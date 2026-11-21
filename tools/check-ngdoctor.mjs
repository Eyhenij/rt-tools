#!/usr/bin/env node
/**
 * The check that the Angular Doctor result of the tree equals the threshold written next to it,
 * in `tools/ngdoctor-threshold.json`.
 *
 * Angular Doctor (the npm package `@abiramcodes/angular-doctor`) scans the Angular code of the tree
 * and gives a score from 0 to 100 and a list of findings. The epic RT-3476 brings the tree to no
 * findings; until then every task of it writes the result it reached.
 *
 * The score alone is blind to most new findings: it charges an error rule once per file and a
 * warning rule once in all, and info not at all. Four totals are blind to a swap — one finding
 * fixed and another added. So the threshold is the score with the count of findings of every
 * rule, and all of them are compared. A swap inside one rule stays unseen; the epic removes rules
 * whole, and a rule gone shows.
 *
 * The verdict is equality, not "at least". A worse result means a new finding. A better one means a
 * fix whose task did not write the threshold — and a threshold left below the result lets the next
 * finding hide in the gap between them.
 *
 * A degraded run is red whatever the numbers, and `--write` refuses it. The tool drops the findings
 * of a subsystem that did not start: it says so in `skippedChecks` when it notices, and says nothing
 * when oxlint printed nothing at all. So a source of findings — the tool itself, oxlint, the
 * template linter — that the threshold holds and the run lacks is a degraded run too, as is a run
 * that scanned fewer files than it found. A source whose last finding a task really removed is
 * written by `--write --source-gone <source>`.
 *
 * Every file the tool reads is counted, ignored by git or not: the owner chose to fit the code
 * rather than narrow the check. A task that adds a model to the storage schema adds a generated
 * file and its finding, and writes the threshold.
 *
 * The tool is run here, not piped in: with a temporary directory of its own, removed after the run,
 * because the tool writes its oxlint settings into the shared temporary directory once and reads
 * them from there in every later run of any version.
 *
 *   node tools/check-ngdoctor.mjs                        run the tool and judge the result
 *   node tools/check-ngdoctor.mjs --write                run the tool and write the threshold
 *   node tools/check-ngdoctor.mjs --input <json> [--threshold <json>]   judge a saved output
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const THRESHOLD_FILE = join(ROOT, 'tools', 'ngdoctor-threshold.json');

/** The value of a flag that takes one. */
function flag(name) {
    const at = process.argv.indexOf(name);
    return at === -1 ? null : (process.argv[at + 1] ?? null);
}

/** The JSON text of a run of the tool, with its own temporary directory; `null` text on a failure. */
function runTool() {
    const own = mkdtempSync(join(tmpdir(), 'ngdoctor-'));
    try {
        const run = spawnSync('pnpm', ['run', '-s', 'ngdoctor', '--json'], {
            cwd: ROOT,
            env: { ...process.env, TMPDIR: own },
            encoding: 'utf8',
            maxBuffer: 256 * 1024 * 1024,
        });
        if (run.error || run.status !== 0) {
            return { text: null, why: `angular-doctor did not finish: ${run.error?.message ?? `exit ${run.status}`} ${(run.stderr ?? '').trim()}` };
        }
        return { text: run.stdout, why: null };
    } finally {
        rmSync(own, { recursive: true, force: true });
    }
}

/** The result of a run: the score and the count of findings by rule, or the reason it is no result. */
function resultOf(text) {
    let report;
    try {
        report = JSON.parse(text);
    } catch {
        return { problem: 'the output of angular-doctor is not JSON — the scan failed or printed nothing' };
    }
    if (typeof report?.score !== 'number' || !Number.isFinite(report.score)) return { problem: 'the output of angular-doctor carries no score' };
    if (!Array.isArray(report.diagnostics)) return { problem: 'the output of angular-doctor carries no list of findings' };
    const rules = {};
    for (const d of report.diagnostics) {
        if (typeof d?.ruleId !== 'string') return { problem: 'a finding of angular-doctor carries no rule' };
        rules[d.ruleId] = (rules[d.ruleId] ?? 0) + 1;
    }
    const skipped = Array.isArray(report.skippedChecks) ? report.skippedChecks : [];
    const partial =
        Number.isInteger(report.filesScanned) && Number.isInteger(report.filesTotal) && report.filesScanned < report.filesTotal
            ? [`scanned ${report.filesScanned} files of ${report.filesTotal}`]
            : [];
    return { score: report.score, rules: Object.fromEntries(Object.entries(rules).sort(([a], [b]) => a.localeCompare(b))), degraded: [...skipped, ...partial] };
}

/** The source of a rule: the part of its id before the slash. */
const sourceOf = (rule) => rule.split('/')[0];

