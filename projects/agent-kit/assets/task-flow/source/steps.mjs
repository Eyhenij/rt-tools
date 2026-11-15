/**
 * The source «source.steps» of the task flow description: the parsing of the steps of a plan and of
 * a progress, by the module every reader of both lists shares — `work-steps-lib.mjs`. A measurer
 * imports nothing outside its directory, so the parsing reaches it through this port.
 *
 *   ofPlan(text)      [{ number, name }] — the steps of the plan in their order
 *   ofProgress(text)  { steps: [{ mark, number, name }], declared } — the steps of the progress
 *   checks(text)      [{ number, command, expected }] — the check line under each step of the plan;
 *                     a step without one has `command` and `expected` null
 *
 * The parsing module lies next to the laid-out engine one level up, and in the package in the
 * directory of the checks.
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const LIB = [join(HERE, '..', '..', 'work-steps-lib.mjs'), join(HERE, '..', '..', 'checks', 'work-steps-lib.mjs')].find((p) => existsSync(p));
const lib = LIB ? await import(pathToFileURL(LIB).href) : null;

const STEP = /^\s+(\d+)\.\s+(.+?)\s*$/;
const STAGE = /^###\s+(\d+)\./;
const CHECK = /^\s+(?:Проверка|Check):\s+`(.+)`\s+→\s+(.+?)\s*$/;

/** The check line under each step: the step line, then `Проверка: `<command>` → <expected>`. */
function checks(text) {
    const found = [];
    let stage = null;
    let last = null;
    for (const line of text.split('\n')) {
        const heading = line.match(STAGE);
        if (heading) {
            stage = heading[1];
            last = null;
            continue;
        }
        const check = line.match(CHECK);
        if (check && last) {
            last.command = check[1];
            last.expected = check[2];
            last = null;
            continue;
        }
        const step = stage && line.match(STEP);
        if (step && !CHECK.test(line)) {
            last = { number: `${stage}.${step[1]}`, command: null, expected: null };
            found.push(last);
        }
    }
    const planned = new Set(lib ? lib.stepsOfPlan(text).map((s) => s.number) : found.map((s) => s.number));
    return found.filter((s) => planned.has(s.number));
}

export function open() {
    if (!lib) throw new Error('source.steps: work-steps-lib.mjs lies neither next to the engine nor in the package');
    return { ofPlan: lib.stepsOfPlan, ofProgress: lib.stepsOfProgress, checks };
}
