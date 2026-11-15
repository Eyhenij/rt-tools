/**
 * The measurer «measure.plan» — exit 5: a commit of the branch added the plan; every step of the
 * plan as that commit wrote it has a check line whose expected result is a form of `expect`; and
 * the approval mark lies in the common directory of git with an answer that begins with «Одобряю».
 * A plan of a branch of `words.legacyBranches` was approved before the engine and needs no mark.
 */
import { taskFolder } from './text.mjs';

export function approved({ git, marks, steps }) {
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
        const mark = marks.approval(branch);
        return typeof mark?.answer === 'string' && mark.answer.trim().startsWith('Одобряю');
    };
}
