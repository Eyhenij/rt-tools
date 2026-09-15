#!/usr/bin/env node
// rt-kit v0.28.0 · checks/check-board.github.mjs · 3bc1800711be · правится надстройкой, не здесь
/**
 * Audit of the work queue against what the delivery law requires of a task and its PR.
 *
 * The delivery guard refuses a miss at the moment it is made, but it acts only on the agent's
 * commands: a task created past it and a PR opened by hand it does not see. This audit answers
 * a different question — "is the whole queue in order right now" — and so it looks at the state,
 * not at the command.
 *
 * It judges only what is open. Closed tasks and merged PRs are history: of the last forty merged
 * PRs, thirty-six came from branches with no task behind them, and a check that is red forever
 * would be no different from no check at all.
 *
 * It does not judge the branch name. An open PR cannot have its branch renamed — that is a new
 * branch and a new PR — and a check that demands the impossible gets bypassed, not carried out.
 * The branch name is watched by the guard at the moment of `git checkout -b` and `gh pr create`.
 *
 * The task's column is judged by its PR: an open PR means review, none means no review. The
 * moment a task is taken into work is not visible from here at all — the board has no branch —
 * and "In progress" is required of nobody here.
 *
 * The run on the head is asked by this audit too: a PR page without a run looks the same as a
 * page with a green one — it has no colour in either case — and a head with no run behind it is
 * found only when someone opens the list of runs by hand.
 *
 * No network or no token — exit code zero: a check that fails on a plane stops meaning anything.
 *
 * A non-zero exit code and the list of discrepancies.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
    IN_REVIEW_STATUS,
    OWNER,
    OfflineError,
    REPO,
    STATUS_OPTIONS,
    TASK_KEY,
    botToken,
    fetchBoard,
    fetchIssues,
    fetchOpenPulls,
    behindMain,
    gh,
    ghJson,
    numberFromTaskDir,
    numberFromTitle,
    taskDirs,
} from './board.mjs';
import { checkBranchFolders } from './board-folders.mjs';
import { checkConflicting, checkHeadRun } from './board-pull-state.mjs';
import { checkLongWork } from './board-long-work.mjs';
import { HAS_PIPELINE, deployLag, lastDeploy, lastMainRun, pipelineText, pipelineWakesOnPush } from './board-runs.mjs';
import { checkEpicLinks, checkEpicPullBase, checkEpicState, checkEpicSubIssues } from './board-epics.mjs';
import { similarTitles } from './board-titles.mjs';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const IN_REVIEW = STATUS_OPTIONS[IN_REVIEW_STATUS].name;
const TASKS_DIR = join(ROOT, CONFIG.tasksDir);
/** Age of an abandoned draft after which it stops looking like one started today. */
const DRAFT_DAYS = 7;
/**
 * The tree's pipeline. Runs are asked for only where they have somewhere to come from: a tree
 * without a pipeline would get a line for every open PR, and about nothing.
 */
/**
 * The rollout workflow and the branch production is compared with. A tree that names no workflow
 * gets no production audit — and the audit says so out loud: silence would read as "production
 * matches".
 */
/**
 * Labels that mark cargo in the work queue — incident analyses and proposals sent by trees. They
 * are not tasks: their title has no number, they have no executor, they are not on the board — and
 * the audit printed three lines for each, among which a real discrepancy could no longer be read.
 * Such records are no longer created in the queue, and those created the old way are not going
 * anywhere: closing them is the owner's decision, not the audit's.
 *
 * The label name names the tree: each has its own, and an invented default would match nothing
 * and silently switch the filtering off. A tree that names no label is judged as before.
 *
 * The label alone is not enough to recognise cargo: a tree puts it on the tasks that grew out of
 * cargo too — that is how the reader sees where the work came from. Read by the label alone, such
 * a task fell out of the whole task half at once: neither the executor, nor the board, nor the
 * link with an epic, nor a matching title was asked about it, and a request about it got the line
 * "the task is not among the open ones". So a title with a number outweighs the label: that is
 * what the tree itself tells a task by.
 */
const CARGO_LABELS = new Set(CONFIG.board?.cargoLabels ?? []);

/** A record of the cargo: the label of one, and no title of a task. */
function isCargo(issue) {
    return numberFromTitle(issue.title) === null && (issue.labels ?? []).some((label) => CARGO_LABELS.has(label.name));
}

