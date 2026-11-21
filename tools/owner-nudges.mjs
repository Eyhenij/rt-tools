#!/usr/bin/env node
// rt-kit v0.38.0 · checks/owner-nudges.mjs · 0cb9db3043df · правится надстройкой, не здесь
/**
 * The measures of the guards of the end of a turn, read from the session records of this tree.
 *
 *   node owner-nudges.mjs --days 7 --until 2026-11-15              nudges of the owner per 100 calls
 *   node owner-nudges.mjs --typed --since 2026-10-13 --until …      typed messages of the owner
 *   node owner-nudges.mjs --refusals --days 1 --until 2026-11-14    refusals per 100 calls
 *   node owner-nudges.mjs --deadlocks --days 7 --until 2026-11-15   series of stop refusals
 *   node owner-nudges.mjs --missed --last 200                       turns ended with open work
 *
 * The records are the jsonl files of Claude Code under `--root` (by default `~/.claude/projects`),
 * in the directories of every copy of the tree: the main checkout named by `--tree` (by default the
 * checkout that holds the common directory of git) and its worktrees under `.claude/worktrees/`.
 * Only the session files are read, not the records of subagents: an owner message lives only there.
 * An entry copied into a resumed session is counted once, by its id.
 *
 * The window is whole days of UTC: `--until <date>` includes that day, `--days N` goes N days back
 * from its end, `--since <date>` starts at that day. A moment with a time is taken as it is. The
 * moment is always a parameter: the decisions below never read the clock.
 *
 * A nudge is a typed owner message the pattern `words.nudge` of the task flow description matches;
 * a call is a tool use of the agent. A refusal is a mark `BLOCKED by <guard>:` in the feedback of a
 * stop hook or in the hook error a tool call got back. A deadlock is a series of 10 and more stop
 * refusals in a row with one guard and one first line of the reason — the line that names the
 * state and the step; a stop that passed or a refusal with another line ends the series.
 *
 * The missed stops are read in the last `--last` calls after the layout of the engine: the moment
 * of the first commit that added it to the tree, or `--layout <moment>`. A turn that ended there,
 * on a branch that carries the engine, while no release case of the description released it is
 * missed.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { buildModel } from './flow-model.mjs';
import { readRecord } from './flow-plan.mjs';
// The owner's words are read by the counter of the record, the same rule the engine reads them by.
import { typedOf } from './record-count.mjs';

const DAY = 24 * 60 * 60 * 1000;

/** The mark of a refusal: at the start of a line or right after the prefix of the harness. */
const MARK = /(?:^|\n|: )BLOCKED by ([a-z0-9][a-z0-9-]*):([^\n]*)/g;

/** The text the harness gives back to a tool call a hook refused. */
const HOOK_ERROR = /^\S+ hook error: /;

/** The text the harness hands the agent after a stop hook refused. */
const STOP_FEEDBACK = 'Stop hook feedback:';

/** The rewritten exit check. */
export const EXIT_GUARDS = ['turn-exit-guard'];

/** The checks of the executable scenario: the rewritten exit check and the guard of the course of work. */
export const NEW_GUARDS = ['turn-exit-guard', 'flow-step-guard'];

/**
 * The seven checks of the base that judged the conversation, and the agent hooks that carry their
 * requirements since they were removed.
 */
export const BASE_GUARDS = [
    'grill-gate', 'grill-gate-ask', 'claim-guard', 'waiting-turn-guard', 'postmortem-guard', 'work-start-guard',
    'proposal-guard', 'stand-login-guard', 'turn-judge', 'ask-judge',
];

/** The length from which a series of stop refusals is a deadlock. */
export const SERIES = 10;

/** The directory name Claude Code gives the records of a path. */
export const recordDirOf = (path) => path.replace(/[^A-Za-z0-9]/g, '-');

/** A directory of records belongs to a copy of the tree: the main checkout or one of its worktrees. */
export function isCopyDir(name, tree) {
    const own = recordDirOf(tree);
    return name === own || name.startsWith(`${own}--claude-worktrees-`);
}

const momentOf = (text, endOfDay) => {
    const day = /^\d{4}-\d{2}-\d{2}$/.test(text);
    const at = Date.parse(day ? `${text}T00:00:00Z` : text);
    if (Number.isNaN(at)) throw new Error(`not a date: ${text}`);
    return day && endOfDay ? at + DAY : at;
};

