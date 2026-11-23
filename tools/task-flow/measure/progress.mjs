// rt-kit v0.39.0 · task-flow/measure/progress.mjs · d1f867ef09ce · правится надстройкой, не здесь
/**
 * The measurer «measure.progress».
 *
 * mirrors — exit 6: a version of the progress in the commit of the plan or later repeats the steps
 * of the plan, numbers and names, and marks exactly one of them as going on now.
 *
 * done — exit 7: the progress of the working copy, and without the folder the last one in the
 * history, marks every step of the plan done, and every done step has a green mark of its own. A
 * plan without a single check line is judged by the marks of the progress alone.
 */
import { sameSteps, taskFolder } from './text.mjs';

export function mirrors({ git, steps }) {
    return () => {
        const branch = git.branch();
        if (!branch) return false;
        const folder = taskFolder(branch);
        const sha = git.addedBy(`${folder}/plan.md`);
        if (!sha) return false;
        const planned = steps.ofPlan(git.versionAt(`${folder}/plan.md`, sha) ?? '');
        if (planned.length === 0) return false;
        const commits = git.commits();
        return commits.slice(commits.findIndex((c) => c.sha === sha)).some((c) => {
            const text = git.versionAt(`${folder}/progress.md`, c.sha);
            if (text === null) return false;
            const got = steps.ofProgress(text).steps;
            return sameSteps(planned, got) && got.filter((s) => s.mark === '>').length === 1;
        });
    };
}

export function done({ git, tree, marks, steps }) {
    return () => {
        const branch = git.branch();
        if (!branch) return false;
        const folder = taskFolder(branch);
        const plan = tree.read(`${folder}/plan.md`) ?? git.lastVersion(`${folder}/plan.md`);
        const progress = tree.read(`${folder}/progress.md`) ?? git.lastVersion(`${folder}/progress.md`);
        if (plan === null || progress === null) return false;
        const planned = steps.ofPlan(plan);
        if (planned.length === 0) return false;
        const got = steps.ofProgress(progress).steps;
        const unchecked = steps.checks(plan).every((c) => c.command === null);
        return planned.every((p) => {
            const step = got.find((s) => s.number === p.number);
            if (step?.mark !== 'x') return false;
            return unchecked || marks.step(branch, p.number)?.matched === true;
        });
    };
}
