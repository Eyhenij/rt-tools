/**
 * The source «source.git» of the task flow description: the history of the branch, read by `git`.
 *
 * The commits of the branch are those of the head the main branch on the server does not hold,
 * oldest first. A fact read from them stays true in later states: a folder taken apart is still
 * found in the commit that held it.
 *
 *   branch()            the name of the checked-out branch, '' when the head is detached
 *   commits()           [{ sha, added, deleted, modified }] — the paths each commit changed
 *   versionAt(path, sha) the text of the file at that commit, null where it is absent
 *   lastVersion(path)   the text at the head, or for a file the head lacks at `removedFrom`
 *   addedBy(path)       the sha of the oldest commit of the branch that added the file, or null
 *   removedAt(path)     the sha of the removal of the path whose parent holds its last version, or null:
 *                       a merge counts, a copy that stood earlier in another candidate's history not
 *   removedFrom(path)   the parent of that removal, which holds the last version
 *   everExisted(path)   the path, a file or a directory, stood in a commit of the branch or of the
 *                       main branch on the server
 *   existsAtHead(path)  the path stands in the head commit
 *   branches(prefix)    [{ name, sha }] — the local branches whose name begins so
 *   head()              the sha of the head commit
 *   filesAt(dir, sha)   [path] — the files under the directory at that commit
 *
 * Outside `open()`, the engine puts a taken-apart task folder back from this history for one run of
 * a check: `putBack`, `rewritePutBack`, `release`, and `cleanBroken` at a start of the engine.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const BASE = 'origin/main';

const run = (args) => {
    // A path is read as it is written: by default git prints a non-ASCII one in octal codes.
    const out = spawnSync('git', ['-c', 'core.quotePath=false', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    return out.status === 0 ? out.stdout : null;
};

const parseStatus = (text) => {
    const changes = { added: [], deleted: [], modified: [] };
    for (const line of text.split('\n').filter(Boolean)) {
        const [status, ...paths] = line.split('\t');
        if (status.startsWith('A')) changes.added.push(paths[0]);
        else if (status.startsWith('D')) changes.deleted.push(paths[0]);
        else if (status.startsWith('R')) {
            changes.deleted.push(paths[0]);
            changes.added.push(paths[1]);
        } else changes.modified.push(paths[paths.length - 1]);
    }
    return changes;
};

export function open() {
    let cached = null;
    const commits = () => {
        if (cached) return cached;
        const list = (run(['log', '--reverse', '--format=%H', `${BASE}..HEAD`]) ?? '').split('\n').filter(Boolean);
        cached = list.map((sha) => ({ sha, ...parseStatus(run(['show', '--no-renames', '--name-status', '--format=', sha]) ?? '') }));
        return cached;
    };
    const versionAt = (path, sha) => run(['show', `${sha}:${path}`]);
    const existsAtHead = (path) => run(['cat-file', '-e', `HEAD:${path.replace(/\/$/, '')}`]) !== null;
    const limit = run(['rev-parse', '--verify', '--quiet', BASE]) === null ? [] : ['--not', BASE];
    /** The object of the path at each commit, `missing` where it is absent; one call for the list. */
    const objects = (shas, path) =>
        (spawnSync('git', ['cat-file', '--batch-check=%(objectname)'], { encoding: 'utf8', input: shas.map((sha) => `${sha}:${path}\n`).join('') }).stdout ?? '')
            .split('\n')
            .slice(0, shas.length)
            .map((line) => (line.endsWith(' missing') ? 'missing' : line));
    /** Of candidates `{ sha, parent, object }`, newest first: a copy whose object stood earlier in another one's history is old. */
    const freshest = (found, bare) => {
        if (found.length < 2) return found[0] ?? null;
        const histories = found.map((c) => new Set(objects((run(['log', '--full-history', '--format=%H', c.parent, ...limit, '--', bare]) ?? '').split('\n').filter(Boolean), bare)));
        return found.find((c) => !found.some((other, j) => other.object !== c.object && histories[j].has(c.object))) ?? found[0];
    };
    const removals = new Map();
    /**
     * The removal of the path whose parent holds its last version: `{ sha, parent }` or null. Every
     * removal in the branch is a candidate, a merge against any parent included. The branch's own
     * taking-apart — a commit whose own change removed the path and added an archive record, as exit 9
     * reads it — wins over a merged base, whatever the base did to its copy. Without one, an old copy
     * is passed over by `freshest`. Kept per path for the life of the source.
     */
    const removal = (path) => {
        const bare = path.replace(/\/$/, '');
        if (removals.has(bare)) return removals.get(bare);
        const shas = [...new Set((run(['log', '--full-history', '-m', '--diff-filter=D', '--format=%H', 'HEAD', ...limit, '--', bare]) ?? '').split('\n').filter(Boolean))];
        const own = shas.filter((sha) => {
            const change = parseStatus(run(['show', '--no-renames', '--name-status', '--format=', sha]) ?? '');
            return change.deleted.some((p) => p === bare || p.startsWith(`${bare}/`)) && change.added.some((p) => p.startsWith('docs/archive/'));
        });
        const candidates = (list) =>
            list.flatMap((sha) => {
                const parents = (run(['rev-parse', `${sha}^@`]) ?? '').split('\n').filter(Boolean);
                const [after, ...held] = objects([sha, ...parents], bare);
                return after === 'missing' ? parents.map((parent, i) => ({ sha, parent, object: held[i] })).filter((c) => c.object !== 'missing') : [];
            });
        const mine = candidates(own.slice(0, 1));
        const result = mine.length > 0 ? freshest(mine, bare) : freshest(candidates(shas), bare);
        removals.set(bare, result);
        return result;
    };
    const removedAt = (path) => removal(path)?.sha ?? null;
    return {
        branch: () => (run(['branch', '--show-current']) ?? '').trim(),
        commits,
        versionAt,
        lastVersion(path) {
            // A file the head lacks is read before the commit of this branch that removed it: a merged
            // base with an older copy must not answer for it.
            if (existsAtHead(path)) return versionAt(path, 'HEAD');
            const removed = removal(path);
            return removed ? versionAt(path, removed.parent) : null;
        },
        addedBy(path) {
            return commits().find((c) => c.added.includes(path))?.sha ?? null;
        },
        removedAt,
        removedFrom: (path) => removal(path)?.parent ?? null,
        everExisted(path) {
            const find = (...extra) => (run(['log', '--format=%H', '-1', ...extra, 'HEAD', BASE, '--', path.replace(/\/$/, '')]) ?? '').trim() !== '';
            return find() || find('--full-history');
        },
        existsAtHead,
        branches(prefix) {
            return (run(['for-each-ref', '--format=%(refname:short)\t%(objectname)', `refs/heads/${prefix}*`]) ?? '')
                .split('\n')
                .filter(Boolean)
                .map((line) => {
                    const [name, sha] = line.split('\t');
                    return { name, sha };
                });
        },
        head: () => (run(['rev-parse', 'HEAD']) ?? '').trim(),
        filesAt: (dir, sha) =>
            (run(['ls-tree', '-r', '--name-only', sha, '--', dir.replace(/\/$/, '')]) ?? '').split('\n').filter(Boolean),
    };
}

