// rt-kit v0.42.0 · task-flow/measure/epic.mjs · 46c72d23b944 · правится надстройкой, не здесь
/**
 * The measurer «measure.epic» — the exits that read the epic of the work: its plan in the plans
 * directory, its branch and its card.
 *
 * declared — exit 2: the epic branch stands on the server or went into the main branch by the PR of
 * the epic, and the epic card left the first column or is closed. Kept for the life of the branch
 * once met. Work outside an epic meets it by its card: no epic and the line of work outside one; that
 * answer is kept for the branch and stands only while the hosting is silent. A branch without a task
 * number in a copy without a live epic meets it by the only draft whose grill counts one task.
 *
 * nextTaken — exit 11: every unmerged, unblocked task of the epic other than the current one has a
 * branch, locally or on the server; with no such task the exit is met. A task is blocked when it is
 * deferred. A task with a branch standing
 * before a task without one does not meet the exit: the plan still holds work nobody took.
 *
 * mergedMarked — exit 12: every task not deferred with a merged PR of its branch is marked
 * «влито», except the task merged last, whatever its row, and the task of the last row: the mark is
 * set by the branch of the next task, and these have none. A mark on a task whose merged PR the
 * hosting does not list counts while no branch of it is on the server and no PR of its branches is
 * open or closed unmerged. Until then state 13 would demand the PR of
 * an epic whose tasks are not in its branch.
 *
 * finished — exit 13: the tip of the branch of every task of the epic that is not deferred lies in
 * the epic branch or in the main branch on the server, and the PR of the epic into the main branch
 * exists in any state. The tip is the local branch, the branch on the server, or the head of its
 * merged PR when the server removed the branch.
 */
import { epicOfWork, workTask } from './epic-of.mjs';
import { taskOfBranch } from './epic-text.mjs';
import { tasksOfGrill } from './text.mjs';

/** The card of the task is of work outside an epic; a silent hosting leaves the answer kept before. */
function outsideByCard({ git, host }, task) {
    const key = `exit2:outside:${git.branch()}`;
    let card;
    try {
        card = host.issue(task);
    } catch (error) {
        if (error?.name === 'HostSilent' && host.recalled(key)) return true;
        throw error;
    }
    const met = card !== null && (card.epic ?? null) === null && Boolean(card.outside);
    if (met) host.remember(key);
    return met;
}

/** The only draft of the copy counts one task, and the epic the copy is assigned is not open. */
function outsideByDraft({ host, tree }) {
    const drafts = tree.list('docs/tasks').filter((name) => name.startsWith('_draft-'));
    if (drafts.length !== 1) return false;
    if (tasksOfGrill(tree.read(`docs/tasks/${drafts[0]}/grill.md`) ?? '').count !== 1) return false;
    const copyEpic = tree.copyEpic();
    const card = copyEpic === null ? null : host.issue(copyEpic);
    return !(card?.open && card.isEpic);
}

export function declared({ git, host, tree }) {
    return () => {
        const task = workTask({ git, tree });
        if (task !== null && outsideByCard({ git, host }, task)) return true;
        const plan = epicOfWork({ git, host, tree });
        if (task === null && plan === null) return outsideByDraft({ host, tree });
        if (!plan?.branch) return false;
        const key = `exit2:${plan.epic}`;
        if (host.recalled(key)) return true;
        const onServer = host.remoteBranch(plan.branch) || host.pulls(plan.branch).some((p) => p.base === 'main' && p.state === 'MERGED');
        const card = host.issue(plan.epic);
        const met = onServer && card !== null && (!card.open || (card.status !== null && card.status !== 'backlog'));
        if (met) host.remember(key);
        return met;
    };
}

/** A row the work does not wait for: deferred by the owner's word naming the task. */
const blocked = (row) => row.deferred;

const prefix = (task) => `RT-${task}-`;

export function nextTaken({ git, host, tree }) {
    return () => {
        const plan = epicOfWork({ git, host, tree });
        if (!plan) return false;
        const current = taskOfBranch(git.branch());
        // A task with a merged PR is not ahead even unmarked: the hosting removes its branch on merge.
        const merged = new Set(host.mergedPulls().map((p) => taskOfBranch(p.head)).filter((n) => n !== null));
        const ahead = plan.rows.filter((row) => !row.merged && !merged.has(row.task) && row.task !== current && !blocked(row));
        return ahead.every((row) => git.branches(prefix(row.task)).length > 0 || host.remoteBranches(prefix(row.task)).length > 0);
    };
}

export function mergedMarked({ git, host, tree }) {
    return () => {
        const plan = epicOfWork({ git, host, tree });
        if (!plan) return false;
        // The moment of the merge per task: the latest of its merged PRs.
        const mergedAt = new Map();
        for (const p of host.mergedPulls()) {
            const task = taskOfBranch(p.head);
            if (task === null) continue;
            const at = p.mergedAt ?? '';
            if (!mergedAt.has(task) || at > mergedAt.get(task)) mergedAt.set(task, at);
        }
        const live = plan.rows.filter((row) => !row.deferred);
        // The task merged last has no next branch to mark it by: its merged PR counts alone. Tasks
        // merged in the same second are all last.
        const lastAt = [...live].filter((row) => mergedAt.has(row.task)).reduce((at, row) => (mergedAt.get(row.task) > at ? mergedAt.get(row.task) : at), '');
        const isLast = (row) => mergedAt.has(row.task) && mergedAt.get(row.task) === lastAt;
        // The last row has no next task either: a chain merged top-down leaves it merged before the rest.
        const lastRow = live.at(-1) ?? null;
        return live.every((row) => {
            if (mergedAt.has(row.task)) return row.merged || isLast(row) || row === lastRow;
            // A mark with no merged PR in view stands for a merge past the window of the hosting: the
            // hosting removed its branch on merge, so a branch left on the server, or any PR of its
            // branches open or closed unmerged, says the mark is ahead of the work.
            return row.merged && !host.remoteBranches(prefix(row.task)).length && !openPullOrClosedUnmerged({ git, host }, row.task);
        });
    };
}

/** A PR of a branch of the task is open or closed unmerged; the branches are the local and the server ones. */
const openPullOrClosedUnmerged = ({ git, host }, task) => {
    const names = new Set([...git.branches(prefix(task)), ...host.remoteBranches(prefix(task))].map((b) => b.name));
    return [...names].some((name) => host.pulls(name).some((p) => p.state === 'OPEN' || p.state === 'CLOSED'));
};

/** The tip of the branch of a task: local, on the server, or the head of its merged PR. */
const tipOf = ({ git, host }, task) =>
    git.branches(prefix(task))[0]?.sha ??
    host.remoteBranches(prefix(task))[0]?.sha ??
    host.mergedPulls().find((p) => taskOfBranch(p.head) === task)?.headRefOid ??
    null;

export function finished({ git, host, tree }) {
    return () => {
        const plan = epicOfWork({ git, host, tree });
        if (!plan?.branch) return false;
        const landed = plan.rows
            .filter((row) => !row.deferred)
            .every((row) => {
                const tip = tipOf({ git, host }, row.task);
                return tip !== null && (host.inRemote(tip, plan.branch) || host.inRemote(tip, 'main'));
            });
        return landed && host.pulls(plan.branch).some((p) => p.base === 'main');
    };
}
