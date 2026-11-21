#!/usr/bin/env node
/**
 * The check that the Angular Doctor score of the tree equals the threshold written here.
 *
 * Angular Doctor (the npm package `@abiramcodes/angular-doctor`) scans the Angular code of the tree
 * and gives a score from 0 to 100: an error rule costs 1.5 in every file where it fires, a warning
 * rule costs 0.75 once. The epic RT-3476 brings the score to 100; until then every task of it
 * raises the threshold to the score it reached.
 *
 * The verdict is equality, not "at least". A lower score means a new finding. A higher one means a
 * fix whose task did not raise the threshold — and a threshold left below the score lets the next
 * finding hide in the gap between them.
 *
 * The score is compared exactly, as the JSON of the tool carries it (32.5). The last line prints it
 * the way the tool itself shows it to a person — rounded, `--score-only` and the report print 33.
 *
 * The JSON comes on stdin: `angular-doctor --json | node tools/check-ngdoctor.mjs`. An empty or
 * broken input, or one without a score, is red: a tool that failed must not read as a clean tree.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/** The score the tree reached; the task that changes the score writes the new one here. */
export const THRESHOLD = 32.5;

/**
 * The verdict on the text the tool printed. Returns `{ ok, lines }`: `lines` are printed in order,
 * and on a green verdict the last of them is «score N = threshold N».
 */
export function verdict(text, threshold) {
    let report;
    try {
        report = JSON.parse(text);
    } catch {
        return { ok: false, lines: ['check-ngdoctor: the output of angular-doctor is not JSON — the scan failed or printed nothing'] };
    }
    const score = report?.score;
    if (typeof score !== 'number' || !Number.isFinite(score)) {
        return { ok: false, lines: ['check-ngdoctor: the output of angular-doctor carries no score'] };
    }
    const totals = report.totals ?? {};
    const counts = `errors ${totals.error ?? '?'}, warnings ${totals.warning ?? '?'}, info ${totals.info ?? '?'}`;
    if (score < threshold) {
        return {
            ok: false,
            lines: [
                `check-ngdoctor: score ${score} is below the threshold ${threshold} — ${counts}`,
                'a new finding appeared: `pnpm exec angular-doctor --verbose` names it',
            ],
        };
    }
    if (score > threshold) {
        return {
            ok: false,
            lines: [
                `check-ngdoctor: score ${score} is above the threshold ${threshold} — ${counts}`,
                `the work raised the score: write THRESHOLD = ${score} in tools/check-ngdoctor.mjs`,
            ],
        };
    }
    const shown = Math.round(score);
    return { ok: true, lines: [`check-ngdoctor: exact score ${score}, threshold ${threshold} — ${counts}`, `score ${shown} = threshold ${shown}`] };
}

const isMain = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
    const { ok, lines } = verdict(readFileSync(0, 'utf8'), THRESHOLD);
    for (const line of lines) (ok ? console.log : console.error)(line);
    process.exit(ok ? 0 : 1);
}
