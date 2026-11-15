#!/usr/bin/env node
// rt-kit v0.37.0 · checks/task-flow-script.mjs · b22d0f9dff10 · правится надстройкой, не здесь
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
