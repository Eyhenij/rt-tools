#!/usr/bin/env node
/**
 * The check that the Angular Doctor result of the tree equals the threshold written here.
 *
 * Angular Doctor (the npm package `@abiramcodes/angular-doctor`) scans the Angular code of the tree
 * and gives a score from 0 to 100: an error rule costs 1.5 in every file where it fires, a warning
 * rule costs 0.75 once, info costs nothing. The epic RT-3476 brings the tree to no findings; until
 * then every task of it writes the result it reached.
 *
 * The score alone is blind to most new findings: a second warning of a rule that already fires,
 * a second error of a rule in a file where it already fires and any info leave it as it was. So
 * the threshold is the score together with the count of errors, warnings and info, and all four
 * are compared.
 *
 * The verdict is equality, not "at least". A worse result means a new finding. A better one means a
 * fix whose task did not write the new threshold — and a threshold left below the result lets the
 * next finding hide in the gap between them.
 *
 * A run in which the tool skipped a part of its checks is red whatever the numbers: the tool drops
 * the findings of a subsystem that did not start (oxlint, the template linter), writes the reason
 * into `skippedChecks` and exits 0, and the better score it prints would read as a fix.
 *
 * The score is compared exactly, as the JSON of the tool carries it (32.5). The last line prints it
 * the way the tool itself shows it to a person — rounded, as `--score-only` and the report do.
 *
 * The JSON comes on stdin: `angular-doctor --json | node tools/check-ngdoctor.mjs`. An empty or
 * broken input, or one without a score, is red: a tool that failed must not read as a clean tree.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/** The result the tree reached; the task that changes it writes the new one here. */
export const THRESHOLD = { score: 32.5, error: 74, warning: 1186, info: 200 };

/** The four numbers of a result, in the words of a line. */
const describe = (r) => `score ${r.score}, errors ${r.error}, warnings ${r.warning}, info ${r.info}`;

/** Whether `a` is a worse result than `b`: a lower score or more of any kind of finding. */
const worse = (a, b) => a.score < b.score || a.error > b.error || a.warning > b.warning || a.info > b.info;

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
    const skipped = Array.isArray(report.skippedChecks) ? report.skippedChecks : [];
    if (skipped.length > 0) {
        return {
            ok: false,
            lines: ['check-ngdoctor: angular-doctor skipped a part of its checks, and its numbers say nothing:', ...skipped.map((s) => `  ${s}`)],
        };
    }
    const totals = report.totals ?? {};
    const got = { score, error: totals.error, warning: totals.warning, info: totals.info };
    if (![got.error, got.warning, got.info].every(Number.isInteger)) {
        return { ok: false, lines: ['check-ngdoctor: the output of angular-doctor carries no count of errors, warnings and info'] };
    }
    const same = got.score === threshold.score && got.error === threshold.error && got.warning === threshold.warning && got.info === threshold.info;
    if (!same && worse(got, threshold)) {
        return {
            ok: false,
            lines: [
                `check-ngdoctor: the result is worse than the threshold — got ${describe(got)}; threshold ${describe(threshold)}`,
                'a new finding appeared: `pnpm exec angular-doctor --verbose` names it',
            ],
        };
    }
    if (!same) {
        return {
            ok: false,
            lines: [
                `check-ngdoctor: the result differs from the threshold — got ${describe(got)}; threshold ${describe(threshold)}`,
                `the work changed the result: write THRESHOLD = { score: ${got.score}, error: ${got.error}, warning: ${got.warning}, info: ${got.info} } in tools/check-ngdoctor.mjs`,
            ],
        };
    }
    const shown = Math.round(score);
    return { ok: true, lines: [`check-ngdoctor: ${describe(got)} — equal to the threshold`, `score ${shown} = threshold ${shown}`] };
}

const isMain = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
    const { ok, lines } = verdict(readFileSync(0, 'utf8'), THRESHOLD);
    for (const line of lines) (ok ? console.log : console.error)(line);
    process.exit(ok ? 0 : 1);
}
