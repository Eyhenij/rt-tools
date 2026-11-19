// rt-kit v0.37.0 · task-flow/measure/epic.mjs · 8ff5e5b3f979 · правится надстройкой, не здесь
/**
 * The measurer «measure.epic» — the exits that read the epic of the work: its plan in the plans
 * directory, its branch and its card.
 *
 * declared — exit 2: the epic branch stands on the server or went into the main branch by the PR of
 * the epic, and the epic card left the first column or is closed. Kept for the life of the branch
 * once met.
 *
 * nextTaken — exit 11: every unmerged, unblocked task of the epic other than the current one has a
 * branch, locally or on the server; with no such task the exit is met. A task is blocked when it is
 * deferred or its row names the owner's step. A task with a branch standing
 * before a task without one does not meet the exit: the plan still holds work nobody took.
 *
 * mergedMarked — exit 12: every task not deferred counts merged — a merged PR of its branch is on
 * the hosting, or its row says «влито» — and no row that says «влито» has an open PR. The mark is
 * set by the branch of the next task, and the task merged last has none: it counts by its PR
 * alone, whatever its row. Until then state 13 would demand the PR of an epic whose tasks are not
 * in its branch.
 *
 * finished — exit 13: the tip of the branch of every task of the epic that is not deferred lies in
 * the epic branch or in the main branch on the server, and the PR of the epic into the main branch
 * exists in any state. The tip is the local branch, the branch on the server, or the head of its
 * merged PR when the server removed the branch.
 */
import { epicOfWork } from './epic-of.mjs';
import { taskOfBranch } from './epic-text.mjs';

export function declared({ git, host, tree }) {
    return () => {
        const plan = epicOfWork({ git, host, tree });
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

/**
 * A row the work does not wait for: deferred, or naming the owner's step. A row names the owner's
 * step only through the owner's window on the edit of the plan, so the row itself is the owner's word.
 */
const blocked = (row) => row.deferred || row.ownerQuote !== null;

const prefix = (task) => `RT-${task}-`;

export function nextTaken({ git, host, tree }) {
    return () => {
        const plan = epicOfWork({ git, host, tree });
        if (!plan) return false;
        const current = taskOfBranch(git.branch());
        const ahead = plan.rows.filter((row) => !row.merged && row.task !== current && !blocked(row));
        return ahead.every((row) => git.branches(prefix(row.task)).length > 0 || host.remoteBranches(prefix(row.task)).length > 0);
    };
}

export function mergedMarked({ git, host, tree }) {
    return () => {
        const plan = epicOfWork({ git, host, tree });
        if (!plan) return false;
        const merged = new Set(host.mergedPulls().map((p) => taskOfBranch(p.head)).filter((n) => n !== null));
        const live = plan.rows.filter((row) => !row.deferred);
        const counted = live.every((row) => merged.has(row.task) || row.merged);
        // A mark does not stand ahead of the hosting: «влито» on a task whose PR is open is no merge.
        const honest = live.every((row) => !row.merged || !openPull({ git, host }, row.task));
        return counted && honest;
    };
}

/** A PR of a branch of the task is open on the hosting; the branches are the local and the server ones. */
const openPull = ({ git, host }, task) => {
    const names = new Set([...git.branches(prefix(task)), ...host.remoteBranches(prefix(task))].map((b) => b.name));
    return [...names].some((name) => host.pulls(name).some((p) => p.state === 'OPEN'));
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
