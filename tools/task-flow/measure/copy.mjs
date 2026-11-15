// rt-kit v0.37.0 · task-flow/measure/copy.mjs · eb56707ad407 · правится надстройкой, не здесь
/**
 * The measurer «measure.copy» — where the working copy stands against the scenario.
 *
 * outsideEpic — the work has no epic: the task card names none, or the copy of a branch without a
 * task number leads no live epic. Outside an epic the scenario ends at exit 10.
 *
 * outOfScenario — the branch carries no task number, the copy leads no live epic, and no draft folder
 * lies in the working copy: the engine has nothing to name as the next step. A draft keeps the copy
 * in the scenario, measured by states 1–4.
 */
import { epicOfWork, workTask } from './epic-of.mjs';

export function outsideEpic({ git, host, tree }) {
    return () => epicOfWork({ git, host, tree }) === null;
}

export function outOfScenario({ git, host, tree }) {
    return () =>
        workTask({ git, tree }) === null &&
        epicOfWork({ git, host, tree }) === null &&
        !tree.list('docs/tasks').some((name) => name.startsWith('_draft-'));
}
