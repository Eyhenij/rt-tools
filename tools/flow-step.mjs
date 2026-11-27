// rt-kit v0.42.0 · checks/flow-step.mjs · df9f7354b5af · правится надстройкой, не здесь
/**
 * A step of the plan measured by its check — the engine command `step`.
 *
 * The check is taken from the commit that added the plan: a plan edited later would measure what was
 * never approved. The plan, the grill and every file of the folder that is no text must still match
 * that commit: a script edited after the plan would answer what the step needs. The other texts of the
 * folder grow. A command of the work itself is
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
import { availableParallelism, tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { compareExpected, isWriteCommand } from './flow-data.mjs';

// The sources of the description lie next to the engine where it is laid out, one level up in the package.
const HERE = dirname(fileURLToPath(import.meta.url));
const source = (name) => [join(HERE, `task-flow/source/${name}`), join(HERE, `../task-flow/source/${name}`)].find((path) => existsSync(path));
const records = await import(pathToFileURL(source('records.mjs')).href);
const { liveRun, putBack, release, rewritePutBack } = await import(pathToFileURL(source('git.mjs')).href);

/** The record directories of this repository and the test of an approval mark, shared by the checks. */
export const openRecords = (root = process.cwd()) => records.openAt(root);
export const approvalFault = records.approvalFault;

/** The limit of one check, in milliseconds: past it the step does not match. */
export const STEP_LIMIT_MS = 540_000;

/** The budget of the rerun before a PR, in milliseconds: a second run of a group starts only within it. */
export const RERUN_BUDGET_MS = 1_500_000;

export const PROGRESS = 'progress.md';
/** What the owner approved: these files stay as the commit of the plan holds them. */
const FROZEN = ['plan.md', 'grill.md'];

/** A taken-apart folder put back for one run, or null; a live, broken or stray folder on disk refuses the step. */
export function restoreFolder(git, folder) {
    const restored = putBack(git, folder);
    if (restored?.busy) throw new StepRefused(`the task folder is put back by the live run ${restored.busy}: measure after it ends`);
    if (restored?.left) throw new StepRefused(`${folder} is left by a broken step run and was edited after it: read it, remove it, then measure`);
    if (restored?.stray) throw new StepRefused(`the task folder is taken apart by ${restored.removedBy.slice(0, 9)}, and ${folder} still holds ${restored.stray.join(', ')}: remove them, then measure`);
    return restored;
}

/** The versions of a file in its history up to the head, or up to `removedFrom` when the head lacks it, oldest first. */
const versionsOf = (source, path) =>
    (spawnSync('git', ['log', '--reverse', '--format=%H', (!source.existsAtHead(path) && source.removedFrom?.(path)) || 'HEAD', '--', path], { encoding: 'utf8' }).stdout ?? '').split('\n').filter(Boolean).map((sha) => source.versionAt(path, sha));

const doneLine = (number) => new RegExp(`^\\s*-\\s+\\[x\\]\\s+${number.replace('.', '\\.')}\\s`, 'm');

/**
 * The progress as step `number` saw it: the version before the first one marking it done, with the
 * replacements of `latest` (the last version has every step done). With no such version, `latest`.
 */
export function progressOfStep(versions, latest, number) {
    const first = versions.findIndex((text) => text !== null && doneLine(number).test(text));
    const chosen = (first > 0 && versions[first - 1]) || latest;
    return chosen === latest ? chosen : withReplacements(chosen, latest);
}

/** The move of a step on a taken-apart folder whose fix lies in the folder: the revert of its taking-apart. */
export const revertMove = (removedBy) =>
    `fix what the step measures and measure it again; a fix that lies in the folder — a check replaced in the progress, a folder file edited after the plan — needs the folder back: \`git revert --no-edit ${removedBy}\` takes back the whole commit, the archive record too; then take the folder apart again`;

