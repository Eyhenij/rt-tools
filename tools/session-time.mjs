#!/usr/bin/env node
/**
 * Where the time of agent sessions goes: `pnpm run session:time`.
 *
 *   pnpm run session:time                                   the journals of this working copy
 *   node tools/session-time.mjs --file <journal.jsonl>      one journal, may be given several times
 *   node tools/session-time.mjs --since 2026-11-21 --until 2026-11-24
 *   node tools/session-time.mjs --by-branch --steps --json
 *
 * `--branches RT-1,RT-2` prints the mean active minutes of these tasks, and the mean of every category:
 * it is the number the milestone of the epic is judged by. A task is all the branches that start with
 * its key. With `--steps` it also leaves only these branches in the steps. A task cut by the period is
 * refused: the mean of its tail would read as the mean of the task.
 *
 * The days of `--since` and `--until` are the days of this machine. A gap belongs to the day it ended
 * in, so the days add up to the whole.
 *
 * `--steps` adds the median minutes of every step of the task flow over the branches that went the
 * whole course, and apart over the branches of one review round; what tells a step from another is said in `session-time-steps.mjs`.
 *
 * The journals are the client's own and lie outside the tree. Nothing is written and no text of a
 * message or of a command is printed: the output holds numbers, categories and branch names. The
 * journals of another working copy, a worktree included, are read only by `--file`.
 *
 * A journal is read line by line: one session took 176 MB. A line that is not a JSON object is counted
 * and named, and a record whose `uuid` was already read is skipped — a resumed session repeats them in
 * a second file. The longest file is read first, so the copy that goes on holds the whole session and
 * the order of the arguments changes nothing. A journal that cannot be read, or none at all, or no time
 * in the period is refused with the code 1: an empty table reads as «no time was spent».
 */
import { createReadStream, existsSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

import { CATEGORIES, OWNER, activeOf, eventOf, gapsOf, measure, reportOf } from './session-time-model.mjs';
import { LACKS, STEPS, endsOf, noteEnds, stepsOf, stepsReport } from './session-time-steps.mjs';

const fail = (message) => {
    console.error(`session-time: ${message}`);
    process.exit(1);
};

/** A day that the calendar holds: `2026-02-31` parses to a day of the next month and is not one. */
const isDay = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

const isOf = (branch, key) => branch === key || branch.startsWith(`${key}-`);

/** The keys of the tasks, each once: one that another key already holds is the same task. */
const keysOf = (value) => {
    const keys = [...new Set(value.split(',').filter(Boolean))];
    return keys.filter((key) => !keys.some((other) => other !== key && isOf(key, other)));
};

function parseArgs(argv) {
    const args = { files: [], since: null, until: null, branches: null, byBranch: false, steps: false, json: false };
    for (let i = 0; i < argv.length; i += 1) {
        const name = argv[i];
        if (name === '--') continue;
        if (name === '--by-branch') args.byBranch = true;
        else if (name === '--steps') args.steps = true;
        else if (name === '--json') args.json = true;
        else {
            const value = argv[(i += 1)] ?? '';
            if (value === '' || value.startsWith('--')) fail(`unknown or incomplete argument ${name}`);
            if (name === '--file') args.files.push(value);
            else if (name === '--branches') args.branches = keysOf(value);
            else if ((name === '--since' || name === '--until') && isDay(value)) args[name.slice(2)] = value;
            else fail(`unknown or incomplete argument ${name}`);
        }
    }
    if (args.branches?.length === 0) fail('unknown or incomplete argument --branches');
    if (args.since && args.until && args.since > args.until) fail(`the period ends before it begins: ${args.since} — ${args.until}`);
    return args;
}

/** The directory of the journals of the working copy: the client names it after the path. */
function ownJournals() {
    const dir = join(homedir(), '.claude', 'projects', process.cwd().replace(/[^a-zA-Z0-9]/g, '-'));
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
        .filter((name) => name.endsWith('.jsonl'))
        .map((name) => join(dir, name));
}

/** The journals from the longest to the shortest; the name settles a tie. */
function ordered(files) {
    const sized = [...new Set(files)].map((file) => {
        if (!existsSync(file)) fail(`no such journal: ${file}`);
        const stat = statSync(file);
        if (!stat.isFile()) fail(`not a journal file: ${file}`);
        return { file, size: stat.size };
    });
    return sized.sort((a, b) => b.size - a.size || (a.file < b.file ? -1 : 1)).map(({ file }) => file);
}

const parsed = (line) => {
    try {
        return JSON.parse(line);
    } catch {
        return null;
    }
};

/** The events of one journal; the calls and their ends go to the store that all the journals share. */
async function readJournal(file, store) {
    const events = [];
    for await (const line of createInterface({ input: createReadStream(file, 'utf8'), crlfDelay: Infinity })) {
        if (line.trim() === '') continue;
        const record = parsed(line);
        if (record === null || typeof record !== 'object') {
            store.broken += 1;
            continue;
        }
        if (record.uuid && store.seen.has(record.uuid)) continue;
        if (record.uuid) store.seen.add(record.uuid);
        const event = eventOf(record, store.calls);
        if (event) events.push(event);
        noteEnds(record, store);
    }
    return events;
}

/** One session has one clock: the gaps are counted inside each journal, then taken together. */
async function readAll(files) {
    const store = { calls: new Map(), notices: new Map(), reports: new Map(), agents: new Map(), seen: new Set(), broken: 0 };
    const journals = [];
    for (const file of files) {
        try {
            journals.push(await readJournal(file, store));
        } catch (error) {
            fail(`cannot read ${file}: ${error.code ?? error.message}`);
        }
    }
    return { all: journals.flatMap((events) => gapsOf(events, store.calls)), store };
}

const pad = (text, width) => text.padEnd(width);

/** The mean minutes of the named tasks: a key with no branch and a task cut by the period are refused, a mean of less reads as a whole one. */
function meansOf(all, gaps, keys) {
    const hoursOf = (from, key) => from.filter(({ branch }) => isOf(branch, key));
    const missing = keys.filter((key) => hoursOf(all, key).length === 0);
    if (missing.length > 0) fail(`no branch of the journals starts with ${missing.join(', ')}`);
    const cut = keys.filter((key) => hoursOf(gaps, key).length < hoursOf(all, key).length);
    if (cut.length > 0) fail(`the period cuts ${cut.join(', ')}: take the whole task`);
    const totals = keys.map((key) => measure(hoursOf(gaps, key)).total);
    const mean = (pick) => Math.round((totals.reduce((sum, hours) => sum + pick(hours), 0) / totals.length) * 600) / 10;
    return {
        branches: totals.length,
        activeMinutes: mean(activeOf),
        ownerMinutes: mean((hours) => hours[OWNER] ?? 0),
        categories: Object.fromEntries(CATEGORIES.map(([key]) => [key, mean((hours) => hours[key] ?? 0)])),
    };
}

function printMeans({ branches, activeMinutes, ownerMinutes, categories }) {
    console.log(`В среднем на задачу (${branches}): ${activeMinutes} мин активно, ${ownerMinutes} мин ожидания владельца`);
    for (const [key, label] of CATEGORIES) console.log(`  ${pad(label, 34)} ${String(categories[key]).padStart(5)}`);
}

const LABELS = new Map(CATEGORIES);

/** The two categories that took most of a step. */
const leading = (kinds) =>
    Object.entries(kinds)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([kind, minutes]) => `${LABELS.get(kind)} ${minutes}`)
        .join(', ');