/** The window `{ from, to }` in ms, the end excluded. */
export function windowOf({ until, since, days }) {
    if (!until) throw new Error('the window needs --until');
    const to = momentOf(until, true);
    if (since) return { from: momentOf(since, false), to };
    if (!Number.isInteger(days) || days < 1) throw new Error('the window needs --days N or --since <date>');
    return { from: to - days * DAY, to };
}

const inWindow = (entry, window) => {
    const at = Date.parse(entry?.timestamp ?? '');
    return at >= window.from && at < window.to;
};

const partsOf = (entry) => (Array.isArray(entry?.message?.content) ? entry.message.content : []);

/**
 * The text the owner typed in an entry, before a turn or during one, or null: a tool result, a menu
 * answer and a wrapper of the harness are none.
 */
export function typedText(entry) {
    if (entry?.isSidechain || entry?.toolUseResult) return null;
    const word = typedOf(entry);
    return word && word.text.trim() !== '' ? word.text : null;
}

/** The ids of the tool calls in an entry of the agent. */
export function callsOf(entry) {
    if (entry?.type !== 'assistant' || entry.isSidechain) return [];
    return partsOf(entry)
        .map((part, index) => (part?.type === 'tool_use' ? (part.id ?? `${entry.uuid}:${index}`) : null))
        .filter((id) => id !== null);
}

const textOf = (content) =>
    typeof content === 'string'
        ? content
        : Array.isArray(content)
          ? content.map((part) => (typeof part === 'string' ? part : (part?.text ?? ''))).join('\n')
          : '';

const marksOf = (text, stop) => [...text.matchAll(MARK)].map((match) => ({ guard: match[1], line: match[2].trim(), stop }));

/** The refusals an entry carries: `[{ guard, line, stop }]`, `stop` for a refusal of the end of a turn. */
export function refusalsOf(entry) {
    if (entry?.type !== 'user' || entry.isSidechain) return [];
    const content = entry.message?.content;
    const text = textOf(typeof content === 'string' ? content : partsOf(entry).filter((part) => part?.type === 'text'));
    if (text.startsWith(STOP_FEEDBACK)) return marksOf(text, true);
    return partsOf(entry)
        .filter((part) => part?.type === 'tool_result' && part.is_error)
        .map((part) => textOf(part.content))
        .filter((result) => HOOK_ERROR.test(result))
        .flatMap((result) => marksOf(result, false));
}

/** A stop the hooks let through: the summary of the stop hooks names no refusal. */
export const stopPassed = (entry) =>
    entry?.type === 'system' && entry.subtype === 'stop_hook_summary' && !(entry.hookErrors ?? []).some((error) => String(error).includes('BLOCKED by'));

/**
 * The entries of the copies in the window, each once: `{ copy, session, entry }`. An entry copied
 * into a resumed session carries the same id and is skipped the second time.
 */
export function* entriesOf(copies, window) {
    const seen = new Set();
    for (const copy of copies) {
        for (const session of copy.sessions) {
            for (const entry of session.entries) {
                if (!inWindow(entry, window)) continue;
                if (entry.uuid) {
                    if (seen.has(entry.uuid)) continue;
                    seen.add(entry.uuid);
                }
                yield { copy: copy.name, session: session.id, entry };
            }
        }
    }
}

const countCalls = (copies, window) => {
    const ids = new Set();
    for (const { entry } of entriesOf(copies, window)) for (const id of callsOf(entry)) ids.add(id);
    return ids.size;
};

/** Nudges and calls in the window: `{ nudges, calls }`. */
export function measureNudges(copies, window, nudge) {
    const pattern = new RegExp(nudge, 'iu');
    let nudges = 0;
    for (const { entry } of entriesOf(copies, window)) {
        const text = typedText(entry);
        if (text !== null && pattern.test(text)) nudges += 1;
    }
    return { nudges, calls: countCalls(copies, window) };
}

/** Typed owner messages in the window and the copies that hold them: `{ messages, copies }`. */
export function measureTyped(copies, window) {
    let messages = 0;
    const holding = new Set();
    for (const { copy, entry } of entriesOf(copies, window)) {
        if (typedText(entry) === null) continue;
        messages += 1;
        holding.add(copy);
    }
    return { messages, copies: holding.size };
}

