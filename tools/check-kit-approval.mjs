#!/usr/bin/env node
/**
 * A kit edit the person sees leaves the machine only with two approvals of the owner: of the
 * mockup and of the showcase. The rule is `kit-approval`, the law is `mockups`.
 *
 * The approval is the owner's answer, written down by the executor as a quote. A quote proves
 * nothing by itself — the executor writes it — and the check does not guess whether the owner said
 * it by searching the records of the conversations: such a search missed answers given in other
 * words and on another machine. The record is demanded here; the quotes are confirmed by the owner
 * in the window the guard opens on `gh pr create`, where `--quotes` gives them.
 *
 *   node tools/check-kit-approval.mjs                       # the branch against origin/main: push, PR
 *   node tools/check-kit-approval.mjs --publish ui-kit-v2   # every merge since the last version bump
 *   node tools/check-kit-approval.mjs --quotes              # the quotes of the branch for the window
 *
 * Where the record lies: `docs/tasks/<branch>/approvals.md` while the task folder lives, and the
 * same lines in `docs/archive/<branch>.md` after the folder is taken apart. Two lines are read:
 *
 *   - **Макет:** «<the owner's words>» — <the Figma link>
 *   - **Витрина:** «<the owner's words>»
 *
 * An edit the owner said changes nothing visible carries one line instead of all three:
 *
 *   - **Без вида:** «<the owner's words>»
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const KITS = { 'ui-kit-v2': 'projects/ui-kit-v2/' };
const RULE = 'kit-approval';

/** Files that only keep settings in the browser: the key registry and the storage services. */
const STORAGE_FILES = [
    'projects/ui-kit-v2/src/lib/platform/storage-keys.enum.ts',
    'projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-config.service.ts',
    'projects/ui-kit-v2/src/lib/components/table/rt-table-settings.persistence.ts',
    'projects/ui-kit-v2/src/lib/components/side-menu/rt-side-menu-settings.service.ts',
];

/**
 * A file the person sees in a kit: the components' code, templates, styles, tokens, icons. Pure
 * logic — `*.logic.ts` and `*.core.ts` — draws nothing, and its behaviour is held by its specs; a
 * barrel `index.ts` only gives out what its neighbours declare. The storage files only read and
 * write settings in the browser — the owner's word on RT-2867 «Хранение не видимо (Recommended)».
 */
export function isVisibleKitFile(path) {
    const kit = Object.values(KITS).find((root) => path.startsWith(`${root}src/`));

    if (kit === undefined || STORAGE_FILES.includes(path)) {
        return false;
    }

    return !/(\.spec\.ts|\.stories\.ts|\.logic\.ts|\.core\.ts|\/index\.ts|\.mdx|\.md)$|\/__snapshots__\/|\/stories\/|\/testing\/|\/showcase\//.test(
        path
    );
}

function spawnOk(command, args) {
    try {
        execFileSync(command, args, { stdio: 'ignore' });

        return true;
    } catch {
        return false;
    }
}

