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
 *   - the session and the owner measurers read the record up to the stop, as the hook would, and a
 *     background task is judged by the time of that stop;
 *   - a branch with a task number, and any branch of the main checkout, stand in the scenario;
 *   - the scenario is over for a task branch once its task folder was removed from history;
 *   - the end of an epic and the silent hosting release nothing;
 *   - the guard sees the text an edit replaces, not the whole file, and does not judge the state
 *     line: the measured state of that minute is gone;
 *   - a step counts as measured once the session saw the engine match it;
 *   - a held stop whose refusal names the owner's menu ends the series of stops: until the next call
 *     the executor asks the menu instead of stopping, so a stop the record holds there is not
 *     reached.
 *
 * The line names the longest run of held stops in a row within one session: a released stop and a
 * word of the owner break a run.
 *
 * The same replay counts the missed stops after the layout: a turn that ended while no release case
 * of the description released it. An end by the limit of continuations and a failed engine count
 * as missed too: the record shows the end, and the replay shows the open work.
 */
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { judgeCall } from './flow-guard.mjs';
import { menuCause, releaseCase } from './flow-verdict.mjs';
import { callsOf, readCopies, windowOf } from './owner-nudges.mjs';

/** The measurers a record answers. */
const FROM_RECORD = new Set([
    'measure.owner.saidStop',
    'measure.owner.interrupted',
    'measure.owner.nudged',
    'measure.session.wrote',
    'measure.session.role',
    'measure.session.menuLost',
    'measure.session.forbidden',
    'measure.session.idle',
    'measure.session.unread',
    'measure.session.waiting',
    'measure.session.hung',
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

/** A refusal of a stop hook in the summary of the stop hooks. */
const BLOCK = /BLOCKED by |"decision"\s*:\s*"block"/;

/**
 * A stop that ended the turn: the summary of the stop hooks with no refusal in it, and no feedback of
 * a stop hook right after it.
 */
export function isTurnEnd(entry, next) {
    if (entry?.type !== 'system' || entry.subtype !== 'stop_hook_summary') return false;
    if ((entry.hookErrors ?? []).some((error) => BLOCK.test(String(error)))) return false;
    return !(next && next.type === 'user' && isStopEntry(next));
}

const nextMain = (entries, index) => {
    for (let at = index + 1; at < entries.length; at += 1) if (!entries[at]?.isSidechain) return entries[at];
    return null;
};

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
 * The replay of the copies: `{ calls, stops, held, judged, refused, laidStops, ended, missed, longest }`. `openReaders` is the reader
 * factory of the engine; `sessionSource`, `wordOf` and `wordsOf` read the record as the sources do.
 */
export async function forecastCopies({ copies, window, model, base, openReaders, sessionSource, wordOf, wordsOf, tree, settings, laid = () => true }) {
    const live = { entries: [], uses: [], last: null, messages: [], now: 0 };
    // The summary of the stop being judged is written after the hook answers: the hook does not see it.
    const upToStop = () => (live.entries.at(-1)?.subtype === 'stop_hook_summary' ? live.entries.slice(0, -1) : live.entries);
    const given = {
        session: { toolUses: () => live.uses, events: () => sessionSource.eventsOf(upToStop()), now: () => live.now, agent: () => null, roleTools: () => null },
        owner: { messages: () => live.messages, said: (quote) => live.messages.some((text) => text.includes(quote)), last: () => live.last, words: () => wordsOf(upToStop()) },
    };
    const read = await openReaders(model, base, given);
    const history = historyOf(tree, settings.tasksDir);
    const marks = new Set();
    const ids = new Set();
    const seen = new Set();
    const counts = { stops: 0, held: 0, judged: 0, refused: 0, laidStops: 0, ended: 0, missed: 0, longest: 0 };

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
            let menuNamed = false;
            let run = 0;
            for (const [index, entry] of session.entries.entries()) {
                if (entry?.isSidechain) continue;
                live.entries.push(entry);
                branch = entry.gitBranch ?? branch;
                cwd = entry.cwd ?? cwd;
                const at = Date.parse(entry.timestamp ?? '');
                if (Number.isFinite(at)) live.now = at;
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
                        menuNamed = false;
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
                }
                // A queued message is an entry of its own, not of the type `user`: the word is read
                // from every entry, as the owner source of the engine reads it.
                const word = wordOf(entry);
                if (word !== null) {
                    live.last = word;
                    if (!entry.toolUseResult) live.messages.push(word);
                    run = 0;
                }

                if (!isStopEntry(entry)) continue;
                const first = !inStop;
                inStop = true;
                if (!counted) continue;
                if (first && laid(branch)) counts.laidStops += 1;
                const ended = isTurnEnd(entry, nextMain(session.entries, index)) && laid(branch);
                const judged = first && !menuNamed;
                if (!judged && !ended) continue;
                const answer = (name) => {
                    if (FROM_RECORD.has(name)) return read(name);
                    if (name === 'measure.copy.outOfScenario') return !inScenario(branch, cwd);
                    if (name === 'measure.copy.outsideEpic') return true;
                    if (name === 'measure.pr.handed') return handed(branch, at);
                    return false;
                };
                const released = Boolean(releaseCase(model, answer, { state: 'replayed', reason: null }));
                if (ended) {
                    counts.ended += 1;
                    if (!released) counts.missed += 1;
                }
                if (!judged) continue;
                counts.stops += 1;
                if (released) {
                    run = 0;
                    continue;
                }
                counts.held += 1;
                run += 1;
                counts.longest = Math.max(counts.longest, run);
                // A named unread task is a move, not the menu: the next stop is judged as usual.
                const cause = menuCause(answer);
                // A hung task, like an unread one, names a move, not the owner's menu.
                menuNamed = cause !== null && !cause.unread && !cause.hung;
            }
        }
    }
    return { calls: ids.size, ...counts };
}

