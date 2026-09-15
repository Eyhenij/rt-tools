#!/usr/bin/env node
// rt-kit v0.28.0 · checks/task-new.github.mjs · a8b1e67d04c5 · правится надстройкой, не здесь
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
 *   npm run task:new -- --epic --title 'Delivery goes by epics' --slug work-by-epics
 *   npm run task:new -- --epic-of 1921 --title '…' --slug command-creates-epic
 *   npm run task:new -- --outside-epic 'the owner asked for it apart' --title '…'
 *
 * The body is read from standard input. The author and the assignee are the bot account, the same
 * one the commits go from; `--assignee` overrides the assignee.
 *
 * With `--epic` the same four steps create an epic — the card the tasks of a piece of work wider
 * than one branch hang on. Three things are added to them: the epic label, without which the audit
 * has nothing to tell an epic card from an ordinary task by; a draft of the plan in the tree's
 * plans directory, because the card carries neither the makeup of the epic nor the order of its
 * tasks; and the path to that draft in the card body — the audit reads the plan by it, and a card
 * without the path points into emptiness. The branch line printed at the end is taken from the main
 * branch: the branch of an epic is the base for the branches of its tasks.
 *
 * With `--epic-of <number>` the created task is a task of that epic: the body says so in the very
 * shape the audit reads the link by, and the printed branch line takes the branch of the epic as
 * its base. Both are written here and not left to the executor's hand: the shape of the line is
 * read by a machine from two sides at once, and the base of the branch is otherwise taken from the
 * working copy, where at that minute any branch may be checked out.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { planPathOf } from './board-epic-plan.mjs';
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
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

/**
 * What an epic is created by: the label of its card and the directory its plan is put in. Both are
 * each tree's own words, and neither has a default — a plan laid at a guessed address is found by
 * nobody, and a card without the label is an ordinary task to the audit.
 */
const EPIC_LABEL = CONFIG.board?.epicLabel ?? '';
const PLANS_DIR = CONFIG.plansDir ?? '';

