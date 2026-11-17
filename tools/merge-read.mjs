#!/usr/bin/env node
// rt-kit v0.37.0 · checks/merge-read.mjs · 6fdde58fd400 · правится надстройкой, не здесь
/**
 * The merges of requests and the editions of packages, read from the hosting and the registry and
 * written as observations: what the day line and the epic windows are counted by.
 *
 *   node merge-read.mjs --pulls <file> --observations <dir> --mark <file>
 *                       [--main <branch>] [--packages <dir>,<dir>] [--editions <pkg>=<file>]...
 *
 * `--pulls` holds the requests the hosting gave, one JSON object per line: `{number, state,
 * headRefName, baseRefName, mergedAt, title, files}`, open requests included — they tell a task
 * branch from an epic branch before the epic merges. `--editions` holds the answer of the registry
 * for one package: the map of versions to their moments.
 *
 * What is written, by the day of the moment:
 *   task-merged    a task request merged; `opens: "1"` when its base is an epic branch, `epic` its key
 *   epic-merged    an epic request merged into the main branch; `pkg` the packages it changed
 *   edition        a published version of a package of the tree
 *
 * A request and an edition are written once: the mark keeps what was read. An answer that does not
 * parse whole writes nothing and keeps the mark: a broken read is taken again by the next one.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { taskOf } from './record-count.mjs';

const MINUTE = 60 * 1000;

const option = (argv, name) => {
    const at = argv.indexOf(name);
    return at >= 0 ? argv[at + 1] : undefined;
};

const options = (argv, name) => argv.flatMap((value, at) => (value === name && argv[at + 1] ? [argv[at + 1]] : []));

/** A value of an observation: no path, no text, a name of 48 characters at most. */
const clean = (value) => String(value ?? '').includes('/') ? '' : String(value ?? '').replace(/[^A-Za-z0-9._:-]/g, '').slice(0, 48);

/**
 * The branches that are task branches: the head of a request whose base is not the main branch. A
 * request merged into such a branch is a stack step, and it opens no window.
 */
export function taskBranchesOf(pulls, main = 'main') {
    return new Set(pulls.filter((p) => p.baseRefName && p.baseRefName !== main).map((p) => p.headRefName));
}

/** The branches that are epic branches: a base of a request that is no task branch and no main branch. */
export function epicBranchesOf(pulls, main = 'main') {
    const tasks = taskBranchesOf(pulls, main);
    return new Set(pulls.map((p) => p.baseRefName).filter((base) => base && base !== main && !tasks.has(base)));
}

/** The packages a request changed: the directories of `packages` that hold one of its files. */
export const packagesOf = (pull, packages) =>
    packages.filter((dir) => (pull.files ?? []).some((file) => file === dir || file.startsWith(`${dir}/`))).map((dir) => dir.split('/').pop());

/** The observations of the merged requests: one per request, by its merge moment. */
export function mergesOf(pulls, { main = 'main', packages = [] } = {}) {
    const epics = epicBranchesOf(pulls, main);
    const out = [];
    for (const pull of pulls) {
        if (!pull.mergedAt) continue;
        const task = clean(taskOf(pull.headRefName));
        if (pull.baseRefName === main && epics.has(pull.headRefName)) {
            out.push({ number: pull.number, line: { t: pull.mergedAt, ev: 'epic-merged', task, pkg: packagesOf(pull, packages).map(clean).join(',') } });
            continue;
        }
        const line = { t: pull.mergedAt, ev: 'task-merged', task };
        if (epics.has(pull.baseRefName)) {
            line.opens = '1';
            line.epic = clean(taskOf(pull.baseRefName));
        }
        out.push({ number: pull.number, line });
    }
    return out;
}

/** The observations of the editions of one package: the registry map without its service keys. */
export const editionsOf = (pkg, times) =>
    Object.entries(times ?? {})
        .filter(([version, at]) => /^\d+\.\d+\.\d+/.test(version) && typeof at === 'string')
        .map(([version, at]) => ({ key: `${pkg}@${version}`, line: { t: at, ev: 'edition', pkg: clean(pkg), ver: clean(version) } }));

/**
 * The merges of a day for the day line: the merged tasks, those with a taking seen on this machine,
 * and their whole minutes from the taking. The taking of a task is its earliest `task-taken`.
 */
export function dayMerges(observations, day) {
    const taken = new Map();
    for (const o of observations) {
        if (o.ev !== 'task-taken' || !o.task) continue;
        if (!taken.has(o.task) || o.t < taken.get(o.task)) taken.set(o.task, o.t);
    }
    let tasksMerged = 0;
    let tasksTimed = 0;
    let takenMinutes = 0;
    for (const o of observations) {
        if (o.ev !== 'task-merged' || !String(o.t).startsWith(day)) continue;
        tasksMerged += 1;
        const from = taken.get(o.task);
        if (!from || from > o.t) continue;
        tasksTimed += 1;
        takenMinutes += Math.floor((Date.parse(o.t) - Date.parse(from)) / MINUTE);
    }
    return { tasksMerged, tasksTimed, takenMinutes };
}

