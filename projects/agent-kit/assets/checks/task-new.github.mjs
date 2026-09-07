#!/usr/bin/env node
/**
 * Creating the task an edit starts with.
 *
 * Creation is made of four steps, and the edit starts only after all four: the task, the number in
 * its title, adding it to the board, the «Backlog» state. While the steps were rewritten by hand
 * from a pattern, a miss on any of them gave a task that is not in the work queue: two such stood
 * idle for a month.
 *
 * The command does not create the branch — it prints the ready line. Creating a branch by a call
 * of its own is demanded by the main branch guard: the compound «create a branch and commit right
 * away» it turns down whole.
 *
 *   npm run task:new -- --title 'Letters to the owner are not sent' --label bug --label area:api
 *   npm run task:new -- --title '…' --slug mail-owner-silence < description.md
 *
 * The body is read from standard input. The author and the assignee are the bot account, the same
 * one the commits go from; `--assignee` overrides the assignee.
 */
import { cpSync, existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    BACKLOG_OPTION_ID,
    BOT,
    IN_PROGRESS_STATUS,
    OfflineError,
    OWNER,
    PROJECT_ID,
    REPO,
    STATUS_FIELD_ID,
    TASK_KEY,
    botToken,
    describeTaskState,
    gh,
    ghJson,
    graphql,
    numberFromTitle,
    taskState,
    unstampFolder,
} from './board.mjs';

function parseArgs(argv) {
    const args = { labels: [], assignee: BOT, title: null, slug: null };
    for (let index = 0; index < argv.length; index += 1) {
        const value = argv[index + 1];
        switch (argv[index]) {
            case '--title':
                args.title = value;
                index += 1;
                break;
            case '--label':
                args.labels.push(value);
                index += 1;
                break;
            case '--assignee':
                args.assignee = value;
                index += 1;
                break;
            case '--slug':
                args.slug = value;
                index += 1;
                break;
            default:
                fail(`unknown flag ${argv[index]}`);
        }
    }
    return args;
}

function fail(message) {
    console.error(`task-new: ${message}`);
    process.exit(1);
}

function readBody() {
    if (process.stdin.isTTY) {
        return '';
    }
    try {
        return readFileSync(0, 'utf8').trim();
    } catch {
        return '';
    }
}

const args = parseArgs(process.argv.slice(2));
if (!args.title) {
    fail("--title '<Что не так>' is required");
}
if (numberFromTitle(args.title) !== null || args.title.startsWith(`[${TASK_KEY}-`)) {
    fail('the number is not typed into the title by hand: it is known only after the creation and is appended by itself');
}
if (args.slug !== null && !/^[a-z0-9][a-z0-9-]*$/.test(args.slug)) {
    fail('slug is lowercase latin letters, digits and dashes: the branch name is read in a list of fifty lines');
}

/**
 * The token of the machine account is optional: a tree that has not named it creates the task
 * under the account the hosting client is logged in as. Demanding the token would hold task
 * creation in a tree that has not created a machine account, and in a tree whose account the
 * hosting has limited — and without creation no work starts at all. Who exactly created the task
 * is read off the task itself.
 */
const token = botToken() ?? undefined;

let number = null;
try {
    const created = gh(
        [
            'issue',
            'create',
            '--repo',
            `${OWNER}/${REPO}`,
            '--title',
            args.title,
            '--body',
            readBody(),
            '--assignee',
            args.assignee,
            ...args.labels.flatMap((label) => ['--label', label]),
        ],
        { token }
    ).trim();
    number = Number(created.split('/').pop());
    if (!Number.isInteger(number)) {
        fail(`the number of the created task cannot be parsed in the answer: ${created}`);
    }

    // The number is known only now, so the title is appended by a second call.
    gh(['api', '-X', 'PATCH', `repos/${OWNER}/${REPO}/issues/${number}`, '-f', `title=[${TASK_KEY}-${number}] ${args.title}`], {
        token,
    });

    const issueId = ghJson(['api', `repos/${OWNER}/${REPO}/issues/${number}`, '--jq', '{id:.node_id}'], { token }).id;
    const itemId = graphql(
        `mutation { addProjectV2ItemById(input: {projectId: "${PROJECT_ID}", contentId: "${issueId}"}) { item { id } } }`,
        { token }
    ).data.addProjectV2ItemById.item.id;
    graphql(
        `mutation { updateProjectV2ItemFieldValue(input: {projectId: "${PROJECT_ID}", itemId: "${itemId}", fieldId: "${STATUS_FIELD_ID}", value: {singleSelectOptionId: "${BACKLOG_OPTION_ID}"}}) { projectV2Item { id } } }`,
        { token }
    );
} catch (error) {
    const reason = error instanceof OfflineError ? `no connection to GitHub: ${error.message}` : String(error.message ?? error);
    if (number === null) {
        fail(reason);
    }
    // The task already exists, and it may not be on the board — exactly the state tasks were being
    // lost by. Staying silent here is not allowed: the number is printed to finish it by hand.
    console.error(`task-new: the task #${number} is created but not finished — ${reason}`);
    console.error(`task-new: check it and finish it — npm run check:board`);
    process.exit(1);
}