function git(...args) {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

/** The two quotes and the link from a record text; a missing piece stays null. */
export function parseApprovals(text) {
    const mockup = /^- \*\*Макет:\*\* «(.+?)» — (https:\/\/(?:www\.)?figma\.com\/\S+)/m.exec(text);
    const showcase = /^- \*\*Витрина:\*\* «(.+?)»/m.exec(text);
    const match = /^- \*\*Совпадение:\*\* (\d+) из (\d+) чисел/m.exec(text);
    const invisible = /^- \*\*Без вида:\*\* «(.+?)»/m.exec(text);

    return {
        invisible: invisible ? invisible[1] : null,
        mockup: mockup ? mockup[1] : null,
        figma: mockup ? mockup[2] : null,
        showcase: showcase ? showcase[1] : null,
        match: match ? { matched: Number(match[1]), total: Number(match[2]) } : null,
    };
}

/** The record of a branch: the task folder first, the archive after it. */
function recordOf(branch) {
    const live = join('docs', 'tasks', branch, 'approvals.md');

    if (existsSync(live)) {
        return { path: live, text: readFileSync(live, 'utf8') };
    }

    const archived = join('docs', 'archive', `${branch}.md`);

    return existsSync(archived) ? { path: archived, text: readFileSync(archived, 'utf8') } : null;
}

/** The faults of one record, each a line for the refusal; empty means approved. */
export function faultsOf(name, record) {
    if (record === null) {
        return [`${name}: no approval record — the mockup and the showcase lines in the task folder's approvals.md`];
    }

    const found = parseApprovals(record.text);
    const faults = [];

    // A kit file edited without a change of look — the type an input takes, say — has no frame to
    // draw. The owner's word that nothing visible changed stands in for all three lines; like the
    // other quotes, it goes to the owner's window on `gh pr create` — `quotesLine` shows it there.
    if (found.invisible !== null) {
        return [];
    }

    if (found.mockup === null) {
        faults.push(`${record.path}: no line «- **Макет:** «…» — <Figma link>»`);
    }

    if (found.match === null) {
        faults.push(`${record.path}: no line «- **Совпадение:** N из N чисел» — the output of tools/kit-match.mjs numbers`);
    } else if (found.match.total === 0 || found.match.matched !== found.match.total) {
        faults.push(`${record.path}: the match is ${found.match.matched} of ${found.match.total} numbers, not 100%`);
    }

    if (found.showcase === null) {
        faults.push(`${record.path}: no line «- **Витрина:** «…»»`);
    }

    return faults;
}

function branchVisible() {
    const base = git('merge-base', 'origin/main', 'HEAD');

    return git('diff', '--name-only', `${base}..HEAD`).split('\n').filter(isVisibleKitFile);
}

/** The subject git writes when main is merged in: `Merge (remote-tracking )branch '(origin/)main'`. */
const MAIN_MERGE = /^Merge (?:remote-tracking )?branch '(?:origin\/)?main'/;

/**
 * The record of a task found by its number: the live task folder first — a task of a chain is
 * judged before its folder is taken apart — then the archive, `docs/archive/<task>-<slug>.md`.
 */
function taskRecordOf(task) {
    const live = existsSync(join('docs', 'tasks')) ? readdirSync(join('docs', 'tasks')).find((dir) => dir.startsWith(`${task}-`)) : undefined;

    if (live !== undefined && existsSync(join('docs', 'tasks', live, 'approvals.md'))) {
        const path = join('docs', 'tasks', live, 'approvals.md');

        return { path, text: readFileSync(path, 'utf8') };
    }

    const archive = join('docs', 'archive');
    const archived = existsSync(archive) ? readdirSync(archive).find((file) => file.startsWith(`${task}-`)) : undefined;

    return archived ? { path: join(archive, archived), text: readFileSync(join(archive, archived), 'utf8') } : null;
}

/**
 * The task a commit belongs to: `[RT-N]` opening the subject of a merged PR, or `(RT-N)` closing a
 * commit subject. A number elsewhere — a revert of a PR, a mention in passing — names no task.
 */
export function taskOf(subject) {
    return /^\[(RT-\d+)\]/.exec(subject)?.[1] ?? /\((RT-\d+)\)\s*$/.exec(subject)?.[1] ?? null;
}

/** A record that answers: present and with every line its kind needs. */
const whole = (record) => record !== null && faultsOf(record.path, record).length === 0;

/**
 * Who answers for the visible kit files a branch carries. Every commit that touched such a file
 * answers by the record of its task: a merged PR by `[RT-N]`, a commit of an earlier branch of the
 * chain by its closing `(RT-N)`. A merge with no whole record behind its task, or with no task at
 * all — an epic merged into main, the epic branch merged into a task — is taken apart by its own
 * commits when they are given. A commit of the branch's own task, a commit naming no task and a merge
 * that cannot be taken apart answer by the branch's own record. A file only main's merge touched is a
 * conflict the branch resolved, and it is the branch's own too; a file a task answers for is not.
 *
 * `commits` are the first parents from the base, each `{ sha, subject, merge, files, children? }`;
 * `children` — the first parents of the merged side, a list or a function that reads them. `ownTask`
 * is the task of the branch itself; `inBranchOf(sha, task)` says whether a commit lies in the branch
 * of that task.
 */
export function answerersOf(commits, visible, { ownTask = null, recordOfTask = () => null, inBranchOf = () => true } = {}) {
    const wanted = new Set(visible);
    const own = new Set();
    const tasks = new Map();

    const walk = (list) => {
        for (const commit of list) {
            const files = commit.files.filter((path) => wanted.has(path));

            if (files.length === 0) {
                continue;
            }

            // Main's merge answers for nothing by itself: a file only it touched falls to the branch below.
            if (commit.merge && MAIN_MERGE.test(commit.subject)) {
                continue;
            }

            const task = taskOf(commit.subject);
            // A commit of the branch's own that names another task is still the branch's own: only a
            // commit lying in that task's branch came by the chain.
            const foreign = task !== null && task !== ownTask && (commit.merge || inBranchOf(commit.sha, task));
            const children = typeof commit.children === 'function' ? commit.children() : commit.children;
            const takeApart = commit.merge && Array.isArray(children) && (!foreign || !whole(recordOfTask(task)));

            if (takeApart) {
                walk(children);
            } else if (foreign) {
                const entry = tasks.get(task) ?? { task, sha: commit.sha, subject: commit.subject, files: new Set() };

                files.forEach((file) => entry.files.add(file));
                tasks.set(task, entry);
            } else {
                files.forEach((file) => own.add(file));
            }
        }
    };

    walk(commits);

    // What no commit answered for — a conflict resolved in main's merge, or history left whole — is
    // the branch's own: an edit nobody else answers for is not let through.
    const answered = new Set([...tasks.values()].flatMap((entry) => [...entry.files]));

    visible.filter((file) => !answered.has(file)).forEach((file) => own.add(file));

    return { own: [...own], tasks: [...tasks.values()].map(({ task, sha, subject }) => ({ task, sha, subject })) };
}

/** The files a commit changed against its first parent; a root commit against nothing. */
function changedFiles(sha) {
    const parent = spawnOk('git', ['rev-parse', '--verify', '--quiet', `${sha}^1`]);
    const args = parent ? ['diff', '--name-only', `${sha}^1`, sha] : ['show', '--name-only', '--format=', sha];

    return git(...args).split('\n').filter(Boolean);
}

const readSides = new Map();

/**
 * The first parents of `range`, each with its subject and files. The merged side of a merge is read
 * only when the walk asks for it, and once: most merges answer by their task and are never opened.
 */
function firstParents(range, depth = 0) {
    return git('log', '--first-parent', '--format=%H %P%x09%s', range)
        .split('\n')
        .filter(Boolean)
        .map((line) => {
            const [head, ...rest] = line.split('\t');
            const [sha, ...parents] = head.split(' ');
            const merge = parents.length > 1;
            const side = `${sha}^1..${sha}^2`;

            return {
                sha,
                subject: rest.join('\t'),
                merge,
                files: changedFiles(sha),
                // An epic in a chain merges at most a few levels deep; deeper history is left whole.
                children:
                    merge && depth < 3
                        ? () => {
                              if (!readSides.has(side)) {
                                  readSides.set(side, firstParents(side, depth + 1));
                              }

                              return readSides.get(side);
                          }
                        : undefined,
            };
        });
}

/** The task of the branch itself, from its name: `RT-3585-night-findings` is RT-3585. */
const taskOfBranch = (branch) => /^(RT-\d+)-/.exec(branch)?.[1] ?? null;

/** Whether a commit lies in a branch of that task, local or on the host: a commit come by the chain. */
function inTaskBranch(sha, task) {
    return git('for-each-ref', '--contains', sha, '--format=%(refname)', `refs/heads/${task}-*`, `refs/remotes/origin/${task}-*`) !== '';
}

function branchFaults() {
    const branch = git('rev-parse', '--abbrev-ref', 'HEAD');

    const base = git('merge-base', 'origin/main', 'HEAD');
    const visible = branchVisible();

    if (visible.length === 0) {
        return [];
    }

    return judgeBranch({ name: branch, own: recordOf(branch), commits: firstParents(`${base}..HEAD`), visible, recordOfTask: taskRecordOf, inBranchOf: inTaskBranch });
}

/**
 * The faults of a branch, from what it carries. The branch's own record answers only for the kit
 * files its own commits brought; a merged task answers by its own record. A branch with a record of
 * its own and no kit edit of its own is not asked for approvals: the merged tasks were.
 *
 * `own` is the branch record or null; `commits` the first parents from the base; `recordOfTask`
 * gives the record of a task number or null; `inBranchOf` as in `answerersOf`.
 */
export function judgeBranch({ name, own, commits, visible, recordOfTask, inBranchOf }) {
    const { own: direct, tasks } = answerersOf(commits, visible, { ownTask: taskOfBranch(name), recordOfTask, inBranchOf });
    const faults = direct.length === 0 ? [] : faultsOf(name, own);

    for (const { task, sha, subject } of tasks) {
        faults.push(...faultsOf(`${sha.slice(0, 9)} ${subject}`, recordOfTask(task)));
    }

    return faults;
}

/**
 * The record whose quotes the owner confirms in the window: the branch's own, and only when the
 * branch carries a kit edit of its own. A merged task's quotes were confirmed in the window of its
 * own PR; asked again on the epic, they stop a night for nothing.
 */
export function quotedRecords({ name, own, commits, visible, recordOfTask, inBranchOf }) {
    const { own: direct } = answerersOf(commits, visible, { ownTask: taskOfBranch(name), recordOfTask, inBranchOf });

    return direct.length > 0 && whole(own) ? [own] : [];
}

/** The line of the window: both quotes of a record, for the owner to confirm. */
export function quotesLine(record) {
    const found = parseApprovals(record.text);

    if (found.invisible !== null) {
        return `Без вида: «${found.invisible}» (${record.path})`;
    }

    return `Макет: «${found.mockup}» — ${found.figma} · Витрина: «${found.showcase}» (${record.path})`;
}

function publishFaults(kit) {
    const root = KITS[kit];

    if (root === undefined) {
        return [`unknown kit «${kit}»: ${Object.keys(KITS).join(', ')}`];
    }

    const bump = git('log', '-1', '--format=%H', 'origin/main', '--', `${root}package.json`);
    // Work merged before the rule reached main was never asked for approvals: it is counted from
    // the later of the two — the last version bump or the arrival of this check itself.
    const arrival = git('log', '-1', '--diff-filter=A', '--format=%H', 'origin/main', '--', 'tools/check-kit-approval.mjs');

    if (arrival === '') {
        return [];
    }

    const from = spawnOk('git', ['merge-base', '--is-ancestor', bump, arrival]) ? arrival : bump;
    const merges = git('log', '--first-parent', '--format=%H %s', `${from}..origin/main`).split('\n').filter(Boolean);
    const faults = [];

    for (const line of merges) {
        const [sha, ...words] = line.split(' ');
        const subject = words.join(' ');
        const visible = git('diff', '--name-only', `${sha}^1`, sha)
            .split('\n')
            .filter((path) => path.startsWith(`${root}src/`) && isVisibleKitFile(path));

        if (visible.length === 0) {
            continue;
        }

        // An epic merged into main has no record of its own: its tasks answer, each by its record.
        const parents = git('log', '-1', '--format=%P', sha).split(' ').filter(Boolean);
        const commit = {
            sha,
            subject,
            merge: parents.length > 1,
            files: visible,
            children: parents.length > 1 ? () => firstParents(`${sha}^1..${sha}^2`, 1) : undefined,
        };

        faults.push(...judgeBranch({ name: `${sha.slice(0, 9)} ${subject}`, own: null, commits: [commit], visible, recordOfTask: taskRecordOf, inBranchOf: inTaskBranch }));
    }

    return faults;
}

const calledDirectly = process.argv[1] !== undefined && import.meta.url.endsWith(process.argv[1].split('/').pop());

if (calledDirectly && process.argv.includes('--quotes')) {
    // Nothing printed — the branch has no visible kit edit, and there is nothing to confirm.
    // The quotes shown are those of the records the check holds the branch to: its own for its own
    // kit edits, each merged task's for the task's.
    const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
    const visible = branchVisible();

    if (visible.length > 0) {
        const base = git('merge-base', 'origin/main', 'HEAD');
        const records = quotedRecords({ name: branch, own: recordOf(branch), commits: firstParents(`${base}..HEAD`), visible, recordOfTask: taskRecordOf, inBranchOf: inTaskBranch });

        records.forEach((record) => console.log(quotesLine(record)));
    }

    process.exit(0);
}

if (calledDirectly) {
    const at = process.argv.indexOf('--publish');
    const faults = at === -1 ? branchFaults() : publishFaults(process.argv[at + 1]);

    if (faults.length > 0) {
        console.error(`check-kit-approval: a visible kit edit without the owner's approvals (rule ${RULE})\n`);
        faults.forEach((fault) => console.error(`  ${fault}`));
        console.error('\nAsk the owner, write their answer word for word; a refusal is fixed and shown again.');
        process.exit(1);
    }

    console.log('check-kit-approval: no visible kit edit without approvals');
}