// --- A taken-apart folder put back for one run ------------------------------------------------------
//
// The record lies in the git directory of this copy, never shared with another worktree:
// { pid, root, folder, files: { path: [digest, …] } }. It is written before any file, and a digest
// before its text, so a run broken at any point leaves a record that names every text it wrote.

export const digest = (text) => createHash('sha256').update(text).digest('hex');

/** The path of the record, or null outside a repository. */
export const recordPath = () => {
    const dir = run(['rev-parse', '--absolute-git-dir']);
    return dir === null ? null : join(dir.trim(), 'rt-kit-restored.json');
};

const readEntry = () => {
    const file = recordPath();
    try {
        return file && existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : null;
    } catch {
        return {};
    }
};
const writeEntry = (entry) => writeFileSync(recordPath(), `${JSON.stringify(entry)}\n`);

/** The process lives: a signal 0 reaches it, or it belongs to another user. */
export const alive = (pid) => {
    try {
        process.kill(pid, 0);
        return true;
    } catch (error) {
        return error.code === 'EPERM';
    }
};

/** The pid of another live run that holds `folder` put back, or null. */
export function liveRun(folder) {
    const entry = readEntry();
    return entry?.folder === folder && Number.isInteger(entry.pid) && entry.pid !== process.pid && alive(entry.pid) ? entry.pid : null;
}