/** A replacement of a step check in the progress. */
const REPLACEMENT = /^-\s+\*\*(?:Проверка шага|Check of step)\s+(\d+\.\d+)\s+(?:заменена|replaced):\*\*\s+`(.+)`\s+→\s+(.+?)(?:\s+·\s+(?:слово владельца|the owner's word):\s+«.+»)?\s*$/u;

/** A step the engine does not measure, with the reason. */
export class StepRefused extends Error {
    constructor(message) {
        super(message);
        this.name = 'StepRefused';
    }
}

/** The last `count` lines of a text that are not empty. */
const tail = (text, count) =>
    (text ?? '')
        .split('\n')
        .map((line) => line.trimEnd())
        .filter((line) => line !== '')
        .slice(-count);

const lastLine = (output) => tail(output, 1)[0] ?? '';

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

/** The files that differ from the commit of the plan: the plan, the grill and every file that is no text; the other texts grow. */
export function changedSincePlan(git, plan, read = readFile) {
    const frozen = (name) => FROZEN.includes(name) || !name.endsWith('.md');
    return git
        .filesAt(plan.folder, plan.sha)
        .filter((path) => frozen(path.slice(path.lastIndexOf('/') + 1)))
        .filter((path) => read(path) !== git.versionAt(path, plan.sha));
}

/**
 * The check of a step after the decisions of the progress. A replacement line reaches the progress
 * only through the owner's window on the edit (the guard answers `ask`), so the line itself is the
 * owner's word: no quote is looked for. A quote of the older form is read and ignored. Of two lines
 * for one step the later wins, here and in the rerun alike.
 */
export function replacedCheck(progressText, number, step) {
    let last = null;
    for (const line of (progressText ?? '').split('\n')) {
        const m = line.match(REPLACEMENT);
        if (m && m[1] === number) last = { command: m[2], expected: m[3], replaced: true };
    }
    return last ?? { command: step.command, expected: step.expected, replaced: false };
}

/**
 * The progress text `text` with its replacement lines swapped for those of `latest`, the last
 * version of the progress in the history. A replacement is the owner's decision about a check, not
 * a part of the work the check measures: it holds on every version the rerun uses. A line the last
 * version no longer carries stays away, and a step replaced twice keeps the later line.
 */
export function withReplacements(text, latest) {
    const isReplacement = (line) => REPLACEMENT.test(line);
    const kept = (text ?? '').split('\n').filter((line) => !isReplacement(line));
    const lastOfStep = new Map();
    for (const line of (latest ?? '').split('\n')) if (isReplacement(line)) lastOfStep.set(line.match(REPLACEMENT)[1], line);
    const added = [...lastOfStep.values()];
    if (added.length === 0) return kept.join('\n');
    return `${kept.join('\n').replace(/\n*$/, '\n')}\n${added.join('\n')}\n`;
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

/**
 * The verdict of a run: the mark is written and the step marked done, or the mark is dropped; the
 * result is returned with the command, its output and errors. `keepMark` leaves the mark of a step
 * that did not match, for a run that is repeated; `restored` leaves a folder put back unmarked.
 */
function settleStep({ git, marks }, model, { plan, step }, run, limitMs, { keepMark = false, restored = false } = {}) {
    const verdict = run.timedOut ? { form: null, matched: false } : compareExpected(model.expect, step.expected, run.code, run.output);
    if (verdict.matched) {
        marks.writeStep(plan.branch, step.number, { branch: plan.branch, step: step.number, plan: plan.fingerprint, head: git.head(), line: lastLine(run.output), replaced: step.replaced, matched: true });
        // Only the engine marks a step done: the guard refuses a hand mark.
        const progress = `${plan.folder}/${PROGRESS}`;
        const text = restored ? null : readFile(progress);
        if (text !== null) {
            const marked = markedProgress(text, step.number);
            if (marked !== text) writeFileSync(progress, marked);
        }
    } else if (!keepMark) marks.dropStep(plan.branch, step.number);
    const got = gotOf(run, verdict.form, limitMs, verdict.matched);
    return { number: step.number, expected: step.expected, got, matched: verdict.matched, timedOut: run.timedOut, command: step.command, output: run.output, errors: run.errors ?? '', tap: run.tap ?? '' };
}

/**
 * The command with `tee <file>` before its last pipe, so the output a closing `grep` only counts is
 * kept for the line of an unmatched step. Null unless the pipe is certain: a `|` of `case`, `((`,
 * `[[` or `>|`, a backslash in a quote and `PIPESTATUS` change their meaning under a `tee`.
 */
export function tapped(command, file) {
    if (/\bcase\b|\(\(|\[\[|>\||PIPESTATUS|\\/.test(command)) return null;
    let quote = null;
    let at = -1;
    for (let i = 0; i < command.length; i++) {
        const c = command[i];
        if (quote) quote = c === quote ? null : quote;
        else if (c === "'" || c === '"') quote = c;
        else if (c === '|' && command[i + 1] !== '|' && command[i - 1] !== '|' && command[i + 1] !== '&') at = i;
    }
    return at < 0 || !/^\|\s*grep\b/.test(command.slice(at)) ? null : `${command.slice(0, at)}| tee '${file}' ${command.slice(at)}`;
}

/**
 * Measures one step of the plan: `{ number, expected, got, matched, removedBy }`, and writes or drops
 * its mark. A taken-apart folder comes back for the run with the progress of the step's measurement; a
 * step the last progress of the history does not mark done is refused with the move of the revert.
 */
export function measureStep(sources, model, number, limitMs = STEP_LIMIT_MS, read = readFile) {
    const plan = planOfBranch(sources.git, model.words);
    if (!sources.steps.ofPlan(plan.text).some((s) => s.number === number)) throw new StepRefused(`the plan names no step ${number}`);
    const restored = restoreFolder(sources.git, plan.folder);
    try {
        if (restored) {
            const progressPath = `${plan.folder}/${PROGRESS}`;
            const latest = readFile(progressPath);
            if (latest === null || !doneLine(number).test(latest)) {
                const back = `\`git revert --no-edit ${restored.removedBy}\``;
                throw new StepRefused(`${number} is not marked done in the history, and the task folder is taken apart by ${restored.removedBy.slice(0, 9)}: bring the folder back — ${back} — then do the step, measure it and take the folder apart again`);
            }
            rewritePutBack(progressPath, progressOfStep(versionsOf(sources.git, progressPath), latest, number));
        }
        const ready = preparedOn(sources, model, number, read, restored?.removedBy);
        const result = settleStep(sources, model, ready, runCheck(ready.step.command, limitMs), limitMs, { restored: restored !== null });
        return { ...result, removedBy: restored?.removedBy ?? null };
    } finally {
        release(restored);
    }
}

/** `prepareStep` on a folder put back: a folder file edited after the plan gets the move of the revert. */
function preparedOn(sources, model, number, read, removedBy) {
    try {
        return prepareStep(sources, model, number, read);
    } catch (error) {
        if (!removedBy || !(error instanceof StepRefused) || !error.message.startsWith('the task folder differs')) throw error;
        throw new StepRefused(`${error.message}, and the folder is taken apart by ${removedBy.slice(0, 9)}: ${revertMove(removedBy)}`);
    }
}

/**
 * Measures the steps side by side, at most `width` at once, each within the limit: results in the order
 * of `numbers`, a refused one as `{ number, refused }`; `settle` goes to each verdict, `settle.tap` to `tapped`.
 */
export async function measureSteps(sources, model, numbers, limitMs = STEP_LIMIT_MS, width = availableParallelism(), read = readFile, settle = {}) {
    const results = new Array(numbers.length);
    let next = 0;
    const worker = async () => {
        while (next < numbers.length) {
            const index = next++;
            const number = numbers[index];
            try {
                const ready = preparedOn(sources, model, number, read, settle.removedBy);
                const file = join(tmpdir(), `rt-step-${process.pid}-${number}.out`);
                const command = (settle.tap && tapped(ready.step.command, file)) || ready.step.command;
                const started = Date.now();
                const run = await runCheckAsync(command, limitMs);
                if (command !== ready.step.command) run.tap = readFile(file) ?? '';
                rmSync(file, { force: true });
                results[index] = { ...settleStep(sources, model, ready, run, limitMs, settle), ms: Date.now() - started };
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
            if (!result.matched && result.removedBy) console.log([...detailLines(result), `step: ${revertMove(result.removedBy)}`].join('\n'));
            return result.matched ? 0 : 1;
        } catch (error) {
            if (!(error instanceof StepRefused)) throw error;
            console.log(`step: ${error.message}`);
            return 1;
        }
    }
    let numbers;
    try {
        // A taken-apart folder: the done steps are measured the way the rerun before a PR measures them.
        const folder = planOfBranch(sources.git, model.words).folder;
        if (!existsSync(folder) || liveRun(folder)) return runBeforePull(sources, model);
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

/** A line of a suite that names a failure. */
const FAILURE = /\bFAIL\b|\bnot ok\b|\b[Ee]rror\b|провал/;

/**
 * The lines under an unmatched step: its command, the last lines of its output and of its errors, and
 * of what a pipe fed its last command — the lines naming a failure, or the last ones; each cut at 300.
 */
export const detailLines = (result) => {
    const fed = (result.tap ?? '').split('\n').filter((line) => FAILURE.test(line) && !/\b0 провалов/.test(line));
    const lines = (name, list) => list.map((line) => `    ${name}: ${line.slice(0, 300)}`);
    return [
        ...lines('command', [result.command]),
        ...lines('output', tail(result.output, 3)),
        ...lines('errors', tail(result.errors, 3)),
        ...lines('before the last pipe', fed.length > 0 ? tail(fed.join('\n'), 3) : tail(result.tap, 3)),
    ];
};

/**
 * The rerun before a PR: every step the progress marks done is measured once more on the folder put
 * back, whatever mark lies on disk; a check that changes a tracked file does not match. A mismatch
 * runs again in its group within the budget and loses its mark only then. 0 when every step matched.
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
    const started = Date.now();
    const before = trackedChanges();
    let restored = null;
    try {
        // A taken-apart folder: its last version comes back for the run and leaves after it.
        restored = restoreFolder(sources.git, plan.folder);
        const numbers = doneSteps(sources, model);
        // The suites shorten the limit and the budget; the work always runs with its own.
        const limit = Number(process.env.RT_FLOW_STEP_LIMIT_MS) || STEP_LIMIT_MS;
        const budget = Number(process.env.RT_FLOW_RERUN_BUDGET_MS) || RERUN_BUDGET_MS;
        // A restored folder brings the progress back as it stood when each step was measured.
        const progressPath = `${plan.folder}/${PROGRESS}`;
        const latest = restored ? readFile(progressPath) : null;
        const versions = latest === null ? [] : versionsOf(sources.git, progressPath);
        const groups = new Map();
        for (const number of numbers) {
            const text = latest === null ? null : progressOfStep(versions, latest, number);
            groups.set(text, [...(groups.get(text) ?? []), number]);
        }
        const settle = { keepMark: true, restored: restored !== null, removedBy: restored?.removedBy, tap: true };
        // A second run of a group starts only when its longest first run still fits the budget, and
        // runs no longer than the budget left.
        const spent = new Map();
        const runGroups = async (wanted, settled, again) => {
            const out = [];
            for (const [text, group] of groups) {
                const todo = group.filter((number) => wanted.includes(number));
                const left = budget - (Date.now() - started);
                if (todo.length === 0 || (again && (spent.get(text) ?? 0) > left)) continue;
                if (text !== null) rewritePutBack(progressPath, text);
                const done = await measureSteps(sources, model, todo, again ? Math.min(limit, left) : limit, undefined, readFile, settled);
                spent.set(text, Math.max(0, ...done.map((r) => r.ms ?? 0)));
                out.push(...done);
            }
            return out;
        };
        const first = await runGroups(numbers, settle, false);
        const again = first.filter((r) => !r.refused && !r.matched && !r.timedOut).map((r) => r.number);
        const second = await runGroups(again, { ...settle, keepMark: false }, true);
        // A second run refused keeps the first mismatch: the step did not match, and its lines stay.
        const results = first.map((r) => {
            const s = second.find((x) => x.number === r.number);
            return s && !s.refused ? s : { ...r, refusedAgain: s?.refused };
        });
        results.sort((a, b) => numbers.indexOf(a.number) - numbers.indexOf(b.number));
        // A step that did not match and did not run again loses its mark here.
        for (const r of results) if (!r.refused && !r.matched) sources.marks.dropStep(plan.branch, r.number);
        const changed = trackedChanges().filter((line) => !before.includes(line));
        for (const result of results) {
            console.log(`${result.number} ${result.refused ? `step: ${result.refused}` : stepLine(result)}`);
            const runs = second.some((s) => s.number === result.number && !s.refused) ? 'twice' : 'once';
            const again = result.refusedAgain ? [`    second run: step: ${result.refusedAgain}`] : [];
            if (!result.refused && !result.matched) console.log([`    runs: ${runs}`, ...again, ...detailLines(result)].join('\n'));
            else if (result.matched && runs === 'twice') console.log('    matched on the second run');
        }
        if (changed.length > 0) console.log(`step: the checks changed tracked files — ${changed.join(', ')}: a check measures, it does not edit`);
        const failed = results.filter((r) => !r.refused && !r.matched).map((r) => r.number);
        if (restored && failed.length > 0) {
            console.log(`step: ${failed.join(', ')} did not match, and the task folder is taken apart by ${restored.removedBy.slice(0, 9)}: ${revertMove(restored.removedBy)}`);
        }
        const matched = changed.length > 0 ? 0 : results.filter((result) => result.matched).length;
        console.log(`steps re-measured ${results.length}, matched ${matched}`);
        return matched === results.length && changed.length === 0 ? 0 : 1;
    } catch (error) {
        if (!(error instanceof StepRefused)) throw error;
        console.log(`step: ${error.message}`);
        return 1;
    } finally {
        release(restored);
    }
}
