#!/usr/bin/env node
/**
 * The engine of the task flow: reads the description `flow.js` through the model and answers about
 * the scenario. The description lies next to the engine as `task-flow/flow.js` where the engine is
 * laid out, and as `../task-flow/flow.js` in the package; `--flow <path>` names another one.
 *
 *   node task-flow-script.mjs states   the states of the scenario in their order, a line each:
 *                                      `<n>. <title> — <action> (<pattern>)`
 *   node task-flow-script.mjs measure  the measured state of the checked-out branch, its action and
 *                                      the exits read up to it; `--json` prints one object with
 *                                      `state`, `index`, `reason`, `exits`, `action`, `pattern`
 *   node task-flow-script.mjs step N.M  runs the check of that step of the plan, prints
 *                                      `ожидалось … · получено … · совпало|не совпало` and writes the
 *                                      mark of a matched step; exits 0 on a match, 1 otherwise
 *   node task-flow-script.mjs step --done  the same for every step the progress marks done
 *   node task-flow-script.mjs plan-check <plan.md>  names every check of the plan in no known
 *                                      form or that is a command of the work; exits 1 on any
 *   node task-flow-script.mjs plan-red  runs every check of the plan of the branch and writes the
 *                                      approval mark when all are red and the owner approved after
 *                                      both roles; the record of the conversation is named by
 *                                      `RT_FLOW_TRANSCRIPT`
 *   node task-flow-script.mjs guard    reads the input of a hook before Edit, Write, MultiEdit or a
 *                                      shell command from stdin and prints the reason of a refusal,
 *                                      or nothing — the hook `flow-step-guard.sh` calls it
 *
 * The tree override `.claude/rt-kit/overrides/task-flow/flow.js` is merged with the description
 * key by key when it lies in the tree and no `--flow` is named; `--override <path>` names another
 * one. `measure` prints every key the override removed, with its reason.
 *
 * A description that does not build is named with its reason, and the engine exits 1: a scenario
 * read from a broken description would measure what nobody wrote.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { evaluateCondition } from './flow-condition.mjs';
import { judgeCall } from './flow-guard.mjs';
import { callOf, guardContext } from './flow-guard-run.mjs';
import { isWriteCommand, saysStop } from './flow-data.mjs';
import { FlowModelError, buildModel } from './flow-model.mjs';
import { overridePath, removedLines } from './flow-override.mjs';
import { planProblems, readRecord, runPlanRed } from './flow-plan.mjs';
import { runStepCommand } from './flow-step.mjs';
import { FlowSyntaxError } from './flow-syntax.mjs';
import { currentStep, holdReason, releaseCase } from './flow-verdict.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

/** Where the description lies: next to the laid-out engine, or in the package. */
export function flowPath(given) {
    if (given) return given;
    const laid = join(HERE, 'task-flow', 'flow.js');
    return existsSync(laid) ? laid : join(HERE, '..', 'task-flow', 'flow.js');
}

/** The lines of `states`. */
export function stateLines(model) {
    return model.states.map((s, i) => `${i + 1}. ${s.title} — ${s.action ?? ''} (${s.pattern ?? ''})`);
}

/** A read the hosting did not answer twice: the error a source throws carries this name. */
const SILENT = 'HostSilent';

/**
 * The measured state: the first state whose exit is known to be unmet. An exit the hosting could not
 * answer is unknown and is passed over, and the exits after it are measured. With no unmet exit and
 * an unknown one, the measured state is the first unknown, and the reason is the silent hosting.
 * With every exit met, the scenario is over.
 *
 * `read(name)` answers a measurer result by its reference and may throw `HostSilent`; a result is
 * read once per measurement. Returns `{ state, index, reason, exits }`, `exits` mapping a state key
 * to `true`, `false` or `'unknown'`.
 */
export function measureStates(model, read) {
    const cache = new Map();
    const measured = (name) => {
        if (!cache.has(name)) cache.set(name, read(name));
        return cache.get(name);
    };
    const exits = {};
    let firstUnknown = null;
    for (const [index, state] of model.states.entries()) {
        let met;
        try {
            met = evaluateCondition(state.exit, measured);
        } catch (error) {
            if (error?.name !== SILENT) throw error;
            exits[state.key] = 'unknown';
            firstUnknown ??= index;
            continue;
        }
        exits[state.key] = met;
        if (!met) return { state: state.title, index: index + 1, reason: null, exits };
    }
    if (firstUnknown !== null) {
        return { state: model.states[firstUnknown].title, index: firstUnknown + 1, reason: 'the hosting did not answer twice', exits };
    }
    return { state: null, index: model.states.length + 1, reason: 'the end of the scenario', exits };
}

