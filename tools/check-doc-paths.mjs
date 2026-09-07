#!/usr/bin/env node
// rt-kit v0.25.0 · checks/check-doc-paths.mjs · e91840ae9811 · правится надстройкой, не здесь
/**
 * The check that the addresses named in the documentation exist.
 *
 * A document referring to a file that has disappeared is worse than a missing one: it looks like
 * a working reference and takes the reader into a directory that is not there. This accumulates
 * silently — a rearrangement of the tree fixes the code and breaks the text, and nobody collects
 * the text.
 *
 * Only addresses in backticks and outside code blocks count: the blocks hold commands and output,
 * where a path to something built is the result of a build, not a file of the repository. Patterns
 * (`*`, `<…>`, `{…}`) are skipped: that is the form of an address, not an address.
 *
 * An address comes in three kinds, and all three are judged alike: a path rooted in the tree, a
 * bare file name and a directory. Half of the "Where this lies" tables are taken by directories,
 * and a check that knows only a string with an extension does not see them at all.
 *
 * Documents that by their nature speak of what does not exist — plans of the future, the archive
 * and task folders — are taken out of the check. So is portable text: its addresses belong to the
 * tree the rule is laid out into, and in that they are examples, not links.
 *
 * On a second pass the completeness of a directory index is audited: the overview document lists
 * the records in a table, and the reader searches by it, not by walking. This is the reverse side
 * of the same agreement — not only does an address in a text lead to a file, but a file is named
 * in the text people look for it by.
 *
 * A non-zero return code and a list of divergences.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, posix } from 'node:path';

import { allowlistOf, CONFIG, ROOT, parseAllowlist } from './rt-kit-checks.config.mjs';

const ALLOWLIST = allowlistOf('doc-paths');
// `worktrees` — copies of the repository under the agent's directory: their documents describe the
// layout of their own branch, while the check looks for addresses in the tree of the current one.
// One abandoned copy gave 73 divergences and a red end-to-end run on a branch that did not start it.
const SKIPPED_DIRS = CONFIG.skippedDirs;
/**
 * The archive describes the layout as it was at the moment of writing. Fixing addresses in it means
 * rewriting history after the fact, so it is taken out of the check entirely.
 */
const ARCHIVE_DIR = CONFIG.archiveDir;
/**
 * A task folder describes the progress, and what has been removed it names by name: the findings
 * section lists exactly what is not in the tree. A machine has nothing to tell such a mention from
 * a link by, and the folder lives until the merge — so it is taken out of the check, like the
 * archive.
 */
const TASKS_DIR = CONFIG.tasksDir.endsWith('/') ? CONFIG.tasksDir : `${CONFIG.tasksDir}/`;
/**
 * Directories whose index is audited against the content. Nothing else judges a directory taken out
 * of the address check: a record that arrived by a merge of a neighbouring branch stays unnamed,
 * while the reader searches by the index. An index audited by hand diverges again within a day.
 */
const INDEXED_DIRS = (CONFIG.indexedDirs ?? []).map((dir) => (dir.endsWith('/') ? dir : `${dir}/`));
/**
 * The sources of portable texts: a rule that is laid out into another tree names the addresses of
 * that tree. A laid-out copy is recognised by its header, and the source carries no header — the
 * layout puts it there — so its directory is named by a setting.
 */
const PORTABLE_DIRS = (CONFIG.portableDirs ?? []).map((dir) => (dir.endsWith('/') ? dir : `${dir}/`));
/** The header of a laid-out file: the package version, the resource and the sum of the body. */
const STAMP_LINE = /rt-kit\s+v\S+\s+·\s+\S+\s+·\s+[0-9a-f]{12}/;
/** The header stands as the first line of the body, and the body starts after the skill's intro. */
const STAMP_LOOKAHEAD = 12;
/** The extensions by which a bare name counts as a file and not as the name of a record */
const EXTENSIONS = 'ts|mts|cts|js|mjs|cjs|json|jsonc|scss|css|html|proto|conf|ya?ml|sh|md|sql|txt|xml|svg|webp|png|ico|env|Dockerfile|lock';
/**
 * Any string in backticks is taken: a directory carries no extension, and requiring one in the
 * selection itself would mean not seeing half of the "Where this lies" tables. The sifting is in
 * `looksLikePath`.
 */
const PATH_IN_BACKTICKS = /`([^`\n]+?)`/g;

const problems = [];
const indexProblems = [];
const report = (doc, line, path) => problems.push(`${doc}:${line}: no file \`${path}\``);

