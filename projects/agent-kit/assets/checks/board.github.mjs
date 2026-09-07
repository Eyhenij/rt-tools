#!/usr/bin/env node
/**
 * Shared work with the work queue: the project board, the tasks and their state.
 *
 * One question — "is task N in order?" — is asked by three callers: the task creation command
 * (tools/task-new.mjs), the queue audit (tools/check-board.mjs) and the delivery guard
 * (.claude/hooks/git-guard-delivery.sh). While the answer stood as ready-made lines in a pattern,
 * each answered its own way: two tasks were created outside the board that way.
 *
 * The board is not bound to the repository — its `projectsV2` is empty — so a task lands on it
 * only by an explicit call. The guard calls this file as a command: `node tools/board.mjs task
 * <number>` prints the task state as one line of JSON; `move <number> <column>` moves its column,
 * also `npm run task:move`.
 *
 * No network or no token is not a discrepancy but an inability to check: the functions return
 * `null`, the command mode prints `{"offline":true}`.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { OfflineError, botToken, gh, ghJson, graphql } from './board-gh.mjs';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

// The client leaves here under its old name: three neighbouring modules and the tree's commands
// call it from the board module, and rewriting them for the moved declaration would mean paying
// for the file split twice.
export { OfflineError, botToken, gh, ghJson, graphql };

/**
 * The board address and its columns live in `.claude/rt-kit/checks.json`: the identifiers of the
 * project, the fields and the options are issued by GitHub itself when the board is created, and
 * they cannot be guessed. An empty value means the tree has not created a board — then work with
 * it refuses out loud instead of silently editing someone else's.
 */
const BOARD = CONFIG.board ?? {};

export const OWNER = BOARD.owner ?? '';
export const REPO = BOARD.repo ?? '';
export const PROJECT_ID = BOARD.projectId ?? '';
/** The board's "Status" field — the column the task stands in now */
export const STATUS_FIELD_ID = BOARD.statusFieldId ?? '';
/**
 * The board columns under their short names. The progress is read by them, not by whether the
 * task has a branch: branches are not visible on the board at all.
 */
export const STATUS_OPTIONS = BOARD.statusOptions ?? {};
/** The column of a newly created task */
export const BACKLOG_OPTION_ID = STATUS_OPTIONS.backlog?.id ?? '';
/** The column of a task taken into work, and of a task whose PR waits for review */
export const IN_PROGRESS_STATUS = 'in-progress';
export const IN_REVIEW_STATUS = 'in-review';
/** The machine account — the same one the commits come from */
export const BOT = BOARD.bot ?? '';
/**
 * The task key: gives the branch `<KEY>-<number>-<slug>` and the title `[<KEY>-<number>]`.
 *
 * The only thing in the name form that the tree chooses itself — and so the only thing the
 * delivery law allows to configure. The tree must name it: an empty key assembles into `[-317]`,
 * and such a title matches nothing. The refusal is by name, because silence costs more here: the
 * queue audit does not fail but marks every task as wrongly named, and the real discrepancy drowns
 * among those lines.
 */
export const TASK_KEY = BOARD.taskKey ?? '';
if (PROJECT_ID && !TASK_KEY) {
    console.error(
        'board: ключ задач не назван — задать его ключом `board.taskKey` в .claude/rt-kit/checks.json.\n' +
            'Из него собираются заголовок задачи `[<КЛЮЧ>-<номер>]` и имя ветки `<КЛЮЧ>-<номер>-<краткое-имя>`.'
    );
    process.exit(1);
}
/** Who is requested for review: without a reviewer the PR does not reach the owner's inbox. */
export const REVIEWER = BOARD.reviewer ?? '';
/**
 * Tasks standing on the board, and board items that are not tasks. Each task has its board item
 * and column: a task can be moved only by the item identifier, not by the task number, and it is
 * taken right here so as not to ask the board twice.
 */