function printGroup({ branches, medians, kinds }, name, none) {
    if (branches === 0) {
        console.log(none);

        return;
    }
    console.log(`Шаги task flow, медиана по ${branches} веткам ${name}, минуты; справа — среднее двух главных категорий шага`);
    for (const [key, label] of STEPS) console.log(`  ${pad(label, 34)} ${String(medians[key]).padStart(5)}  ${leading(kinds[key])}`);
}

function printSteps({ oneRound, left, open, ...full }) {
    printGroup(full, 'полного хода', 'Веток полного хода нет');
    printGroup(oneRound, 'с одним кругом', 'Веток с одним кругом нет');
    const lacks = Object.entries(left.lacks).filter(([, count]) => count > 0);
    const why = lacks.map(([key, count]) => `без ${LACKS[key]} ${count}`).join(', ');
    console.log(`Вне хода: веток ${left.branches}${why ? ` (${why})` : ''}, ${left.hours} ч активно`);
    if (open > 0) console.log(`Запусков ревью без найденного конца: ${open}`);
}

function printReport(report, branches, broken) {
    console.log(`Активно ${report.activeHours} ч, ожидание владельца ${report.ownerHours} ч`);
    for (const [key, label] of CATEGORIES) {
        const { hours, share } = report.categories[key];
        console.log(`  ${pad(label, 26)} ${String(hours).padStart(7)} ч  ${Math.round(share * 100)}%`);
    }
    if (broken > 0) console.log(`Строк без разбора: ${broken}`);
    for (const [branch, hours] of branches) {
        console.log(`${pad(branch, 44)} ${String(hours.activeHours).padStart(7)} ч активно, ${hours.ownerHours} ч ожидания владельца`);
    }
}

const args = parseArgs(process.argv.slice(2));
const files = ordered(args.files.length > 0 ? args.files : ownJournals());
if (files.length === 0) fail('no journal found for this working copy: name one by --file');
const from = args.since ? Date.parse(`${args.since}T00:00:00`) : -Infinity;
const to = args.until ? Date.parse(`${args.until}T23:59:59.999`) : Infinity;

const { all, store } = await readAll(files);
const gaps = all.filter((gap) => gap.to >= from && gap.to <= to);
if (gaps.length === 0) fail('no time of a session in the journals for the period');
const { total, branches } = measure(gaps);
const report = reportOf(total);
const byBranch = args.byBranch
    ? Object.entries(branches)
          .map(([branch, kinds]) => [branch, reportOf(kinds)])
          .sort((a, b) => b[1].activeHours - a[1].activeHours)
    : [];
const means = args.branches ? meansOf(all, gaps, args.branches) : null;
const takes = (branch) => !args.branches || args.branches.some((key) => isOf(branch, key));
const steps = args.steps ? stepsReport(stepsOf({ gaps, calls: store.calls, ends: endsOf(store), from, to, takes })) : null;
if (args.json) console.log(JSON.stringify({ ...report, broken: store.broken, branches: Object.fromEntries(byBranch), steps, means }));
else {
    printReport(report, byBranch, store.broken);
    if (steps) printSteps(steps);
    if (means) printMeans(means);
}