function parseArgs(argv) {
    const args = { labels: [], assignee: BOT, title: null, slug: null, epic: false, epicOf: null, outsideEpic: null };
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
            case '--epic':
                args.epic = true;
                break;
            case '--epic-of':
                args.epicOf = Number(value);
                index += 1;
                break;
            case '--outside-epic':
                args.outsideEpic = value ?? '';
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
 * A task outside an epic is not created — that is the whole of the requirement, and the refusal
 * carries both lawful ways out of it, because in the shape «name the epic» alone it is read as
 * "there is no way out" and gets bypassed by a call to the hosting past this command.
 *
 * The owner's word is the second way, and it goes into the call as text: work outside an epic
 * happens — a one-line fix, a report from the outside — and only the owner names it as such. An
 * empty reason is not a reason: it is indistinguishable from a flag typed to get past a refusal.
 *
 * A tree that has not named the epic label lives as before: there epics do not exist at all, and
 * demanding one of every task would stop the work of every such tree on the day of installation.
 */
if (EPIC_LABEL && !args.epic && args.epicOf === null && args.outsideEpic === null) {
    fail(
        'a task outside an epic is not taken. Two ways: name the epic — `--epic-of <number>` — or name the word of the owner about work outside an epic — `--outside-epic "<the reason of the owner>"`'
    );
}
if (args.outsideEpic !== null && args.outsideEpic.trim() === '') {
    fail('--outside-epic "<the reason of the owner>": an empty reason is indistinguishable from a flag typed to get past the refusal');
}
if (args.outsideEpic !== null && (args.epic || args.epicOf !== null)) {
    fail('--outside-epic goes with neither --epic nor --epic-of: work is either under an epic or outside one, and the word of the owner is needed only for the second');
}

if (args.epic && args.epicOf !== null) {
    fail('--epic and --epic-of together: an epic is not a task of an epic. An epic inside an epic is not a shape this order knows');
}
if (args.epicOf !== null && !Number.isInteger(args.epicOf)) {
    fail('--epic-of <number>: the number of the epic card, as it stands in the work queue');
}

/**
 * Everything an epic cannot be created without is asked before the creation, not after it: a card
 * already made cannot be taken off the board by anyone but an administrator, and a refusal after
 * the call leaves an epic without a plan and without a label — that is, invisible to the audit as
 * an epic at all.
 */
if (args.epic) {
    if (!EPIC_LABEL) {
        fail('the label of an epic card is not named — `board.epicLabel` in the check settings. Without it the audit has nothing to tell an epic from an ordinary task by');
    }
    if (!PLANS_DIR) {
        fail('the directory of plans is not named — `plansDir` in the check settings. The plan of an epic lies outside the task folder: the folder dies with the merge, the epic outlives it');
    }
    if (!args.slug) {
        fail('--slug <short-slug> is required for an epic: the plan file and the branch of the epic are named by it');
    }
}

/** The label goes with the card, and the audit finds the epic by it — no second way. */
const labels = args.epic && !args.labels.includes(EPIC_LABEL) ? [...args.labels, EPIC_LABEL] : args.labels;

/**
 * The token of the machine account is optional: a tree that has not named it creates the task
 * under the account the hosting client is logged in as. Demanding the token would hold task
 * creation in a tree that has not created a machine account, and in a tree whose account the
 * hosting has limited — and without creation no work starts at all. Who exactly created the task
 * is read off the task itself.
 */
const token = botToken() ?? undefined;

/**
 * The plan of the epic and the line about it in the card body.
 *
 * The audit takes the path to the plan from the body: the card has to name it anyway, and a
 * setting read instead would become a second truth about where the plan of this very epic lies. So
 * the path is written into the body by the same call that creates the file.
 */
const planPath = args.epic ? `${PLANS_DIR.replace(/\/+$/, '')}/${args.slug}.md` : null;

/**
 * The epic the task is created under, read from its card.
 *
 * The link is declared by the task body, and the audit reads exactly one shape of it: the word
 * about the task standing right before the word about the epic. Written by hand, the line comes
 * out in a shape of its own once out of three, and the audit then says the task belongs to no epic
 * while the executor sees the epic named in the body.
 *
 * The path to the plan is taken from the epic card, as the audit takes it — a second address here
 * would diverge from the first one silently. The branch of the epic is read from the plan: the
 * plan names it, and the queue does not know branch names at all.
 */
function epicOfCard(epicNumber) {
    const card = ghJson(['issue', 'view', String(epicNumber), '--json', 'number,title,labels,body'], { token });
    const labelled = (card.labels ?? []).some((label) => label.name === EPIC_LABEL);
    if (!labelled) {
        fail(`#${epicNumber} is not an epic: the card carries no label «${EPIC_LABEL}». A task hangs on an epic, and an epic is what the audit reads by that label`);
    }
    // Which of the paths in the body is the plan is decided by the shared reading, the same one the
    // queue audit calls. Read here by its own way — the first path in the body — the command wrote a
    // law into every task of the epic as its plan, and the branch of the epic was then read from
    // that law and came back empty. Both sides answered as usual, and the miss showed only by
    // reading a created task.
    const found = planPathOf(card.body, { makeupRequired: false });
    const plan = found.path;
    if (plan === null) {
        fail(`the card of the epic #${epicNumber}: ${found.why}. The branch of the epic is named in the plan too`);
    }
    return { plan, branch: epicBranchOf(plan, epicNumber) };
}

/**
 * The branch of the epic, read from the header of its plan.
 *
 * Three spellings are accepted: the one this command writes, the bare word about a branch and the
 * English one — the plans of a tree are translated one at a time, and a single spelling would take
 * every plan but the freshest out of the reading in silence.
 */
function epicBranchOf(plan, epicNumber) {
    const path = join(ROOT, plan);
    if (!existsSync(path)) {
        return null;
    }
    const named = readFileSync(path, 'utf8').match(
        new RegExp(`\\*\\*(?:Ветка эпика|Ветка|Branch):\\*\\*\\s*\`?(${TASK_KEY}-${epicNumber}-[a-z0-9][a-z0-9-]*)\`?`)
    );
    return named ? named[1] : null;
}

const epic = args.epicOf === null ? null : epicOfCard(args.epicOf);
const body = [
    readBody(),
    args.epic ? `Замысел эпика — ${planPath}` : '',
    epic ? `Задача эпика #${args.epicOf}, замысел — ${epic.plan}` : '',
    args.outsideEpic ? `Работа вне эпика — ${args.outsideEpic}` : '',
]
    .filter((part) => part !== '')
    .join('\n\n');

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
            body,
            '--assignee',
            args.assignee,
            ...labels.flatMap((label) => ['--label', label]),
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

    // The task of an epic becomes a sub-issue of the epic card. The line in the body says the same
    // thing, but only to whoever opens the task: the board shows neither the makeup of an epic nor
    // how much of it is done, and the count has to be assembled by hand from the list of open
    // tasks. A sub-issue is the hosting's own link — the epic card gets the list and the progress,
    // the task gets the line about its parent, and the board card gets the "done of total" bar.
    //
    // The link is asked by the numeric id of the task, not by its number: the endpoint takes the id.
    if (args.epicOf !== null) {
        const subId = ghJson(['api', `repos/${OWNER}/${REPO}/issues/${number}`, '--jq', '{id:.id}'], { token }).id;
        gh(['api', '-X', 'POST', `repos/${OWNER}/${REPO}/issues/${args.epicOf}/sub_issues`, '-F', `sub_issue_id=${subId}`], { token });
    }
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

/**
 * The draft of the epic plan. It is assembled here and not copied from a sample: the sample would
 * have to be laid out at a fixed address, while the directory of plans is each tree's own — and a
 * draft assembled here comes with the number, the title and the branch already filled in, which a
 * copied one would leave to be typed by hand.
 *
 * An existing file is not overwritten: a plan written before the card is a lawful order — the
 * makeup is thought out first, and the card is created under a ready one.
 */
function writeEpicPlan() {
    const path = join(ROOT, planPath);
    if (existsSync(path)) {
        console.log(`\nThe plan of the epic is already in place: ${planPath}`);
        return;
    }
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(
        path,
        [
            `# ${args.title}`,
            '',
            `**Эпик:** ${TASK_KEY}-${number} · **Ветка эпика:** \`${branch}\``,
            '',
            '## Что даёт',
            '',
            '<Возможность, ради которой эпик заведён: что владелец получит и чего не может сегодня.>',
            '',
            '## Как стоят ветки',
            '',
            `Ветка эпика отведена от главной, ветки задач — от неё, заявки задач идут в неё. <Стопкой`,
            'ветки задач стоят или каждая от ветки эпика — решает этот план, а не тот, кто заводит',
            'ветку.>',
            '',
            '## Состав',
            '',
            '| #   | Задача                                   | Состояние |',
            '| --- | ---------------------------------------- | --------- |',
            `| 1   | ${TASK_KEY}-<номер> — <что делает>        | впереди   |`,
            '',
            '## Чего эпик не делает',
            '',
            '- <Что лежит рядом и в эпик не входит.>',
            '',
        ].join('\n')
    );
    console.log(`\nThe draft of the epic plan: ${planPath}`);
}

if (args.epic) {
    writeEpicPlan();
} else {
    adoptDraft();
}

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

/**
 * The branch of an epic is taken from the main branch, and the branches of its tasks from it: a
 * base named here saves the executor from taking it from the working copy, where any branch may be
 * checked out at that minute.
 */
const base = args.epic ? ` origin/${CONFIG.deploy?.mainBranch || 'main'}` : epic?.branch ? ` ${epic.branch}` : '';
if (epic && !epic.branch) {
    console.error(`task-new: the plan «${epic.plan}» does not name the branch of the epic — the base of the branch is taken by hand, and it is the branch of the epic, not the main one`);
}
console.log(`\nThe branch is created by a separate call:\n  git checkout -b ${branch}${base}`);
console.log(`A task taken into work is moved on the board:\n  npm run task:move -- ${number} ${IN_PROGRESS_STATUS}`);

if (!answer.ok) {
    console.error(`task-new: check the whole work queue — npm run check:board`);
    process.exit(1);
}
