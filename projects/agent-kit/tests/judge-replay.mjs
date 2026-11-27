// The replay of the model hooks on the recorded turns of `fixtures/turn-replay/`.
//
// The judge is the model that reads the text of a model hook and one recorded turn and answers
// `allow` or `block`. It runs outside the tree, from an empty temporary directory, with no tools, no
// setting sources, no MCP servers and no session kept: it has nothing to read the expected verdicts
// with. Its prompt holds the text of the hook and only the `turns` and `next` of the fixture — no file
// name, no `case`, no `kind`. The expected verdicts are compared by this script after every judge has
// answered, and only the answers of this run count: a verdict file left by an earlier replay is never
// read.
//
// A call is given 90 s. A call past that, an empty answer with code 0 and an answer with no verdict are
// asked once more, with a `retry` line on stderr. A judge that did not run — no CLI, an expired login, a
// code other than 0, an empty answer twice — stops the replay: the answer is printed and the code is 2.
// Every later case would read as a mismatch of the text.
//
// The replay calls a model once per pair of a fixture and a hook, so it runs by hand and as a plan
// step, not in the set before a push.
//
// The mode `--as-hook` runs the turn judge the way the Stop hook runs it, to see its time: the
// recorded turn becomes a session record on disk, the judge gets the prompt of the hook declaration
// with the hook input and the tools Read, Grep and Glob, and each case prints its seconds. `--pad`
// puts a real session record in front of the turn. `--live` reads the runs of the hook from the
// session records of the current branch after the last commit of the hook.
//
// Usage: node judge-replay.mjs [--root <tree>] [--only <start of a fixture name>] [--key judge|ask] [--model <id>]
//        node judge-replay.mjs --as-hook [--model <id>] [--pad <session record>] [--root <tree>]
//        node judge-replay.mjs --live [--root <tree>]
//   RT_JUDGE_RUNNER=<command> replaces the call of the model: the command gets the prompt on stdin
//   and prints the answer. The suite gives it a fake judge.
import { execFileSync, spawnSync } from 'node:child_process';
import {
    closeSync,
    existsSync,
    mkdtempSync,
    openSync,
    readdirSync,
    readFileSync,
    readSync,
    rmSync,
    statSync,
    writeFileSync,
} from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { recordOf } from './turn-replay-lib.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

/** The hook of each key of the expected verdicts. */
export const HOOKS = { judge: 'turn-judge.md', ask: 'ask-judge.md' };

/** The prompt of the judge: the text of the hook, then the recorded turn without its labels. */
export function promptOf(hookText, fixture) {
    const turn = { turns: fixture.turns ?? [], next: fixture.next ?? null };
    return [
        hookText.trim(),
        '',
        'The hook input is the recorded turn below. Answer with one word: allow or block.',
        '',
        JSON.stringify(turn, null, 2),
    ].join('\n');
}

/** The call of the judge: no tools, no setting sources, no MCP servers, from a directory outside the tree. */
export function judgeCommand({ model = null, cwd }) {
    const args = [
        '-p',
        '--tools',
        '',
        '--setting-sources',
        '',
        '--strict-mcp-config',
        '--mcp-config',
        '{"mcpServers":{}}',
        '--disable-slash-commands',
        '--no-session-persistence',
    ];
    if (model) args.push('--model', model);
    return { cmd: 'claude', args, cwd };
}

