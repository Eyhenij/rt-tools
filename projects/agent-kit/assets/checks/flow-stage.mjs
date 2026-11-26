/**
 * A stage of the plan measured by one call — the engine command `step <N>`, the number of a stage.
 *
 * The steps of the stage with no green mark of their own are measured side by side; with every step
 * green the whole stage is measured again. Each matched step writes its mark, as `step <N.M>` does.
 *
 * The progress is marked after all of them, in the order of the whole plan: from the first step not
 * done while the next one matched here. A step that matched behind an open one, of this stage or of an
 * earlier, keeps its mark on disk and stays open in the progress: the step guard refuses a done mark
 * behind an open step on every edit of the progress, and the call must not lead there. A progress whose
 * lines do not follow the plan is marked up to the first line that cannot be marked in order. A done
 * step that did not match loses its mark on disk and keeps its `[x]`, as `step <N.M>` leaves it.
 *
 * Exits with 0 when every measured step matched and none of them was left open, with 1 otherwise.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import { marksOutOfOrder } from './flow-guard.mjs';
import { PROGRESS, StepRefused, markedProgress, measureSteps, planOfBranch, replacedCheck, stepLine } from './flow-step.mjs';

/** The text split around its section of the steps, so that a note elsewhere is never taken for a step. */
function aroundSteps(text) {
    const lines = text.split('\n');
    const from = lines.findIndex((line) => /^##\s+(?:Steps|Шаги)\s*$/.test(line));
    const next = lines.findIndex((line, i) => i > from && /^##\s/.test(line));
    const to = next < 0 ? lines.length : next;
    return from < 0 ? null : { head: lines.slice(0, from), steps: lines.slice(from, to).join('\n'), tail: lines.slice(to) };
}

/**
 * The progress with the steps that matched marked done in the order of the plan, up to the first that did
 * not. Of the marks one after another the last set that stands in order holds: a step marked ahead of the
 * others is in order only with those before it marked too.
 */
export function markedStage(text, planned, stepsOf, matched) {
    const done = (now) => new Set(stepsOf(now).filter((s) => s.mark === 'x').map((s) => s.number));
    const parts = aroundSteps(text);
    let best = text;
    let now = text;
    for (const { number } of parts ? planned : []) {
        if (done(now).has(number)) continue;
        if (!matched.has(number)) break;
        parts.steps = markedProgress(parts.steps, number);
        now = [...parts.head, parts.steps, ...parts.tail].join('\n');
        // The line of the step is not among the steps: nothing behind it is marked.
        if (!done(now).has(number)) break;
        if (marksOutOfOrder(now) === null) best = now;
    }
    const has = done(best);
    return { text: best, done: has, open: planned.find(({ number }) => !has.has(number))?.number ?? null };
}

const whyOpen = (number, open) => (open === number ? ' · not marked: its line in the progress cannot be marked in order' : ` · not marked: ${open} stands open before it`);

/** Measures stage `stage` of the plan of the branch; 0 when every step of it matched and was marked. */
export async function runStage(sources, model, stage, more = []) {
    try {
        if (more.length > 0) throw new StepRefused(`one stage per call: ${more.join(' ')} is not read`);
        const { git, steps, marks } = sources;
        const plan = planOfBranch(git, model.words);
        // A folder another run put back stands on disk and not in the head: its marks would go with it.
        if (!existsSync(plan.folder) || !git.existsAtHead(`${plan.folder}/plan.md`)) throw new StepRefused('the task folder is taken apart, or the call is not from the root of the tree: a stage is measured while the folder stands, the done steps by `step --done`');
        const planned = steps.ofPlan(plan.text);
        const own = planned.filter((s) => s.number.split('.')[0] === stage).map((s) => s.number);
        if (own.length === 0) throw new StepRefused(`the plan names no stage ${stage}`);
        const path = `${plan.folder}/${PROGRESS}`;
        const read = () => (existsSync(path) ? readFileSync(path, 'utf8') : '');
        const stepsOf = (text) => steps.ofProgress(text).steps;
        const doneNow = new Set(stepsOf(read()).filter((s) => s.mark === 'x').map((s) => s.number));
        // A mark of another plan says nothing about this step, and one of a check replaced since neither.
        const holds = (number, mark) => {
            const step = planned.find((s) => s.number === number);
            return mark?.matched === true && mark.plan === plan.fingerprint && Boolean(mark.replaced) === replacedCheck(read(), number, step).replaced;
        };
        const green = own.filter((number) => doneNow.has(number) && holds(number, marks.step(plan.branch, number)));
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
            else console.log(`${number} ${stepLine(result)}${left.includes(number) ? whyOpen(number, after.open) : ''}`);
        }
        console.log(`stage ${stage}: measured ${results.length}, matched ${matched.size}, left open ${left.length}`);
        return matched.size === results.length && left.length === 0 ? 0 : 1;
    } catch (error) {
        if (!(error instanceof StepRefused)) throw error;
        console.log(`step: ${error.message}`);
        return 1;
    }
}