/**
 * Puts a taken-apart task folder back: the files at the parent of the commit that removed it.
 * `{ folder, removedBy, files }`; null when the folder stands at the head or no commit of the head
 * removed it. A folder on disk the head does not hold is not written over: `{ busy: pid }` when
 * another live run holds it, `{ left: true }` when a broken run left it edited, `{ stray, removedBy }`
 * with the files that lie in it otherwise.
 */
export function putBack(source, folder) {
    const removedBy = source.existsAtHead(folder) ? null : source.removedAt(folder);
    if (existsSync(folder)) {
        const pid = liveRun(folder);
        if (pid) return { busy: pid };
        if (readEntry()?.kept && readEntry().folder === folder) return { left: true };
        return removedBy ? { stray: readdirSync(folder, { recursive: true }).map(String), removedBy } : null;
    }
    if (!removedBy) return null;
    const at = source.removedFrom?.(folder) ?? `${removedBy}^`;
    const texts = source.filesAt(folder, at).map((path) => [path, source.versionAt(path, at)]).filter(([, text]) => text !== null);
    const root = (run(['rev-parse', '--show-toplevel']) ?? '').trim();
    writeEntry({ pid: process.pid, root, folder, files: Object.fromEntries(texts.map(([path, text]) => [path, [digest(text)]])) });
    for (const [path, text] of texts) {
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, text);
    }
    return { folder, removedBy, files: texts.map(([path]) => path) };
}

/** Writes a new text into a file put back; its digest reaches the record first. */
export function rewritePutBack(path, text) {
    const entry = readEntry();
    if (entry?.files) {
        entry.files[path] = [...(entry.files[path] ?? []), digest(text)];
        writeEntry(entry);
    }
    writeFileSync(path, text);
}

/** Removes the folder of this run with all it holds, and the record when it is this run's. */
export function release(restored) {
    if (!restored?.folder) return;
    rmSync(restored.folder, { recursive: true, force: true });
    if (readEntry()?.pid === process.pid) rmSync(recordPath(), { force: true });
}

/**
 * Cleans what a broken run left, at a start of the engine: `{ verdict, folder }` — `cleaned`, `kept`
 * or `live` — or null. The folder goes only when the process is gone, the head holds no such folder
 * and every recorded file is absent or has a text the run wrote. A live run keeps the folder and the
 * record. A folder with an edited file stays, and so does its record, marked `kept`, until the folder
 * is gone: every later start names it. A record of a folder the head holds, of another root or that
 * does not parse is dropped and nothing is touched.
 */
export function cleanBroken() {
    const entry = readEntry();
    if (entry === null) return null;
    if (Number.isInteger(entry.pid) && alive(entry.pid) && entry.pid !== process.pid) return { verdict: 'live', folder: entry.folder };
    const root = (run(['rev-parse', '--show-toplevel']) ?? '').trim();
    const dir = entry.folder && entry.root === root ? join(root, entry.folder) : null;
    const atHead = dir !== null && spawnSync('git', ['cat-file', '-e', `HEAD:${entry.folder}`], { cwd: root }).status === 0;
    const drop = (verdict) => {
        rmSync(recordPath(), { force: true });
        return verdict && { verdict, folder: entry.folder };
    };
    if (dir === null || atHead || !existsSync(dir)) return drop(null);
    if (entry.kept) return { verdict: 'kept', folder: entry.folder };
    const own = Object.entries(entry.files ?? {}).every(([path, digests]) => {
        const file = join(root, path);
        return !existsSync(file) || [digests].flat().includes(digest(readFileSync(file, 'utf8')));
    });
    if (own) {
        rmSync(dir, { recursive: true, force: true });
        return drop('cleaned');
    }
    writeEntry({ ...entry, pid: null, kept: true });
    return { verdict: 'kept', folder: entry.folder };
}