/** The refusals per thousand calls, rounded to a whole number: the held stops, and with `guard` the guard too. */
export const perMille = ({ calls, held, refused }, guard) => String(Math.round(calls > 0 ? ((held + (guard ? refused : 0)) * 1000) / calls : 0));

export const forecastLine = (result, guard) =>
    `forecast: ${result.calls} calls, ${result.stops} stops, ${result.held} held; ${result.judged} calls judged by the guard, ${result.refused} refused — ${perMille(result, guard)} per mille; the longest run of held stops — ${result.longest}`;

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
    const { wordOf, wordsOf } = await import(pathToFileURL(join(base, ownerFile)).href);
    const copies = readCopies(root, tree, window);
    const result = await forecastCopies({ copies, window, model, base, openReaders, sessionSource, wordOf, wordsOf, tree, settings });
    return args.perMille ? perMille(result, args.guard) : forecastLine(result, args.guard);
}

/** The line of the missed stops: the turns ended with open work among the stops of the window on branches with the engine. */
export const missedLine = (result, last) => `missed stops with open work: ${result.missed} of ${result.laidStops} stops in the last ${last} calls`;

/**
 * The command `owner-nudges.mjs --missed`: replays the records from `from` and counts the turns
 * that ended with open work. `from` is the first of the last calls after the layout; `laid` says
 * whether a branch carries the engine, and a turn of a branch without it is not counted.
 */
export async function runMissed({ copies, from, model, base, openReaders, tree, settings, laid }) {
    const sessionFile = model.sources.find((source) => source.entry === 'session').file;
    const ownerFile = model.sources.find((source) => source.entry === 'owner').file;
    const sessionSource = await import(pathToFileURL(join(base, sessionFile)).href);
    const { wordOf, wordsOf } = await import(pathToFileURL(join(base, ownerFile)).href);
    const window = { from, to: Number.POSITIVE_INFINITY };
    return forecastCopies({ copies, window, model, base, openReaders, sessionSource, wordOf, wordsOf, tree, settings, laid });
}
