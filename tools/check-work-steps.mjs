#!/usr/bin/env node
// rt-kit v0.39.1 · checks/check-work-steps.mjs · d4af1c24c876 · правится надстройкой, не здесь
/**
 * The check that the steps of the progress match the steps of the plan.
 *
 * The plan holds the steps and is not edited after it is written; the progress holds the same list
 * with a mark on every step and is rewritten by every turn that moves the work. Two lists in two
 * files diverge silently: the progress names three steps where the plan named seven, and the guard
 * counting what is not done counts three. Nothing else reads both files, so nothing else sees it.
 *
 * Three things are judged, and each of them is a divergence on its own:
 *   the set    — the same step numbers, in the same order;
 *   the names  — copied from the plan word for word, not reworded;
 *   the marks  — exactly one step going on right now, while any step is not done yet.
 *
 * The parsing of both lists lives in `work-steps-lib.mjs`: the engine of the task flow reads the
 * same steps, and two parsers of one format diverge silently.
 *
 * FAIL-OPEN: no task folder, no plan in it, or a plan that names no steps — a zero code. A tree
 * that has not started writing steps is not refused: the requirement arrives with the sample of the
 * plan, and the folders written before it stay lawful. A plan whose step names still stand as the
 * sample wrote them — in angle brackets — is not judged either: that is the sample itself and a
 * folder just copied from it. A progress that carries the section of steps while the plan carries
 * none is a divergence: the list was written from the head.
 *
 * A non-zero exit code and the list of divergences.
 */
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';
import { judge } from './work-steps-lib.mjs';

const TASKS = CONFIG.tasksDir ? join(ROOT, CONFIG.tasksDir) : '';

if (!TASKS || !existsSync(TASKS)) {
    console.log('check-work-steps: the tree has no task folders — there is nothing to check');
    process.exit(0);
}

const found = [];
let counted = 0;

for (const entry of readdirSync(TASKS, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
        continue;
    }

    const folder = join(TASKS, entry.name);
    const problems = judge(folder);

    counted += 1;

    for (const problem of problems) {
        found.push(`${entry.name}: ${problem}`);
    }
}

if (found.length > 0) {
    console.error(`check-work-steps: divergences ${found.length}`);

    for (const problem of found) {
        console.error(`  ${problem}`);
    }

    console.error('\nThe steps are written in the plan and mirrored in the progress with a mark each: the numbers and the names are copied, not reworded.');
    process.exit(1);
}

console.log(`check-work-steps: task folders ${counted}, the steps of the plan and of the progress match`);
