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
import { spawn, spawnSync } from 'node:child_process';
import { availableParallelism } from 'node:os';
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

/** Runs a check without blocking: the same answer as `runCheck`, so that the checks of `--done` run side by side. */
export function runCheckAsync(command, limitMs = STEP_LIMIT_MS) {
    return new Promise((resolve) => {
        const child = spawn('bash', ['-c', command], { stdio: ['ignore', 'pipe', 'ignore'] });
        let output = '';
        let timedOut = false;
        const timer = setTimeout(() => {
            timedOut = true;
            child.kill('SIGKILL');
        }, limitMs);
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', (chunk) => (output += chunk));
        child.on('close', (code) => {
            clearTimeout(timer);
            resolve({ code: timedOut ? null : code, output, timedOut });
        });
    });
}

/**
 * The plan of the checked-out branch as its commit wrote it: the commit that added the plan. A branch
 * of `words.legacyBranches` takes the newest commit that changed it — its plan was approved, and
 * edited by the owner's word, before the engine existed.
 */
export function planOfBranch(git, words = {}) {
    const branch = git.branch();
    const folder = `docs/tasks/${branch}`;
    const path = `${folder}/plan.md`;
    const legacy = (words.legacyBranches ?? []).includes(branch);
    const sha = legacy
        ? ([...git.commits()].reverse().find((c) => c.added.includes(path) || c.modified.includes(path))?.sha ?? null)
        : git.addedBy(path);
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

/** The step ready to run: its plan, its check and the expected result, or a refusal before anything runs. */
function prepareStep({ git, steps, owner }, model, number, read) {
    const plan = planOfBranch(git, model.words);
    const changed = changedSincePlan(git, plan, read);
    if (changed.length > 0) throw new StepRefused(`the task folder differs from the commit of the plan: ${changed.join(', ')}`);
    const planned = steps.ofPlan(plan.text).find((s) => s.number === number);
    if (!planned) throw new StepRefused(`the plan names no step ${number}`);
    const progress = `${plan.folder}/${PROGRESS}`;
    const step = { number, ...replacedCheck(read(progress) ?? git.lastVersion(progress), number, owner, planned) };
    if (step.command === null) throw new StepRefused(`step ${number} has no check line`);
    if (isWriteCommand(step.command, model.words)) throw new StepRefused(`the check of step ${number} is a command of the work: ${step.command}`);
    if (compareExpected(model.expect, step.expected, 0, '') === null) throw new StepRefused(`the expected result of step ${number} is in no form: ${step.expected}`);
    return { plan, step };
}

/** The verdict of a run: the mark is written or dropped, and the result is returned. */
function settleStep({ git, marks }, model, { plan, step }, run, limitMs) {
    const verdict = run.timedOut ? { form: null, matched: false } : compareExpected(model.expect, step.expected, run.code, run.output);
    if (verdict.matched) {
        marks.writeStep(plan.branch, step.number, { branch: plan.branch, step: step.number, plan: plan.fingerprint, head: git.head(), line: lastLine(run.output), replaced: step.replaced, matched: true });
    } else marks.dropStep(plan.branch, step.number);
    return { number: step.number, expected: step.expected, got: gotOf(run, verdict.form, limitMs), matched: verdict.matched };
}

/**
 * Measures one step of the plan: `{ number, expected, got, matched }`, and writes or drops its mark.
 * `sources` holds `git`, `steps`, `marks` and `owner`; `model` gives the words and the forms of `expect`.
 */
export function measureStep(sources, model, number, limitMs = STEP_LIMIT_MS, read = readFile) {
    const ready = prepareStep(sources, model, number, read);
    return settleStep(sources, model, ready, runCheck(ready.step.command, limitMs), limitMs);
}

/**
 * Measures the given steps side by side, at most `width` checks at once: the results in the order of
 * `numbers`, a refused step as `{ number, refused }`. The limit holds for each check, as in `measureStep`.
 */
export async function measureSteps(sources, model, numbers, limitMs = STEP_LIMIT_MS, width = availableParallelism(), read = readFile) {
    const results = new Array(numbers.length);
    let next = 0;
    const worker = async () => {
        while (next < numbers.length) {
            const index = next++;
            const number = numbers[index];
            try {
                const ready = prepareStep(sources, model, number, read);
                const run = await runCheckAsync(ready.step.command, limitMs);
                results[index] = settleStep(sources, model, ready, run, limitMs);
            } catch (error) {
                if (!(error instanceof StepRefused)) throw error;
                results[index] = { number, refused: error.message };
            }
        }
    };
    await Promise.all(Array.from({ length: Math.max(1, Math.min(width, numbers.length)) }, worker));
    return results;
}

/** The steps the progress marks done: the working copy, or the last version in the history. */
export function doneSteps({ git, steps }, model, read = readFile) {
    const plan = planOfBranch(git, model.words);
    const path = `${plan.folder}/${PROGRESS}`;
    const text = read(path) ?? git.lastVersion(path) ?? '';
    return steps.ofProgress(text).steps.filter((s) => s.mark === 'x').map((s) => s.number);
}

/** The line of one measured step; it always ends with the verdict. */
export const stepLine = (result) => `ожидалось ${result.expected} · получено ${result.got} · ${result.matched ? 'совпало' : 'не совпало'}`;

/**
 * The command `step <N.M>` or `step --done`: prints a line per step and returns the exit code — 0
 * when every measured step matched, 1 when one did not or was refused. `--done` runs the checks side
 * by side, prefixes each line with the number of its step and ends with the line
 * `steps re-measured N, matched M`.
 */
export async function runStepCommand(sources, model, target) {
    if (target !== '--done') {
        try {
            const result = measureStep(sources, model, target);
            console.log(stepLine(result));
            return result.matched ? 0 : 1;
        } catch (error) {
            if (!(error instanceof StepRefused)) throw error;
            console.log(`step: ${error.message}`);
            return 1;
        }
    }
    let numbers;
    try {
        numbers = doneSteps(sources, model);
    } catch (error) {
        if (!(error instanceof StepRefused)) throw error;
        console.log(`step: ${error.message}`);
        return 1;
    }
    const results = await measureSteps(sources, model, numbers);
    for (const result of results) console.log(`${result.number} ${result.refused ? `step: ${result.refused}` : stepLine(result)}`);
    const matched = results.filter((result) => result.matched).length;
    console.log(`steps re-measured ${results.length}, matched ${matched}`);
    return matched === results.length ? 0 : 1;
}