export function fetchBoard(options) {
    const items = new Map();
    const foreign = [];
    let after = 'null';
    for (;;) {
        const page = graphql(
            `{ node(id: "${PROJECT_ID}") { ... on ProjectV2 { items(first: 100, after: ${after}) {
                pageInfo { hasNextPage endCursor }
                nodes { id
                    status: fieldValueByName(name: "Status") { ... on ProjectV2ItemFieldSingleSelectValue { name optionId } }
                    content { __typename ... on Issue { number } ... on PullRequest { number } ... on DraftIssue { title } } } } } } }`,
            options
        ).data.node.items;
        for (const node of page.nodes) {
            const content = node.content ?? {};
            if (content.__typename === 'Issue') {
                items.set(content.number, { itemId: node.id, status: node.status?.name ?? null });
            } else {
                foreign.push(content.__typename === 'PullRequest' ? `PR #${content.number}` : `черновик «${content.title}»`);
            }
        }
        if (!page.pageInfo.hasNextPage) {
            return { issues: new Set(items.keys()), items, foreign };
        }
        after = `"${page.pageInfo.endCursor}"`;
    }
}

/**
 * Moving a task to another column. The task's state on the board is the only thing the progress
 * is visible by: the board does not read the branch or the open PR itself.
 */
export function moveTask(number, status, options) {
    const option = STATUS_OPTIONS[status];
    if (!option) {
        throw new Error(`неизвестная колонка «${status}» — есть ${Object.keys(STATUS_OPTIONS).join(', ')}`);
    }
    const item = fetchBoard(options).items.get(number);
    if (!item) {
        throw new Error(`задачи #${number} нет на борде — заводится она командой npm run task:new`);
    }
    graphql(
        `mutation { updateProjectV2ItemFieldValue(input: {projectId: "${PROJECT_ID}", itemId: "${item.itemId}", fieldId: "${STATUS_FIELD_ID}", value: {singleSelectOptionId: "${option.id}"}}) { projectV2Item { id } } }`,
        options
    );
    return { from: item.status, to: option.name };
}

/**
 * Whose eyes the state was taken with: `machine` — the call went with the machine account's
 * token, `client` — as whoever the hosting client is logged in as. A task is read with the token,
 * a PR without it, and from the output alone this cannot be told apart: a tree whose machine
 * account was restricted by the hosting got a person's picture and took it as checked. The login
 * is not printed here — it would take a second network request, and the guards read the answer
 * without it.
 */
export function viewerOf(options) {
    return options?.token ? 'machine' : 'client';
}

export function fetchIssues(state, options) {
    // The body is taken together with the list, not by a call per task: the link to an epic is
    // read exactly there, and four hundred calls of the kind "show one task" would cost more than
    // the whole audit.
    return ghJson(
        ['issue', 'list', '--state', state, '--limit', '400', '--json', 'number,title,state,assignees,labels,body'],
        options,
    );
}

export function fetchIssue(number, options) {
    try {
        return ghJson(['issue', 'view', String(number), '--json', 'number,title,state,assignees,labels'], options);
    } catch (error) {
        if (error instanceof OfflineError) {
            throw error;
        }
        return null;
    }
}

/**
 * The PR state in delivery terms: whether it exists, whether it is a draft and whether it has a
 * review — a requested reviewer or a review already left.
 *
 * Before this edit nobody asked about the reviewer: it lived as prose in the pattern about the
 * commit and the PR, and the hosting silently accepts a review request to oneself — the review
 * then looks requested, and there is none.
 */
export function pullState(ref, options) {
    // The PR reference is optional: without it the hosting client takes the PR of the current
    // branch, and that is the shortest form of the call. Requiring a number would mean silently
    // skipping it.
    const target = ref === undefined || ref === null || `${ref}`.trim() === '' ? [] : [`${ref}`.trim()];
    let pull;
    try {
        pull = ghJson(['pr', 'view', ...target, '--json', 'number,isDraft,reviewRequests,latestReviews,author,mergeable'], options);
    } catch (error) {
        if (error instanceof OfflineError) {
            throw error;
        }
        return { exists: false, viewer: viewerOf(options) };
    }
    if (!pull) {
        return { exists: false, viewer: viewerOf(options) };
    }
    const requested = (pull.reviewRequests ?? []).map((entry) => entry.login ?? entry.name ?? '').filter(Boolean);
    const reviewed = (pull.latestReviews ?? []).map((entry) => entry.author?.login ?? '').filter(Boolean);
    const reviewers = [...new Set([...requested, ...reviewed])];
    return {
        exists: true,
        viewer: viewerOf(options),
        number: pull.number ?? null,
        draft: pull.isDraft === true,
        author: pull.author?.login ?? null,
        reviewers,
        reviewed: reviewers.filter((login) => login !== (pull.author?.login ?? null)).length > 0,
        // A conflict arrives through someone else's merge, without a single action by the PR
        // author. Only a direct "conflicting" is judged: `UNKNOWN` means the hosting is still
        // computing, and reading it as a conflict would mean refusing work on every fresh head.
        conflicting: pull.mergeable === 'CONFLICTING',
    };
}

