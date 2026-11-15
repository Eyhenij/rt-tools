/**
 * The epic of the work, for the measurers that read it: the task the branch carries names its epic on
 * the card, and the plan of that epic lies in the plans directory of the working copy. A branch
 * without a task number gets its epic from the assignment of the copy — the measurer of the copy
 * passes it as `epic`.
 */
import { findEpicPlan, taskOfBranch } from './epic-text.mjs';

/** The plans directory of the tree. */
export const PLANS = 'docs/plans';

/** The plan of the epic of the work: { epic, branch, rows }, or null where there is none. */
export function epicOfWork({ git, host, tree }, epic = null) {
    let number = epic;
    if (number === null) {
        const task = taskOfBranch(git.branch());
        if (task === null) return null;
        const card = host.issue(task);
        number = card?.epic === null || card?.epic === undefined ? null : Number(card.epic);
    }
    if (number === null) return null;
    const texts = tree.list(PLANS).filter((name) => name.endsWith('.md')).map((name) => tree.read(`${PLANS}/${name}`) ?? '');
    return findEpicPlan(texts, number);
}