const branch = args.slug ? `${TASK_KEY}-${number}-${args.slug}` : `${TASK_KEY}-${number}-<short-slug>`;

/**
 * The task folder is renamed here, because the number and the branch name are known at this moment
 * for the only time in the whole work. The grill of the owner's request goes before the task is
 * created — until the grill is over it is not even known how many tasks will come out of it — and
 * lies in `docs/tasks/_draft-<slug>`. Left as a draft, it stays outside the history, and the next
 * session does not find it: the startup hook looks for the folder by the branch name.
 */

function adoptDraft() {
    if (!args.slug) {
        console.log(`\nThe task folder: --slug is not set, there is nothing to rename the draft by.`);
        return;
    }
    const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
    const draft = join(root, 'docs/tasks', `_draft-${args.slug}`);
    const target = join(root, 'docs/tasks', branch);

    if (existsSync(target)) {
        console.log(`\nThe task folder is already in place: docs/tasks/${branch}/`);
    } else if (existsSync(draft)) {
        renameSync(draft, target);
        // The draft too is assembled from the sample, and the header in it is the same: it is
        // taken off here as well.
        unstampFolder(target);
        console.log(`\nThe task folder: docs/tasks/_draft-${args.slug}/ → docs/tasks/${branch}/`);
    } else {
        const template = join(root, 'docs/tasks/_template');

        if (!existsSync(template)) {
            console.log(`\nThere is no task folder and nothing to assemble it from: the sample ${'docs/tasks/_template'} does not lie in the tree`);
            return;
        }

        cpSync(template, target, { recursive: true });
        unstampFolder(target);
        console.log(`\nThe task folder is assembled from the sample: docs/tasks/${branch}/`);
    }

    // The header of the plan is read by a guard: by it the guard finds the product agreement. The
    // number in it is set right here — by hand it is copied over from a hint and mistyped.
    const plan = join(target, 'plan.md');
    if (!existsSync(plan)) {
        return;
    }
    const before = readFileSync(plan, 'utf8');
    // The key is read under two names: the package sample is English, and a tree folder created
    // before the layer was translated is Russian. It is written in English.
    const after = before.replace(/^\*\*(?:Task|Задача):\*\*.*$/m, `**Task:** ${TASK_KEY}-${number} · **Branch:** ${branch}`);
    if (after !== before) {
        writeFileSync(plan, after);
        console.log(`The header of the plan is filled in: docs/tasks/${branch}/plan.md`);
    }
}

adoptDraft();

console.log(`[${TASK_KEY}-${number}] ${args.title}`);
console.log(`https://github.com/${OWNER}/${REPO}/issues/${number}`);

/**
 * The fifth step: creation is confirmed by the answer of the work queue, not by the output of this
 * command.
 *
 * All four steps above answer for their own calls and stay silent about whether the task is visible
 * to whoever comes for it. Sixteen creations in a row printed the number with a link that way, and
 * not one of them landed in the queue: the account was limited by the hosting, and the calls gave
 * no refusal at that.
 */
/**
 * This is read more than once. The queue does not hand back a new card the same second it was
 * created, and the reading goes as the next call after the adding: two creations in a row printed
 * that the task is not in the queue while the card was in place. A false refusal here costs more
 * than a delay — it pushes to create the card a second time, and only an administrator can take it
 * off the board.
 */
let unreachable = false;

function askQueue() {
    try {
        return describeTaskState(number, taskState(number, { token }));
    } catch (error) {
        // There was nothing to ask with — there is nothing to repeat: the answer is not late,
        // there will be none at all.
        unreachable = true;
        const reason = error instanceof OfflineError ? error.message : String(error.message ?? error);
        return describeTaskState(number, { offline: reason });
    }
}

/** How long to wait between readings and how many times to re-read: the queue delay is seconds. */
const QUEUE_RETRIES = 3;
const QUEUE_PAUSE_MS = 1500;

let answer = askQueue();
for (let attempt = 1; !answer.ok && !unreachable && attempt < QUEUE_RETRIES; attempt += 1) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, QUEUE_PAUSE_MS);
    answer = askQueue();
}
for (const line of answer.lines) {
    (answer.ok ? console.log : console.error)(`task-new: ${line}`);
}

console.log(`\nThe branch is created by a separate call:\n  git checkout -b ${branch}`);
console.log(`A task taken into work is moved on the board:\n  npm run task:move -- ${number} ${IN_PROGRESS_STATUS}`);

if (!answer.ok) {
    console.error(`task-new: check the whole work queue — npm run check:board`);
    process.exit(1);
}