/**
 * How many commits the PR branch is behind main. The guard judges the base at the minute of
 * opening, and a PR stands for days: what was merged in that time is seen neither by it nor by a
 * green run. Nothing to compare with — zero: an audit without access would refuse work instead
 * of a miss; without network the refusal is thrown, as everywhere.
 */
export function behindMain(branch, mainBranch, options) {
    if (!OWNER || !REPO || !branch || !mainBranch) {
        return 0;
    }
    try {
        const behind = gh(
            ['api', `repos/${OWNER}/${REPO}/compare/${encodeURIComponent(mainBranch)}...${encodeURIComponent(branch)}`, '--jq', '.behind_by'],
            options
        );
        return Number(String(behind).trim()) || 0;
    } catch (error) {
        if (error instanceof OfflineError) {
            throw error;
        }
        return 0;
    }
}

/** The head is taken together with the rest: both the task folder and the run are judged by it,
 * and asking for it later would mean a second call per PR. */
export function fetchOpenPulls(options) {
    return ghJson(
        ['pr', 'list', '--state', 'open', '--limit', '200', '--json', 'number,title,headRefName,headRefOid,isDraft,body,mergeable,baseRefName'],
        options
    );
}

/**
 * Own open PRs marked as conflicting. Asked at the minute new work is taken: while what was
 * handed over conflicts, a person cannot merge it, and every next PR adds one more to the queue.
 *
 * Own means opened by the tree's machine account. A tree that has not named it is not asked at
 * all: `@me` would answer with the account the hosting client is logged in as — most often the
 * owner, whose PRs are not the executor's to fix.
 *
 * Only a direct `CONFLICTING` is judged. `UNKNOWN` means the hosting is still computing
 * mergeability — it recomputes it after every edit of the main branch — and reading it as a
 * conflict would refuse work on every fresh head.
 */
export function conflictingPulls(options) {
    if (!BOT) {
        return null;
    }
    const pulls = ghJson(['pr', 'list', '--author', BOT, '--state', 'open', '--limit', '100', '--json', 'number,headRefName,mergeable'], options);
    if (!Array.isArray(pulls)) {
        return null;
    }
    return pulls
        .filter((pull) => pull.mergeable === 'CONFLICTING')
        .map((pull) => ({ number: pull.number ?? null, branch: pull.headRefName ?? '' }));
}

/** `[<KEY>-<number>]` at the start of the title — the only form of the number in names */
export const TITLE_NUMBER = new RegExp(`^\\[${TASK_KEY}-(\\d+)\\]\\s+\\S`);
/** `<KEY>-<number>-<slug>` — the name of the branch set aside for the task */
export const BRANCH_NUMBER = new RegExp(`^${TASK_KEY}-(\\d+)-[a-z0-9][a-z0-9-]*$`);

export function numberFromTitle(title) {
    const match = TITLE_NUMBER.exec(title ?? '');
    return match ? Number(match[1]) : null;
}

/**
 * The task number by the folder name. The key in front is optional: a branch name of the kind
 * `chore/312-slug` is lawful too, and the folder under it is named by the bare number. If the
 * audit does not recognise a number in the name, the folder will lie among the current ones for
 * any length of time — one such was found by grep, not by a check.
 */
