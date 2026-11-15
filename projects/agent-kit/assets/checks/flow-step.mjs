/**
 * A step of the plan measured by its check — the engine command `step`.
 *
 * The check is taken from the commit that added the plan, not from the working copy: a plan edited
 * after it is written would measure what was never approved. Every file of the task folder that the
 * commit holds, except the progress, must still match it, otherwise the step is refused: a script of
 * the folder edited after the plan would answer what the step needs. A command of the work itself is
 * never a check, and an expected result in no form of `expect` is refused before anything runs. The
 * command runs with a limit; past it the step does not match.
 *
 * A check is replaced only by a decision in the progress that quotes the owner, and the quote must
 * stand in a message the owner typed:
 *
 *   - **Проверка шага 2.4 заменена:** `<command>` → <expected> · слово владельца: «<quote>»
 *
 * A matched step writes its mark: the branch, the step, the fingerprint of the plan, the head and the
 * last line of the output. A step that does not match drops a mark left before, so a mark always
 * says what the last measurement said.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

import { compareExpected, isWriteCommand } from './flow-data.mjs';

/** The limit of one check, in milliseconds: past it the step does not match. */
export const STEP_LIMIT_MS = 540_000;

/** The progress changes every turn and is the one file of the folder not judged against the plan. */
const PROGRESS = 'progress.md';

/** A replacement of a step check in the progress. */
const REPLACEMENT = /^-\s+\*\*(?:Проверка шага|Check of step)\s+(\d+\.\d+)\s+(?:заменена|replaced):\*\*\s+`(.+)`\s+→\s+(.+?)\s+·\s+(?:слово владельца|the owner's word):\s+«(.+)»\s*$/u;

/** A step the engine does not measure, with the reason. */
export class StepRefused extends Error {
    constructor(message) {
        super(message);
        this.name = 'StepRefused';
    }
}

const lastLine = (output) =>
    output
        .split('\n')
        .map((line) => line.trimEnd())
        .filter((line) => line !== '')
        .pop() ?? '';

const readFile = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : null);

/** Runs a check: its exit code and output, or the mark that the limit ran out. */
export function runCheck(command, limitMs = STEP_LIMIT_MS) {
    const out = spawnSync('bash', ['-c', command], { encoding: 'utf8', timeout: limitMs, killSignal: 'SIGKILL', maxBuffer: 64 * 1024 * 1024 });
    const timedOut = out.error?.code === 'ETIMEDOUT';
    return { code: timedOut ? null : out.status, output: out.stdout ?? '', timedOut };
}

/** The plan of the checked-out branch as the commit that added it wrote it. */
export function planOfBranch(git) {
    const branch = git.branch();
    const folder = `docs/tasks/${branch}`;
    const path = `${folder}/plan.md`;
    const sha = git.addedBy(path);
    if (!sha) throw new StepRefused(`no commit of the branch added ${path}`);
    const text = git.versionAt(path, sha);
    return { branch, folder, sha, text, fingerprint: createHash('sha256').update(text).digest('hex').slice(0, 16) };
}

/** The files of the task folder that differ from the commit of the plan; the progress is not judged. */
export function changedSincePlan(git, plan, read = readFile) {
    return git
        .filesAt(plan.folder, plan.sha)
        .filter((path) => !path.endsWith(`/${PROGRESS}`))
        .filter((path) => read(path) !== git.versionAt(path, plan.sha));
}

/**
 * The check of a step after the decisions of the progress: a replacement counts only when its quote
 * stands in a message the owner typed, and one whose quote the owner never typed refuses the step.
 */
export function replacedCheck(progressText, number, owner, step) {
    for (const line of (progressText ?? '').split('\n')) {
        const m = line.match(REPLACEMENT);
        if (!m || m[1] !== number) continue;
        if (!owner.said(m[4])) throw new StepRefused(`the replacement of the check of step ${number} quotes «${m[4]}», and the owner never typed it`);
        return { command: m[2], expected: m[3], replaced: true };
    }
    return { command: step.command, expected: step.expected, replaced: false };
}