const DEPLOY_WORKFLOW = CONFIG.deploy?.workflow ?? '';
const MAIN_BRANCH = CONFIG.deploy?.mainBranch ?? 'main';

const problems = [];
const report = (message) => problems.push(message);

/**
 * The grill of the owner's request goes before the task is created and lives in `_draft-<slug>`.
 * Abandoned halfway, it stays on disk outside history and looks the same as one started today:
 * the second session takes up the same thing anew. Age is the only sign available here: there is
 * no task behind the draft yet, and nobody to ask about it.
 */
function checkDrafts() {
    const now = Date.now();
    for (const name of taskDirs()) {
        if (!name.startsWith('_draft-')) {
            continue;
        }
        const age = Math.floor((now - statSync(join(TASKS_DIR, name)).mtimeMs) / 86400000);
        if (age >= DRAFT_DAYS) {
            report(`${CONFIG.tasksDir}/${name}/: the grill was abandoned ${age} days ago — create the task or delete the folder`);
        }
    }
}

/**
 * The meaningful words of a title: the task key and short function words are thrown out.
 *
 * The parsing is deliberately rough — a match of words here is not a verdict but a reason to
 * look: exact comparison of titles finds nothing, because a duplicate is written in other words.
 */
function closesNumbers(body) {
    return [...String(body ?? '').matchAll(/\bCloses\s+#(\d+)\b/gi)].map((match) => Number(match[1]));
}

/**
 * The bypass line in the PR body. The form is the same one the delivery guard reads: it starts
 * the line and accepts no placeholders — otherwise a text that names this line would lift the
 * requirement by itself.
 */
const FOLDER_SKIP = /^[ \t]*Task-folder-skip:[ \t]*[^\s<"'][^\s"']{2,}/im;

/**
 * Whether the PR branch carries its task folder.
 *
 * The branch is asked, not the working tree: a folder removed on the machine and not committed
 * arrives together with the branch. Local references are of little use here — the PR branch may
 * not be fetched here at all — so the contents are taken from the hosting. The refusal "no such
 * path" means there is no folder; everything else goes up and is treated as no connection.
 */
function folderInBranch(branch, options) {
    const path = `${CONFIG.tasksDir}/${branch}`;
    try {
        gh(['api', `repos/${OWNER}/${REPO}/contents/${path}?ref=${encodeURIComponent(branch)}`, '--jq', 'length'], options);
        return path;
    } catch (error) {
        if (error instanceof OfflineError) {
            throw error;
        }

        return null;
    }
}

let checked = { issues: 0, pulls: 0, cargo: 0 };

// Drafts are judged by the disk and so are checked always: no connection is needed for that.
checkDrafts();
checkBranchFolders(report, MAIN_BRANCH);

let offline = false;
try {
    const options = { token: botToken() ?? undefined };
    const board = fetchBoard(options);
    const issues = fetchIssues('all', options);
    const allOpen = issues.filter((issue) => issue.state === 'OPEN');
    // Filtering happens once and before all task checks: a cargo record is not a task as a whole,
    // not by half — it is judged neither by title, nor by executor, nor by the board, nor by the
    // digest of matching titles, nor by the link to an epic. A card with a title of a task is not
    // such a record, whatever labels it wears.
    const open = CARGO_LABELS.size === 0 ? allOpen : allOpen.filter((issue) => !isCargo(issue));
    const pulls = fetchOpenPulls(options);
    checked = { issues: issues.length, pulls: pulls.length, cargo: allOpen.length - open.length };

    for (const item of board.foreign) {
        report(`the board: ${item} — the board holds tasks, not PRs about them`);
    }
    // The board is checked only for open tasks. A closed one left the queue by a merge, and the
    // board has no column for it: a line about it has nothing to close it with. Six such lines
    // hung in every run and drowned out the real task that never made it to the board.
    for (const issue of open) {
        if (!board.issues.has(issue.number)) {
            report(`#${issue.number}: the task is not on the board — nobody watches it`);
        }
        if (numberFromTitle(issue.title) !== issue.number) {
            report(`#${issue.number}: the title does not start with [${TASK_KEY}-${issue.number}] — «${issue.title}»`);
        }
        if (issue.assignees.length === 0) {
            report(`#${issue.number}: the task has no assignee — by the work queue there is no seeing who took it`);
        }
    }

    similarTitles(open);
    checkEpicLinks(open, report);
    checkEpicPullBase(open, pulls, report);
    checkEpicState(open, pulls, report);
    checkEpicSubIssues(open, report, options);
    checkLongWork(open, report);

    const openNumbers = new Set(open.map((issue) => issue.number));
    const claimed = new Map();
    for (const pull of pulls) {
        const titleNumber = numberFromTitle(pull.title);
        if (titleNumber === null) {
            report(`PR #${pull.number}: the title does not start with [${TASK_KEY}-<number>] — «${pull.title}»`);
            continue;
        }
        if (!closesNumbers(pull.body).includes(titleNumber)) {
            report(`PR #${pull.number}: the body carries no line «Closes #${titleNumber}» — on the board it will not attach to the task`);
        }
        if (!openNumbers.has(titleNumber)) {
            report(`PR #${pull.number}: the task #${titleNumber} is not among the open ones — a task has one branch`);
        }
        if (claimed.has(titleNumber)) {
            report(`PR #${pull.number}: the task #${titleNumber} is already closed by PR #${claimed.get(titleNumber)} — a task has one branch`);
        } else {
            claimed.set(titleNumber, pull.number);
        }

        // A task folder lying in the branch of an open PR is a discrepancy from the PR's first
        // minute: the clean-up comes before it opens, and opening with the folder in place is
        // refused by the delivery guard. A folder that got this far means a bypass — or a PR
        // opened past the guard. Said after the merge, this line is no longer fixed by the same
        // PR: the work has moved on, and a second task is created for the clean-up.
        if (HAS_PIPELINE && pull.headRefOid) {
            checkHeadRun(pull, report, MAIN_BRANCH, options);
        }

        checkConflicting(pull, report);

        // The PR falling behind the main branch: the guard judges the base once, at the minute of
        // opening, and a PR stands for days. Merged while behind, it carries into main a
        // combination nobody checked — and the PR page does not show this: the run on it is green.
        const behind = behindMain(pull.headRefName, MAIN_BRANCH, options);
        if (behind > 0) {
            report(
                `PR #${pull.number}: the branch lags «${MAIN_BRANCH}» by ${behind} commits — the run went from a base ` +
                    `the main branch no longer carries. Merge the main branch in, revise the check set by what the branch carries now, and run again`
            );
        }

        if (!FOLDER_SKIP.test(String(pull.body ?? '')) && pull.headRefName) {
            const folder = folderInBranch(pull.headRefName, options);
            if (folder !== null) {
                report(
                    `PR #${pull.number}: the branch carries the task folder «${folder}/» — the request opens after the folder is taken apart. Take it apart by this same PR or put the line «Task-folder-skip: <reason>» into the body`
                );
            }
        }
    }

    // The task's column and its PR are audited both ways: an open PR with the task in "Backlog"
    // reads as work not yet started, and "In review" without an open PR as a review nobody is
    // waiting for.
    for (const issue of open) {
        const status = board.items.get(issue.number)?.status ?? null;
        const pull = claimed.get(issue.number);
        if (pull !== undefined && status !== IN_REVIEW) {
            report(
                `#${issue.number}: PR #${pull} is open, and the task stands at «${status ?? 'outside the columns'}» — npm run task:move -- ${issue.number} ${IN_REVIEW_STATUS}`
            );
        }
        if (pull === undefined && status === IN_REVIEW) {
            report(`#${issue.number}: the task awaits review, and there is no open PR behind it — the column lags the work`);
        }
    }

    // The task folder dies with the task: what explains a settled decision moves to
    // `docs/archive/`, the rest is deleted. Left next to the current ones, it reads as current —
    // the more convincingly, the older it is.
    for (const name of taskDirs()) {
        const number = numberFromTaskDir(name.split('/').pop());
        if (number === null || openNumbers.has(number)) {
            continue;
        }
        if (issues.some((issue) => issue.number === number)) {
            report(`${CONFIG.tasksDir}/${name}/: the task #${number} is closed, and the folder lies among the current ones — take it apart`);
        }
    }
} catch (error) {
    if (error instanceof OfflineError) {
        // The work queue cannot be checked without a connection, but the folders on disk can:
        // staying silent about them would mean losing the only thing that can still be said here.
        console.log(`check-board: the work queue is skipped, there is nothing to check with — ${error.message}`);
        offline = true;
    } else {
        console.error(`check-board: ${String(error.message ?? error)}`);
        process.exit(1);
    }
}

// Production is audited against the main branch by the last successful rollout. A task leaves the
// queue by a merge, but a merge is not yet production: where the rollout is started by hand, any
// number of commits may lie between them, and there is nowhere to notice this from.
if (!offline && DEPLOY_WORKFLOW) {
    try {
        const token = botToken() ?? undefined;
        const lag = deployLag(DEPLOY_WORKFLOW, MAIN_BRANCH, { token });
        if (lag === null) {
            report(`there was not a single rollout by «${DEPLOY_WORKFLOW}» — there is nothing to compare production against`);
        } else if (lag.behind > 0) {
            report(
                `production lags «${MAIN_BRANCH}» by ${lag.behind} commits: the last rollout is ${lag.sha.slice(0, 8)} of ${String(lag.at).slice(0, 10)}`
            );
        }

        // Why production fell behind, the lag does not say: it is counted by the last SUCCESSFUL
        // rollout, and "not started" and "failed" look the same through it. They lead to different
        // things — the first is started, the second is read by its output and fixed.
        const deploy = lastDeploy(DEPLOY_WORKFLOW, { token });
        if (deploy.verdict === 'failure') {
            report(
                `the rollout «${DEPLOY_WORKFLOW}» failed on ${String(deploy.sha).slice(0, 8)} of ${String(deploy.at).slice(0, 10)}: ` +
                    `the main branch is ahead of production, and merges on top will travel the same way — ${deploy.url}`
            );
        }
    } catch (error) {
        if (error instanceof OfflineError) {
            console.log(`check-board: production was not checked — ${error.message}`);
        } else {
            throw error;
        }
    }
}

// The main branch is audited by the last run of the pipeline on it. A PR is checked before the
// merge, but the merge itself nobody watches: a red main run stood for a day and a half without a
// line about it, and a run pushed out of the queue by the next merge looked like a passed one.
if (!offline && HAS_PIPELINE) {
    if (pipelineWakesOnPush(pipelineText(), MAIN_BRANCH)) {
        try {
            const run = lastMainRun(MAIN_BRANCH, { token: botToken() ?? undefined });
            if (run.verdict === 'failure') {
                report(
                    `the last run of «${MAIN_BRANCH}» is red on ${String(run.sha).slice(0, 8)} of ${String(run.at).slice(0, 10)}: ` +
                        `merges on top go out unchecked — ${run.url}`
                );
            } else if (run.verdict === 'evicted') {
                report(
                    `the run of «${MAIN_BRANCH}» on ${String(run.sha).slice(0, 8)} was pushed out of the queue and never checked the merge — ${run.url}`
                );
            }
        } catch (error) {
            if (error instanceof OfflineError) {
                console.log(`check-board: the main branch run was not checked — ${error.message}`);
            } else {
                throw error;
            }
        }
    } else {
        // Silence here would read as «main is green»: the tree whose pipeline sleeps on a push is told so.
        console.log(`check-board: the main branch run was not checked — the pipeline does not wake on a push to «${MAIN_BRANCH}»`);
    }
}

// What was not checked is named out loud: silence about runs would read as "the runs are there".
if (!offline && !DEPLOY_WORKFLOW) {
    console.log('check-board: production was not checked against the main branch — the rollout workflow is not named in the tree config');
}

// What was filtered out is named by number: silent filtering is indistinguishable from a broken
// audit — a label named with a typo would switch the check off entirely and say nothing about it.
if (!offline && checked.cargo > 0) {
    console.log(`check-board: cargo records in the queue ${checked.cargo} — they are not judged as tasks`);
}

if (!offline && !HAS_PIPELINE) {
    console.log('check-board: the runs on the tips were not asked — the tree has no pipeline file');
}

if (problems.length > 0) {
    console.error(`check-board: divergences ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    console.error('\nA task is created by the command npm run task:new — it does all four steps at once.');
    console.error('The task folder and taking it apart — the rule task-flow.');
    process.exit(1);
}

if (offline) {
    process.exit(0);
}

console.log(`check-board: tasks ${checked.issues}, open PRs ${checked.pulls}, no divergences`);
