// rt-kit v0.37.0 · checks/flow-forecast.mjs · 34b563cef233 · правится надстройкой, не здесь
/**
 * The forecast of refusals — the engine command `forecast`, run before the hooks are laid out.
 *
 * It replays the session records of the copies of the tree over the past days: every stop of a turn
 * goes through the release cases of the description, and every Edit, Write, MultiEdit and shell call
 * goes through the guard of the course of work. A stop no case releases is a refusal of the exit
 * check; a call the guard refuses is a refusal of the guard. The count is given per thousand calls.
 *
 * A record keeps what the session did, not the tree at that minute, so the replay reads the tree
 * facts it can recover and fills the rest the strict way:
 *
 *   - the session and the owner measurers read the record up to the stop, as the hook would;
 *   - a branch with a task number, and any branch of the main checkout, stand in the scenario;
 *   - the scenario is over for a task branch once its task folder was removed from history;
 *   - the end of an epic and the silent hosting release nothing;
 *   - the guard sees the text an edit replaces, not the whole file, and does not judge the state
 *     line: the measured state of that minute is gone;
 *   - a step counts as measured once the session saw the engine match it.
 */
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { judgeCall } from './flow-guard.mjs';
import { releaseCase } from './flow-verdict.mjs';
import { callsOf, readCopies, windowOf } from './owner-nudges.mjs';

/** The measurers a record answers. */
const FROM_RECORD = new Set([
    'measure.owner.saidStop',
    'measure.owner.nudged',
    'measure.session.wrote',
    'measure.session.role',
    'measure.session.menuLost',
]);

/** The calls the guard of the course of work judges. */
const GUARDED = new Set(['Edit', 'Write', 'MultiEdit', 'Bash']);

const TASK_BRANCH = /^[A-Z]+-\d+-/;

const STEP_RUN = /task-flow-script\.mjs\s+step\s+(\d+\.\d+)/;

const parts = (entry) => (Array.isArray(entry?.message?.content) ? entry.message.content : []);

const textOf = (content) =>
    typeof content === 'string'
        ? content
        : Array.isArray(content)
          ? content.map((part) => (typeof part === 'string' ? part : (part?.text ?? ''))).join('\n')
          : '';

/** An entry of a stop: the summary of the stop hooks, or the feedback a stop hook gave back. */
export function isStopEntry(entry) {
    if (entry?.type === 'system' && entry.subtype === 'stop_hook_summary') return true;
    return entry?.type === 'user' && /^Stop hook feedback:/.test(textOf(entry.message?.content).trimStart());
}

/** The path of a call relative to the copy it was made in: the main checkout or one of its worktrees. */
export function copyPath(raw, tree) {
    if (!raw) return '';
    const worktree = raw.match(/\/\.claude\/worktrees\/[^/]+\/(.*)$/);
    if (worktree) return worktree[1];
    return raw.startsWith(`${tree}/`) ? raw.slice(tree.length + 1) : raw;
}

/** The call of a tool use in the form the guard judges. */
export function guardCall(use, tree) {
    const input = use.input ?? {};
    const path = copyPath(input.file_path ?? '', tree);
    if (use.name === 'Bash') return { tool: 'Bash', command: input.command ?? '' };
    if (use.name === 'Write') return { tool: 'Write', path, content: input.content ?? '' };
    if (use.name === 'Edit') return { tool: 'Edit', path, edits: [{ oldString: input.old_string ?? '', newString: input.new_string ?? '', replaceAll: Boolean(input.replace_all) }] };
    return {
        tool: 'MultiEdit',
        path,
        edits: (input.edits ?? []).map((edit) => ({ oldString: edit.old_string ?? '', newString: edit.new_string ?? '', replaceAll: Boolean(edit.replace_all) })),
    };
}

/** What an edit replaces: the text the guard compares against, or null for a whole write. */
const replacedText = (call) => (call.tool === 'Write' ? null : (call.edits ?? []).map((edit) => edit.oldString).join('\n'));