/** One verdict, `allow` or `block`; anything else — none or both — is no verdict. */
export function verdictOf(answer) {
    // The hook answers as its text asks: the last JSON object `{"ok": true|false, …}` is its verdict;
    // an earlier one quotes the rule.
    const ok = [...String(answer).matchAll(/\{\s*"ok"\s*:\s*(true|false)\b/g)].at(-1);
    if (ok) return ok[1] === 'true' ? 'allow' : 'block';
    const words = new Set((String(answer).match(/\b(allow|block)\b/gi) ?? []).map((w) => w.toLowerCase()));
    return words.size === 1 ? [...words][0] : null;
}

/** The model the hook uses in production: the `model` of its agent entry in the settings, or the default. */
export function hookModel(root) {
    try {
        const settings = JSON.parse(readFileSync(join(root, '.claude/settings.json'), 'utf8'));
        for (const groups of Object.values(settings.hooks ?? {})) {
            for (const group of groups) {
                for (const hook of group.hooks ?? []) {
                    if (hook.type === 'agent' && hook.model) return hook.model;
                }
            }
        }
    } catch {
        // No settings — the default model.
    }
    return null;
}

/** A judge that did not run: the replay stops on it, because no verdict of it says anything of the hook. */
export class JudgeDidNotRun extends Error {}

/**
 * The answer of a judge run. A run that did not start, ended with a code other than zero or said
 * nothing is no answer: an expired login of the CLI read as a mismatch of every case. `timeoutIsAnswer`
 * keeps a run past its limit as an empty answer — the time is what the caller measures.
 */
function answerOf(run, file, timeoutIsAnswer = false) {
    if (timeoutIsAnswer && run.error?.code === 'ETIMEDOUT') return '';
    const out = (run.stdout ?? '').trim();
    if (!run.error && run.status === 0 && out !== '') return out;
    const said = [out, (run.stderr ?? '').trim(), run.error?.message].filter(Boolean).join(' · ') || 'an empty answer';
    throw new JudgeDidNotRun(`the judge did not run on ${file}: exit ${run.status ?? 'none'} · ${said}`);
}

/** One call of the judge, 90 s at most: the stub of the suite or the CLI on the model asked or the model of the hook. */
function call(prompt, root, model) {
    const runner = process.env.RT_JUDGE_RUNNER;
    if (runner) return spawnSync('sh', ['-c', runner], { input: prompt, encoding: 'utf8', timeout: 90_000 });
    const cwd = mkdtempSync(join(tmpdir(), 'judge-'));
    try {
        const { cmd, args } = judgeCommand({ model: model ?? hookModel(root), cwd });
        return spawnSync(cmd, args, { cwd, input: prompt, encoding: 'utf8', timeout: 90_000 });
    } finally {
        rmSync(cwd, { recursive: true, force: true });
    }
}

/**
 * The answer of the judge. A call past its limit, an empty answer with code 0 and an answer with no
 * verdict are asked once more, with a `retry` line on stderr; a code other than 0 is no answer at once.
 */
function ask(prompt, root, file, key, model) {
    let run = call(prompt, root, model);
    const out = (run.stdout ?? '').trim();
    const failed = run.error?.code === 'ETIMEDOUT' || (!run.error && run.status === 0 && (out === '' || verdictOf(out) === null));
    if (failed) {
        console.error(`retry ${file} ${key}: ${run.error?.code ?? (out || 'an empty answer')}`);
        run = call(prompt, root, model);
    }
    return answerOf(run, file);
}

/**
 * Runs the judge over every pair the expected file names and compares afterwards. The pairs are
 * taken from the names of the expected file; the verdicts in it are read only after the last answer.
 * `only` keeps the fixtures whose name starts with it: the questions of one record, one model call each.
 * `hook` keeps the pairs of one key, `model` replaces the model of the hook (SC-AK-2020).
 */
export function replay({ root, fixtures, hooksDir, expectedFile, only = null, hook = null, model = null }) {
    const pairs = Object.entries(JSON.parse(readFileSync(expectedFile, 'utf8')))
        .filter(([file]) => !only || file.startsWith(only))
        .flatMap(([file, keys]) => Object.keys(keys).map((key) => ({ file, key })))
        .filter(({ key }) => !hook || key === hook);
    const answers = pairs.map(({ file, key }) => {
        const fixture = JSON.parse(readFileSync(join(fixtures, file), 'utf8'));
        const hookText = readFileSync(join(hooksDir, HOOKS[key]), 'utf8');
        return { file, key, got: verdictOf(ask(promptOf(hookText, fixture), root, file, key, model)) };
    });
    const expected = JSON.parse(readFileSync(expectedFile, 'utf8'));
    return answers.map((a) => ({ ...a, want: expected[a.file][a.key], ok: a.got !== null && a.got === expected[a.file][a.key] }));
}

/** The agent hook on Stop that runs the turn judge: its prompt, model and timeout. */
export function stopHookOf(root) {
    const settings = JSON.parse(readFileSync(join(root, '.claude/settings.json'), 'utf8'));
    for (const group of settings.hooks?.Stop ?? []) {
        for (const hook of group.hooks ?? []) {
            if (hook.type === 'agent' && /turn-judge/.test(hook.prompt ?? '')) return hook;
        }
    }
    return null;
}

/** The input the host gives the Stop hook, for a session record written at `transcript`. */
export function hookInputOf(fixture, transcript, root) {
    const turns = fixture.turns ?? [];
    const said = [...turns].reverse().find((turn) => turn.say);
    // The host sets it when this stop follows a refusal of a Stop hook within the same turn.
    const owner = turns.map((turn) => turn.role).lastIndexOf('owner');
    const refused = turns.slice(owner + 1).some((turn) => turn.role === 'hook');
    return {
        session_id: 'replay',
        transcript_path: transcript,
        cwd: root,
        hook_event_name: 'Stop',
        stop_hook_active: refused,
        last_assistant_message: said?.say ?? '',
    };
}

/** The call of the judge as the hook: the tools of an agent hook, no settings, MCP servers or memory. */
export function asHookCommand({ model = null, cwd }) {
    const args = [
        '-p',
        '--tools',
        'Read,Grep,Glob',
        '--allowedTools',
        'Read,Grep,Glob',
        '--setting-sources',
        '',
        '--strict-mcp-config',
        '--mcp-config',
        '{"mcpServers":{}}',
        '--disable-slash-commands',
        '--no-session-persistence',
    ];
    if (model) args.push('--model', model);
    return { cmd: 'claude', args, cwd };
}

/** The verdict of an answer of the hook: `{"ok": true}` lets the turn end, `{"ok": false}` holds it. */
export function hookVerdictOf(answer) {
    const found = [...String(answer).matchAll(/"ok"\s*:\s*(true|false)/g)].map((m) => m[1]);
    if (new Set(found).size !== 1) return null;
    return found[0] === 'true' ? 'allow' : 'block';
}

const median = (values) => {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    return n === 0 ? 0 : (sorted[(n - 1) >> 1] + sorted[n >> 1]) / 2;
};

/** Runs the turn judge as the hook over every fixture with a `judge` verdict; seconds per case. */
export function replayAsHook({ root, fixtures, expectedFile, model = null, pad = null }) {
    const hook = stopHookOf(root);
    if (!hook) throw new Error('no agent hook on Stop runs the turn judge');
    const files = Object.entries(JSON.parse(readFileSync(expectedFile, 'utf8')))
        .filter(([, keys]) => keys.judge)
        .map(([file]) => file);
    const head = pad ? readFileSync(pad, 'utf8').replace(/\n?$/, '\n') : '';
    const answers = files.map((file) => {
        const fixture = JSON.parse(readFileSync(join(fixtures, file), 'utf8'));
        const work = mkdtempSync(join(tmpdir(), 'judge-hook-'));
        try {
            const transcript = join(work, 'transcript.jsonl');
            writeFileSync(
                transcript,
                `${head}${recordOf(fixture)
                    .map((e) => JSON.stringify(e))
                    .join('\n')}\n`
            );
            const prompt = hook.prompt.replace('$ARGUMENTS', JSON.stringify(hookInputOf(fixture, transcript, root)));
            const started = Date.now();
            let answer;
            const runner = process.env.RT_JUDGE_RUNNER;
            if (runner) {
                answer = answerOf(spawnSync('sh', ['-c', runner], { input: prompt, encoding: 'utf8' }), file);
            } else {
                // `default` asks for the model the CLI takes by itself, past the declaration.
                const chosen = model === 'default' ? null : (model ?? hook.model ?? null);
                const { cmd, args } = asHookCommand({ model: chosen, cwd: work });
                const run = spawnSync(cmd, args, { cwd: work, input: prompt, encoding: 'utf8', timeout: (hook.timeout ?? 120) * 1000 });
                answer = answerOf(run, file, true);
            }
            return { file, got: hookVerdictOf(answer), seconds: (Date.now() - started) / 1000 };
        } finally {
            rmSync(work, { recursive: true, force: true });
        }
    });
    const expected = JSON.parse(readFileSync(expectedFile, 'utf8'));
    return answers.map((a) => ({ ...a, want: expected[a.file].judge, ok: a.got !== null && a.got === expected[a.file].judge }));
}

/**
 * The live runs of the hook: the session records of the current branch after the last commit of the
 * hook, picked by the prompt of its declaration. A run with no duration — a refusal or a timeout — is
 * timed from the last record before its summary; one that reached the timeout is counted apart.
 */
/** The lines of a file read in pieces: a session record outgrows the longest string of the runtime. */
function* linesOf(file) {
    const fd = openSync(file, 'r');
    const chunk = Buffer.alloc(1 << 20);
    let rest = '';
    try {
        for (let read; (read = readSync(fd, chunk, 0, chunk.length, null)) > 0;) {
            const parts = (rest + chunk.toString('utf8', 0, read)).split('\n');
            rest = parts.pop();
            yield* parts;
        }
    } finally {
        closeSync(fd);
    }
    if (rest) yield rest;
}

export function liveRuns(tree, dir = join(homedir(), '.claude/projects', resolve(tree).replace(/[/.]/g, '-'))) {
    const root = resolve(tree);
    const hook = stopHookOf(root);
    const since = Date.parse(
        execFileSync('git', ['log', '-1', '--format=%cI', '--', '.claude/settings.json', 'projects/agent-kit/assets/hooks/turn-judge.md'], {
            cwd: root,
            encoding: 'utf8',
        }).trim()
    );
    if (Number.isNaN(since)) throw new Error(`no commit of the hook in ${root}: nothing to count from`);
    const branch = execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).trim();
    const limit = (hook?.timeout ?? 120) * 1000;
    const seconds = [];
    let timeouts = 0;
    for (const file of existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.jsonl')) : []) {
        if (statSync(join(dir, file)).mtimeMs < since) continue;
        let before = null;
        for (const line of linesOf(join(dir, file))) {
            if (!line) continue;
            let record;
            try {
                record = JSON.parse(line);
            } catch {
                continue;
            }
            const at = Date.parse(record.timestamp ?? '');
            if (record.subtype !== 'stop_hook_summary') {
                if (record.type === 'assistant' && at) before = at;
                continue;
            }
            if (!(at >= since) || record.gitBranch !== branch) continue;
            const run = (record.hookInfos ?? []).find((h) => h.command === hook?.prompt);
            if (!run) continue;
            if (run.durationMs) {
                seconds.push(run.durationMs / 1000);
                continue;
            }
            // No duration: the judge refused, timed out, or was dropped when another Stop hook
            // refused first. Only its own refusal or a run past the timeout is timed by the records.
            const ms = before ? at - before : null;
            if (ms === null) continue;
            const judged = (record.hookErrors ?? []).some((e) => String(e).includes('BLOCKED by turn-judge'));
            if (!judged && ms < limit) continue;
            if (!judged) timeouts += 1;
            seconds.push(ms / 1000);
        }
    }
    return { runs: seconds.length, median: median(seconds), timeouts };
}

