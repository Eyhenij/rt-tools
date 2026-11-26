// rt-kit v0.40.0 · task-flow/measure/epic-of.mjs · e3a2ab622e24 · правится надстройкой, не здесь
/**
 * The epic of the work, for the measurers that read it. The task the branch carries names its epic
 * on the card. A branch without a task number takes the epic of the working copy from the assignment
 * table; such an epic merged into the main branch or with its card closed counts as absent — the copy
 * then leads nothing. The plan of the epic lies in the plans directory of the working copy.
 */
import { findEpicPlan, taskOfBranch } from './epic-text.mjs';

/** The plans directory of the tree. */
export const PLANS = 'docs/plans';

const planOf = (tree, number) =>
    findEpicPlan(
        tree
            .list(PLANS)
            .filter((name) => name.endsWith('.md'))
            .map((name) => tree.read(`${PLANS}/${name}`) ?? ''),
        number,
    );

/** The epic of the copy is alive: its card is not closed and its PR into the main branch is not merged. */
const alive = (host, plan) => {
    const card = host.issue(plan.epic);
    if (card && !card.open) return false;
    return !(plan.branch && host.pulls(plan.branch).some((p) => p.base === 'main' && p.state === 'MERGED'));
};

/**
 * The task the branch carries, or null. The epic branch has the same form as a task branch — the key
 * and a number — and reads as a branch without a task number: a plan of the epic with that number
 * names it as its branch.
 */
export function workTask({ git, tree }) {
    const branch = git.branch();
    const number = taskOfBranch(branch);
    if (number === null) return null;
    return planOf(tree, number)?.branch === branch ? null : number;
}

/** The plan of the epic of the work: { epic, branch, rows }, or null where there is none. */
export function epicOfWork({ git, host, tree }) {
    const task = workTask({ git, tree });
    if (task === null) {
        const number = tree.copyEpic();
        const plan = number === null ? null : planOf(tree, number);
        return plan && alive(host, plan) ? plan : null;
    }
    const epic = host.issue(task)?.epic;
    return epic === null || epic === undefined ? null : planOf(tree, Number(epic));
}
