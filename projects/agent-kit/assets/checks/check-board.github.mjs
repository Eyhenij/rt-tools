#!/usr/bin/env node
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
import { onlyIgnoredPaths } from './board-paths.mjs';
import { checkBranchFolders } from './board-folders.mjs';
import { checkLongWork } from './board-long-work.mjs';
import { HAS_PIPELINE, deployLag, evictedOnHead, headCommittedAt, lastDeploy, runsOnHead, verdictOnHead } from './board-runs.mjs';
import { checkEpicLinks } from './board-epics.mjs';
import { similarTitles } from './board-titles.mjs';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const IN_REVIEW = STATUS_OPTIONS[IN_REVIEW_STATUS].name;
const TASKS_DIR = join(ROOT, CONFIG.tasksDir);
/** Age of an abandoned draft after which it stops looking like one started today. */
const DRAFT_DAYS = 7;
/**
 * How long a head is given for a run to start behind it. The event does not reach the hosting
 * instantly, and an audit called right after a push would otherwise go red on a healthy branch.
 */
const RUN_GRACE_MINUTES = 10;
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
 */
const CARGO_LABELS = new Set(CONFIG.board?.cargoLabels ?? []);

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
            report(`${CONFIG.tasksDir}/${name}/: разбор брошен ${age} дн. назад — заведи задачу или удали папку`);
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

/**
 * The run on the head of an open PR.
 *
 * A silent page and a green run read the same, and the event does not always reach the hosting:
 * in the hour of its failures the push went through and no run started behind it. The audit names
 * such a head while the PR is still open — after the merge it is too late to learn about it.
 *
 * What counts is the fact of a run, not its colour. A running and a failed run are both visible
 * on the PR page; only absence is invisible, and the audit speaks of exactly that.
 *
 * A fresh head is not judged: time passes between the push and the run, and a red line in that
 * gap would mean "wait", not "fix".
 *
 * A conflicting PR gets no run at all, and the cause is not a lost event: the pipeline checks the
 * merge of the branch with its base, and under a conflict there is no merge. The advice to bring
 * the event back is followed literally and does not help — in one session a PR was closed and
 * reopened twice in a row, and the run started only after the main branch was merged in. So the
 * line names the cause that can be fixed.
 */
function checkHeadRun(pull, options) {
    if (checkEvicted(pull, options)) {
        return;
    }

    if (runsOnHead(pull.headRefOid, options) > 0) {
        checkReadyDraft(pull, options);
        return;
    }

    const minutes = Math.floor((Date.now() - headCommittedAt(pull.headRefOid, options)) / 60000);
    if (minutes < RUN_GRACE_MINUTES) {
        return;
    }

    if (onlyIgnoredPaths(pull, options)) {
        return;
    }

    if (pull.mergeable === 'CONFLICTING') {
        report(
            `PR #${pull.number}: на вершине ${pull.headRefOid.slice(0, 8)} прогона нет и не будет, пока она конфликтует — ` +
                `конвейер проверяет слияние ветки с базой, а слияния при конфликте нет; влей главную ветку и запушь, ` +
                `перезакрытие PR тут не помогает`
        );

        return;
    }

    // A PR on top of a neighbouring one gets no run: the workflow listens for PRs into the main
    // branch and does not see events with another base. The line about a lost event is wrong
    // here twice: the event was not lost, and closing and reopening will not bring it back — the
    // advice is followed literally, no run starts, and on the second try the breakage is looked
    // for in the hosting.
    if (pull.baseRefName && pull.baseRefName !== MAIN_BRANCH) {
        report(
            `PR #${pull.number}: на вершине ${pull.headRefOid.slice(0, 8)} прогона нет и не будет — ` +
                `заявка открыта в ветку «${pull.baseRefName}», а рабочий поток слушает заявки в главную; ` +
                `перенеси базу на «${MAIN_BRANCH}», когда нижняя заявка влита`
        );

        return;
    }

    report(
        `PR #${pull.number}: на вершине ${pull.headRefOid.slice(0, 8)} прогона нет, а лежит она ${minutes} мин — ` +
            `конвейер события не получил; верни его новым коммитом либо перезакрытием PR ` +
            `(gh pr close ${pull.number} && gh pr reopen ${pull.number})`
    );
}

/**
 * A head run evicted from the pipeline queue.
 *
 * The queue group protects a running run and does not protect a waiting one: the hosting keeps
 * one waiting run per group, and the next one to start evicts the previous. The branch behind
 * such a run was not checked by a single line, yet by the work queue it looks checked — there is
 * a run on the head, and the audit counts exactly the fact.
 *
 * Judged before the absence of a run and before the colour: otherwise one head gets two lines
 * about one thing. Returns `true` when the line has been said, and the other head checks are
 * skipped.
 *
 * The line names both commands, in the order they are called. The guard refuses a rerun until the
 * output of that step has been read within the same turn, and the order in the line meets the
 * requirement by itself: the executor calls what is written and does not hit a refusal on the
 * second step.
 */