/** Refusals in the window by group and the calls: `{ calls, all, exit, base, fresh }`. */
export function measureRefusals(copies, window) {
    const counts = { all: 0, exit: 0, base: 0, fresh: 0 };
    for (const { entry } of entriesOf(copies, window)) {
        for (const { guard } of refusalsOf(entry)) {
            counts.all += 1;
            if (EXIT_GUARDS.includes(guard)) counts.exit += 1;
            if (BASE_GUARDS.includes(guard)) counts.base += 1;
            if (NEW_GUARDS.includes(guard)) counts.fresh += 1;
        }
    }
    return { calls: countCalls(copies, window), ...counts };
}

/**
 * The deadlocks in the window: `[{ session, key, refusals }]`. A series runs over the stop refusals of
 * one session with one key — the guard and the first line of its reason. Calls and owner messages
 * between them do not end it: in a deadlock the agent keeps trying and the owner keeps writing. A
 * stop that passed ends it, unless a refusal of an agent hook follows the summary of that stop.
 */
export function findDeadlocks(copies, window) {
    const found = [];
    const sessions = new Map();
    for (const { copy, session, entry } of entriesOf(copies, window)) {
        const id = `${copy}/${session}`;
        if (!sessions.has(id)) sessions.set(id, []);
        sessions.get(id).push(entry);
    }
    for (const [session, entries] of sessions) {
        let run = null;
        let passed = false;
        const close = () => {
            if (run && run.refusals >= SERIES) found.push({ session, ...run });
            run = null;
            passed = false;
        };
        for (const entry of entries) {
            const stops = refusalsOf(entry).filter((refusal) => refusal.stop);
            if (stops.length > 0) {
                passed = false;
                for (const { guard, line } of stops) {
                    const key = `${guard}: ${line}`;
                    if (run?.key !== key) close();
                    run = run ?? { key, refusals: 0 };
                    run.refusals += 1;
                }
            } else if (stopPassed(entry)) {
                passed = true;
            } else if (passed && (entry.type === 'assistant' || typedText(entry) !== null)) {
                close();
            }
        }
        close();
    }
    return found;
}

/** A count per hundred calls with two decimals. */
export const per100 = (count, calls) => (calls > 0 ? (count * 100) / calls : 0).toFixed(2);

export const nudgesLine = ({ nudges, calls }) => `owner nudges per 100 calls: ${per100(nudges, calls)} (${nudges} nudges, ${calls} calls)`;

export const typedLine = ({ messages, copies }) => `owner typed messages: ${messages} in ${copies} copies`;

export const refusalsLine = ({ calls, all, exit, base, fresh }) =>
    `refusals per 100 calls: all ${per100(all, calls)}, exit ${per100(exit, calls)}, base ${per100(base, calls)}, new ${per100(fresh, calls)}`;

export const deadlocksLine = (series) =>
    `deadlocks: ${series.length} series of ${SERIES}+ stop refusals at one state and step, ${series.reduce((sum, s) => sum + s.refusals, 0)} refusals`;

const USAGE =
    'usage: node owner-nudges.mjs [--typed | --refusals | --deadlocks] (--days N | --since <date>) [--until <date>] [--root <dir>] [--tree <path>] [--flow <flow.js>]\n       node owner-nudges.mjs --missed --last N [--layout <moment>] [--root <dir>] [--tree <path>] [--flow <flow.js>]';

/** The arguments of the command line, or a thrown error naming what is wrong. */
export function parseArgs(argv) {
    const args = { mode: 'nudges' };
    const modes = { '--typed': 'typed', '--refusals': 'refusals', '--deadlocks': 'deadlocks', '--missed': 'missed' };
    const values = { '--days': 'days', '--since': 'since', '--until': 'until', '--root': 'root', '--tree': 'tree', '--flow': 'flow', '--last': 'last', '--layout': 'layout' };
    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg in modes) {
            if (args.mode !== 'nudges') throw new Error('one measure at a time');
            args.mode = modes[arg];
        } else if (arg in values) {
            const value = argv[index + 1];
            if (value === undefined || value.startsWith('--')) throw new Error(`${arg} needs a value`);
            args[values[arg]] = values[arg] === 'days' || values[arg] === 'last' ? Number(value) : value;
            index += 1;
        } else {
            throw new Error(`unknown argument: ${arg}`);
        }
    }
    return args;
}

/** The moment of the first of the last `last` calls in the window, or the start of the window when there are fewer. */
export function lastCallsFrom(copies, window, last) {
    const moments = [];
    for (const { entry } of entriesOf(copies, window)) for (const _ of callsOf(entry)) moments.push(Date.parse(entry.timestamp));
    moments.sort((a, b) => a - b);
    return moments.length > last ? moments[moments.length - last] : window.from;
}

