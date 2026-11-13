// rt-kit v0.37.0 · checks/board-pull-state.github.mjs · 64e1ab1b0b7a · правится надстройкой, не здесь
/**
 * The state of an open request read by its tip: a run pushed out of the queue, a missing run, a
 * finished piece of work left as a draft, a missing reviewer, a conflict. Lives in a file of its
 * own — the audit of the work queue stands at the length limit even without it, and these five checks are read
 * together and apart from the rest.
 *
 * The line printer and the name of the main branch come as arguments: the module knows the
 * hosting, not the settings of the tree that called it.
 */
import { onlyIgnoredPaths } from './board-paths.mjs';
import { evictedOnHead, headCommittedAt, runsOnHead, verdictOnHead } from './board-runs.mjs';

/**
 * How long a fresh tip is given before it is asked about a run. Between the push and the start of
 * the run some time passes, and a line inside that gap would mean «wait», not «fix».
 */
const RUN_GRACE_MINUTES = 10;

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
export function checkHeadRun(pull, report, mainBranch, options) {
    if (checkEvicted(pull, report, options)) {
        return;
    }

    if (runsOnHead(pull.headRefOid, options) > 0) {
        checkReadyDraft(pull, report, options);
        return;
    }

    const minutes = Math.floor((Date.now() - headCommittedAt(pull.headRefOid, options)) / 60000);
    if (minutes < RUN_GRACE_MINUTES) {
        return;
    }

    if (onlyIgnoredPaths(pull, options)) {
        return;
    }

    // A PR whose base is not the main branch gets no run at all: the workflow listens for PRs
    // into the main branch and does not see events with another base. That is the order of
    // handing in, not a discrepancy — every task of an epic is handed in exactly so — and the
    // audit says nothing about it. The former line was wrong three times over: the event was not
    // lost, reopening will not bring it back, and the base of a task request stays the epic
    // branch to the merge. It is asked before the conflict: a conflicting task PR is named by the
    // conflict line, and «no run while it conflicts» would promise a run that never comes.
    if (pull.baseRefName && pull.baseRefName !== mainBranch) {
        return;
    }

    if (pull.mergeable === 'CONFLICTING') {
        report(
            `PR #${pull.number}: there is no run on the tip ${pull.headRefOid.slice(0, 8)} and there will be none while it conflicts — ` +
                `the pipeline checks the merge of the branch with the base, and there is no merge while it conflicts; merge the main branch in and push, ` +
                `reopening the PR does not help here`
        );

        return;
    }

    report(
        `PR #${pull.number}: there is no run on the tip ${pull.headRefOid.slice(0, 8)}, and it has lain there ${minutes} min — ` +
            `the pipeline received no event; bring it back by a new commit or by reopening the PR ` +
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
function checkEvicted(pull, report, options) {
    const evicted = evictedOnHead(pull.headRefOid, options);
    if (evicted.length === 0) {
        return false;
    }

    const run = evicted[0];
    report(
        `PR #${pull.number}: the run ${run} on the tip ${pull.headRefOid.slice(0, 8)} was pushed out of the pipeline queue — ` +
            `it has zero steps, the branch was not checked, and in the list it looks failed; ` +
            `read the run and restart it (gh run view ${run} && gh run rerun ${run})`
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
function checkReadyDraft(pull, report, options) {
    if (pull.isDraft !== true) {
        return;
    }
    if (verdictOnHead(pull.headRefOid, options) !== 'success') {
        return;
    }

    report(
        `PR #${pull.number}: the run on the tip ${pull.headRefOid.slice(0, 8)} is green, and the PR is a draft — ` +
            `take the task folder apart and lift the draft (gh pr ready ${pull.number}) or tell the owner what you are waiting for`
    );
}

/**
 * A PR nobody was asked to review.
 *
 * Such a PR reaches no inbox: the queue stands while it looks as if it works. A request to review
 * oneself does not count — the host accepts it and creates nothing — so the author is taken out of
 * both lists. A PR opened by a person shows here too: an author cannot be asked, and nobody else
 * was.
 *
 * FAIL-OPEN: an answer that carries neither list is not judged. Silence about the reviewers is not
 * the same as their absence, and a line on it would go red on every PR of a host that hides them.
 */
export function checkReviewer(pull, report) {
    if (pull.reviewRequests === undefined && pull.latestReviews === undefined) {
        return;
    }

    const author = pull.author?.login ?? null;
    // A bot asked for a review or one that left it is not a person: the PR still reaches no inbox.
    const person = (entry, login) => entry.__typename !== 'Bot' && !login.endsWith('[bot]');
    const asked = (pull.reviewRequests ?? [])
        .map((entry) => [entry, entry.login ?? entry.name ?? entry.slug ?? ''])
        .filter(([entry, login]) => person(entry, login))
        .map(([, login]) => login);
    const left = (pull.latestReviews ?? [])
        .map((entry) => [entry.author ?? {}, entry.author?.login ?? ''])
        .filter(([entry, login]) => person(entry, login))
        .map(([, login]) => login);
    if ([...asked, ...left].some((login) => login !== '' && login !== author)) {
        return;
    }

    report(
        `PR #${pull.number}: the PR has no reviewer — nobody but its author was asked or left a review, and it reaches no inbox; ` +
            `request one by a REST call: gh api -X POST repos/<owner>/<repo>/pulls/${pull.number}/requested_reviewers -f 'reviewers[]=<login>'; ` +
            `a PR opened by the reviewer's own account cannot ask them — close it and open it again as the machine account`
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
export function checkConflicting(pull, report) {
    if (pull.mergeable !== 'CONFLICTING') {
        return;
    }

    // The host counts mergeability against the base of the PR: for a task that is the epic branch.
    const base = pull.baseRefName ? `«${pull.baseRefName}»` : 'branch';
    report(
        `PR #${pull.number}: it conflicts with its base ${base} — merge the base into the PR branch, resolve the conflict and push; ` +
            `the owner cannot merge this request, and on the page that shows only inside it`
    );
}