/**
 * The sources of a description by name. Every module is loaded first; a source is opened when it is
 * first asked for, so a source not written yet throws only where it is needed. `given` maps a source
 * name to an opened source and replaces its module.
 */
export async function openSources(model, base, given = {}) {
    const modules = {};
    for (const s of model.sources) {
        if (!(s.entry in given)) modules[s.entry] = await import(pathToFileURL(join(base, s.file)).href);
    }
    const opened = { ...given };
    return (name) => {
        if (!(name in opened)) opened[name] = modules[name].open();
        return opened[name];
    };
}

/**
 * The reader of measurer results over the sources of a description. Every module is loaded first,
 * so the measurement itself stays synchronous.
 */
export async function openReaders(model, base, given = {}) {
    const source = await openSources(model, base, given);
    const modules = {};
    for (const m of model.measures) modules[m.entry] = await import(pathToFileURL(join(base, m.file)).href);
    const data = { words: model.words, expect: model.expect, rules: { saysStop, isWriteCommand } };
    const caps = new Map(model.measures.map((m) => [m.entry, m.caps]));
    return (name) => {
        const [, entry, cap] = name.split('.');
        const ports = Object.fromEntries(Object.entries(caps.get(entry)[cap]).map(([port, ref]) => [port, source(ref.path[1])]));
        return modules[entry][cap](ports)(data);
    };
}

const MARK = { true: 'met', false: 'unmet', unknown: 'unknown' };

/** The lines of `measure`: the measured state, what it waits for and the exits read. */
export function measureLines(model, result) {
    const total = model.states.length;
    const lines = [];
    if (result.state === null) lines.push(`state: the end of the scenario (${total} of ${total} met)`);
    else {
        const state = model.states[result.index - 1];
        lines.push(`state: ${result.state} (${result.index} of ${total})`);
        lines.push(`next: ${state.action ?? ''} (${state.pattern ?? ''})`);
        if (result.reason) lines.push(`reason: ${result.reason}`);
    }
    for (const [i, s] of model.states.entries()) {
        if (!(s.key in result.exits)) break;
        lines.push(`  ${i + 1}. ${s.title}: ${MARK[String(result.exits[s.key])]}`);
    }
    return lines;
}

/** The JSON of `measure --json`: the measured state with its action and pattern. */
export function measureJson(model, result) {
    const state = result.state === null ? null : model.states[result.index - 1];
    return { ...result, action: state?.action ?? null, pattern: state?.pattern ?? null };
}

const USAGE = 'usage: node task-flow-script.mjs states | measure [--json] | step <N.M>|--done | plan-check <plan.md> | plan-red | guard | verdict  [--flow <flow.js>]';

/**
 * What the guard guards: where the task folders and the epic plans lie, the tree override, and the
 * description with its engine — in the package and laid out.
 */
const GUARD_SETTINGS = {
    tasksDir: process.env.RT_FLOW_TASKS_DIR || 'docs/tasks',
    plansDir: process.env.RT_FLOW_PLANS_DIR || 'docs/plans',
    overridePath: '.claude/rt-kit/overrides/task-flow/flow.js',
    protectedPaths: [
        '^projects/agent-kit/assets/task-flow/',
        '^tools/task-flow/',
        '(?:^|/)task-flow-script\\.mjs$',
        '^projects/agent-kit/assets/checks/flow-[\\w-]+\\.mjs$',
        '^tools/flow-[\\w-]+\\.mjs$',
    ],
};

/** The verdict of the guard on the hook input from stdin: the reason of a refusal, or null. */
async function runGuard(model, base) {
    const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
    const root = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).stdout?.trim();
    if (!root) return null;
    const call = callOf(input, root);
    if (!call) return null;
    if (input.transcript_path) process.env.RT_FLOW_TRANSCRIPT = input.transcript_path;
    const source = await openSources(model, base);
    const readers = await openReaders(model, base);
    const measure = () => measureStates(model, readers).index;
    const ctx = guardContext({ root, model, marks: source('marks'), owner: source('owner'), measure, settings: GUARD_SETTINGS });
    return judgeCall(call, ctx);
}

