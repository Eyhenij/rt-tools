// rt-kit v0.39.1 · checks/coupling-read.mjs · 2da7b3af24d2 · правится надстройкой, не здесь
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
const LAID_OUT = /^(?:#!.*\n)?(?:\/\/|#|<!--) rt-kit v\S+(?: · (\S+))?/;
const LIMIT = 1024 * 1024 * 512;

export class RevisionMissing extends Error {}

const git = (root, args) =>
    execFileSync('git', ['-c', 'core.quotePath=false', ...args], { cwd: root, encoding: 'utf8', maxBuffer: LIMIT, stdio: ['ignore', 'pipe', 'pipe'] });
const lines = (text) => text.split('\n').filter(Boolean);

const wanted = (path, { roots, skipped }) =>
    CODE.test(path) &&
    !TYPES.test(path) &&
    roots.some((root) => path === root || path.startsWith(`${root}/`)) &&
    !path.split('/').some((part) => skipped.includes(part));

const keep = ({ files, copies }, path, text) => {
    const copy = LAID_OUT.exec(text);
    if (copy) {
        copies.set(path, copy[1]);
    } else {
        files.set(path, text);
    }
};

/** The tracked and the new files of the working tree: texts by path, laid-out copies by the name of the resource. */
export function treeFiles(root, scope) {
    const read = { files: new Map(), copies: new Map() };
    for (const path of git(root, ['ls-files', '-z', '--cached', '--others', '--exclude-standard']).split('\0')) {
        if (path && wanted(path, scope) && existsSync(join(root, path))) {
            keep(read, path, readFileSync(join(root, path), 'utf8'));
        }
    }
    return read;
}

/** The same of a revision, read by one call. */
export function revisionFiles(root, revision, scope) {
    const paths = git(root, ['ls-tree', '-r', '-z', '--name-only', revision])
        .split('\0')
        .filter((path) => path && wanted(path, scope));
    const input = paths.map((path) => `${revision}:${path}\n`).join('');
    const out = spawnSync('git', ['cat-file', '--batch'], { cwd: root, input, maxBuffer: LIMIT }).stdout;
    const read = { files: new Map(), copies: new Map() };
    let at = 0;
    for (const path of paths) {
        const end = out.indexOf(10, at);
        const size = Number(out.subarray(at, end).toString().split(' ')[2]);
        keep(read, path, out.subarray(end + 1, end + 1 + size).toString());
        at = end + size + 2;
    }
    return read;
}

/** The point a revision left the base at. A revision nobody has is named, not passed over. */
export function forkOf(root, base, at = 'HEAD') {
    for (const revision of [base, at]) {
        if (spawnSync('git', ['rev-parse', '-q', '--verify', `${revision}^{commit}`], { cwd: root }).status !== 0) {
            throw new RevisionMissing(`the revision «${revision}» is not in this repository`);
        }
    }
    const found = spawnSync('git', ['merge-base', base, at], { cwd: root, encoding: 'utf8' });
    if (found.status !== 0) {
        throw new RevisionMissing(`«${base}» and «${at}» have no common revision here: the history is cut or foreign`);
    }
    return found.stdout.trim();
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
 * The texts of the commits of the branch, of the tasks merged into it too: after the folder of the task is
 * taken apart a reason has no other place. The trailers are cut off: a name of a co-author is no reason.
 */
export const ownMessages = (root, fork, at = null) =>
    git(root, ['log', '--no-merges', '--format=%B', `${fork}..${at ?? 'HEAD'}`]).replace(/^[A-Z]\w*(?:-\w+)+: .*$/gm, '');

/** A copy of the sample nobody filled in: most of its lines with a gap still stand. */
function isDraft(text, sample) {
    const gaps = (sample ?? '').split('\n').filter((line) => /<[^<>]+>/.test(line));
    return gaps.filter((line) => text.includes(line)).length * 2 > gaps.length;
}

/** Every version of `<tasks>/<task>/<name>` the commits wrote, oldest first; the sample and its copies apart. */
function versionsIn(root, commits, { tasksDir, name, sample }) {
    const form = ['--no-merges', '--no-renames', '--full-history', '--topo-order', '--reverse', '--name-only', '--format=%H', '--diff-filter=AM'];
    const versions = [];
    let commit = null;
    for (const line of lines(git(root, ['log', ...form, ...commits, '--', `${tasksDir}/*/${name}`]))) {
        if (/^[0-9a-f]{40}$/.test(line)) {
            commit = line;
        } else if (!line.startsWith(`${tasksDir}/_`)) {
            versions.push({ commit, path: line, text: git(root, ['show', `${commit}:${line}`]) });
        }
    }
    return versions.filter(({ text }) => !isDraft(text, sample));
}

/** The file of the task the branch is named by; a revision without a name — the task begun last. */
function ownFile(root, at, versions, pathOf) {
    const name = git(root, ['rev-parse', '--abbrev-ref', at ?? 'HEAD']).trim();
    const paths = [...new Set(versions.map(({ path }) => path))];
    const named = [name, name.replace(/^[^/]+\//, '')].map(pathOf);
    return paths.find((path) => named.includes(path)) ?? (name === '' || name === 'HEAD' ? paths.at(-1) : null) ?? named[0];
}

/**
 * The versions of `<tasks>/<task>/<name>` of a branch — its commits, then the file of the working tree; the
 * folder of a task leaves the tree before the push, its history stays. `first` holds the first version of
 * the file named by the branch, or the one that came with the base, the first versions written before it —
 * the lower branches of a stack — and those of the tasks merged into the branch. The rest is `later`.
 */
export function ownVersions(root, fork, tasksDir, name, at = null) {
    const form = { tasksDir, name, sample: textAt(root, fork, `${tasksDir}/_template/${name}`) };
    const range = `${fork}..${at ?? 'HEAD'}`;
    const committed = versionsIn(root, ['--first-parent', range], form);
    const own = ownFile(root, at, committed, (task) => `${tasksDir}/${task}/${name}`);
    const stood = textAt(root, fork, own);
    const loose = !at && existsSync(join(root, own)) ? [{ path: own, text: readFileSync(join(root, own), 'utf8') }] : [];
    const wrote = [...(stood === null ? [] : [{ path: own, text: stood }]), ...committed, ...loose.filter(({ text }) => !isDraft(text, form.sample))];
    const merged = versionsIn(root, [range], form).filter(({ commit, path }) => path !== own && !committed.some((one) => one.commit === commit));
    const last = Math.max(
        0,
        wrote.findIndex(({ path }) => path === own)
    );
    const opens = (list) => (one, index) => list.findIndex(({ path }) => path === one.path) === index;
    const first = [...wrote.filter((one, index) => index <= last && opens(wrote)(one, index)), ...merged.filter(opens(merged))];
    const textsOf = (list) => list.map(({ text }) => text);
    return { first: textsOf(first), later: textsOf([...wrote, ...merged].filter((one) => !first.includes(one))) };
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
