#!/usr/bin/env node
/**
 * Whether the task folder of the checked-out branch can be taken apart: every step done, the
 * footprint of the plan touched, and the plan with the grill as the commit of the plan holds them.
 *
 *   node flow-ready.mjs   a line per reason the folder cannot be taken apart yet
 *
 * Exits with 1 when a reason was printed, with 0 when there is none, and with 2 when there is
 * nothing to judge by: the description of the flow does not build, a source did not answer, or the
 * tree has another main branch or another directory of tasks than the engine reads. The caller — the
 * helper of the push set — says so and goes on.
 *
 * The steps are judged by the measurer of their exit, `measure.progress.done`, the footprint by the
 * rows of the plan. The agreement under `proposed/` is not asked about: the draft of an epic lives until
 * its last task. No other exit is read: a lost approval mark or a silent board holds neither the folder
 * nor the PR.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { buildModel } from './flow-model.mjs';
import { overridePath } from './flow-override.mjs';
import { StepRefused, changedSincePlan, planOfBranch } from './flow-step.mjs';
import { flowPath, openReaders, openSources } from './task-flow-script.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const { footprintRows, touches } = await import(
    pathToFileURL([join(HERE, 'task-flow/measure/text.mjs'), join(HERE, '../task-flow/measure/text.mjs')].find((path) => existsSync(path))).href
);

const gitOk = (...args) => spawnSync('git', args, { stdio: 'ignore' }).status === 0;

/** Why the engine has nothing to judge the folder of the branch by, or an empty string. */
function unjudged(branch) {
    const folder = `docs/tasks/${branch}`;
    if (!gitOk('rev-parse', '--verify', '--quiet', 'origin/main')) return 'the copy has no origin/main';
    if (!gitOk('cat-file', '-e', `HEAD:${folder}`)) return `the head has no ${folder}`;
    return gitOk('cat-file', '-e', `origin/main:${folder}/plan.md`) ? `the plan of ${folder} already lies in origin/main` : '';
}

/** The numbers of the steps the progress does not mark done, for the words of the reason. */
function openSteps({ steps, tree }, plan) {
    const got = steps.ofProgress(tree.read(`${plan.folder}/progress.md`) ?? '').steps;
    return steps.ofPlan(plan.text).map((s) => s.number).filter((number) => got.find((s) => s.number === number)?.mark !== 'x');
}

/** The paths of the footprint rows marked edited that no commit after the plan touched. */
function untouchedPaths({ git }, plan) {
    const commits = git.commits();
    const changed = commits
        .slice(commits.findIndex((c) => c.sha === plan.sha) + 1)
        .flatMap((c) => [...c.added, ...c.deleted, ...c.modified]);
    return footprintRows(plan.text)
        .filter((row) => row.edited)
        .flatMap((row) => row.paths)
        .filter((path) => !changed.some((file) => touches(file, path)));
}

/** The reasons the folder cannot be taken apart yet; `read(name)` answers a measurer by its reference. */
function folderReasons(sources, model, read) {
    let plan;
    try {
        plan = planOfBranch(sources.git, model.words);
    } catch (error) {
        if (!(error instanceof StepRefused)) throw error;
        return [`the task folder holds no plan of a commit: ${error.message}`];
    }
    const reasons = [];
    if (read('measure.progress.done') !== true) {
        const open = openSteps(sources, plan);
        reasons.push(
            open.length > 0
                ? `the plan has open steps: ${open.join(', ')} — finish each and run \`node tools/task-flow-script.mjs step N.M\``
                : 'the progress marks done a step with no green mark of the engine, or its steps are not those of the plan: run `node tools/task-flow-script.mjs step --done`',
        );
    }
    const paths = untouchedPaths(sources, plan);
    if (paths.length > 0) reasons.push(`the footprint of the plan is untouched: ${paths.join(', ')}`);
    const changed = changedSincePlan(sources.git, plan);
    if (changed.length > 0) reasons.push(`the task folder differs from the commit of the plan: ${changed.join(', ')} — put each back as that commit holds it`);
    return reasons;
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
    try {
        const path = flowPath();
        const model = buildModel(path, { override: overridePath() });
        const source = await openSources(model, dirname(path));
        const git = source('git');
        const why = unjudged(git.branch());
        if (why) throw new Error(why);
        const read = await openReaders(model, dirname(path));
        const reasons = folderReasons({ git, steps: source('steps'), tree: source('tree') }, model, read);
        for (const reason of reasons) console.log(reason);
        process.exit(reasons.length > 0 ? 1 : 0);
    } catch (error) {
        console.log(`the task folder is not judged: ${error.message}`);
        process.exit(2);
    }
}
