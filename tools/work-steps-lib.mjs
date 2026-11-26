// rt-kit v0.41.1 · checks/work-steps-lib.mjs · db27c7cf5ee9 · правится надстройкой, не здесь
/**
 * The parsing of the steps of a plan and of a progress, shared by every reader of both lists.
 *
 * The plan holds the steps and is not edited after it is written; the progress holds the same list
 * with a mark on every step. The check of their match reads both, and so does the engine of the
 * task flow, which measures a step by the check line under it and judges a mark by its record. Two
 * parsers of one format diverge silently: one reads a step the other skips. So the parsing lives
 * here once, and the readers import it.
 *
 * The numbering is «<stage>.<step>»: a bare ordinal says nothing about which stage the step belongs
 * to, and the stages are renumbered by nobody — the plan is not edited after it is written.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** The heading the steps of the progress lie under. */
const STEPS_HEADING = /^##\s+(?:Steps|Шаги)\s*$/;
/** The heading the stages of the plan lie under. */
const STAGES_HEADING = /^##\s+(?:Stages|Этапы)\s*$/;
/** A stage heading: the number stands before the dot, the name after it. */
const STAGE_HEADING = /^###\s+(\d+)\.\s+(.+?)\s*$/;
/** The opening of the step list inside a stage. */
const STEPS_OPENING = /^-\s+\*\*(?:Steps|Шаги):\*\*\s*$/;
/** A step of the plan: an indented ordinal and the name. */
const PLAN_STEP = /^\s+(\d+)\.\s+(.+?)\s*$/;
/**
 * The check line under a step: the word in either language, the command in backticks, an arrow and
 * the expected result. It belongs to the step above it and is never part of its name.
 */
const CHECK_LINE = /^\s+(?:Проверка|Check):\s+`(.+)`\s+→\s+(.+?)\s*$/;
/** Another key of the stage: it closes the step list. */
const STAGE_KEY = /^-\s+\*\*/;
/** A step of the progress: the mark, the number of the stage, the number of the step, the name. */
const PROGRESS_STEP = /^-\s+\[([x>\s])\]\s+(\d+)\.(\d+)\s+(.+?)\s*$/;
/**
 * A name left as the sample wrote it. The sample of a task folder carries step names in angle
 * brackets, and a folder just copied from it holds them on both sides — with different words, so
 * every fresh folder would be red before a line of work is done in it. The sample directory itself
 * is judged by the same sign and needs no name of its own here.
 */
const BLANK_NAME = /^<.+>$/;

/** The mark of a step that is done. */
export const DONE = 'x';
/** The mark of the step going on right now. */
export const CURRENT = '>';

/**
 * The steps of the plan: the number «<stage>.<step>», the name and the check line under the step, in
 * the order they are written. A step without a check line has `command` and `expected` null.
 */
export function stepsOfPlan(text) {
    const steps = [];
    let stage = null;
    let inside = false;
    let listing = false;

    for (const line of text.split('\n')) {
        if (STAGES_HEADING.test(line)) {
            inside = true;
            continue;
        }

        if (inside && /^##\s+/.test(line)) {
            break;
        }

        if (!inside) {
            continue;
        }

        const heading = line.match(STAGE_HEADING);

        if (heading) {
            stage = heading[1];
            listing = false;
            continue;
        }

        if (STEPS_OPENING.test(line)) {
            listing = true;
            continue;
        }

        if (!listing) {
            continue;
        }

        const check = line.match(CHECK_LINE);

        if (check) {
            const last = steps.at(-1);

            if (last && last.number.startsWith(`${stage}.`) && last.command === null) {
                last.command = check[1];
                last.expected = check[2];
            }

            continue;
        }

        const step = line.match(PLAN_STEP);

        if (step) {
            steps.push({ number: `${stage}.${step[1]}`, name: step[2], command: null, expected: null });
            continue;
        }

        if (STAGE_KEY.test(line) || line.trim() === '') {
            listing = line.trim() === '' ? listing : false;
        }
    }

    return steps;
}

/** The steps of the progress: the number, the name and the mark, in the order they are written. */
export function stepsOfProgress(text) {
    const steps = [];
    let inside = false;

    for (const line of text.split('\n')) {
        if (STEPS_HEADING.test(line)) {
            inside = true;
            continue;
        }

        if (inside && /^##\s+/.test(line)) {
            break;
        }

        if (!inside) {
            continue;
        }

        const step = line.match(PROGRESS_STEP);

        if (step) {
            steps.push({ mark: step[1].trim() || ' ', number: `${step[2]}.${step[3]}`, name: step[4] });
        }
    }

    return { steps, declared: inside };
}

/** What is wrong with one task folder. An empty list means it matches. */
export function judge(folder) {
    const plan = join(folder, 'plan.md');
    const progress = join(folder, 'progress.md');

    if (!existsSync(plan) || !existsSync(progress)) {
        return [];
    }

    const planned = stepsOfPlan(readFileSync(plan, 'utf8'));
    const { steps: marked, declared } = stepsOfProgress(readFileSync(progress, 'utf8'));

    if (planned.some((step) => BLANK_NAME.test(step.name))) {
        return [];
    }

    if (planned.length === 0) {
        return declared && marked.length > 0
            ? ['the progress carries a list of steps, and the plan names none: the list was written from the head']
            : [];
    }

    if (!declared) {
        return [`the plan names ${planned.length} steps, and the progress carries no section of steps`];
    }

    const problems = [];

    if (marked.length !== planned.length) {
        problems.push(`the plan names ${planned.length} steps, the progress ${marked.length}`);
    }

    for (let index = 0; index < Math.min(planned.length, marked.length); index += 1) {
        if (planned[index].number !== marked[index].number) {
            problems.push(`step ${index + 1} in a row: the plan calls it «${planned[index].number}», the progress «${marked[index].number}»`);
            continue;
        }

        if (planned[index].name !== marked[index].name) {
            problems.push(`step ${planned[index].number}: the name in the progress is not the name in the plan — «${marked[index].name}»`);
        }
    }

    const current = marked.filter((step) => step.mark === CURRENT);
    const left = marked.filter((step) => step.mark !== DONE);

    if (left.length > 0 && current.length !== 1) {
        problems.push(
            current.length === 0
                ? `${left.length} steps are not done, and none is marked as going on right now`
                : `${current.length} steps are marked as going on right now, and there is only ever one`,
        );
    }

    if (left.length === 0 && current.length > 0) {
        problems.push('every step is done, and one is still marked as going on right now');
    }

    return problems;
}