/** The moment the engine was laid out: the first commit of any branch that added it, or null. */
export function layoutMoment(tree) {
    const run = spawnSync('git', ['-C', tree, 'log', '--all', '--diff-filter=A', '--reverse', '--format=%ct', '--', 'tools/task-flow-script.mjs'], { encoding: 'utf8' });
    const first = run.status === 0 ? run.stdout.trim().split('\n')[0] : '';
    return first ? Number(first) * 1000 : null;
}

/** Whether a branch carries the engine; a branch removed since is taken as one without it. */
export function branchLaid(tree) {
    const known = new Map();
    return (branch) => {
        if (!branch) return false;
        if (!known.has(branch)) {
            const run = spawnSync('git', ['-C', tree, 'cat-file', '-e', `${branch}:tools/task-flow-script.mjs`], { encoding: 'utf8' });
            known.set(branch, run.status === 0);
        }
        return known.get(branch);
    };
}

/** The copies of the tree with their session records; a file last written before the window is skipped. */
export function readCopies(root, tree, window) {
    if (!existsSync(root)) return [];
    return readdirSync(root)
        .filter((name) => isCopyDir(name, tree))
        .sort()
        .map((name) => {
            const dir = join(root, name);
            const sessions = readdirSync(dir)
                .filter((file) => file.endsWith('.jsonl'))
                .sort()
                .filter((file) => statSync(join(dir, file)).mtimeMs >= window.from)
                .map((file) => ({ id: file.replace(/\.jsonl$/, ''), entries: readRecord(join(dir, file)) }));
            return { name, sessions };
        });
}

/** The main checkout: the parent of the common directory of git, or the current directory outside git. */
function treeRoot() {
    const run = spawnSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { encoding: 'utf8' });
    return run.status === 0 ? dirname(run.stdout.trim()) : process.cwd();
}

function flowPath(named) {
    if (named) return resolve(named);
    const here = dirname(fileURLToPath(import.meta.url));
    const laid = join(here, 'task-flow', 'flow.js');
    return existsSync(laid) ? laid : join(here, '..', 'task-flow', 'flow.js');
}

/** The command line; it runs after the module is evaluated, so the engine it imports can import this module. */
async function main() {
    let args;
    let window;
    try {
        args = parseArgs(process.argv.slice(2));
        if (args.mode === 'missed') {
            if (!Number.isInteger(args.last) || args.last < 1) throw new Error('--missed needs --last N');
        } else window = windowOf({ ...args, until: args.until ?? new Date().toISOString().slice(0, 10) });
    } catch (error) {
        console.error(`owner-nudges: ${error.message}\n${USAGE}`);
        process.exit(2);
    }
    const root = args.root ?? join(homedir(), '.claude', 'projects');
    const tree = args.tree ?? treeRoot();
    if (args.mode === 'missed') {
        const laid = args.layout ? Date.parse(args.layout) : layoutMoment(tree);
        if (laid === null || Number.isNaN(laid)) {
            console.log(`missed stops with open work: 0 of 0 stops in the last ${args.last} calls`);
            return;
        }
        const after = { from: laid, to: Number.POSITIVE_INFINITY };
        const copies = readCopies(root, tree, after);
        const path = flowPath(args.flow);
        const model = buildModel(path);
        const { GUARD_SETTINGS, openReaders } = await import(pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), 'task-flow-script.mjs')).href);
        const { missedLine, runMissed } = await import(pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), 'flow-forecast.mjs')).href);
        const from = lastCallsFrom(copies, after, args.last);
        const result = await runMissed({ copies, from, model, base: dirname(path), openReaders, tree, settings: GUARD_SETTINGS, laid: branchLaid(tree) });
        console.log(missedLine(result, args.last));
        return;
    }
    const copies = readCopies(root, tree, window);
    if (args.mode === 'typed') console.log(typedLine(measureTyped(copies, window)));
    else if (args.mode === 'refusals') console.log(refusalsLine(measureRefusals(copies, window)));
    else if (args.mode === 'deadlocks') console.log(deadlocksLine(findDeadlocks(copies, window)));
    else console.log(nudgesLine(measureNudges(copies, window, buildModel(flowPath(args.flow)).words.nudge)));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
