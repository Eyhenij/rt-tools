// rt-kit v0.39.1 · task-flow/measure/pr.mjs · 58ddc9270c74 · правится надстройкой, не здесь
/**
 * The measurer «measure.pr» — exit 10: a branch on the server holds the commit that took the task
 * folder apart; the branch has a PR in any state with a reviewer; the task left the work column.
 */
import { taskOfBranch } from './epic-text.mjs';
import { taskFolder, under } from './text.mjs';

export function handed({ git, host }) {
    return () => {
        const branch = git.branch();
        const task = taskOfBranch(branch);
        if (task === null) return false;
        const folder = taskFolder(branch);
        const archived = git.commits().find((c) => c.deleted.some((p) => under(p, folder)) && c.added.some((p) => under(p, 'docs/archive')));
        if (!archived || !host.remoteContains(archived.sha)) return false;
        if (!host.pulls(branch).some((p) => p.reviewers.length > 0)) return false;
        const card = host.issue(task);
        return card !== null && (!card.open || card.status !== 'in-progress');
    };
}
