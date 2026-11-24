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

    const archived = readdirSync(join('docs', 'archive')).find((file) => file.startsWith(`${task}-`));

    return archived ? { path: join('docs', 'archive', archived), text: readFileSync(join('docs', 'archive', archived), 'utf8') } : null;
}

/** The task a commit belongs to: `[RT-N]` of a merged PR, or `(RT-N)` closing a commit subject. */
export function taskOf(subject) {
    return /\[(RT-\d+)\]/.exec(subject)?.[1] ?? /\((RT-\d+)\)\s*$/.exec(subject)?.[1] ?? null;
}

/**
 * Who answers for the visible kit files a branch carries. Every commit that touched such a file
 * answers by the record of its task: a merged PR by `[RT-N]`, a commit of an earlier branch of the
 * chain by its closing `(RT-N)`. A merge with no record behind its task, or with no task at all —
 * an epic merged into main, the epic branch merged into a task — is taken apart by its own commits
 * when they are given. A commit of the branch's own task, a commit naming no task and a merge that
 * cannot be taken apart answer by the branch's own record. A file only main's merge touched is a
 * conflict the branch resolved, and it is the branch's own too; a file a task answers for is not.
 *
 * `commits` are the first parents from the base, each `{ sha, subject, merge, files, children? }`,
 * `children` the first parents of the merged side. `ownTask` is the task of the branch itself.
 */
export function answerersOf(commits, visible, { ownTask = null, recordOfTask = () => null } = {}) {
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
            const foreign = task !== null && task !== ownTask;
            const takeApart = commit.merge && Array.isArray(commit.children) && (!foreign || recordOfTask(task) === null);

            if (takeApart) {
                walk(commit.children);
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

/** The first parents of `range`, each with the first parents of its merged side when it is a merge. */
function firstParents(range, depth = 0) {
    return git('log', '--first-parent', '--format=%H %P', range)
        .split('\n')
        .filter(Boolean)
        .map((line) => {
            const [sha, ...parents] = line.split(' ');
            const merge = parents.length > 1;

            return {
                sha,
                subject: git('log', '-1', '--format=%s', sha),
                merge,
                files: git('diff', '--name-only', `${sha}^1`, sha).split('\n').filter(Boolean),
                // An epic in a chain merges at most a few levels deep; deeper history is left whole.
                children: merge && depth < 3 ? firstParents(`${sha}^1..${sha}^2`, depth + 1) : undefined,
            };
        });
}

/** The task of the branch itself, from its name: `RT-3585-night-findings` is RT-3585. */
const taskOfBranch = (branch) => /^(RT-\d+)-/.exec(branch)?.[1] ?? null;

function branchFaults() {
    const branch = git('rev-parse', '--abbrev-ref', 'HEAD');

    const base = git('merge-base', 'origin/main', 'HEAD');
    const visible = branchVisible();

    if (visible.length === 0) {
        return [];
    }

    return judgeBranch({ name: branch, own: recordOf(branch), commits: firstParents(`${base}..HEAD`), visible, recordOfTask: taskRecordOf });
}

/**
 * The faults of a branch, from what it carries. The branch's own record answers only for the kit
 * files its own commits brought; a merged task answers by its own record. A branch with a record of
 * its own and no kit edit of its own is not asked for approvals: the merged tasks were.
 *
 * `own` is the branch record or null; `commits` the first parents from the base; `recordOfTask`
 * gives the record of a task number or null.
 */
export function judgeBranch({ name, own, commits, visible, recordOfTask }) {
    const { own: direct, tasks } = answerersOf(commits, visible, { ownTask: taskOfBranch(name), recordOfTask });
    const faults = direct.length === 0 ? [] : faultsOf(name, own);

    for (const { task, sha, subject } of tasks) {
        faults.push(...faultsOf(`${sha.slice(0, 9)} ${subject}`, recordOfTask(task)));
    }

    return faults;
}

/**
 * The records whose quotes the owner confirms in the window: the ones `judgeBranch` holds the branch
 * to and finds whole. A record that answers for nothing the branch carries is not shown.
 */
export function quotedRecords({ name, own, commits, visible, recordOfTask }) {
    const { own: direct, tasks } = answerersOf(commits, visible, { ownTask: taskOfBranch(name), recordOfTask });
    const records = [];

    if (direct.length > 0 && own !== null) {
        records.push(own);
    }

    tasks.forEach(({ task }) => {
        const record = recordOfTask(task);

        if (record !== null) {
            records.push(record);
        }
    });

    return records.filter((record) => faultsOf(record.path, record).length === 0);
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
            children: parents.length > 1 ? firstParents(`${sha}^1..${sha}^2`, 1) : undefined,
        };

        faults.push(...judgeBranch({ name: `${sha.slice(0, 9)} ${subject}`, own: null, commits: [commit], visible, recordOfTask: taskRecordOf }));
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
        const records = quotedRecords({ name: branch, own: recordOf(branch), commits: firstParents(`${base}..HEAD`), visible, recordOfTask: taskRecordOf });

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
