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
 * A check is replaced only by a decision in the progress the owner allowed in the window on its edit:
 *
 *   - **Проверка шага 2.4 заменена:** `<command>` → <expected>
 *
 * A matched step writes its mark: the branch, the step, the fingerprint of the plan, the head and the
 * last line of the output. A step that does not match drops a mark left before, so a mark always
 * says what the last measurement said.
 */
import { spawn, spawnSync } from 'node:child_process';
import { availableParallelism } from 'node:os';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { compareExpected, isWriteCommand } from './flow-data.mjs';

// The sources of the description lie next to the engine where it is laid out, one level up in the package.
const HERE = dirname(fileURLToPath(import.meta.url));
const RECORDS = [join(HERE, 'task-flow/source/records.mjs'), join(HERE, '../task-flow/source/records.mjs')].find((path) => existsSync(path));
const records = await import(pathToFileURL(RECORDS).href);

/** The record directories of this repository and the test of an approval mark, shared by the checks. */
export const openRecords = (root = process.cwd()) => records.openAt(root);
export const approvalFault = records.approvalFault;

/** The limit of one check, in milliseconds: past it the step does not match. */
export const STEP_LIMIT_MS = 540_000;

/** The progress changes every turn and is the one file of the folder not judged against the plan. */
const PROGRESS = 'progress.md';

