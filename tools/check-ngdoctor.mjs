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
 * A source the threshold no longer holds is silent unseen by the tree's run. So before the verdict
 * the tool runs on a probe — a one-component project written into the temporary directory, outside
 * the tree's scan — and every source must fire its named rule there: the tool itself
 * `missing-spec-file` (a file rule: `project-layout` fires on the probe even when the file rules
 * are silent), oxlint `eqeqeq`, the template linter `button-has-type`. The probe's own run is judged
 * degraded the same way as the tree's. A red probe means the source does not start, or the version
 * of the tool dropped the rule and the probe is to be updated; `--write` refuses it too. The probe
 * shows that a source starts, not that it passed every file of the tree: oxlint that fails on one
 * file of the tree and prints nothing stays unseen here.
 *
 * The tool is run here, not piped in: with a temporary directory of its own, removed after the run,
 * because the tool writes its oxlint settings into the shared temporary directory once and reads
 * them from there in every later run of any version.
 *
 *   node tools/check-ngdoctor.mjs                        run the probe and the tool, judge the result
 *   node tools/check-ngdoctor.mjs --write                the same, then write the threshold
 *   node tools/check-ngdoctor.mjs --input <json> [--threshold <json>]   judge a saved output, no probe
 *     --probe-input <json>                               judge a saved output of the probe as well
 *     --probe-real [--probe-omit <source>]               run the real probe, without the construct
 *                                                        of the named source
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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

/** The rule each source of findings must fire on the probe. */
const PROBE_RULES = {
    'angular-doctor': 'angular-doctor/missing-spec-file',
    oxlint: 'oxlint/eqeqeq',
    'template-eslint': 'template-eslint/button-has-type',
};

/** The JSON text of a run of the tool, with its own temporary directory; `null` text on a failure. */
function runTool(own, args) {
    const run = spawnSync('pnpm', ['run', '-s', 'ngdoctor', '--json', ...args], {
        cwd: ROOT,
        env: { ...process.env, TMPDIR: own },
        encoding: 'utf8',
        maxBuffer: 256 * 1024 * 1024,
    });
    if (run.error || run.status !== 0) {
        return { text: null, why: `angular-doctor did not finish: ${run.error?.message ?? `exit ${run.status}`} ${(run.stderr ?? '').trim()}` };
    }
    return { text: run.stdout, why: null };
}

/** A run of the tool in a temporary directory of its own, removed after it. */
function withOwnTmp(run) {
    const own = mkdtempSync(join(tmpdir(), 'ngdoctor-'));
    try {
        return run(own);
    } finally {
        rmSync(own, { recursive: true, force: true });
    }
}

/** The version a manifest gives: its own, or that of the named dependency. */
function versionOf(manifest, name) {
    const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
    return (name ? (pkg.dependencies?.[name] ?? pkg.devDependencies?.[name]) : pkg.version) ?? '';
}

const TOOL_VERSION = versionOf(join(ROOT, 'node_modules', '@abiramcodes', 'angular-doctor', 'package.json'));

/**
 * Writes the probe into a directory of its own inside `own` and returns its path: one component
 * without a spec, a button without a type, a loose comparison. `omit` drops the construct of one
 * source, so that the real probe can be seen red.
 */
function writeProbe(own, omit) {
    const dir = join(own, 'probe');
    mkdirSync(join(dir, 'src', 'app'), { recursive: true });
    const angular = versionOf(join(ROOT, 'package.json'), '@angular/core');
    writeFileSync(join(dir, 'angular.json'), JSON.stringify({ version: 1, projects: { probe: { root: '', sourceRoot: 'src', projectType: 'application' } } }));
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'probe', version: '0.0.0', dependencies: { '@angular/core': angular } }));
    const button = omit === 'template-eslint' ? '<button type="button" (click)="press()">press</button>' : '<button (click)="press()">press</button>';
    const compare = omit === 'oxlint' ? '===' : '==';
    writeFileSync(
        join(dir, 'src', 'app', 'probe.component.ts'),
        [
            "import { Component } from '@angular/core';",
            '',
            `@Component({ selector: 'app-probe', template: '${button}' })`,
            'export class ProbeComponent {',
            '    public value: string | null = null;',
            '',
            '    public press(): boolean {',
            `        return this.value ${compare} null;`,
            '    }',
            '}',
            '',
        ].join('\n'),
    );
    if (omit === 'angular-doctor') {
        writeFileSync(join(dir, 'src', 'app', 'probe.component.spec.ts'), "import { ProbeComponent } from './probe.component';\n\nexport const probe: ProbeComponent = new ProbeComponent();\n");
    }
    return dir;
}

/** The JSON text of the tool's run on the probe. */
function runProbe(omit) {
    return withOwnTmp((own) => runTool(own, [writeProbe(own, omit)]));
}

/** What the probe says against the sources: an empty list when every source fired its rule. */
function probeFailures(text) {
    const result = resultOf(text);
    if (result.problem) return [`the probe: ${result.problem}`];
    const missed = Object.entries(PROBE_RULES)
        .filter(([, rule]) => !result.rules[rule])
        .map(
            ([source, rule]) =>
                `the probe: the source «${source}» did not fire ${rule} at angular-doctor ${TOOL_VERSION} — either the source does not start, or the version dropped the rule and the probe is to be updated`,
        );
    return [...result.degraded.map((s) => `the probe: ${s}`), ...missed];
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

/**
 * The probe's verdict: `null` when the probe is not run (a saved output without probe flags), else
 * `{ ok, lines }`.
 */
function probeVerdict(input) {
    const probeInput = flag('--probe-input');
    if (input && !probeInput && !process.argv.includes('--probe-real')) return null;
    const { text, why } = probeInput ? { text: readFileSync(probeInput, 'utf8'), why: null } : runProbe(flag('--probe-omit'));
    const failures = text === null ? [`the probe: ${why}`] : probeFailures(text);
    if (failures.length > 0) {
        return { ok: false, lines: ['check-ngdoctor: a source of findings does not run on the probe, the result says nothing:', ...failures.map((s) => `  ${s}`)] };
    }
    return { ok: true, lines: [`check-ngdoctor: the sources ${Object.keys(PROBE_RULES).join(', ')} run — the probe fired ${Object.values(PROBE_RULES).join(', ')}`] };
}

function main() {
    const input = flag('--input');
    const probe = probeVerdict(input);
    if (probe && !probe.ok) {
        for (const l of probe.lines) console.error(l);
        if (process.argv.includes('--write')) console.error('check-ngdoctor: nothing written');
        return 1;
    }
    const { text, why } = input ? { text: readFileSync(input, 'utf8'), why: null } : withOwnTmp((own) => runTool(own, []));
    if (text === null) {
        console.error(`check-ngdoctor: ${why}`);
        return 1;
    }
    if (probe) console.log(probe.lines[0]);
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
