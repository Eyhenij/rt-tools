#!/usr/bin/env node
/**
 * The engine of the task flow: reads the description `flow.js` through the model and answers about
 * the scenario. The description lies next to the engine as `task-flow/flow.js` where the engine is
 * laid out, and as `../task-flow/flow.js` in the package; `--flow <path>` names another one.
 *
 *   node task-flow-script.mjs states   the states of the scenario in their order, a line each:
 *                                      `<n>. <title> — <action> (<pattern>)`
 *
 * A description that does not build is named with its reason, and the engine exits 1: a scenario
 * read from a broken description would measure what nobody wrote.
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { evaluateCondition } from './flow-condition.mjs';
import { FlowModelError, buildModel } from './flow-model.mjs';
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const args = process.argv.slice(2);
    const at = args.indexOf('--flow');
    const given = at >= 0 ? args.splice(at, 2)[1] : undefined;
    const [command] = args;
    if (command !== 'states') {
        console.error('usage: node task-flow-script.mjs states [--flow <flow.js>]');
        process.exit(2);
    }
    try {
        const model = buildModel(flowPath(given));
        console.log(stateLines(model).join('\n'));
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