function checkEvicted(pull, options) {
    const evicted = evictedOnHead(pull.headRefOid, options);
    if (evicted.length === 0) {
        return false;
    }

    const run = evicted[0];
    report(
        `PR #${pull.number}: прогон ${run} на вершине ${pull.headRefOid.slice(0, 8)} вытеснен из очереди конвейера — ` +
            `заданий у него ноль, ветка не проверялась, а в списке он выглядит упавшим; ` +
            `прочитай прогон и перезапусти его (gh run view ${run} && gh run rerun ${run})`
    );
    return true;
}

/**
 * Finished work left as a draft.
 *
 * On a draft the merge button is blocked by the hosting itself, so a green PR page allows the
 * owner nothing: a list in which everything is grey reads as "the work is not done". The
 * draft-lifting guard does not reach here — it judges one turn and stays silent while the branch
 * carries its task folder; the audit looks at the state of the whole queue.
 *
 * Four PRs stood as drafts for two days — the analysis is the record
 * "2026-08-18-ready-work-left-in-drafts" in the intake.
 */
function checkReadyDraft(pull, options) {
    if (pull.isDraft !== true) {
        return;
    }
    if (verdictOnHead(pull.headRefOid, options) !== 'success') {
        return;
    }

    report(
        `PR #${pull.number}: прогон на вершине ${pull.headRefOid.slice(0, 8)} зелёный, а PR черновик — ` +
            `разбери папку задачи и сними черновик (gh pr ready ${pull.number}) либо скажи владельцу, чего ждёшь`
    );
}

/**
 * A PR that conflicts with the main branch.
 *
 * A conflict arrives in a handed-over PR through someone else's merge, without a single action by
 * its author: the base checked at opening goes stale the minute the owner merges a neighbouring
 * piece of work. The draft-lifting guard does not reach here — it judges one turn, and a PR stands
 * in the queue for days.
 *
 * Only a direct "conflicting" is judged: `UNKNOWN` means the hosting is still computing
 * mergeability, and a line about it would go red on every fresh head. Two PRs went to review with
 * a conflict this way — the analysis is the record
 * "2026-08-20-drafts-cleared-without-re-reading-pr-state" in the intake.
 */