/** The sources the threshold holds and the result lacks, apart from those named gone. */
function silentSources(result, threshold, gone = []) {
    const had = new Set(Object.keys(threshold.rules).map(sourceOf));
    const has = new Set(Object.keys(result.rules).map(sourceOf));
    return [...had].filter((s) => !has.has(s) && !gone.includes(s));
}

/**
 * The verdict on a result against a threshold. Returns `{ ok, lines }`: `lines` are printed in
 * order, and on a green verdict the last of them is «score N = threshold N».
 */
function verdict(result, threshold) {
    if (result.problem) return { ok: false, lines: [`check-ngdoctor: ${result.problem}`] };
    const silent = silentSources(result, threshold);
    if (result.degraded.length > 0 || silent.length > 0) {
        return {
            ok: false,
            lines: [
                'check-ngdoctor: a degraded run of angular-doctor, its numbers say nothing:',
                ...result.degraded.map((s) => `  ${s}`),
                ...silent.map((s) => `  the source «${s}» gave no finding, and the threshold holds its findings`),
            ],
        };
    }
    const names = [...new Set([...Object.keys(threshold.rules), ...Object.keys(result.rules)])].sort();
    const more = names.filter((r) => (result.rules[r] ?? 0) > (threshold.rules[r] ?? 0));
    const fewer = names.filter((r) => (result.rules[r] ?? 0) < (threshold.rules[r] ?? 0));
    const line = (r) => `  ${r}: ${threshold.rules[r] ?? 0} → ${result.rules[r] ?? 0}`;
    const total = Object.values(result.rules).reduce((a, b) => a + b, 0);
    if (more.length > 0 || result.score < threshold.score) {
        return {
            ok: false,
            lines: [
                `check-ngdoctor: new findings — score ${threshold.score} → ${result.score}`,
                ...more.map(line),
                'the files and lines: `node tools/check-ngdoctor.mjs --verbose`',
            ],
        };
    }
    if (fewer.length > 0 || result.score !== threshold.score) {
        return {
            ok: false,
            lines: [
                `check-ngdoctor: the result is better than the threshold — score ${threshold.score} → ${result.score}`,
                ...fewer.map(line),
                'the work removed findings: write the threshold by `node tools/check-ngdoctor.mjs --write`',
            ],
        };
    }
    const shown = Math.round(result.score);
    return {
        ok: true,
        lines: [`check-ngdoctor: score ${result.score}, ${total} findings of ${names.length} rules — equal to the threshold`, `score ${shown} = threshold ${shown}`],
    };
}

/** The findings of the rules whose count grew, with their files and lines, from the output text. */
function newFindingsOf(text, threshold, result) {
    const grew = new Set(Object.keys(result.rules).filter((r) => result.rules[r] > (threshold.rules[r] ?? 0)));
    return JSON.parse(text)
        .diagnostics.filter((d) => grew.has(d.ruleId))
        .map((d) => `  ${d.ruleId} ${String(d.file).replace(`${ROOT}/`, '')}:${d.line} — ${d.message}`);
}

function main() {
    const input = flag('--input');
    const { text, why } = input ? { text: readFileSync(input, 'utf8'), why: null } : runTool();
    if (text === null) {
        console.error(`check-ngdoctor: ${why}`);
        return 1;
    }
    const result = resultOf(text);
    const thresholdPath = flag('--threshold') ?? THRESHOLD_FILE;
    const threshold = existsSync(thresholdPath) ? JSON.parse(readFileSync(thresholdPath, 'utf8')) : { score: 0, rules: {} };

    if (process.argv.includes('--write')) {
        if (result.problem) {
            console.error(`check-ngdoctor: ${result.problem}; nothing written`);
            return 1;
        }
        const gone = flag('--source-gone') ? [flag('--source-gone')] : [];
        const silent = silentSources(result, threshold, gone);
        if (result.degraded.length > 0 || silent.length > 0) {
            console.error('check-ngdoctor: a degraded run is not written as the threshold:');
            for (const s of [...result.degraded, ...silent.map((x) => `the source «${x}» gave no finding — if a task removed its last one, add --source-gone ${x}`)]) {
                console.error(`  ${s}`);
            }
            return 1;
        }
        writeFileSync(thresholdPath, `${JSON.stringify({ score: result.score, rules: result.rules }, null, 2)}\n`); // the indent the formatter gives JSON here
        console.log(`check-ngdoctor: the threshold is written — score ${result.score}, ${Object.keys(result.rules).length} rules`);
        return 0;
    }

    const { ok, lines } = verdict(result, threshold);
    for (const l of lines) (ok ? console.log : console.error)(l);
    if (!ok && !result.problem && process.argv.includes('--verbose')) {
        for (const l of newFindingsOf(text, threshold, result)) console.error(l);
    }
    return ok ? 0 : 1;
}

process.exit(main());
