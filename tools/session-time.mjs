#!/usr/bin/env node
/**
 * Where the time of agent sessions goes: `pnpm run session:time`.
 *
 *   pnpm run session:time                                   the journals of this working copy
 *   node tools/session-time.mjs --file <journal.jsonl>      one journal, may be given several times
 *   node tools/session-time.mjs --since 2026-11-21 --until 2026-11-24
 *   node tools/session-time.mjs --by-branch --steps --json
 *
 * `--branches RT-1,RT-2` prints the mean active minutes of the branches that start with these keys, and
 * the mean of every category: it is the number the milestone of the epic is judged by.
 *
 * `--steps` adds the median minutes of every step of the task flow over the branches that went the
 * whole course; what tells a step from another is said in `session-time-steps.mjs`.
 *
 * The journals are the client's own and lie outside the tree. Nothing is written and no text of a
 * message or of a command is printed: the output holds numbers, categories and branch names.
 *
 * A journal is read line by line: one session took 176 MB. A line that is not JSON is counted and
 * named, and a record whose `uuid` was already read is skipped — a resumed session repeats them in a
 * second file. A journal that cannot be read is refused with the code 1; no journal at all is too:
 * an empty table reads as «no time was spent».
 */
import { createReadStream, existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

import { CATEGORIES, eventOf, measure, reportOf } from './session-time-model.mjs';
import { STEPS, noteEnds, stepsOf, stepsReport } from './session-time-steps.mjs';

const fail = (message) => {
    console.error(`session-time: ${message}`);
    process.exit(1);
};

function parseArgs(argv) {
    const args = { files: [], since: null, until: null, branches: null, byBranch: false, steps: false, json: false };
    for (let i = 0; i < argv.length; i += 1) {
        const value = argv[i + 1];
        if (argv[i] === '--by-branch') args.byBranch = true;
        else if (argv[i] === '--steps') args.steps = true;
        else if (argv[i] === '--json') args.json = true;
        else if (argv[i] === '--branches' && value) args.branches = argv[(i += 1)].split(',');
        else if (argv[i] === '--file' && value) args.files.push(argv[(i += 1)]);
        else if ((argv[i] === '--since' || argv[i] === '--until') && /^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) {
            args[argv[i].slice(2)] = argv[(i += 1)];
        } else fail(`unknown or incomplete argument ${argv[i]}`);
    }
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

async function readJournal(file, store) {
    const { events, calls, seen } = store;
    let broken = 0;
    for await (const line of createInterface({ input: createReadStream(file, 'utf8'), crlfDelay: Infinity })) {
        if (line.trim() === '') continue;
        let record;
        try {
            record = JSON.parse(line);
        } catch {
            broken += 1;
            continue;
        }
        if (record.uuid && seen.has(record.uuid)) continue;
        if (record.uuid) seen.add(record.uuid);
        const event = eventOf(record, calls);
        if (event) events.push(event);
        noteEnds(record, store);
    }
    return broken;
}

/** One session has one clock: the gaps are counted inside each journal, then added up. */
async function readAll(files, { since, until }) {
    const seen = new Set();
    const total = {};
    const branches = {};
    const rows = [];
    let broken = 0;
    const from = since ? Date.parse(`${since}T00:00:00`) : -Infinity;
    const to = until ? Date.parse(`${until}T23:59:59.999`) : Infinity;
    for (const file of files) {
        const store = { events: [], calls: new Map(), ends: new Map(), agents: new Map(), seen };
        broken += await readJournal(file, store);
        const events = store.events.filter((event) => event.at >= from && event.at <= to).sort((a, b) => a.at - b.at);
        const part = measure(events, store.calls);
        rows.push(...stepsOf({ events, calls: store.calls, ends: store.ends, owner: part.owner }));
        for (const [kind, hours] of Object.entries(part.total)) total[kind] = (total[kind] ?? 0) + hours;
        for (const [branch, kinds] of Object.entries(part.branches)) {
            branches[branch] ??= {};
            for (const [kind, hours] of Object.entries(kinds)) branches[branch][kind] = (branches[branch][kind] ?? 0) + hours;
        }
    }
    return { total, branches, rows, broken };
}

const pad = (text, width) => text.padEnd(width);

/** The mean minutes of the named branches. A key that no branch starts with is refused: a mean over fewer branches reads as a whole one. */
function meansOf(branches, keys) {
    const found = keys.map((key) => [key, Object.keys(branches).find((branch) => branch === key || branch.startsWith(`${key}-`))]);
    const missing = found.filter(([, branch]) => branch === undefined).map(([key]) => key);
    if (missing.length > 0) fail(`no branch of the journals starts with ${missing.join(', ')}`);
    const reports = found.map(([, branch]) => reportOf(branches[branch]));
    const mean = (pick) => Math.round((reports.reduce((sum, report) => sum + pick(report), 0) / reports.length) * 600) / 10;
    return {
        branches: reports.length,
        activeMinutes: mean((report) => report.activeHours),
        ownerMinutes: mean((report) => report.ownerHours),
        categories: Object.fromEntries(CATEGORIES.map(([key]) => [key, mean((report) => report.categories[key].hours)])),
    };
}

function printMeans({ branches, activeMinutes, ownerMinutes, categories }) {
    console.log(`В среднем на ветку (${branches}): ${activeMinutes} мин активно, ${ownerMinutes} мин ожидания владельца`);
    for (const [key, label] of CATEGORIES) console.log(`  ${pad(label, 34)} ${String(categories[key]).padStart(5)}`);
}

function printSteps({ branches, medians }) {
    console.log(`Шаги task flow, медиана по ${branches} веткам полного хода, минуты`);
    for (const [key, label] of STEPS) console.log(`  ${pad(label, 34)} ${String(medians[key]).padStart(5)}`);
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
const files = args.files.length > 0 ? args.files : ownJournals();
if (files.length === 0) fail('no journal found for this working copy: name one by --file');
for (const file of files) if (!existsSync(file)) fail(`no such journal: ${file}`);

const { total, branches, rows, broken } = await readAll(files, args);
const report = reportOf(total);
const byBranch = args.byBranch
    ? Object.entries(branches)
          .map(([branch, kinds]) => [branch, reportOf(kinds)])
          .sort((a, b) => b[1].activeHours - a[1].activeHours)
    : [];
const means = args.branches ? meansOf(branches, args.branches) : null;
const steps = args.steps ? stepsReport(rows) : null;
if (args.json) console.log(JSON.stringify({ ...report, broken, branches: Object.fromEntries(byBranch), steps, means }));
else {
    printReport(report, byBranch, broken);
    if (steps) printSteps(steps);
    if (means) printMeans(means);
}