function collectDocs(dir = '.') {
    const entries = readdirSync(join(ROOT, dir), { withFileTypes: true });
    const found = [];

    for (const entry of entries) {
        const relativePath = dir === '.' ? entry.name : `${dir}/${entry.name}`;
        if (entry.isDirectory()) {
            if (!SKIPPED_DIRS.includes(entry.name)) {
                found.push(...collectDocs(relativePath));
            }
        } else if (entry.name.endsWith('.md')) {
            found.push(relativePath);
        }
    }

    return found.sort();
}

/**
 * Documents that will not reach the repository: a personal draft lying in the tree and covered by
 * the ignore settings. The check judges the repository, not the desk of whoever started it: a dead
 * link in someone's draft held the push gate, though that file goes into no branch at all.
 */
function droppedByGit(docs) {
    if (docs.length === 0) {
        return new Set();
    }

    // `--stdin` instead of arguments: the list is longer than the command line limit
    const ignored = spawnSync('git', ['check-ignore', '--stdin'], {
        cwd: ROOT,
        encoding: 'utf8',
        input: docs.join('\n'),
    });

    // No git — there is nothing to judge by, and the check stays stricter than needed
    return new Set((ignored.stdout ?? '').split('\n').filter(Boolean));
}

/** The top level of the tree: an address rooted in the repository is recognised by it */
const ROOTED_IN = new Set(
    readdirSync(ROOT, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !SKIPPED_DIRS.includes(entry.name))
        .map((entry) => entry.name)
);

/**
 * The tree is asked of the version control system, not walked directory by directory: the agent's
 * and the pipeline's directories start with a dot, and a walk passes them by silently — everything
 * lying in them would read as non-existent. The untracked is taken together with the tracked: a
 * file started by this very branch and not yet added exists no less.
 */
function treeOfRepo() {
    const listed = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
        cwd: ROOT,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
    });
    const paths = (listed.stdout ?? '').split('\n').filter(Boolean);
    const files = new Set(paths);
    const dirs = new Set();
    const byName = new Map();

    for (const path of paths) {
        const segments = path.split('/');
        for (let depth = 1; depth < segments.length; depth += 1) {
            dirs.add(segments.slice(0, depth).join('/'));
        }
        byName.set(segments[segments.length - 1], true);
    }
    for (const dir of dirs) {
        byName.set(dir.split('/').pop(), true);
    }

    return { files, dirs, byName };
}

const TREE = treeOfRepo();

/**
 * Whether this is an address at all. Everything describing a form rather than an address is cut
 * off: patterns, network links, package names, flags and the binding "path:symbol" — that one is
 * judged by the spec audit. After that a candidate comes in two kinds: rooted in the tree and a
 * bare name. A bare name is used for both a file and a directory — both are looked for across the
 * tree, because their address is one and the same, only written short.
 */