function checkConflicting(pull) {
    if (pull.mergeable !== 'CONFLICTING') {
        return;
    }

    report(
        `PR #${pull.number}: конфликтует с главной веткой — влей её в ветку задачи, разбери конфликт и запушь; ` +
            `слить эту заявку владелец не может, а по странице это видно только внутри неё`
    );
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
    // Filtering happens once and before all task checks: a labelled record is not a task as a
    // whole, not by half — it is judged neither by title, nor by executor, nor by the board, nor
    // by the digest of matching titles, nor by the link to an epic.
    const open = CARGO_LABELS.size === 0 ? allOpen : allOpen.filter((issue) => !(issue.labels ?? []).some((label) => CARGO_LABELS.has(label.name)));
    const pulls = fetchOpenPulls(options);
    checked = { issues: issues.length, pulls: pulls.length, cargo: allOpen.length - open.length };

    for (const item of board.foreign) {
        report(`борда: ${item} — на борде стоят задачи, а не PR о них`);
    }
    // The board is checked only for open tasks. A closed one left the queue by a merge, and the
    // board has no column for it: a line about it has nothing to close it with. Six such lines
    // hung in every run and drowned out the real task that never made it to the board.
    for (const issue of open) {
        if (!board.issues.has(issue.number)) {
            report(`#${issue.number}: задачи нет на борде — за ней никто не следит`);
        }
        if (numberFromTitle(issue.title) !== issue.number) {
            report(`#${issue.number}: заголовок не начинается с [${TASK_KEY}-${issue.number}] — «${issue.title}»`);
        }
        if (issue.assignees.length === 0) {
            report(`#${issue.number}: у задачи нет исполнителя — по очереди работ не видно, кто её взял`);
        }
    }

    similarTitles(open);
    checkEpicLinks(open, report);
    checkLongWork(open, report);

    const openNumbers = new Set(open.map((issue) => issue.number));
    const claimed = new Map();
    for (const pull of pulls) {
        const titleNumber = numberFromTitle(pull.title);
        if (titleNumber === null) {
            report(`PR #${pull.number}: заголовок не начинается с [${TASK_KEY}-<номер>] — «${pull.title}»`);
            continue;
        }
        if (!closesNumbers(pull.body).includes(titleNumber)) {
            report(`PR #${pull.number}: в теле нет строки «Closes #${titleNumber}» — на борде он не прикрепится к задаче`);
        }
        if (!openNumbers.has(titleNumber)) {
            report(`PR #${pull.number}: задачи #${titleNumber} нет среди открытых — у задачи одна ветка`);
        }
        if (claimed.has(titleNumber)) {
            report(`PR #${pull.number}: задачу #${titleNumber} уже закрывает PR #${claimed.get(titleNumber)} — у задачи одна ветка`);
        } else {
            claimed.set(titleNumber, pull.number);
        }

        // A task folder lying in the branch of an open PR is a discrepancy from the PR's first
        // minute: the clean-up comes before it opens, and opening with the folder in place is
        // refused by the delivery guard. A folder that got this far means a bypass — or a PR
        // opened past the guard. Said after the merge, this line is no longer fixed by the same
        // PR: the work has moved on, and a second task is created for the clean-up.
        if (HAS_PIPELINE && pull.headRefOid) {
            checkHeadRun(pull, options);
        }

        checkConflicting(pull);

        // The PR falling behind the main branch: the guard judges the base once, at the minute of
        // opening, and a PR stands for days. Merged while behind, it carries into main a
        // combination nobody checked — and the PR page does not show this: the run on it is green.
        const behind = behindMain(pull.headRefName, MAIN_BRANCH, options);
        if (behind > 0) {
            report(
                `PR #${pull.number}: ветка отстала от «${MAIN_BRANCH}» на ${behind} коммитов — прогон шёл от основания, ` +
                    `которого в главной ветке уже нет. Влей главную, пересмотри набор проверок по тому, что ветка везёт теперь, и прогони заново`
            );
        }

        if (!FOLDER_SKIP.test(String(pull.body ?? '')) && pull.headRefName) {
            const folder = folderInBranch(pull.headRefName, options);
            if (folder !== null) {
                report(
                    `PR #${pull.number}: ветка везёт папку задачи «${folder}/» — заявка открывается после уборки. Разбери её этим же PR или поставь в тело строку «Task-folder-skip: <причина>»`
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
                `#${issue.number}: PR #${pull} открыт, а задача стоит «${status ?? 'вне колонок'}» — npm run task:move -- ${issue.number} ${IN_REVIEW_STATUS}`
            );
        }
        if (pull === undefined && status === IN_REVIEW) {
            report(`#${issue.number}: задача ждёт разбора, но открытого PR за ней нет — колонка отстала от работы`);
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
            report(`${CONFIG.tasksDir}/${name}/: задача #${number} закрыта, а папка лежит среди текущих — разбери её`);
        }
    }
} catch (error) {
    if (error instanceof OfflineError) {
        // The work queue cannot be checked without a connection, but the folders on disk can:
        // staying silent about them would mean losing the only thing that can still be said here.
        console.log(`check-board: очередь работ пропущена, проверять нечем — ${error.message}`);
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
            report(`выкаток по «${DEPLOY_WORKFLOW}» не было ни одной — сравнить прод не с чем`);
        } else if (lag.behind > 0) {
            report(
                `прод отстал от «${MAIN_BRANCH}» на ${lag.behind} коммитов: последняя выкатка — ${lag.sha.slice(0, 8)} от ${String(lag.at).slice(0, 10)}`
            );
        }

        // Why production fell behind, the lag does not say: it is counted by the last SUCCESSFUL
        // rollout, and "not started" and "failed" look the same through it. They lead to different
        // things — the first is started, the second is read by its output and fixed.
        const deploy = lastDeploy(DEPLOY_WORKFLOW, { token });
        if (deploy.verdict === 'failure') {
            report(
                `выкатка «${DEPLOY_WORKFLOW}» упала на ${String(deploy.sha).slice(0, 8)} от ${String(deploy.at).slice(0, 10)}: ` +
                    `главная ветка впереди прода, и слияния поверх уедут туда же — ${deploy.url}`
            );
        }
    } catch (error) {
        if (error instanceof OfflineError) {
            console.log(`check-board: прод не сверялся — ${error.message}`);
        } else {
            throw error;
        }
    }
}

// What was not checked is named out loud: silence about runs would read as "the runs are there".
if (!offline && !DEPLOY_WORKFLOW) {
    console.log('check-board: прод с главной веткой не сверялся — рабочий поток выкатки в настройке дерева не назван');
}

// What was filtered out is named by number: silent filtering is indistinguishable from a broken
// audit — a label named with a typo would switch the check off entirely and say nothing about it.
if (!offline && checked.cargo > 0) {
    console.log(`check-board: записей груза в очереди ${checked.cargo} — задачами они не судятся`);
}

if (!offline && !HAS_PIPELINE) {
    console.log('check-board: прогоны на вершинах не спрашивались — файла конвейера в дереве нет');
}

if (problems.length > 0) {
    console.error(`check-board: расхождений ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    console.error('\nЗадача заводится командой npm run task:new — она делает все четыре шага сразу.');
    console.error('Папка задачи и её разбор — скил task-flow.');
    process.exit(1);
}

if (offline) {
    process.exit(0);
}

console.log(`check-board: задач ${checked.issues}, открытых PR ${checked.pulls}, расхождений нет`);