/** The call of a replay: a judge that did not run is printed with its answer, and the code is 2. */
function replayed(run) {
    try {
        return run();
    } catch (error) {
        if (!(error instanceof JudgeDidNotRun)) throw error;
        console.log(`judge replay: ${error.message}`);
        process.exit(2);
    }
}

const flag = (name) => {
    const at = process.argv.indexOf(name);
    return at > 0 ? process.argv[at + 1] : null;
};

if (process.argv[1] === fileURLToPath(import.meta.url) && (process.argv.includes('--as-hook') || process.argv.includes('--live'))) {
    const root = flag('--root') ?? join(HERE, '../../..');
    if (process.argv.includes('--live')) {
        const live = liveRuns(root);
        console.log(`live ${live.runs} median ${live.median.toFixed(1)} timeouts ${live.timeouts}`);
        process.exit(0);
    }
    const model = flag('--model') ?? stopHookOf(root)?.model ?? 'default';
    const results = replayed(() =>
        replayAsHook({
            root,
            fixtures: join(HERE, 'fixtures/turn-replay'),
            expectedFile: join(HERE, 'turn-replay.expected.json'),
            model,
            pad: flag('--pad'),
        })
    );
    for (const r of results)
        console.log(`${r.ok ? 'ok' : 'mismatch'} ${r.file}: expected ${r.want}, got ${r.got ?? 'no verdict'}, ${r.seconds.toFixed(1)} s`);
    const bad = results.filter((r) => !r.ok).length;
    console.log(`as-hook ${bad} median ${median(results.map((r) => r.seconds)).toFixed(1)} model ${model}`);
    process.exit(bad === 0 ? 0 : 1);
} else if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const root = flag('--root') ?? join(HERE, '../../..');
    const laid = existsSync(join(root, '.claude/hooks/turn-judge.md'));
    const results = replayed(() =>
        replay({
            root,
            fixtures: join(HERE, 'fixtures/turn-replay'),
            hooksDir: laid ? join(root, '.claude/hooks') : join(HERE, '../assets/hooks'),
            expectedFile: join(HERE, 'turn-replay.expected.json'),
            only: flag('--only'),
            hook: flag('--key'),
            model: flag('--model'),
        })
    );
    for (const r of results)
        console.log(`${r.ok ? 'ok' : 'mismatch'} ${r.file} ${r.key}: expected ${r.want}, got ${r.got ?? 'no verdict'}`);
    const bad = results.filter((r) => !r.ok).length;
    console.log(`judge replay: ${results.length - bad} of ${results.length} match`);
    process.exit(bad === 0 ? 0 : 1);
}