/**
 * The verdict at the end of a turn on the Stop input from stdin: `{ release: <log> }` or
 * `{ block: <reason> }` as one JSON line.
 */
async function runVerdict(model, base) {
    const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
    if (input.transcript_path) process.env.RT_FLOW_TRANSCRIPT = input.transcript_path;
    if (input.agent_type) process.env.RT_FLOW_AGENT = input.agent_type;
    const read = await openReaders(model, base);
    const cache = new Map();
    const measured = (name) => {
        if (!cache.has(name)) cache.set(name, read(name));
        return cache.get(name);
    };
    const result = measureStates(model, measured);
    const released = releaseCase(model, measured, result);
    if (released) return { release: released.log ?? released.key };
    const root = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).stdout?.trim();
    const branch = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' }).stdout?.trim();
    const progress = join(root ?? '.', GUARD_SETTINGS.tasksDir, branch ?? '', 'progress.md');
    const step = currentStep(existsSync(progress) ? readFileSync(progress, 'utf8') : null);
    return { block: holdReason(model, result, step) };
}

const COMMANDS = ['states', 'measure', 'step', 'plan-check', 'plan-red', 'guard', 'verdict'];
/** The commands the hooks call: they judge by the package description when the override breaks. */
const HOOK_COMMANDS = ['guard', 'verdict'];

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const args = process.argv.slice(2);
    const at = args.indexOf('--flow');
    const given = at >= 0 ? args.splice(at, 2)[1] : undefined;
    const atOverride = args.indexOf('--override');
    const overrideGiven = atOverride >= 0 ? args.splice(atOverride, 2)[1] : undefined;
    const json = args.includes('--json');
    const [command, target] = args.filter((a) => a !== '--json');
    if (!COMMANDS.includes(command) || ((command === 'step' || command === 'plan-check') && !target)) {
        console.error(USAGE);
        process.exit(2);
    }
    try {
        const path = flowPath(given);
        const override = overridePath(overrideGiven, given);
        let model;
        try {
            model = buildModel(path, { override });
        } catch (error) {
            // A broken override does not lift the hooks: the guard protects the override itself, and
            // the exit check must not release a turn because a tree file does not build.
            if (!override || !HOOK_COMMANDS.includes(command)) throw error;
            console.error(`task-flow-script: the override does not build, the hook judges by the package description — ${error.message}`);
            model = buildModel(path);
        }
        if (command === 'states') console.log(stateLines(model).join('\n'));
        else if (command === 'step') {
            const source = await openSources(model, dirname(path));
            const sources = { git: source('git'), steps: source('steps'), marks: source('marks'), owner: source('owner') };
            process.exit(runStepCommand(sources, model, target));
        } else if (command === 'plan-check') {
            const source = await openSources(model, dirname(path));
            const problems = planProblems(readFileSync(target, 'utf8'), source('steps'), model);
            for (const problem of problems) console.log(`plan-check: ${problem}`);
            process.exit(problems.length > 0 ? 1 : 0);
        } else if (command === 'verdict') {
            console.log(JSON.stringify(await runVerdict(model, dirname(path))));
        } else if (command === 'guard') {
            console.log((await runGuard(model, dirname(path))) ?? '');
        } else if (command === 'plan-red') {
            const source = await openSources(model, dirname(path));
            const sources = { git: source('git'), steps: source('steps'), marks: source('marks') };
            process.exit(runPlanRed(sources, model, readRecord(process.env.RT_FLOW_TRANSCRIPT)));
        } else {
            const result = measureStates(model, await openReaders(model, dirname(path)));
            console.log(json ? JSON.stringify(measureJson(model, result)) : [...measureLines(model, result), ...removedLines(model)].join('\n'));
        }
    } catch (error) {
        if (error instanceof FlowSyntaxError) {
            console.log(`flow syntax: ${error.message}`);
            process.exit(1);
        }
        if (!(error instanceof FlowModelError)) throw error;
        console.log(`flow model: ${error.message}`);
        process.exit(1);
    }
}
