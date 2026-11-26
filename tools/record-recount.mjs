#!/usr/bin/env node
// rt-kit v0.41.0 · checks/record-recount.mjs · 5875ba519bd3 · правится надстройкой, не здесь
/**
 * The recount of past days from the saved session records of this tree, by the counter the hook at
 * the end of a turn uses. The hook counts only the turns after it was laid out; a day before that is
 * counted here once, on demand.
 *
 *   node record-recount.mjs --tree <root> --observations <dir> (--day YYYY-MM-DD | --days N --until YYYY-MM-DD)
 *                           [--projects <dir>] [--patterns <correction patterns>]
 *
 * A saved record belongs to the tree when its working directory is the tree or a copy of it. A copy
 * already removed from disk is recognised by its branches: they stand in the history of the tree.
 *
 * A session the hook already counted on a day is not recounted for that day: the hook counts a
 * session whole on its first turn, days before its layout included. A day recounted before is
 * replaced: the lines a recount wrote carry `src: "recount"` and are removed before the new ones are
 * written, so a second run does not add to the first. The day is a calendar day of UTC.
 */
import { execFileSync } from 'node:child_process';
import { createReadStream, existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';

import { observationsOf } from './record-turn.mjs';

const DAY = 24 * 60 * 60 * 1000;

const option = (argv, name) => {
    const at = argv.indexOf(name);
    return at >= 0 ? argv[at + 1] : undefined;
};

/** The POSIX `cksum` of a text: the session sign the hooks write is computed by it. */
export function cksum(text) {
    const bytes = Buffer.from(text, 'utf8');
    let crc = 0;
    const step = (byte) => {
        crc ^= byte << 24;
        for (let i = 0; i < 8; i += 1) crc = crc & 0x80000000 ? ((crc << 1) ^ 0x04c11db7) >>> 0 : (crc << 1) >>> 0;
    };
    for (const byte of bytes) step(byte);
    for (let length = bytes.length; length > 0; length >>>= 8) step(length & 0xff);
    return String(~crc >>> 0);
}

/** The days of a window, oldest first. */
export function daysOf({ day, days, until }) {
    if (day) return [day];
    const end = Date.parse(`${until}T00:00:00Z`);
    return Array.from({ length: Number(days) }, (_, i) => new Date(end - (Number(days) - 1 - i) * DAY).toISOString().slice(0, 10));
}

const git = (root, args) => {
    try {
        return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    } catch {
        return '';
    }
};

/** The paths of the tree and its copies on this machine, and the branch names its history knows. */
function treeOf(root) {
    const paths = new Set([root]);
    for (const line of git(root, ['worktree', 'list', '--porcelain']).split('\n')) if (line.startsWith('worktree ')) paths.add(line.slice(9));
    const branches = new Set();
    for (const ref of git(root, ['for-each-ref', '--format=%(refname:short)', 'refs/heads', 'refs/remotes']).split('\n')) {
        if (ref) branches.add(ref.replace(/^[^/]+\//, '')).add(ref);
    }
    for (const subject of git(root, ['log', '--all', '--merges', '--format=%s']).split('\n')) {
        const from = subject.match(/from [^/\s]+\/(\S+)/)?.[1];
        if (from) branches.add(from);
    }
    return { paths, branches };
}

/** The directory name Claude Code gives the records of a working directory. */
const dirNameOf = (path) => path.replace(/[/.]/g, '-');

const atOf = (entry) => entry.timestamp ?? entry.attachment?.timestamp ?? '';

/**
 * The entries of a record that fall on the days, read line by line: a record grows past what one
 * string holds. The signs of whose record it is — the working directory and the branches — are read
 * from every line.
 */
async function readRecordDays(file, days) {
    const entries = [];
    const cwds = new Set();
    const branches = new Set();
    const lines = createInterface({ input: createReadStream(file, 'utf8'), crlfDelay: Infinity });
    for await (const line of lines) {
        if (!line.trim()) continue;
        let entry;
        try {
            entry = JSON.parse(line);
        } catch {
            continue;
        }
        if (typeof entry.cwd === 'string') cwds.add(entry.cwd);
        if (typeof entry.gitBranch === 'string') branches.add(entry.gitBranch);
        if (days.has(atOf(entry).slice(0, 10))) entries.push(entry);
    }
    return { entries, cwds, branches };
}

/** The session files of the tree with their entries of the days: by the working directory, or by the branches. */
export async function recordsOf(root, projects, dayList) {
    const { paths, branches } = treeOf(root);
    const own = new Set([...paths].map(dirNameOf));
    const days = new Set(dayList);
    const since = Date.parse(`${dayList[0]}T00:00:00Z`);
    const out = [];
    if (!existsSync(projects)) return out;
    for (const name of readdirSync(projects)) {
        const dir = join(projects, name);
        if (!statSync(dir).isDirectory()) continue;
        for (const file of readdirSync(dir).filter((f) => f.endsWith('.jsonl'))) {
            const path = join(dir, file);
            if (statSync(path).mtimeMs < since) continue;
            const read = await readRecordDays(path, days);
            if (read.entries.length === 0) continue;
            const mine =
                own.has(name) ||
                [...read.cwds].some((cwd) => [...paths].some((p) => cwd === p || cwd.startsWith(`${p}/`))) ||
                [...read.branches].some((b) => b !== 'main' && b !== 'HEAD' && branches.has(b));
            if (mine) out.push({ session: basename(file, '.jsonl'), entries: read.entries });
        }
    }
    return out;
}

/** Recounts the days; returns per day what happened: `recounted N`, and `hook M` for the sessions the hook counted. */
export async function recount({ root, observations, days, projects, patterns }) {
    const records = await recordsOf(root, projects, days);
    const result = {};
    mkdirSync(observations, { recursive: true });
    for (const day of days) {
        const file = join(observations, `${day}.jsonl`);
        const lines = existsSync(file) ? readFileSync(file, 'utf8').split('\n').filter(Boolean) : [];
        const parsed = lines.map((line) => {
            try {
                return JSON.parse(line);
            } catch {
                return null;
            }
        });
        const counted = new Set(parsed.filter((o) => o && typeof o.ev === 'string' && o.ev.startsWith('record-') && o.src !== 'recount').map((o) => o.sid));
        const kept = lines.filter((_, i) => parsed[i]?.src !== 'recount');
        const added = [];
        let left = 0;
        for (const { session, entries } of records) {
            const ofDay = entries.filter((e) => atOf(e).startsWith(day));
            if (ofDay.length === 0) continue;
            const sid = cksum(session);
            if (counted.has(sid)) {
                left += 1;
                continue;
            }
            const byDay = observationsOf(ofDay, { sid, patterns });
            for (const line of byDay.get(day) ?? []) added.push(JSON.stringify({ ...JSON.parse(line), src: 'recount' }));
        }
        writeFileSync(file, [...kept, ...added].join('\n') + (kept.length + added.length > 0 ? '\n' : ''));
        result[day] = left > 0 ? `recounted ${added.length}, hook ${left}` : `recounted ${added.length}`;
    }
    return result;
}

/** The correction patterns, read from the hook that declares them, as the hook at the end of a turn reads them. */
export function patternsOf(root) {
    const hook = join(root, '.claude', 'hooks', 'owner-corrections.sh');
    if (!existsSync(hook)) return undefined;
    return readFileSync(hook, 'utf8').match(/^RT_CORRECTION_PATTERNS='(.*)'$/m)?.[1];
}

async function main(argv) {
    const root = option(argv, '--tree') ?? process.cwd();
    const observations = option(argv, '--observations') ?? join(root, '.claude', 'rt-kit', 'observations');
    const day = option(argv, '--day');
    const days = daysOf({ day, days: option(argv, '--days') ?? '1', until: option(argv, '--until') ?? new Date().toISOString().slice(0, 10) });
    const projects = option(argv, '--projects') ?? join(homedir(), '.claude', 'projects');
    const patterns = option(argv, '--patterns') ?? patternsOf(root);
    const result = await recount({ root, observations, days, projects, patterns });
    for (const [d, what] of Object.entries(result)) console.log(`${d}: ${what}`);
    return 0;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) main(process.argv.slice(2)).then((code) => process.exit(code));
