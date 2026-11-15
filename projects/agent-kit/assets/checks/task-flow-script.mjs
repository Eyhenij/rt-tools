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
 *
 * A description that does not build is named with its reason, and the engine exits 1: a scenario
 * read from a broken description would measure what nobody wrote.
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { evaluateCondition } from './flow-condition.mjs';
import { FlowModelError, buildModel } from './flow-model.mjs';
import { runStepCommand } from './flow-step.mjs';
import { FlowSyntaxError } from './flow-syntax.mjs';

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
    const data = { words: model.words, expect: model.expect };
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

const USAGE = 'usage: node task-flow-script.mjs states | measure [--json] | step <N.M>|--done  [--flow <flow.js>]';

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const args = process.argv.slice(2);
    const at = args.indexOf('--flow');
    const given = at >= 0 ? args.splice(at, 2)[1] : undefined;
    const json = args.includes('--json');
    const [command, target] = args.filter((a) => a !== '--json');
    if (!['states', 'measure', 'step'].includes(command) || (command === 'step' && !target)) {
        console.error(USAGE);
        process.exit(2);
    }
    try {
        const path = flowPath(given);
        const model = buildModel(path);
        if (command === 'states') console.log(stateLines(model).join('\n'));
        else if (command === 'step') {
            const source = await openSources(model, dirname(path));
            const sources = { git: source('git'), steps: source('steps'), marks: source('marks'), owner: source('owner') };
            process.exit(runStepCommand(sources, model, target));
        } else {
            const result = measureStates(model, await openReaders(model, dirname(path)));
            console.log(json ? JSON.stringify(measureJson(model, result)) : measureLines(model, result).join('\n'));
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