const git = (root, ...args) => {
    const out = spawnSync('git', ['-C', root, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    return out.status === 0 ? out.stdout.trim() : '';
};

/** The tree facts of a branch from history: its plan and the moment its task folder was removed. */
export function historyOf(tree, tasksDir) {
    const plans = new Map();
    const removed = new Map();
    return {
        plan(branch) {
            if (!plans.has(branch)) {
                const path = `${tasksDir}/${branch}/plan.md`;
                const commit = git(tree, 'log', '--all', '--diff-filter=AM', '--format=%H', '-1', '--', path);
                plans.set(branch, commit ? git(tree, 'show', `${commit}:${path}`) || null : null);
            }
            return plans.get(branch);
        },
        removedAt(branch) {
            if (!removed.has(branch)) {
                const at = git(tree, 'log', '--all', '--diff-filter=D', '--format=%ct', '-1', '--', `${tasksDir}/${branch}/plan.md`);
                removed.set(branch, at ? Number(at) * 1000 : null);
            }
            return removed.get(branch);
        },
    };
}

/**
 * The replay of the copies: `{ calls, stops, held, judged, refused }`. `openReaders` is the reader
 * factory of the engine; `sessionSource` and `wordOf` read the record as the sources do.
 */
export async function forecastCopies({ copies, window, model, base, openReaders, sessionSource, wordOf, tree, settings }) {
    const live = { entries: [], uses: [], last: null, messages: [] };
    const given = {
        session: { toolUses: () => live.uses, events: () => sessionSource.eventsOf(live.entries), agent: () => null, roleTools: () => null },
        owner: { messages: () => live.messages, said: (quote) => live.messages.some((text) => text.includes(quote)), last: () => live.last },
    };
    const read = await openReaders(model, base, given);
    const history = historyOf(tree, settings.tasksDir);
    const marks = new Set();
    const ids = new Set();
    const seen = new Set();
    const counts = { stops: 0, held: 0, judged: 0, refused: 0 };

    const inScenario = (branch, cwd) => TASK_BRANCH.test(branch ?? '') || cwd === tree;
    const handed = (branch, at) => {
        const removedAt = TASK_BRANCH.test(branch ?? '') ? history.removedAt(branch) : null;
        return removedAt !== null && removedAt <= at;
    };

    for (const copy of copies) {
        for (const session of copy.sessions) {
            live.entries = [];
            live.uses = [];
            live.last = null;
            live.messages = [];
            const pending = new Map();
            let branch = null;
            let cwd = null;
            let inStop = false;
            for (const entry of session.entries) {
                if (entry?.isSidechain) continue;
                live.entries.push(entry);
                branch = entry.gitBranch ?? branch;
                cwd = entry.cwd ?? cwd;
                const at = Date.parse(entry.timestamp ?? '');
                const fresh = !entry.uuid || !seen.has(entry.uuid);
                if (entry.uuid) seen.add(entry.uuid);
                const counted = fresh && at >= window.from && at < window.to;

                if (entry.type === 'assistant') {
                    inStop = false;
                    if (counted) for (const id of callsOf(entry)) ids.add(id);
                    for (const part of parts(entry)) {
                        if (part?.type !== 'tool_use') continue;
                        const use = { name: part.name, input: part.input ?? {} };
                        live.uses.push(use);
                        const step = use.name === 'Bash' ? (use.input.command ?? '').match(STEP_RUN) : null;
                        if (step) pending.set(part.id, step[1]);
                        if (!counted || !GUARDED.has(use.name)) continue;
                        const call = guardCall(use, tree);
                        const planPath = `${settings.tasksDir}/${branch}/plan.md`;
                        const before = replacedText(call);
                        const ctx = {
                            branch: branch ?? '',
                            key: (branch ?? '').match(/^([A-Z]+)-\d+/)?.[1] ?? 'RT',
                            tasksDir: settings.tasksDir,
                            plansDir: settings.plansDir,
                            marksDir: '.git/rt-kit',
                            overridePath: settings.overridePath,
                            protectedPaths: settings.protectedPaths,
                            legacy: model.words.legacyBranches ?? [],
                            read: (path) => (path === call.path ? before : path === planPath ? history.plan(branch) : null),
                            stepMark: (number) => marks.has(`${branch}:${number}`),
                            approved: () => history.plan(branch) !== null,
                            ownerLast: () => live.last,
                            stateIndex: () => -1,
                            measured: () => null,
                        };
                        counts.judged += 1;
                        if (judgeCall(call, ctx)) counts.refused += 1;
                    }
                    continue;
                }

                if (entry.type === 'user') {
                    for (const part of parts(entry)) {
                        if (part?.type !== 'tool_result' || !pending.has(part.tool_use_id)) continue;
                        const text = textOf(part.content);
                        if (/· совпало/.test(text) && !/не совпало/.test(text)) marks.add(`${branch}:${pending.get(part.tool_use_id)}`);
                        pending.delete(part.tool_use_id);
                    }
                    const word = wordOf(entry);
                    if (word !== null) {
                        live.last = word;
                        if (!entry.toolUseResult) live.messages.push(word);
                    }
                }

                if (!isStopEntry(entry) || inStop) continue;
                inStop = true;
                if (!counted) continue;
                counts.stops += 1;
                const answer = (name) => {
                    if (FROM_RECORD.has(name)) return read(name);
                    if (name === 'measure.copy.outOfScenario') return !inScenario(branch, cwd);
                    if (name === 'measure.copy.outsideEpic') return true;
                    if (name === 'measure.pr.handed') return handed(branch, at);
                    return false;
                };
                if (!releaseCase(model, answer, { state: 'replayed', reason: null })) counts.held += 1;
            }
        }
    }
    return { calls: ids.size, ...counts };
}

/** The refusals per thousand calls with one decimal: the held stops, and with `guard` the guard too. */
export const perMille = ({ calls, held, refused }, guard) => (calls > 0 ? ((held + (guard ? refused : 0)) * 1000) / calls : 0).toFixed(1);

export const forecastLine = (result, guard) =>
    `forecast: ${result.calls} calls, ${result.stops} stops, ${result.held} held; ${result.judged} calls judged by the guard, ${result.refused} refused — ${perMille(result, guard)} per mille`;

/** The arguments of the command: `--days N [--until <date>] [--per-mille] [--guard]`. */
export function forecastArgs(argv) {
    const args = { days: null, until: new Date().toISOString().slice(0, 10), perMille: false, guard: false };
    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === '--per-mille') args.perMille = true;
        else if (arg === '--guard') args.guard = true;
        else if (arg === '--days') args.days = Number(argv[++index]);
        else if (arg === '--until') args.until = argv[++index];
        else throw new Error(`unknown argument: ${arg}`);
    }
    return args;
}

/** The command: reads the records of the copies of `tree` under `root` and prints the forecast. */
export async function runForecast({ argv, model, base, openReaders, tree, root, settings }) {
    const args = forecastArgs(argv);
    const window = windowOf({ days: args.days, until: args.until });
    const sessionFile = model.sources.find((source) => source.entry === 'session').file;
    const ownerFile = model.sources.find((source) => source.entry === 'owner').file;
    const sessionSource = await import(pathToFileURL(join(base, sessionFile)).href);
    const { wordOf } = await import(pathToFileURL(join(base, ownerFile)).href);
    const copies = readCopies(root, tree, window);
    const result = await forecastCopies({ copies, window, model, base, openReaders, sessionSource, wordOf, tree, settings });
    return args.perMille ? perMille(result, args.guard) : forecastLine(result, args.guard);
}
