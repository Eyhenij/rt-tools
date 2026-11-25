// rt-kit v0.39.1 · checks/flow-stage.mjs · c99eb47c0a81 · правится надстройкой, не здесь
/**
 * A stage of the plan measured by one call — the engine command `step <N>`, the number of a stage.
 *
 * The steps of the stage with no green mark of their own are measured side by side; with every step
 * green the whole stage is measured again. Each matched step writes its mark, as `step <N.M>` does.
 *
 * The progress is marked after all of them, in the order of the whole plan: from the first step not
 * done while the next one matched here. A step that matched behind an open one, of this stage or of an
 * earlier, keeps its mark on disk and stays open in the progress: the step guard refuses a done mark
 * behind an open step on every edit of the progress, and the call must not lead there.
 *
 * Exits with 0 when every measured step matched and none of them was left open, with 1 otherwise.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import { PROGRESS, StepRefused, markedProgress, measureSteps, planOfBranch, stepLine } from './flow-step.mjs';

/** The progress with the steps that matched marked done in the order of the plan, up to the first that did not. */
export function markedStage(text, planned, stepsOf, matched) {
    const done = (now) => new Set(stepsOf(now).filter((s) => s.mark === 'x').map((s) => s.number));
    let now = text;
    for (const { number } of planned) {
        if (done(now).has(number)) continue;
        if (!matched.has(number)) break;
        now = markedProgress(now, number);
    }
    const has = done(now);
    return { text: now, done: has, open: planned.find(({ number }) => !has.has(number))?.number ?? null };
}

/** Measures stage `stage` of the plan of the branch; 0 when every step of it matched and was marked. */
export async function runStage(sources, model, stage) {
    try {
        const { git, steps, marks } = sources;
        const plan = planOfBranch(git, model.words);
        // A folder another run put back stands on disk and not in the head: its marks would go with it.
        if (!existsSync(plan.folder) || !git.existsAtHead(`${plan.folder}/plan.md`)) throw new StepRefused('the task folder is taken apart: a stage is measured while it stands, the done steps by `step --done`');
        const planned = steps.ofPlan(plan.text);
        const own = planned.filter((s) => s.number.split('.')[0] === stage).map((s) => s.number);
        if (own.length === 0) throw new StepRefused(`the plan names no stage ${stage}`);
        const path = `${plan.folder}/${PROGRESS}`;
        const read = () => (existsSync(path) ? readFileSync(path, 'utf8') : '');
        const stepsOf = (text) => steps.ofProgress(text).steps;
        const doneNow = new Set(stepsOf(read()).filter((s) => s.mark === 'x').map((s) => s.number));
        const green = own.filter((number) => doneNow.has(number) && marks.step(plan.branch, number)?.matched === true);
        const todo = green.length === own.length ? own : own.filter((number) => !green.includes(number));
        // `restored` leaves the progress alone: it is marked below, in the order of the plan.
        const results = await measureSteps(sources, model, todo, undefined, undefined, undefined, { restored: true });
        const before = read();
        const matched = new Set(results.filter((r) => r.matched).map((r) => r.number));
        const after = markedStage(before, planned, stepsOf, matched);
        if (after.text !== before) writeFileSync(path, after.text);
        const left = [...matched].filter((number) => !after.done.has(number));
        for (const number of own) {
            const result = results.find((r) => r.number === number);
            if (!result) console.log(`${number} not measured: its mark stands`);
            else if (result.refused) console.log(`${number} step: ${result.refused}`);
            else console.log(`${number} ${stepLine(result)}${left.includes(number) ? ` · not marked: ${after.open} stands open before it` : ''}`);
        }
        console.log(`stage ${stage}: measured ${results.length}, matched ${matched.size}, left open ${left.length}`);
        return matched.size === results.length && left.length === 0 ? 0 : 1;
    } catch (error) {
        if (!(error instanceof StepRefused)) throw error;
        console.log(`step: ${error.message}`);
        return 1;
    }
}
