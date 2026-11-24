// rt-kit v0.39.1 · checks/coupling-read.mjs · 56156663e091 · правится надстройкой, не здесь
/**
 * The texts the import graph is built from: the working tree, a revision, what a branch itself wrote.
 *
 * Nothing is judged here. A caller names the roots and the skipped folders; what comes back is a map
 * from a path to its text, the path aliases, the renames and the own edits of a branch.
 *
 * The own edits are the commits of the branch itself: a merge into it brings the work of others, and
 * that work was judged in its own branch.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const CODE = /\.(ts|tsx|mts|cts|mjs|cjs|js|jsx|sh)$/;
const TYPES = /\.d\.[mc]?ts$/;
/** A copy laid out from a package repeats its source: judged twice, one edit would grow two modules. */
const LAID_OUT = /^(?:#!.*\n)?(?:\/\/|#|<!--) rt-kit v/;
const LIMIT = 1024 * 1024 * 512;

export class RevisionMissing extends Error {}

const git = (root, args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: LIMIT, stdio: ['ignore', 'pipe', 'pipe'] });
const lines = (text) => text.split('\n').filter(Boolean);

const wanted = (path, { roots, skipped }) =>
    CODE.test(path) &&
    !TYPES.test(path) &&
    roots.some((root) => path === root || path.startsWith(`${root}/`)) &&
    !path.split('/').some((part) => skipped.includes(part));

const keep = (files, path, text) => {
    if (!LAID_OUT.test(text)) {
        files.set(path, text);
    }
};

/** The tracked and the new files of the working tree. */
export function treeFiles(root, scope) {
    const files = new Map();
    for (const path of git(root, ['ls-files', '-z', '--cached', '--others', '--exclude-standard']).split('\0')) {
        if (path && wanted(path, scope) && existsSync(join(root, path))) {
            keep(files, path, readFileSync(join(root, path), 'utf8'));
        }
    }
    return files;
}

/** The files of a revision, read by one call. */
export function revisionFiles(root, revision, scope) {
    const paths = git(root, ['ls-tree', '-r', '-z', '--name-only', revision])
        .split('\0')
        .filter((path) => path && wanted(path, scope));
    const input = paths.map((path) => `${revision}:${path}\n`).join('');
    const out = spawnSync('git', ['cat-file', '--batch'], { cwd: root, input, maxBuffer: LIMIT }).stdout;
    const files = new Map();
    let at = 0;
    for (const path of paths) {
        const end = out.indexOf(10, at);
        const size = Number(out.subarray(at, end).toString().split(' ')[2]);
        keep(files, path, out.subarray(end + 1, end + 1 + size).toString());
        at = end + size + 2;
    }
    return files;
}

/** The point a revision left the base at. A revision nobody has is named, not passed over. */
export function forkOf(root, base, at = 'HEAD') {
    for (const revision of [base, at]) {
        if (spawnSync('git', ['rev-parse', '-q', '--verify', `${revision}^{commit}`], { cwd: root }).status !== 0) {
            throw new RevisionMissing(`the revision «${revision}» is not in this repository`);
        }
    }
    return git(root, ['merge-base', base, at]).trim();
}

/** The text of one file at a revision, or null. */
export function textAt(root, revision, path) {
    const run = spawnSync('git', ['show', `${revision}:${path}`], { cwd: root, encoding: 'utf8', maxBuffer: LIMIT });
    return run.status === 0 ? run.stdout : null;
}

/** Renames from the fork to a revision or, without one, to the working tree: the new path → the old one. */
export function renamesOf(root, fork, at = null) {
    const renames = new Map();
    for (const line of lines(git(root, ['diff', '-M', '--diff-filter=R', '--name-status', fork, ...(at ? [at] : [])]))) {
        const [, from, to] = line.split('\t');
        renames.set(to, from);
    }
    return renames;
}

const ownCommits = (fork, at) => ['log', '--first-parent', '--no-merges', '--name-only', `${fork}..${at ?? 'HEAD'}`];

/** The paths the own commits of a branch touched, with the uncommitted ones where no revision is named. */
export function ownPaths(root, fork, at = null) {
    const committed = lines(git(root, [...ownCommits(fork, at), '--format=']));
    const loose = at
        ? []
        : [...lines(git(root, ['diff', '--name-only', 'HEAD'])), ...lines(git(root, ['ls-files', '--others', '--exclude-standard']))];
    return new Set([...committed, ...loose]);
}

/**
 * The versions of `<tasks>/<task>/<name>` the branch itself wrote — its commits, then the file of the
 * working tree; the folder of a task leaves the tree before the push, its history stays. `first` holds the
 * first version of the file named by the branch, or the one that came with the base, and the first versions
 * written before it: the lower branches of a stack. Everything else is `later`.
 */
export function ownVersions(root, fork, tasksDir, name, at = null) {
    const own = `${tasksDir}/${git(root, ['rev-parse', '--abbrev-ref', at ?? 'HEAD']).trim()}/${name}`;
    const stood = textAt(root, fork, own);
    const wrote = stood === null ? [] : [{ path: own, text: stood }];
    const history = [...ownCommits(fork, at), '--reverse', '--format=%H', '--diff-filter=AM', '--', `${tasksDir}/*/${name}`];
    let commit = null;
    for (const line of lines(git(root, history))) {
        if (/^[0-9a-f]{40}$/.test(line)) {
            commit = line;
        } else if (!line.startsWith(`${tasksDir}/_`)) {
            wrote.push({ path: line, text: git(root, ['show', `${commit}:${line}`]) });
        }
    }
    if (!at && existsSync(join(root, own))) {
        wrote.push({ path: own, text: readFileSync(join(root, own), 'utf8') });
    }
    const last = Math.max(
        0,
        wrote.findIndex(({ path }) => path === own)
    );
    const isFirst = ({ path }, index) => index <= last && wrote.findIndex((one) => one.path === path) === index;
    const textsOf = (first) => wrote.filter((one, index) => isFirst(one, index) === first).map(({ text }) => text);
    return { first: textsOf(true), later: textsOf(false) };
}

/** The path aliases of the tree: `paths` of the settings file, comments and trailing commas allowed; null — unread. */
export function aliasesFrom(text) {
    try {
        const bare = text
            .replace(/"(?:[^"\\]|\\.)*"|\/\*[\s\S]*?\*\/|\/\/.*$/gm, (part) => (part.startsWith('"') ? part : ''))
            .replace(/,(\s*[}\]])/g, '$1');
        return JSON.parse(bare).compilerOptions?.paths ?? {};
    } catch {
        return null;
    }
}