function looksLikePath(candidate) {
    if (/[*<>{}$|\s()[\]'",;=]|\.\.\.|…/.test(candidate)) {
        return false;
    }
    if (/^(https?:|@|~|\/|-)/.test(candidate) || candidate.includes(':')) {
        return false;
    }
    // A directory the check does not walk it does not judge either: what lies there is foreign code, the build and service files
    if (SKIPPED_DIRS.some((dir) => candidate.startsWith(`${dir}/`))) {
        return false;
    }
    // Starts with a dot and stands without a directory — a kind of file, not a file
    if (/^\.[^/]+$/.test(candidate)) {
        return false;
    }

    return candidate.includes('/') || new RegExp(`\\.(?:${EXTENSIONS})$`).test(candidate);
}

/**
 * Whether such an address is in the tree. A rooted one is asked of the file system: it is named in
 * full, and a miss in it is a miss. A bare name is looked for across the whole tree — among files
 * and among directories: a directory name in a lib's overview document means a directory next to
 * it, not a directory at the root.
 */
function existsInTree(candidate, fromDir = '') {
    const bare = candidate.replace(/\/$/, '');

    /**
     * A relative address belongs to the document's directory, not to the tree root: `../routes.ts`
     * from `libs/x/shell/src/shell/README.md` is `libs/x/shell/src/routes.ts`. Without resolving
     * from the directory such an address is looked for across the tree as a string and is never
     * found, that is, the check reddens at every link written the way links are written in markup.
     */
    if (/^\.{1,2}(\/|$)/.test(bare)) {
        const resolved = posix.normalize(posix.join(fromDir, bare));

        return resolved.startsWith('..') ? false : existsSync(join(ROOT, resolved));
    }

    if (ROOTED_IN.has(bare.split('/')[0])) {
        return existsSync(join(ROOT, bare));
    }
    if (TREE.files.has(bare) || TREE.dirs.has(bare)) {
        return true;
    }
    if (bare.includes('/')) {
        return [...TREE.files, ...TREE.dirs].some((path) => path.endsWith(`/${bare}`));
    }

    return TREE.byName.has(bare);
}

/**
 * A portable text: one laid out by the package is known by its header, its source by the directory
 * from the settings. The addresses in it belong to the tree the rule is laid out into:
 * `libs/common/util` in a tree that calls its roots otherwise is not a dead link but an example.
 * Judging them here means reddening at a hundred and fifty lines, not one of which is fixed by an
 * edit of this tree.
 */
function isPortable(doc) {
    if (PORTABLE_DIRS.some((dir) => doc.startsWith(dir))) {
        return true;
    }

    return readFileSync(join(ROOT, doc), 'utf8')
        .split('\n', STAMP_LOOKAHEAD)
        .some((line) => STAMP_LINE.test(line));
}

/** Documents that by their nature speak of what does not exist are taken out of the address check. */
const isSkipped = (doc) => doc.startsWith(ARCHIVE_DIR) || doc.startsWith(TASKS_DIR) || isPortable(doc);

/**
 * The completeness of a directory index: every record of the directory has a line in the table,
 * every line has a record. The record is the first name in backticks of a table line: the second
 * column holds prose, and there would be nothing to take from there. The directory is asked of the
 * version control system by the same selection as the tree: a draft covered by the ignore settings
 * does not reach the repository and is not needed in the index.
 */
function checkIndex(dir) {
    const index = `${dir}README.md`;
    if (!existsSync(join(ROOT, index))) {
        return;
    }

    const named = new Set(
        readFileSync(join(ROOT, index), 'utf8')
            .split('\n')
            .filter((line) => line.startsWith('|'))
            .map((line) => line.match(PATH_IN_BACKTICKS)?.[0].replaceAll('`', ''))
            .filter((name) => name?.endsWith('.md'))
    );
    const stored = new Set(
        [...TREE.files]
            .filter((path) => path.startsWith(dir) && path.endsWith('.md') && path !== index)
            .map((path) => path.slice(dir.length))
    );

    [...stored]
        .filter((name) => !named.has(name))
        .sort()
        .forEach((name) => indexProblems.push(`${index}: the record \`${name}\` lies in the directory and is not named in the table`));
    [...named]
        .filter((name) => !stored.has(name))
        .sort()
        .forEach((name) => indexProblems.push(`${index}: the line \`${name}\` is named in the table, and there is no record in the directory`));
}

function checkDoc(doc, allowed) {
    const lines = readFileSync(join(ROOT, doc), 'utf8').split('\n');
    const fromDir = posix.dirname(doc);
    let insideFence = false;

    lines.forEach((line, index) => {
        if (/^\s*(```|~~~)/.test(line)) {
            insideFence = !insideFence;

            return;
        }
        if (insideFence) {
            return;
        }

        for (const [, candidate] of line.matchAll(PATH_IN_BACKTICKS)) {
            if (!looksLikePath(candidate) || allowed.has(candidate)) {
                continue;
            }
            if (!existsInTree(candidate, fromDir)) {
                report(doc, index + 1, candidate);
            }
        }
    });
}

/** An index divergence is printed as a list of its own: it is fixed by a line in the table, not by silence. */
function reportIndex() {
    if (indexProblems.length === 0) {
        return;
    }

    console.error(`\nthe index diverged from the directory, divergences ${indexProblems.length}\n`);
    indexProblems.forEach((problem) => console.error(`  ${problem}`));
    console.error(
        '\nA record is named in the table of the index by the same change that lays it down:\nthe reader searches by the index, not by walking the directory.'
    );
}

const allowlist = parseAllowlist('doc-paths', ['files', 'paths']);
const allowedPaths = new Set(allowlist.paths.keys());
const collected = collectDocs().filter((doc) => !allowlist.files.has(doc) && !isSkipped(doc));
const dropped = droppedByGit(collected);
const docs = collected.filter((doc) => !dropped.has(doc));

docs.forEach((doc) => checkDoc(doc, allowedPaths));
INDEXED_DIRS.forEach((dir) => checkIndex(dir));

if (problems.length > 0) {
    console.error(`check-doc-paths: divergences ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    // There are three ways out, and the third is named: the known list holds what is accepted, not
    // the results of a broken check. The former text offered to enter everything doubtful into the
    // list — it taught the bypass the verifiability law forbids; one review gave 51 false refusals
    // out of 264, every one of them on an address that exists.
    console.error(
        `\nThree moves from here: fix the stale address; enter the name into ${ALLOWLIST} if the document` +
            `\ndescribes what is not created yet; fix the check itself, if it is the one that is wrong — take` +
            `\nthe refusals apart one by one and show the analysis to the owner. What is in dispute is not listed.`
    );
}

reportIndex();

if (problems.length > 0 || indexProblems.length > 0) {
    process.exit(1);
}

console.log(`check-doc-paths: documents checked ${docs.length}, no divergences`);
