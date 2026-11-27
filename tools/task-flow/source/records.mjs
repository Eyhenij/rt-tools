// rt-kit v0.42.0 · task-flow/source/records.mjs · 946ea005fd6f · правится надстройкой, не здесь
/**
 * The record directories of this repository: the directories where the harness keeps the session
 * records of every working copy, one per copy. The harness names a directory by the path of its copy
 * with every slash and dot turned into a dash, under `~/.claude/projects`; `RT_FLOW_RECORDS_HOME`
 * names another home, as the suites do. The copies are those `git worktree list` names.
 *
 *   dirs()             the record directories that exist, the main copy first
 *   records()          the session records in them: the files ending in .jsonl, not the memory
 *   holds(path)        the path is a session record in one of the record directories
 *   said(quote)        a message the owner typed in any of the records holds the quote
 *   entry(path, uuid)  the entry with that uuid in a record of the record directories, or null
 *   approvalFault(mark, planSha, task)  why the approval mark does not hold here, or null
 *
 * A record outside these directories is no record of this repository: a path a caller names in
 * `RT_FLOW_TRANSCRIPT` counts only when it lies in one of them.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { approvalOf, wordOf } from './owner.mjs';
import { linesOf } from './session.mjs';

/**
 * Why an approval mark does not hold, or null when it does: the mark names the commit of the plan
 * and the place of the answer — a session record of this repository and the uuid of its entry — and
 * the entry there approves the plan of the task by `approvalOf`, the rule `plan-red` uses too. The
 * move of every reason is the same: run `plan-red`, which finds the answer in the record; the owner
 * is asked only when it finds none.
 */
export function approvalFault(mark, planSha, task, records) {
    if (!mark || typeof mark.answer !== 'string') return 'there is no approval mark';
    if (!mark.place?.record || !mark.place?.uuid) return 'the approval mark names no place of the answer';
    if (mark.plan !== planSha) return 'the approval mark names another commit of the plan';
    if (!records.holds(mark.place.record)) return 'the place of the answer is not a session record of this repository';
    if (!existsSync(mark.place.record)) return 'the session record of the answer is gone';
    const entry = records.entry(mark.place.record, mark.place.uuid);
    if (!entry) return 'the session record no longer holds the entry of the answer';
    if (!approvalOf(entry, task)) return 'the entry at the place is no approving answer of the owner';
    return null;
}

/** The name of the record directory of a working copy. */
export const encodeCopy = (path) => resolve(path).replace(/[/.]/g, '-');

/** The path with the links of its existing part resolved: a home under a link names one directory. */
const real = (path) => {
    const full = resolve(path);
    if (existsSync(full)) return realpathSync(full);
    const parent = dirname(full);
    return parent === full ? full : join(real(parent), basename(full));
};

const home = () => process.env.RT_FLOW_RECORDS_HOME || join(homedir(), '.claude', 'projects');

const copies = (root) => {
    const out = spawnSync('git', ['-C', root, 'worktree', 'list', '--porcelain'], { encoding: 'utf8' });
    if (out.status !== 0) return [resolve(root)];
    return out.stdout
        .split('\n')
        .filter((line) => line.startsWith('worktree '))
        .map((line) => line.slice('worktree '.length));
};

const parse = (file) => {
    const entries = [];
    // By pieces: a record longer than one string of the runtime is never held whole.
    for (const line of linesOf(file)) {
        if (!line.trim()) continue;
        try {
            entries.push(JSON.parse(line));
        } catch {
            // A line that does not parse is no entry.
        }
    }
    return entries;
};

export function open() {
    return openAt(process.cwd());
}

/** The same for the working copy at `root`: the guard reads the tree of the call, not its own. */
export function openAt(root) {
    const dirs = () => copies(root).map((copy) => join(home(), encodeCopy(copy))).filter((dir) => existsSync(dir)).map((dir) => realpathSync(dir));
    const records = () =>
        dirs().flatMap((dir) =>
            readdirSync(dir)
                .filter((name) => name.endsWith('.jsonl'))
                .map((name) => join(dir, name)),
        );
    const holds = (path) => {
        if (!path || !path.endsWith('.jsonl')) return false;
        const full = real(path);
        // Directly in a record directory: a subagent record one level down is no session record.
        return dirs().some((dir) => full.startsWith(`${dir}/`) && !full.slice(dir.length + 1).includes('/'));
    };
    const said = (quote) => {
        const files = records();
        if (!quote || files.length === 0) return false;
        // The text is searched first, the entries are read only in the records that hold it.
        const out = spawnSync('grep', ['-lF', '--', quote, ...files], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
        const hits = (out.stdout ?? '').split('\n').filter(Boolean);
        return hits.some((file) => parse(file).some((entry) => (wordOf(entry) ?? '').includes(quote)));
    };
    const entry = (path, uuid) => {
        if (!holds(path) || !existsSync(path)) return null;
        return parse(path).find((e) => e.uuid === uuid) ?? null;
    };
    const api = { dirs, records, holds, said, entry };
    api.approvalFault = (mark, planSha, task) => approvalFault(mark, planSha, task, api);
    return api;
}
