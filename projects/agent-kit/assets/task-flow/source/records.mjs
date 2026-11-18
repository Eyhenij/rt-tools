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
 *
 * A record outside these directories is no record of this repository: a path a caller names in
 * `RT_FLOW_TRANSCRIPT` counts only when it lies in one of them.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { wordOf } from './owner.mjs';

/** The name of the record directory of a working copy. */
export const encodeCopy = (path) => resolve(path).replace(/[/.]/g, '-');

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
    for (const line of readFileSync(file, 'utf8').split('\n')) {
        if (!line.trim()) continue;
        try {
            entries.push(JSON.parse(line));
        } catch {
            // A line that does not parse is no entry.
        }
    }
    return entries;
};

export function open(root = process.cwd()) {
    const dirs = () => copies(root).map((copy) => join(home(), encodeCopy(copy))).filter((dir) => existsSync(dir));
    const records = () =>
        dirs().flatMap((dir) =>
            readdirSync(dir)
                .filter((name) => name.endsWith('.jsonl'))
                .map((name) => join(dir, name)),
        );
    const holds = (path) => {
        if (!path || !path.endsWith('.jsonl')) return false;
        const full = resolve(path);
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
    return { dirs, records, holds, said, entry };
}
