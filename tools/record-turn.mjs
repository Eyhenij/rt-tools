#!/usr/bin/env node
// rt-kit v0.41.0 · checks/record-turn.mjs · e51523db5190 · правится надстройкой, не здесь
/**
 * The count of one turn of a session record, written as observations. The hook at the end of a turn
 * and at the end of a session calls it; so does the recount of a past day.
 *
 *   node record-turn.mjs --record <session.jsonl> --observations <dir> --mark <file> --sid <sign>
 *                        [--patterns <correction patterns>] [--version <v>] [--now <ISO>]
 *
 * It reads the record from the offset its mark keeps, turns the new entries into the events of
 * `record-count.mjs` and appends each as an observation line to the file of the day of its moment:
 * `{"t":<moment>,"ev":"record-<event>",...,"sid":<sign>}`. The words of the owner leave no text: a word
 * carries only its kind, whether the set of correction patterns matched it and what it is about (`about`).
 *
 * An unfinished last line — the harness writes the record while the hook runs — is left for the next
 * count: the mark stays before it. A line in the middle that does not parse is skipped and counted
 * (`record-skip`). A record that cannot be read writes `record-broken` and changes no mark. The count
 * never fails the turn: every path exits with zero.
 *
 * Taking a task is the first moment a session stands on the branch of the task: the first entry of
 * the session with that branch writes `{"ev":"task-taken","task":<key>}`. The mark keeps the tasks
 * the session already took, so a later turn on the same branch writes no second taking.
 */
