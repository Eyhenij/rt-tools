// rt-kit v0.40.0 · task-flow/source/design.mjs · 36738380c4b2 · правится надстройкой, не здесь
/**
 * The source «source.design» of the task flow description: the reading of the decision of a plan, by
 * the modules every reader of it shares — `flow-decision.mjs` and `coupling-plan.mjs`. A measurer
 * imports nothing outside its directory, so the reading reaches it through this port.
 *
 *   rows(text)         { state, reason, rows } — the decision of a plan; `absent` where no reading is laid out
 *   suites(paths)      those of the paths that are suites of tests
 *   links(text, files) path → { was, now } — the outgoing links a text promises, a short path by `files`
 *   decisions(text)    the sections of the decisions of a progress
 *
 * The modules lie next to the laid-out engine one level up, and in the package in the directory of the
 * checks.
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ABOVE = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const load = async (name) => {
    const file = [join(ABOVE, name), join(ABOVE, 'checks', name)].find((path) => existsSync(path));
    return file ? await import(pathToFileURL(file).href) : null;
};
const decision = await load('flow-decision.mjs');
const coupling = await load('coupling-plan.mjs');

/** The one definition of a suite is the one the row of input is read by. */
const suites = (paths) => {
    const cell = paths.map((path) => `\`${path}\``).join(' ');
    return decision?.decisionRows(`## Decision\n\n| Input | ${cell} |\n`).rows[0]?.suites ?? [];
};

export function open() {
    return {
        rows: (text) => decision?.decisionRows(text) ?? { state: 'absent', reason: null, rows: [] },
        suites,
        links: (text, files) => coupling?.namedOf(text, new Map(files.map((file) => [file, file])), { pairs: true }) ?? new Map(),
        decisions: (text) => coupling?.decisionsOf(text) ?? '',
    };
}