/** What a run gave, in the words of the line: the code for the exit form, the last line otherwise. */
const gotOf = (run, form, limitMs) => {
    if (run.timedOut) return `the limit of ${limitMs / 1000} s ran out`;
    if (form === 'exit') return `exit ${run.code}`;
    return run.code === 0 ? lastLine(run.output) : `exit ${run.code}, ${lastLine(run.output)}`;
};

/**
 * Measures one step of the plan: `{ number, expected, got, matched }`, and writes or drops its mark.
 * `sources` holds `git`, `steps`, `marks` and `owner`; `model` gives the words and the forms of `expect`.
 */
export function measureStep({ git, steps, marks, owner }, model, number, limitMs = STEP_LIMIT_MS, read = readFile) {
    const plan = planOfBranch(git);
    const changed = changedSincePlan(git, plan, read);
    if (changed.length > 0) throw new StepRefused(`the task folder differs from the commit of the plan: ${changed.join(', ')}`);
    const planned = steps.ofPlan(plan.text).find((s) => s.number === number);
    if (!planned) throw new StepRefused(`the plan names no step ${number}`);
    const progress = `${plan.folder}/${PROGRESS}`;
    const step = { number, ...replacedCheck(read(progress) ?? git.lastVersion(progress), number, owner, planned) };
    if (step.command === null) throw new StepRefused(`step ${number} has no check line`);
    if (isWriteCommand(step.command, model.words)) throw new StepRefused(`the check of step ${number} is a command of the work: ${step.command}`);
    if (compareExpected(model.expect, step.expected, 0, '') === null) throw new StepRefused(`the expected result of step ${number} is in no form: ${step.expected}`);
    const run = runCheck(step.command, limitMs);
    const verdict = run.timedOut ? { form: null, matched: false } : compareExpected(model.expect, step.expected, run.code, run.output);
    if (verdict.matched) {
        marks.writeStep(plan.branch, number, { branch: plan.branch, step: number, plan: plan.fingerprint, head: git.head(), line: lastLine(run.output), replaced: step.replaced, matched: true });
    } else marks.dropStep(plan.branch, number);
    return { number, expected: step.expected, got: gotOf(run, verdict.form, limitMs), matched: verdict.matched };
}

/** The steps the progress marks done: the working copy, or the last version in the history. */
export function doneSteps({ git, steps }, read = readFile) {
    const plan = planOfBranch(git);
    const path = `${plan.folder}/${PROGRESS}`;
    const text = read(path) ?? git.lastVersion(path) ?? '';
    return steps.ofProgress(text).steps.filter((s) => s.mark === 'x').map((s) => s.number);
}

/** The line of one measured step; it always ends with the verdict. */
export const stepLine = (result) => `ожидалось ${result.expected} · получено ${result.got} · ${result.matched ? 'совпало' : 'не совпало'}`;

/**
 * The command `step <N.M>` or `step --done`: prints a line per step and returns the exit code — 0
 * when every measured step matched, 1 when one did not or was refused. `--done` prefixes each line
 * with the number of its step.
 */
export function runStepCommand(sources, model, target) {
    const one = (number) => {
        try {
            const result = measureStep(sources, model, number);
            return { line: stepLine(result), ok: result.matched };
        } catch (error) {
            if (!(error instanceof StepRefused)) throw error;
            return { line: `step: ${error.message}`, ok: false };
        }
    };
    if (target !== '--done') {
        const { line, ok } = one(target);
        console.log(line);
        return ok ? 0 : 1;
    }
    let numbers;
    try {
        numbers = doneSteps(sources);
    } catch (error) {
        if (!(error instanceof StepRefused)) throw error;
        console.log(`step: ${error.message}`);
        return 1;
    }
    let code = 0;
    for (const number of numbers) {
        const { line, ok } = one(number);
        console.log(`${number} ${line}`);
        if (!ok) code = 1;
    }
    return code;
}