import { appendFileSync, existsSync, mkdirSync, openSync, readFileSync, readSync, closeSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { aboutOf, eventsOf, ownerWords, taskOf } from './record-count.mjs';

const option = (argv, name) => {
    const at = argv.indexOf(name);
    return at >= 0 ? argv[at + 1] : undefined;
};

/** A value fit for an observation: no path, only a name, trimmed. */
const clean = (value) => (value === undefined || value === null ? '' : String(value).includes('/') ? '' : String(value).replace(/[^A-Za-z0-9._:-]/g, '').slice(0, 48));

const readMark = (file) => {
    try {
        return JSON.parse(readFileSync(file, 'utf8'));
    } catch {
        return { offset: 0 };
    }
};

/** The whole lines of a record from an offset: the parsed entries, the skipped count and the new offset. */
export function readFrom(file, offset) {
    const size = statSync(file).size;
    if (size <= offset) return { entries: [], skipped: 0, offset: Math.min(offset, size) };
    const fd = openSync(file, 'r');
    const buffer = Buffer.alloc(size - offset);
    try {
        readSync(fd, buffer, 0, buffer.length, offset);
    } finally {
        closeSync(fd);
    }
    const end = buffer.lastIndexOf(0x0a);
    if (end < 0) return { entries: [], skipped: 0, offset };
    const entries = [];
    let skipped = 0;
    for (const line of buffer.subarray(0, end).toString('utf8').split('\n')) {
        if (!line.trim()) continue;
        try {
            entries.push(JSON.parse(line));
        } catch {
            skipped += 1;
        }
    }
    return { entries, skipped, offset: offset + end + 1 };
}

/** A task key of a branch: the taking is written only for a branch that names a task. */
const TASK_KEY = /^[A-Z]+-\d+$/;

/**
 * The takings of tasks in some entries: the first entry of each task the session stands on, not
 * counting the tasks of `seen`. The set is filled with what is found.
 */
export function takingsOf(entries, seen = new Set()) {
    const out = [];
    for (const entry of entries) {
        const at = entry?.timestamp;
        const task = taskOf(entry?.gitBranch);
        if (!at || entry?.isSidechain || !task || !TASK_KEY.test(task) || seen.has(task)) continue;
        seen.add(task);
        out.push({ at, task });
    }
    return out;
}

/** The observation lines of the events of some entries, by the day of their moment. */
export function observationsOf(entries, { sid, patterns, version, seen = new Set() }) {
    const pattern = patterns ? new RegExp(patterns, 'iu') : null;
    const words = ownerWords(entries);
    const corrected = new Set(pattern ? words.filter((w) => pattern.test(w.text)).map((w) => `${w.session}|${w.at}|${w.kind}`) : []);
    const about = new Map(words.map((w) => [`${w.session}|${w.at}|${w.kind}`, aboutOf(w.text, patterns)]));
    const byDay = new Map();
    for (const e of eventsOf(entries)) {
        const line = { t: e.at, ev: `record-${e.ev}` };
        const task = clean(taskOf(e.branch));
        if (task) line.task = task;
        for (const key of ['kind', 'check', 'tool']) if (e[key] !== undefined && e[key] !== null) line[key] = clean(e[key]);
        if (e.ev === 'ask' && e.reask) line.reask = '1';
        if (e.ev === 'change' && e.analysis) line.analysis = '1';
        if (e.ev === 'menu' && e.answered) line.answered = clean(e.answered);
        if (e.ev === 'word' && corrected.has(`${e.session}|${e.at}|${e.kind}`)) line.corr = '1';
        if (e.ev === 'word' && about.has(`${e.session}|${e.at}|${e.kind}`)) line.about = about.get(`${e.session}|${e.at}|${e.kind}`);
        line.sid = sid;
        if (version) line.v = version;
        const day = e.at.slice(0, 10);
        if (!byDay.has(day)) byDay.set(day, []);
        byDay.get(day).push(JSON.stringify(line));
    }
    for (const taking of takingsOf(entries, seen)) {
        const day = taking.at.slice(0, 10);
        if (!byDay.has(day)) byDay.set(day, []);
        byDay.get(day).push(JSON.stringify({ t: taking.at, ev: 'task-taken', task: clean(taking.task), sid, ...(version ? { v: version } : {}) }));
    }
    return byDay;
}

/**
 * The lines the file of the day does not hold yet. A second run over the same entries — a mark left
 * behind by a run that did not finish, or two runs of the hook for one turn — writes each line again;
 * the file already holds it, so it is dropped. The count goes by the number of copies: two equal calls
 * of one entry are two lines, and only as many as the file lacks are written.
 */
function notWritten(lines, file) {
    const held = new Map();
    if (existsSync(file)) for (const line of readFileSync(file, 'utf8').split('\n')) if (line) held.set(line, (held.get(line) ?? 0) + 1);
    return lines.filter((line) => {
        const left = held.get(line) ?? 0;
        if (left > 0) held.set(line, left - 1);
        return left === 0;
    });
}

function main(argv) {
    const record = option(argv, '--record');
    const dir = option(argv, '--observations');
    const markFile = option(argv, '--mark');
    const sid = clean(option(argv, '--sid'));
    const version = clean(option(argv, '--version'));
    const now = option(argv, '--now') ?? new Date().toISOString();
    if (!dir || !markFile) return 0;
    const note = (ev, extra = {}) => {
        try {
            mkdirSync(dir, { recursive: true });
            appendFileSync(join(dir, `${now.slice(0, 10)}.jsonl`), `${JSON.stringify({ t: now, ev, ...extra, sid, ...(version ? { v: version } : {}) })}\n`);
        } catch {
            // The count never fails the turn.
        }
    };
    if (!record || !existsSync(record)) {
        note('record-broken');
        return 0;
    }
    try {
        const mark = readMark(markFile);
        const read = readFrom(record, Number(mark.offset) || 0);
        const seen = new Set(Array.isArray(mark.taken) ? mark.taken : []);
        const byDay = observationsOf(read.entries, { sid, patterns: option(argv, '--patterns'), version, seen });
        mkdirSync(dir, { recursive: true });
        for (const [day, lines] of byDay) {
            const fresh = notWritten(lines, join(dir, `${day}.jsonl`));
            if (fresh.length > 0) appendFileSync(join(dir, `${day}.jsonl`), `${fresh.join('\n')}\n`);
        }
        if (read.skipped > 0) note('record-skip', { n: String(read.skipped) });
        mkdirSync(dirname(markFile), { recursive: true });
        writeFileSync(markFile, JSON.stringify({ offset: read.offset, taken: [...seen] }));
    } catch {
        note('record-broken');
    }
    return 0;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) process.exit(main(process.argv.slice(2)));
