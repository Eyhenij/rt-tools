// rt-kit v0.37.0 · task-flow/measure/epic.mjs · 4b28f94d38a5 · правится надстройкой, не здесь
/**
 * The measurer «measure.epic» — the exits that read the epic of the work: its plan in the plans
 * directory, its branch and its card.
 *
 * declared — exit 2: the epic branch stands on the server or went into the main branch by the PR of
 * the epic, and the epic card left the first column or is closed. Kept for the life of the branch
 * once met.
 *
 * nextTaken — exit 11: the branch of the next unblocked task of the epic stands locally or on the
 * server; with no such task the exit is met. A task is blocked when it is deferred or waits for the
 * owner's step whose quote the owner said.
 *
 * mergedMarked — exit 12: every task of the epic whose PR is merged is marked merged in the plan.
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

/** A row the work does not wait for: deferred, or waiting for the owner's step whose quote the owner said. */
const blocked = (row, owner) => row.deferred || (row.ownerQuote !== null && row.ownerQuote !== '' && owner.said(row.ownerQuote));

const prefix = (task) => `RT-${task}-`;

export function nextTaken({ git, host, tree, owner }) {
    return () => {
        const plan = epicOfWork({ git, host, tree });
        if (!plan) return false;
        const current = taskOfBranch(git.branch());
        const next = plan.rows.find((row) => !row.merged && row.task !== current && !blocked(row, owner));
        if (!next) return true;
        return git.branches(prefix(next.task)).length > 0 || host.remoteBranches(prefix(next.task)).length > 0;
    };
}

export function mergedMarked({ git, host, tree }) {
    return () => {
        const plan = epicOfWork({ git, host, tree });
        if (!plan) return false;
        const merged = new Set(host.mergedPulls().map((p) => taskOfBranch(p.head)).filter((n) => n !== null));
        return plan.rows.every((row) => !merged.has(row.task) || row.merged);
    };
}

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
