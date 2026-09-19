#!/usr/bin/env node
// rt-kit v0.29.0 · checks/check-spec-coverage.mjs · 05e9f9c24729 · правится надстройкой, не здесь
/**
 * The check that no resource of the package leaves without a spec.
 *
 * The measure existed before this check and answered zero whatever it found: the entry into the
 * specs, called without a name, prints the gaps and leaves with a success. A number nobody refuses
 * on is read once, by whoever asked, and never again — a resource added without a spec reached the
 * package in silence, and the complaint about it had nothing to be checked against.
 *
 * The reading is not written a second time here. The list is asked from the very command that
 * prints it: a reader of its own would diverge from the printed list without a word, and the two
 * answers about one and the same tree would then disagree.
 *
 * FAIL-OPEN: a tree that declared no directories of package sources is not judged — it holds laid-
 * out copies, and demanding a spec of someone else's package from it is demanding the impossible.
 * The check says so aloud rather than staying silent: silence reads as "nothing found".
 *
 * A non-zero exit code and the list of the uncovered.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

/** Where the checks of the tree lie: the entry into the specs is called from there. */
const CHECKS = CONFIG.layout?.checks ?? 'tools';

/** The name of the entry as it lies in the tree. */
const ENTRY = join(ROOT, CHECKS, 'specs-for.mjs');

if (!Array.isArray(CONFIG.portableDirs) || CONFIG.portableDirs.length === 0) {
    console.log('check-spec-coverage: the tree declares no directories of package sources — there is nothing to judge');
    process.exit(0);
}

if (!existsSync(ENTRY)) {
    console.log(`check-spec-coverage: the entry into the specs is not laid out (${CHECKS}/specs-for.mjs) — there is nothing to ask with`);
    process.exit(0);
}

const asked = spawnSync(process.execPath, [ENTRY], { cwd: ROOT, encoding: 'utf8' });

if (asked.status !== 0) {
    console.error('check-spec-coverage: the entry into the specs answered with a failure — the list of the uncovered could not be read');
    process.exit(1);
}

const uncovered = asked.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

if (uncovered.length > 0) {
    console.error(`check-spec-coverage: resources no spec speaks of ${uncovered.length}`);

    for (const path of uncovered) {
        console.error(`  ${path}`);
    }

    console.error('\nA resource is described by a spec of its kind before it leaves with the package: a complaint about it is checked against that spec and against nothing else.');
    process.exit(1);
}

console.log('check-spec-coverage: every resource the package carries is spoken of by a spec');