/** A replacement of a step check in the progress. */
const REPLACEMENT = /^-\s+\*\*(?:Проверка шага|Check of step)\s+(\d+\.\d+)\s+(?:заменена|replaced):\*\*\s+`(.+)`\s+→\s+(.+?)(?:\s+·\s+(?:слово владельца|the owner's word):\s+«.+»)?\s*$/u;

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

/** Runs a check: its exit code and output, or the mark that the limit ran out; `cwd` is where it runs. */
export function runCheck(command, limitMs = STEP_LIMIT_MS, cwd = undefined) {
    const out = spawnSync('bash', ['-c', command], { cwd, encoding: 'utf8', timeout: limitMs, killSignal: 'SIGKILL', maxBuffer: 64 * 1024 * 1024 });
    const timedOut = out.error?.code === 'ETIMEDOUT';
    return { code: timedOut ? null : out.status, output: out.stdout ?? '', errors: out.stderr ?? '', timedOut };
}

/** Runs a check without blocking: the same answer as `runCheck`, so that the checks of `--done` run side by side. */
export function runCheckAsync(command, limitMs = STEP_LIMIT_MS) {
    return new Promise((resolve) => {
        const child = spawn('bash', ['-c', command], { stdio: ['ignore', 'pipe', 'pipe'] });
        let output = '';
        let errors = '';
        let timedOut = false;
        const timer = setTimeout(() => {
            timedOut = true;
            child.kill('SIGKILL');
        }, limitMs);
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', (chunk) => (output += chunk));
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', (chunk) => (errors += chunk));
        child.on('close', (code) => {
            clearTimeout(timer);
            resolve({ code: timedOut ? null : code, output, errors, timedOut });
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
 * The check of a step after the decisions of the progress. A replacement line reaches the progress
 * only through the owner's window on the edit (the guard answers `ask`), so the line itself is the
 * owner's word: no quote is looked for. A quote of the older form is read and ignored.
 */
export function replacedCheck(progressText, number, step) {
    for (const line of (progressText ?? '').split('\n')) {
        const m = line.match(REPLACEMENT);
        if (!m || m[1] !== number) continue;
        return { command: m[2], expected: m[3], replaced: true };
    }
    return { command: step.command, expected: step.expected, replaced: false };
}

/** The signs of a failed network in what a check printed. */
const NETWORK = /ENOTFOUND|ECONNREFUSED|ECONNRESET|EAI_AGAIN|ETIMEDOUT|getaddrinfo|Could not resolve host|network is unreachable|Failed to connect/i;

/** What a run gave, in the words of the line: the code for the exit form, the last line otherwise. */
const gotOf = (run, form, limitMs, matched = true) => {
    if (run.timedOut) return `the limit of ${limitMs / 1000} s ran out`;
    const network = !matched && NETWORK.test(`${run.output}\n${run.errors ?? ''}`) ? ' — the cause is the network' : '';
    if (form === 'exit') return `exit ${run.code}${network}`;
    return (run.code === 0 ? lastLine(run.output) : `exit ${run.code}, ${lastLine(run.output)}`) + network;
};

/** The step ready to run: its plan, its check and the expected result, or a refusal before anything runs. */
function prepareStep({ git, steps }, model, number, read) {
    const plan = planOfBranch(git, model.words);
    const changed = changedSincePlan(git, plan, read);
    if (changed.length > 0) throw new StepRefused(`the task folder differs from the commit of the plan: ${changed.join(', ')}`);
    const planned = steps.ofPlan(plan.text).find((s) => s.number === number);
    if (!planned) throw new StepRefused(`the plan names no step ${number}`);
    const progress = `${plan.folder}/${PROGRESS}`;
    const step = { number, ...replacedCheck(read(progress) ?? git.lastVersion(progress), number, planned) };
    if (step.command === null) throw new StepRefused(`step ${number} has no check line`);
    if (isWriteCommand(step.command, model.words)) throw new StepRefused(`the check of step ${number} is a command of the work: ${step.command}`);
    if (compareExpected(model.expect, step.expected, 0, '') === null) throw new StepRefused(`the expected result of step ${number} is in no form: ${step.expected}`);
    return { plan, step };
}

/**
 * The progress with step `number` marked done and, when no step is current, the first one not begun
 * made current. A progress that names no such step comes back as it was.
 */
export function markedProgress(text, number) {
    const own = new RegExp(`^(\\s*-\\s+\\[)[ >x](\\]\\s+${number.replace('.', '\\.')}\\s)`);
    const lines = text.split('\n');
    const at = lines.findIndex((line) => own.test(line));
    // A step already done is measured again, not marked again: the progress stays as it was.
    if (at < 0 || /^\s*-\s+\[x\]/.test(lines[at])) return text;
    lines[at] = lines[at].replace(own, '$1x$2');
    if (!lines.some((line) => /^\s*-\s+\[>\]\s+\d+\.\d+\s/.test(line))) {
        const next = lines.findIndex((line) => /^\s*-\s+\[ \]\s+\d+\.\d+\s/.test(line));
        if (next >= 0) lines[next] = lines[next].replace('[ ]', '[>]');
    }
    return lines.join('\n');
}

/** The verdict of a run: the mark is written and the step marked done, or the mark is dropped; the result is returned. */
function settleStep({ git, marks }, model, { plan, step }, run, limitMs) {
    const verdict = run.timedOut ? { form: null, matched: false } : compareExpected(model.expect, step.expected, run.code, run.output);
    if (verdict.matched) {
        marks.writeStep(plan.branch, step.number, { branch: plan.branch, step: step.number, plan: plan.fingerprint, head: git.head(), line: lastLine(run.output), replaced: step.replaced, matched: true });
        // Only the engine marks a step done: the guard refuses a hand mark.
        const progress = `${plan.folder}/${PROGRESS}`;
        const text = readFile(progress);
        if (text !== null) {
            const marked = markedProgress(text, step.number);
            if (marked !== text) writeFileSync(progress, marked);
        }
    } else marks.dropStep(plan.branch, step.number);
    return { number: step.number, expected: step.expected, got: gotOf(run, verdict.form, limitMs, verdict.matched), matched: verdict.matched };
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
export async function runStepCommand(sources, model, target, mode = '') {
    if (mode === '--pr') return runBeforePull(sources, model);
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

/** The tracked files the working copy changed, as `git status` names them. */
const trackedChanges = () =>
    (spawnSync('git', ['status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' }).stdout ?? '').split('\n').filter(Boolean).sort();

/**
 * The rerun before a PR opens: every step the progress marks done is measured once more, whatever
 * mark lies on disk. A taken-apart task folder is put back from the history for the run and removed
 * after it; a check that leaves a tracked file changed does not match. A branch with no plan, or a
 * plan with no checks, has nothing to measure. Returns 0 when every done step matched.
 */
export async function runBeforePull(sources, model) {
    let plan;
    try {
        plan = planOfBranch(sources.git, model.words);
    } catch (error) {
        if (!(error instanceof StepRefused)) throw error;
        console.log(`step: ${error.message} — nothing to measure before the PR`);
        return 0;
    }
    if (sources.steps.ofPlan(plan.text).every((s) => s.command === null)) {
        console.log('step: the plan names no checks — nothing to measure before the PR');
        return 0;
    }
    // A taken-apart folder: its last version comes back for the run and leaves after it.
    const restored = [];
    if (!existsSync(plan.folder)) {
        const last = (spawnSync('git', ['log', '-1', '--format=%H', '--diff-filter=D', 'HEAD', '--', plan.folder], { encoding: 'utf8' }).stdout ?? '').trim();
        const at = last ? `${last}^` : null;
        for (const path of at ? sources.git.filesAt(plan.folder, at) : []) {
            const text = sources.git.versionAt(path, at);
            if (text === null) continue;
            mkdirSync(dirname(path), { recursive: true });
            writeFileSync(path, text);
            restored.push(path);
        }
    }
    const before = trackedChanges();
    try {
        const numbers = doneSteps(sources, model);
        // The suites shorten the limit; the work always runs with the step limit.
        const limit = Number(process.env.RT_FLOW_STEP_LIMIT_MS) || STEP_LIMIT_MS;
        // A restored folder brings the progress back as it stood when each step was measured — the
        // version before the first commit that marks the step done: a check that reads the progress
        // saw it so, while the last version has every step done.
        const progressPath = `${plan.folder}/${PROGRESS}`;
        const latest = restored.includes(progressPath) ? readFileSync(progressPath, 'utf8') : null;
        const log = latest === null ? '' : (spawnSync('git', ['log', '--reverse', '--format=%H', 'HEAD', '--', progressPath], { encoding: 'utf8' }).stdout ?? '');
        const versions = log.split('\n').filter(Boolean).map((sha) => sources.git.versionAt(progressPath, sha));
        const groups = new Map();
        for (const number of numbers) {
            const done = new RegExp(`^\\s*-\\s+\\[x\\]\\s+${number.replace('.', '\\.')}\\s`, 'm');
            const first = versions.findIndex((text) => text !== null && done.test(text));
            const text = (first > 0 && versions[first - 1]) || latest;
            groups.set(text, [...(groups.get(text) ?? []), number]);
        }
        const results = [];
        for (const [text, group] of groups) {
            if (text !== null) writeFileSync(progressPath, text);
            results.push(...(await measureSteps(sources, model, group, limit)));
        }
        results.sort((a, b) => numbers.indexOf(a.number) - numbers.indexOf(b.number));
        const changed = trackedChanges().filter((line) => !before.includes(line));
        for (const result of results) console.log(`${result.number} ${result.refused ? `step: ${result.refused}` : stepLine(result)}`);
        if (changed.length > 0) console.log(`step: the checks changed tracked files — ${changed.join(', ')}: a check measures, it does not edit`);
        const matched = changed.length > 0 ? 0 : results.filter((result) => result.matched).length;
        console.log(`steps re-measured ${results.length}, matched ${matched}`);
        return matched === results.length && changed.length === 0 ? 0 : 1;
    } catch (error) {
        if (!(error instanceof StepRefused)) throw error;
        console.log(`step: ${error.message}`);
        return 1;
    } finally {
        for (const path of restored) rmSync(path, { force: true });
        if (restored.length > 0) rmSync(plan.folder, { recursive: true, force: true });
    }
}
