// rt-kit v0.39.0 · task-flow/measure/task.mjs · cfc9f47c7914 · правится надстройкой, не здесь
/**
 * The measurer «measure.task» — exit 4: the task the branch carries is open, or closed by its merge,
 * and left the first column of the work queue; a commit of the branch added the task folder. Kept
 * for the life of the branch once met.
 */
import { taskOfBranch } from './epic-text.mjs';
import { taskFolder, under } from './text.mjs';

export function taken({ git, host }) {
    return () => {
        const branch = git.branch();
        const task = taskOfBranch(branch);
        if (task === null) return false;
        const key = `exit4:${branch}`;
        if (host.recalled(key)) return true;
        const folder = taskFolder(branch);
        if (!git.commits().some((c) => c.added.some((p) => under(p, folder)))) return false;
        const card = host.issue(task);
        const met = card !== null && card.exists !== false && (!card.open || (card.status !== null && card.status !== 'backlog'));
        if (met) host.remember(key);
        return met;
    };
}
