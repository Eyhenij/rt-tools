// rt-kit v0.38.0 · task-flow/source/git.mjs · bc79f436bbdd · правится надстройкой, не здесь
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
 *   lastVersion(path)   the text at the newest commit of the branch that holds the file
 *   addedBy(path)       the sha of the oldest commit of the branch that added the file, or null
 *   removedAt(path)     the sha of the newest commit of the head that removed the path, or null
 *   everExisted(path)   the path, a file or a directory, stood in a commit of the branch or of the
 *                       main branch on the server
 *   existsAtHead(path)  the path stands in the head commit
 *   branches(prefix)    [{ name, sha }] — the local branches whose name begins so
 *   head()              the sha of the head commit
 *   filesAt(dir, sha)   [path] — the files under the directory at that commit
 */
import { spawnSync } from 'node:child_process';

const BASE = 'origin/main';

const run = (args) => {
    const out = spawnSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
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
    return {
        branch: () => (run(['branch', '--show-current']) ?? '').trim(),
        commits,
        versionAt,
        lastVersion(path) {
            for (const c of [...commits()].reverse()) {
                const text = versionAt(path, c.sha);
                if (text !== null) return text;
            }
            return null;
        },
        addedBy(path) {
            return commits().find((c) => c.added.includes(path))?.sha ?? null;
        },
        removedAt(path) {
            const bare = path.replace(/\/$/, '');
            return (run(['log', '-1', '--format=%H', '--diff-filter=D', 'HEAD', '--', bare]) ?? '').trim() || null;
        },
        everExisted(path) {
            const bare = path.replace(/\/$/, '');
            return (run(['log', '--format=%H', '-1', 'HEAD', BASE, '--', bare]) ?? '').trim() !== '';
        },
        existsAtHead(path) {
            return run(['cat-file', '-e', `HEAD:${path.replace(/\/$/, '')}`]) !== null;
        },
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