export function numberFromTaskDir(name) {
    // The key is substituted only if the tree has set it: an empty one would give `^(?:-)?`, and
    // a folder with the key in its name would stop being recognised at all.
    const prefix = TASK_KEY ? `(?:${TASK_KEY}-)?` : '';
    const match = new RegExp(`^${prefix}(\\d+)-`).exec(name ?? '');
    return match ? Number(match[1]) : null;
}

/**
 * Task folders, including nested ones. The path repeats the branch name in full, slash included,
 * so the folder of branch `chore/312-slug` lies on the second level — a walk over the top level
 * alone does not see it.
 *
 * We descend exactly one level: a branch name has one slash, and anything deeper is no longer a
 * task folder — but the archive would get in there, if the tree keeps it inside.
 */
/** The layout header: by it the laid-out copy is recognised, and so is the edit-place guard. */
const STAMP = /^<!-- rt-kit v[^\n]*-->\n/m;

/**
 * Remove the layout header from copies of the template.
 *
 * The template carries the header by right: the layout puts it there and updates it. A copy under
 * a task is already the project's text, by the same argument by which the companion draft is laid
 * out without a header: from the first edit there is nothing to audit in it. Left in the copy, the
 * header refuses the very first edit of the grill and sends one to edit the package template
 * instead. It was removed by three lines by hand, anew with every piece of work.
 *
 * Returns the names of the files the header was removed from: by them the scenario judges that
 * the removal works, and the caller that the folder is assembled.
 */
export function unstampFolder(folder) {
    const cleaned = [];

    if (!existsSync(folder)) {
        return cleaned;
    }

    for (const name of readdirSync(folder)) {
        if (!name.endsWith('.md')) {
            continue;
        }

        const path = join(folder, name);
        const before = readFileSync(path, 'utf8');
        const after = before.replace(STAMP, '');

        if (after !== before) {
            writeFileSync(path, after);
            cleaned.push(name);
        }
    }

    return cleaned;
}

export function taskDirs(dir = join(ROOT, CONFIG.tasksDir), prefix = '') {
    if (!existsSync(dir)) {
        return [];
    }
    const found = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name === '_template') {
            continue;
        }
        const name = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.name.startsWith('_draft-') || numberFromTaskDir(entry.name) !== null) {
            found.push(name);
            continue;
        }
        if (!prefix) {
            found.push(...taskDirs(join(dir, entry.name), name));
        }
    }
    return found;
}

export function numberFromBranch(branch) {
    const match = BRANCH_NUMBER.exec(branch ?? '');
    return match ? Number(match[1]) : null;
}

/**
 * The task state in the law's terms: it exists, it stands in the work queue, it has an executor,
 * it is not yet closed. Closed means the branch under it has already gone into main, and a task
 * has one branch.
 */
export function taskState(number, options) {
    const issue = fetchIssue(number, options);
    if (!issue) {
        return { exists: false, viewer: viewerOf(options) };
    }
    const item = fetchBoard(options).items.get(issue.number);
    return {
        exists: true,
        viewer: viewerOf(options),
        title: issue.title,
        open: issue.state === 'OPEN',
        onBoard: item !== undefined,
        status: item?.status ?? null,
        assigned: issue.assignees.length > 0,
        assignees: issue.assignees.map((assignee) => assignee.login),
        numbered: numberFromTitle(issue.title) === issue.number,
        labels: issue.labels.map((label) => label.name),
    };
}

/**
 * The work queue's answer about a created task, folded into lines, and the verdict: secured or not.
 *
 * Separated from the network calls on purpose. Creation ends not with the command output but with
 * the queue's answer, and the decision of what to print and how to end is exactly where sixteen
 * tasks in a row passed as successful without one reaching the queue. Inside the network calls it
 * is checked only by a live board, that is, never.
 *
 * `state` — what `taskState` returned, or `{ offline: <reason> }` if asking failed.
 */
