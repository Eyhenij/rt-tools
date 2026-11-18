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
// The replay calls a model once per pair of a fixture and a hook, so it runs by hand and as a plan
// step, not in the set before a push.
//
// Usage: node judge-replay.mjs [--root <tree>]
//   RT_JUDGE_RUNNER=<command> replaces the call of the model: the command gets the prompt on stdin
//   and prints the answer. The suite gives it a fake judge.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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

function ask(prompt, root) {
    const runner = process.env.RT_JUDGE_RUNNER;
    if (runner) {
        const run = spawnSync('sh', ['-c', runner], { input: prompt, encoding: 'utf8' });
        return run.stdout ?? '';
    }
    const cwd = mkdtempSync(join(tmpdir(), 'judge-'));
    try {
        const { cmd, args } = judgeCommand({ model: hookModel(root), cwd });
        const run = spawnSync(cmd, args, { cwd, input: prompt, encoding: 'utf8', timeout: 300_000 });
        return run.stdout ?? '';
    } finally {
        rmSync(cwd, { recursive: true, force: true });
    }
}

/**
 * Runs the judge over every pair the expected file names and compares afterwards. The pairs are
 * taken from the names of the expected file; the verdicts in it are read only after the last answer.
 */
export function replay({ root, fixtures, hooksDir, expectedFile }) {
    const pairs = Object.entries(JSON.parse(readFileSync(expectedFile, 'utf8'))).flatMap(([file, keys]) =>
        Object.keys(keys).map((key) => ({ file, key }))
    );
    const answers = pairs.map(({ file, key }) => {
        const fixture = JSON.parse(readFileSync(join(fixtures, file), 'utf8'));
        const hookText = readFileSync(join(hooksDir, HOOKS[key]), 'utf8');
        return { file, key, got: verdictOf(ask(promptOf(hookText, fixture), root)) };
    });
    const expected = JSON.parse(readFileSync(expectedFile, 'utf8'));
    return answers.map((a) => ({ ...a, want: expected[a.file][a.key], ok: a.got !== null && a.got === expected[a.file][a.key] }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const at = process.argv.indexOf('--root');
    const root = at > 0 ? process.argv[at + 1] : join(HERE, '../../..');
    const laid = existsSync(join(root, '.claude/hooks/turn-judge.md'));
    const results = replay({
        root,
        fixtures: join(HERE, 'fixtures/turn-replay'),
        hooksDir: laid ? join(root, '.claude/hooks') : join(HERE, '../assets/hooks'),
        expectedFile: join(HERE, 'turn-replay.expected.json'),
    });
    for (const r of results)
        console.log(`${r.ok ? 'ok' : 'mismatch'} ${r.file} ${r.key}: expected ${r.want}, got ${r.got ?? 'no verdict'}`);
    const bad = results.filter((r) => !r.ok).length;
    console.log(`judge replay: ${results.length - bad} of ${results.length} match`);
    process.exit(bad === 0 ? 0 : 1);
}
