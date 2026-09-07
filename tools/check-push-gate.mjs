#!/usr/bin/env node
// rt-kit v0.25.0 · checks/check-push-gate.mjs · 0c205ff8d321 · правится надстройкой, не здесь
/**
 * The check that the set of the push gate is not narrower than the set of the pipeline.
 *
 * The push gate is a promise that the push will not arrive red. While its set is narrower than the
 * set of the pipeline, the promise is wider than what the gate checks, and it is wrong silently:
 * neither the gate nor its output says what is missing from it. Twice in a row an edit that passed
 * the gate whole was refused by the pipeline — and both times the green gate was read as
 * «everything is green locally».
 *
 * The pipeline file is not interpreted by a machine: the commands there are arbitrary, and part of
 * the steps cannot be run locally at all — the cache, uploading traces, signing in to the registry.
 * Only the NAMES of the steps are taken from there, and what each of them is closed by in the gate
 * is declared by the tree. An undeclared name turns red: the hole is seen on the spot and is not
 * deduced by comparing two lists with the eyes.
 *
 * A declaration comes in two kinds. A line is the very command the `rt_push_checks` of the profile
 * prints; it is checked against its output, because a declaration without a run is the same hole.
 * An exception is the reason why the step is not in the gate; an empty reason does not count as an
 * exception: it is the only thing by which a permanent hole differs from a forgotten line. A reason
 * naming a task is judged on the liveness of that task as well: a deferral with a deadline and a
 * deferral without one look alike while nobody has asked about the number.
 *
 * A tree without a pipeline file gets no comparison: a check falling where there is no pipeline
 * would refuse the work instead of a miss.
 *
 * A non-zero exit code and the list of discrepancies.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const GATE = CONFIG.pushGate ?? {};
const PIPELINE = GATE.pipelineFile ?? '';
const DECLARED = GATE.steps ?? {};
/** The task key of the tree: by it a number in a reason differs from a version, a port and a year. */
const TASK_KEY = CONFIG.board?.taskKey ?? '';

/**
 * The profile of the tree is looked for by the same chain as at the push guard: the package
 * default, and the override of the project on top of it. Were they to diverge, the check would
 * judge a set other than the one the guard runs.
 */
const PROFILES = ['.claude/rt-kit/defaults/project.sh', '.claude/rt-kit/project.sh'];

if (!PIPELINE || !existsSync(join(ROOT, PIPELINE))) {
    console.log('check-push-gate: пропущено — файла конвейера в дереве нет');
    process.exit(0);
}

/**
 * The names of the pipeline steps. The template is set by the tree: every hosting has its own form
 * of writing, and the package does not undertake to guess it for all three. The default is the
 * GitHub Actions form.
 */
const stepPattern = new RegExp(GATE.stepPattern ?? '^\\s*-\\s*name:\\s*(.+?)\\s*$');

function pipelineSteps() {
    return readFileSync(join(ROOT, PIPELINE), 'utf8')
        .split('\n')
        .map((line) => line.match(stepPattern)?.[1])
        .filter(Boolean)
        .map((name) => name.replace(/^['"]|['"]$/g, ''));
}

/**
 * The set of the gate is taken from the profile by its own shell, not rewritten here: two lists of
 * one set diverge silently, and they start diverging the day one of them is edited.
 *
 * There is no profile, no function in it, or the shell refused — the set is unknown, and then the
 * check judges only the completeness of the declarations: there is nothing to compare the lines
 * against.
 */
function gateChecks() {
    const present = PROFILES.filter((path) => existsSync(join(ROOT, path)));
    if (present.length === 0) {
        return null;
    }
    const script = `${present.map((path) => `. "${path}"`).join('\n')}
command -v rt_push_checks >/dev/null 2>&1 || exit 42
rt_push_checks ""`;
    try {
        return execFileSync('bash', ['-c', script], { cwd: ROOT, encoding: 'utf8' })
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
    } catch {
        return null;
    }
}

/**
 * The task numbers named by a reason. The key of the tree is mandatory: without it «663» is
 * indistinguishable from a port, a year and an edition number, and the check would ask the work
 * queue about everything in a row.
 */
function taskNumbers(reason) {
    if (!TASK_KEY) {
        return [];
    }
    return [...reason.matchAll(new RegExp(`\\b${TASK_KEY}-(\\d+)\\b`, 'g'))].map((match) => Number(match[1]));
}

/**
 * The work queue is looked for by module resolution, not assembled here: every hosting has its own,
 * and a tree that has none is judged as before. The tier is the same as at the delivery guard:
 * there is something to ask with — it asks, there is not — it stays silent.
 */
async function boardModule() {
    if (!TASK_KEY) {
        return null;
    }
    try {
        const module = await import('./board.mjs');
        return typeof module.taskState === 'function' ? module : null;
    } catch {
        return null;
    }
}

const steps = pipelineSteps();
const checks = gateChecks();
const problems = [];
/** The tasks named by the reasons of exceptions: asked in one batch after all the steps are read. */
const deferrals = [];

for (const step of steps) {
    const declaration = DECLARED[step];

    if (declaration === undefined) {
        problems.push(
            `шаг конвейера «${step}» не объявлен: закрой его строкой набора в pushGate.steps ` + 'либо объяви исключением с причиной'
        );
        continue;
    }

    if (typeof declaration === 'object' && declaration !== null) {
        const reason = String(declaration.skip ?? '').trim();
        if (!reason) {
            problems.push(`шаг конвейера «${step}» объявлен исключением без причины — пустая причина не считается`);
            continue;
        }
        for (const number of taskNumbers(reason)) {
            deferrals.push({ step, number });
        }
        continue;
    }

    const line = String(declaration).trim();
    if (!line) {
        problems.push(`шаг конвейера «${step}» объявлен пустой строкой — назови команду либо объяви исключение`);
        continue;
    }

    if (checks && !checks.some((check) => check.includes(line))) {
        problems.push(`шаг конвейера «${step}» объявлен строкой «${line}», а набор гейта её не печатает`);
    }
}

/** A line about a step the pipeline does not have is stale: otherwise declarations pile up the dead. */
const known = new Set(steps);
for (const step of Object.keys(DECLARED)) {
    if (!known.has(step)) {
        problems.push(`объявление «${step}» устарело — такого шага в ${PIPELINE} нет`);
    }
}

/**
 * A dead number in a reason makes the exception open-ended without saying so by a single line. The
 * very first refusal of the network ends the whole polling: there is no point asking the rest, and
 * still less point in falling for a check that is run on a plane.
 */
const board = deferrals.length > 0 ? await boardModule() : null;
if (board) {
    for (const { step, number } of deferrals) {
        let state;
        try {
            state = board.taskState(number);
        } catch {
            break;
        }
        if (state && state.exists === false) {
            problems.push(`шаг конвейера «${step}» отложен до задачи ${TASK_KEY}-${number}, а такой задачи в очереди работ нет — отсрочка бессрочная`);
        }
    }
}

if (problems.length > 0) {
    console.error(`check-push-gate: расхождений ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    console.error('\nНабор гейта пуша не бывает уже набора конвейера — правило поставки.');
    process.exit(1);
}

const skipped = Object.values(DECLARED).filter((value) => typeof value === 'object' && value !== null).length;
console.log(
    `check-push-gate: шагов конвейера ${steps.length}, закрыто набором ${steps.length - skipped}, ` + `объявлено исключениями ${skipped}`
);
