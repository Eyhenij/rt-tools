// rt-kit v0.41.1 · task-flow/measure/plan.mjs · 82e46ef9a7e9 · правится надстройкой, не здесь
/**
 * The measurer «measure.plan» — exit 5: a commit of the branch added the plan; every step of the
 * plan as that commit wrote it has a check line whose expected result is a form of `expect`; and
 * the approval mark lies in the common directory of git and names the commit of the plan and the
 * place of the answer, where a session record of this repository holds the owner's «Одобряю …».
 * A plan of a branch of `words.legacyBranches` was approved before the engine and needs no mark.
 */
import { taskFolder } from './text.mjs';

export function approved({ git, marks, steps, records }) {
    return (data) => {
        const words = data?.words ?? {};
        const forms = Object.values(data?.expect ?? {}).map((form) => new RegExp(form.pattern));
        const branch = git.branch();
        if (!branch) return false;
        const path = `${taskFolder(branch)}/plan.md`;
        const sha = git.addedBy(path);
        if (!sha) return false;
        if ((words.legacyBranches ?? []).includes(branch)) return true;
        const checks = steps.checks(git.versionAt(path, sha) ?? '');
        const known = (c) => typeof c.expected === 'string' && forms.some((form) => form.test(c.expected.trim()));
        if (checks.length === 0 || !checks.every(known)) return false;
        // The answer is confirmed at its place in the session records, as the guard confirms it.
        const task = branch.match(/^([A-Z]+-\d+)-/)?.[1] ?? branch;
        return records.approvalFault(marks.approval(branch), sha, task) === null;
    };
}