export function describeTaskState(number, state) {
    if (state?.offline) {
        return {
            ok: false,
            lines: [
                `в очереди работ: спросить не удалось — ${state.offline}`,
                'состояние очереди неизвестно, и заведённым это не считается',
            ],
        };
    }
    if (!state?.exists) {
        return { ok: false, lines: [`задачи #${number} у хостинга нет — заведение не состоялось`] };
    }
    if (!state.onBoard) {
        return {
            ok: false,
            lines: [`в очереди работ: НЕТ`, 'задача, которой нет в очереди, работой не обеспечена — по ней никто не придёт'],
        };
    }

    const column = state.status ? `колонка «${state.status}»` : 'колонки нет';
    if (!state.assigned) {
        return {
            ok: false,
            lines: [`в очереди работ: ${column}, исполнителя нет`, 'ничья задача стоит в очереди невидимой для того, кто её делает'],
        };
    }
    return { ok: true, lines: [`в очереди работ: ${column}, исполнитель ${state.assignees.join(', ')}`] };
}

const isEntryPoint = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
// The machine account's token is substituted here too, as in the column move. Without it the
// client goes as whoever is logged in, and during a guard's turn nobody is logged in: the hosting
// answers that the repository does not exist at all, reading the task returns nothing, and "there
// was nothing to ask with" becomes indistinguishable from "the task does not exist". On such an
// answer the delivery guard refused opening a PR with five mutually exclusive reasons at once —
// no task, the task is closed, the task is not in the queue.
if (isEntryPoint && process.argv[2] === 'task') {
    try {
        process.stdout.write(`${JSON.stringify(taskState(Number(process.argv[3]), { token: botToken() ?? undefined }))}\n`);
    } catch (error) {
        if (error instanceof OfflineError) {
            process.stdout.write('{"offline":true}\n');
        } else {
            process.stdout.write(`${JSON.stringify({ error: String(error.message ?? error) })}\n`);
            process.exit(1);
        }
    }
}

if (isEntryPoint && process.argv[2] === 'pr') {
    try {
        // There is no token here on purpose: the review fields need access to the organisation's
        // accounts, which the machine account was not given, and a request with it is refused on
        // rights entirely. A client without a token goes as whoever is logged in, and for a person
        // it answers.
        process.stdout.write(`${JSON.stringify(pullState(process.argv[3]))}\n`);
    } catch (error) {
        if (error instanceof OfflineError) {
            process.stdout.write('{"offline":true}\n');
        } else {
            process.stdout.write(`${JSON.stringify({ error: String(error.message ?? error) })}\n`);
            process.exit(1);
        }
    }
}

// Own conflicting PRs as one line of JSON: `{"conflicting":[{"number":…,"branch":…}]}`.
// The delivery guard calls it before letting new work be taken. A tree without a machine account
// answers with an empty list: there is nobody to ask about.
if (isEntryPoint && process.argv[2] === 'conflicts') {
    try {
        process.stdout.write(`${JSON.stringify({ conflicting: conflictingPulls({ token: botToken() ?? undefined }) ?? [] })}\n`);
    } catch (error) {
        if (error instanceof OfflineError) {
            process.stdout.write('{"offline":true}\n');
        } else {
            process.stdout.write(`${JSON.stringify({ error: String(error.message ?? error) })}\n`);
            process.exit(1);
        }
    }
}

// The column move edits the board. The machine account's token is optional here: a tree that has
// not named it edits the board as the account the hosting client is logged in as. Requiring the
// token would hold the work queue back from a tree that created no machine account, and from a
// tree whose account the hosting restricted. No connection is still a refusal, not a skip: a task
// left unmoved silently stays in its old column, and the discrepancy surfaces only through the
// queue audit.
if (isEntryPoint && process.argv[2] === 'move') {
    const number = Number(process.argv[3]);
    const status = process.argv[4];
    if (!Number.isInteger(number) || !status) {
        console.error(`board: нужен номер задачи и колонка — node tools/board.mjs move 263 ${IN_PROGRESS_STATUS}`);
        process.exit(1);
    }
    const token = botToken() ?? undefined;
    try {
        const moved = moveTask(number, status, { token });
        console.log(`#${number}: ${moved.from ?? 'вне колонок'} → ${moved.to}`);
    } catch (error) {
        const reason = error instanceof OfflineError ? `нет связи с GitHub: ${error.message}` : String(error.message ?? error);
        console.error(`board: задача #${number} осталась на прежнем месте — ${reason}`);
        process.exit(1);
    }
}