/** The end of a day of UTC: what was true at it is what the report of the day says. */
const endOf = (day) => `${day}T23:59:59.999Z`;

/**
 * The epics of a report day, judged by the end of that day: each epic merged into the main branch
 * by then, and each epic whose window opened by then with no merge yet.
 *
 *   status    `released` — every package the epic changed has an edition after the merge, or it
 *             changed none; `not-released` — a package has no such edition; `merged` — the tree
 *             publishes no package; `open` — no merge into the main branch yet
 *   minutes   whole minutes from the taking to the release, to the merge while not released, and
 *             null for an open epic or one with no taking seen; the taking of an epic is the earliest
 *             taking of the epic branch or of a task merged into it
 */
export function dayEpics(observations, day, { publishes = true } = {}) {
    const end = endOf(day);
    const until = observations.filter((o) => String(o.t) <= end);
    const tasksOf = new Map();
    const opened = new Set();
    for (const o of until) {
        if (o.ev !== 'task-merged' || !o.epic) continue;
        if (!tasksOf.has(o.epic)) tasksOf.set(o.epic, new Set());
        tasksOf.get(o.epic).add(o.task);
        if (o.opens) opened.add(o.epic);
    }
    const takenAt = (epic) =>
        until
            .filter((o) => o.ev === 'task-taken' && (o.task === epic || tasksOf.get(epic)?.has(o.task)))
            .map((o) => o.t)
            .sort()[0] ?? null;
    const minutesBetween = (from, to) => (from && to ? Math.floor((Date.parse(to) - Date.parse(from)) / MINUTE) : null);
    const merged = new Map(until.filter((o) => o.ev === 'epic-merged').map((o) => [o.task, o]));
    const out = [];
    for (const [epic, merge] of merged) {
        const packages = String(merge.pkg ?? '').split(',').filter(Boolean);
        const editions = packages.map((pkg) =>
            until.filter((o) => o.ev === 'edition' && o.pkg === pkg && o.t > merge.t).map((o) => o.t).sort()[0] ?? null,
        );
        let status = 'released';
        let releasedAt = merge.t;
        if (!publishes) {
            status = 'merged';
            releasedAt = null;
        } else if (editions.some((at) => at === null)) {
            status = 'not-released';
            releasedAt = null;
        } else if (editions.length > 0) {
            releasedAt = editions.sort().at(-1);
        }
        out.push({ epic, status, mergedAt: merge.t, releasedAt, minutes: minutesBetween(takenAt(epic), releasedAt ?? merge.t) });
    }
    for (const epic of opened) {
        if (!merged.has(epic)) out.push({ epic, status: 'open', mergedAt: null, releasedAt: null, minutes: null });
    }
    return out;
}

/** The lines of a file of JSON lines, or null when one of them does not parse. */
function linesOf(file) {
    const out = [];
    for (const line of readFileSync(file, 'utf8').split('\n')) {
        if (!line.trim()) continue;
        try {
            out.push(JSON.parse(line));
        } catch {
            return null;
        }
    }
    return out;
}

function main(argv) {
    const dir = option(argv, '--observations');
    const markFile = option(argv, '--mark');
    const pullsFile = option(argv, '--pulls');
    if (!dir || !markFile || !pullsFile || !existsSync(pullsFile)) return 0;
    let mark = { pulls: [], editions: [] };
    try {
        if (existsSync(markFile)) mark = { ...mark, ...JSON.parse(readFileSync(markFile, 'utf8')) };
    } catch {
        // A broken mark reads as none: a request read twice is held by the mark of the next run.
    }
    const pulls = linesOf(pullsFile);
    const editions = [];
    for (const pair of options(argv, '--editions')) {
        const [pkg, file] = pair.split('=');
        try {
            editions.push(...editionsOf(pkg, JSON.parse(readFileSync(file, 'utf8'))));
        } catch {
            return 0;
        }
    }
    if (pulls === null) return 0;
    const seenPulls = new Set(mark.pulls);
    const seenEditions = new Set(mark.editions);
    const packages = (option(argv, '--packages') ?? '').split(',').filter(Boolean);
    const fresh = [
        ...mergesOf(pulls, { main: option(argv, '--main') ?? 'main', packages }).filter((m) => !seenPulls.has(m.number)),
        ...editions.filter((e) => !seenEditions.has(e.key)),
    ];
    mkdirSync(dir, { recursive: true });
    for (const item of fresh) {
        appendFileSync(join(dir, `${item.line.t.slice(0, 10)}.jsonl`), `${JSON.stringify(item.line)}\n`);
        if (item.number !== undefined) seenPulls.add(item.number);
        if (item.key !== undefined) seenEditions.add(item.key);
    }
    mkdirSync(dirname(markFile), { recursive: true });
    writeFileSync(markFile, JSON.stringify({ pulls: [...seenPulls], editions: [...seenEditions] }));
    return 0;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) process.exit(main(process.argv.slice(2)));
