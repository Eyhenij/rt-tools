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
 * The tree's settings of the tool hold `reportPath` and nothing else, and any other field is red: a
 * rule switched off or a path ignored there would hide findings from the threshold and the probe
 * alike.
 *
 * Every file the tool reads is counted, ignored by git or not: the owner chose to fit the code
 * rather than narrow the check. A task that adds a model to the storage schema adds a generated
 * file and its finding, and writes the threshold.
 *
 * A source the threshold no longer holds is silent unseen by the tree's run. So before the verdict
 * the tool runs on a probe — a two-component project written into the temporary directory, outside
 * the tree's scan — and every source must fire its named rule in the named file there. The tool
 * itself fires `missing-spec-file` on a class (a file rule: `project-layout` fires on the probe even
 * when the file rules are silent) and `getter-in-template` both in an inline and in an external
 * template; oxlint fires `eqeqeq`; the template linter fires `button-has-type` in both templates
 * too, because the tool reads the two by separate passes. The probe's own run is judged
 * degraded the same way as the tree's. A red probe means the source does not start, or the version
 * of the tool dropped the rule and the probe is to be updated; `--write` refuses it too. A saved
 * output given by `--input` is judged without the probe unless a probe flag comes with it; a source
 * is written away by `--source-gone` only beside a probe that shows the source running. The probe
 * shows that a source starts, not that it passed every file of the tree.
 *
 * The tool loses one file of the tree silently three ways: oxlint that fails on a file prints
 * nothing, and the tool reads that as no findings; a template the linter cannot parse yields a
 * message without a rule, and the tool drops it; a file it cannot read is skipped — version 0.3.0
 * writes `filesScanned` and `filesTotal` as the same number, so the check of a partial scan above
 * never fires for it. So after the scan the check walks the same files itself, with the tool's own
 * modules — the tree resolves other versions of them, or none. It builds the file list by the
 * globs and the ignore list of 0.3.0 and is red when the count differs from `filesScanned`, when a
 * finding lies in an existing file outside the list, or when the tool is of another version. It
 * reads every file, parses every external and inline template with the tool's parser (red on a
 * fatal message only: an `eslint-disable` comment is no loss), and runs oxlint by the tool's binary
 * with the settings the tool wrote into the shared temporary directory, on the same `.ts` files.
 * oxlint is red when it prints no JSON — then the list is halved until the file it fails on is
 * named — or when it lints fewer files than it got. Its finding count is compared with the tool's:
 * this guards the two runs against each other, and with no findings it is blind. So the pass shows
 * that oxlint passed every file in its own run; a failure in the tool's run that did not repeat in
 * the pass stays unseen. A pass that lost a file refuses `--write` too. About a second.
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
 *     --pass-root <dir> [--pass-oxlint <script.mjs>]     walk a directory as the tree, oxlint
 *                                                        replaced by a node script
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const THRESHOLD_FILE = join(ROOT, 'tools', 'ngdoctor-threshold.json');
const CONFIG_FILE = join(ROOT, 'angular-doctor.config.json');

/**
 * The only field the tree's settings of the tool may hold. The owner's word keeps every rule on, and
 * the probe reads the settings of its own directory, not of the tree: a rule switched off or a path
 * ignored there would go unseen by the probe, and by the threshold too once it holds one rule.
 */
const CONFIG_FIELDS = ['reportPath'];

/** The value of a flag that takes one. */
function flag(name) {
    const at = process.argv.indexOf(name);
    return at === -1 ? null : (process.argv[at + 1] ?? null);
}

/** The findings each source of findings must give on the probe: the rule and the file it is in. */
const PROBE_FINDINGS = [
    { source: 'angular-doctor', rule: 'angular-doctor/missing-spec-file', file: 'probe.component.ts' },
    { source: 'angular-doctor', rule: 'angular-doctor/getter-in-template', file: 'probe.component.ts' },
    { source: 'angular-doctor', rule: 'angular-doctor/getter-in-template', file: 'probe-page.component.html' },
    { source: 'oxlint', rule: 'oxlint/eqeqeq', file: 'probe.component.ts' },
    { source: 'template-eslint', rule: 'template-eslint/button-has-type', file: 'probe.component.ts' },
    { source: 'template-eslint', rule: 'template-eslint/button-has-type', file: 'probe-page.component.html' },
];

/** The sources the probe judges, in order. */
const PROBE_SOURCES = [...new Set(PROBE_FINDINGS.map((f) => f.source))];

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

/** The installed version of the tool, read when a refusal names it: a saved output needs no install. */
function toolVersion() {
    try {
        return versionOf(join(ROOT, 'node_modules', '@abiramcodes', 'angular-doctor', 'package.json'));
    } catch {
        return 'not installed';
    }
}

/**
 * Writes the probe into a directory of its own inside `own` and returns its path. One component has
 * an inline template with a button without a type, a loose comparison and no spec; the other has an
 * external template with a button without a type and a getter read in it. `omit` drops the
 * constructs of one source, so that the real probe can be seen red.
 */
function writeProbe(own, omit) {
    const dir = join(own, 'probe');
    const app = join(dir, 'src', 'app');
    mkdirSync(app, { recursive: true });
    const angular = versionOf(join(ROOT, 'package.json'), '@angular/core');
    writeFileSync(join(dir, 'angular.json'), JSON.stringify({ version: 1, projects: { probe: { root: '', sourceRoot: 'src', projectType: 'application' } } }));
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'probe', version: '0.0.0', dependencies: { '@angular/core': angular } }));
    const type = omit === 'template-eslint' ? ' type="button"' : '';
    const compare = omit === 'oxlint' ? '===' : '==';
    const caption = omit === 'angular-doctor' ? ["    public readonly caption: string = 'press';"] : ['    public get caption(): string {', "        return 'press';", '    }'];
    writeFileSync(
        join(app, 'probe.component.ts'),
        [
            "import { Component } from '@angular/core';",
            '',
            `@Component({ selector: 'app-probe', template: \`<button${type} (click)="press()">{{ caption }}</button>\` })`,
            'export class ProbeComponent {',
            '    public value: string | null = null;',
            '',
            ...caption,
            '',
            '    public press(): boolean {',
            `        return this.value ${compare} null;`,
            '    }',
            '}',
            '',
        ].join('\n'),
    );
    const label = omit === 'angular-doctor' ? ["    public readonly label: string = 'press';"] : ['    public get label(): string {', "        return 'press';", '    }'];
    writeFileSync(
        join(app, 'probe-page.component.ts'),
        ["import { Component } from '@angular/core';", '', "@Component({ selector: 'app-probe-page', templateUrl: './probe-page.component.html' })", 'export class ProbePageComponent {', ...label, '}', ''].join('\n'),
    );
    writeFileSync(join(app, 'probe-page.component.html'), `<button${type}>{{ label }}</button>\n`);
    if (omit === 'angular-doctor') {
        writeFileSync(join(app, 'probe.component.spec.ts'), "import { ProbeComponent } from './probe.component';\n\nexport const probe: ProbeComponent = new ProbeComponent();\n");
    }
    return dir;
}

/** The JSON text of the tool's run on the probe. */
function runProbe(omit) {
    return withOwnTmp((own) => runTool(own, [writeProbe(own, omit)]));
}

/** The version of the tool whose file list, ignore list and oxlint settings the pass copies. */
const PASS_VERSION = '0.3.0';
const PASS_GLOBS = ['**/*.ts', '**/*.html'];
const PASS_IGNORE = ['**/node_modules/**', '**/dist/**', '**/.angular/**', '**/coverage/**', '**/*.spec.ts', '**/angular-doctor-report.html'];
/** The oxlint settings version 0.3.0 writes; the pass uses them beside a saved output only. */
const PASS_OXLINT_SETTINGS = {
    $schema: './node_modules/oxlint/configuration_schema.json',
    env: { browser: true, es2022: true, node: true },
    rules: { 'typescript/no-explicit-any': 'warn', 'typescript/no-unused-vars': 'warn', eqeqeq: 'warn' },
};
const PASS_TEMPLATE_FILES = ['**/*.html', '/**/*.html', '**/*.ts', '/**/*.ts'];

/** A require that resolves what the tool itself resolves: the tree holds other versions or none. */
function toolRequire() {
    return createRequire(realpathSync(join(ROOT, 'node_modules', '@abiramcodes', 'angular-doctor', 'package.json')));
}

/** A module's default export or the module itself, as the tool takes it. */
async function importOf(require, name) {
    const module = await import(pathToFileURL(require.resolve(name)).href);
    return module.default ?? module;
}

/**
 * Runs oxlint on files the way the tool does, by `node` on its binary. Returns `{ json, why }`: the
 * parsed output, or the reason there is none.
 */
function runOxlint(binary, settings, root, files) {
    const run = spawnSync(process.execPath, [binary, '--format', 'json', '-c', settings, ...files], { cwd: root, encoding: 'utf8', maxBuffer: 20971520 });
    if (run.error) return { json: null, why: `oxlint did not start: ${run.error.code ?? run.error.message}` };
    try {
        return { json: JSON.parse(run.stdout), why: null };
    } catch {
        return { json: null, why: `oxlint printed no JSON, exit ${run.status ?? run.signal}` };
    }
}

/** The files oxlint fails on, found by halving the list until one file fails alone. */
function oxlintCulprits(binary, settings, root, files) {
    if (files.length === 1) return [files[0]];
    const half = Math.ceil(files.length / 2);
    return [files.slice(0, half), files.slice(half)].flatMap((part) =>
        runOxlint(binary, settings, root, part).json === null ? oxlintCulprits(binary, settings, root, part) : [],
    );
}

/**
 * The pass over the files the tool scanned. The tool drops a file silently three ways — oxlint that
 * fails prints nothing, a template the linter cannot parse yields a message without a rule, a file
 * it cannot read is skipped — so the check walks the same files with the tool's own modules.
 * Returns `{ failures, line }`.
 */
async function passOver(root, text, settings, binaryOverride) {
    const failures = [];
    const version = toolVersion();
    if (version !== PASS_VERSION) {
        failures.push(`the pass copies the file list of angular-doctor ${PASS_VERSION}, the tree has ${version}: compare the globs and the ignore list of the new version and update the pass`);
    }
    const require = toolRequire();
    const files = await require('fast-glob')(PASS_GLOBS, { cwd: root, absolute: true, ignore: PASS_IGNORE, dot: false });
    const report = JSON.parse(text);
    if (files.length !== report.filesScanned) {
        failures.push(`the pass found ${files.length} files, angular-doctor scanned ${report.filesScanned}: the file lists differ`);
    }
    const listed = new Set(files);
    // A finding without a file (oxlint/unknown gives "") or on a directory names no file of the list.
    const outside = [...new Set(report.diagnostics.filter((d) => d.file).map((d) => resolve(root, String(d.file))))].filter(
        (f) => !listed.has(f) && existsSync(f) && statSync(f).isFile(),
    );
    for (const f of outside) failures.push(`a finding of angular-doctor lies in ${f.replace(`${root}/`, '')}, outside the file list of the pass`);

    const contents = new Map();
    for (const f of files) {
        try {
            contents.set(f, readFileSync(f, 'utf8'));
        } catch (error) {
            failures.push(`the pass cannot read ${f.replace(`${root}/`, '')}: ${error.code ?? error.message}`);
        }
    }

    const { Linter } = await import(pathToFileURL(require.resolve('eslint')).href);
    const plugin = await importOf(require, '@angular-eslint/eslint-plugin-template');
    const parser = await importOf(require, '@angular-eslint/template-parser');
    const config = [{ files: PASS_TEMPLATE_FILES, languageOptions: { parser, parserOptions: { ecmaVersion: 2022, sourceType: 'module' } } }];
    const linter = new Linter();
    const inline = plugin.processors['extract-inline-html'];
    let templates = 0;
    for (const [file, content] of contents) {
        const relative = file.replace(`${root}/`, '');
        const blocks = file.endsWith('.html') ? [{ text: content, filename: relative }] : inline.preprocess(content, file).filter((b) => typeof b !== 'string');
        for (const block of blocks) {
            templates += 1;
            const fatal = linter.verify(block.text, config, String(block.filename).replace(`${root}/`, '')).find((m) => m.fatal === true);
            if (fatal) failures.push(`the template linter cannot parse ${relative}: ${fatal.message}`);
        }
    }

    const ts = files.filter((f) => f.endsWith('.ts'));
    const binary = binaryOverride ?? join(dirname(require.resolve('oxlint/package.json')), 'bin', 'oxlint');
    const { json, why } = runOxlint(binary, settings, root, ts);
    let linted = 0;
    if (json === null) {
        const culprits = why.startsWith('oxlint did not start') ? [] : oxlintCulprits(binary, settings, root, ts);
        failures.push(`${why}${culprits.length > 0 ? ` — it fails on ${culprits.map((f) => f.replace(`${root}/`, '')).join(', ')}` : ''}`);
    } else {
        linted = json.number_of_files;
        if (linted !== ts.length) failures.push(`oxlint linted ${linted} files of ${ts.length}: it skipped a file silently`);
        const ours = (Array.isArray(json) ? json : (json.diagnostics ?? [])).length;
        const theirs = report.diagnostics.filter((d) => String(d.ruleId).startsWith('oxlint/')).length;
        if (ours !== theirs) failures.push(`oxlint gave ${ours} findings in the pass, ${theirs} in the run of angular-doctor: the two runs differ`);
    }
    return { failures, line: `check-ngdoctor: the pass read every file: ${files.length} files, ${templates} templates, oxlint ${linted} files` };
}

/** What the probe says against the sources: an empty list when every source gave its findings. */
function probeFailures(text) {
    const result = resultOf(text);
    if (result.problem) return [`the probe: ${result.problem}`];
    const given = new Set(JSON.parse(text).diagnostics.map((d) => `${d.ruleId} ${String(d.file).split('/').pop()}`));
    const missed = PROBE_FINDINGS.filter((f) => !given.has(`${f.rule} ${f.file}`)).map(
        (f) =>
            `the probe: the source «${f.source}» did not fire ${f.rule} in ${f.file} at angular-doctor ${toolVersion()} — either the source does not start, or the version dropped the rule and the probe is to be updated`,
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
    let read = { text: null, why: null };
    if (probeInput) {
        try {
            read = { text: readFileSync(probeInput, 'utf8'), why: null };
        } catch (error) {
            read = { text: null, why: `the saved output of the probe is not read: ${error.message}` };
        }
    } else {
        read = runProbe(flag('--probe-omit'));
    }
    const { text, why } = read;
    const failures = text === null ? [`the probe: ${why}`] : probeFailures(text);
    if (failures.length > 0) {
        return { ok: false, lines: ['check-ngdoctor: a source of findings does not run on the probe, the result says nothing:', ...failures.map((s) => `  ${s}`)] };
    }
    return { ok: true, lines: [`check-ngdoctor: the sources ${PROBE_SOURCES.join(', ')} run — the probe gave ${PROBE_FINDINGS.length} findings of ${PROBE_FINDINGS.length} named`] };
}

/**
 * What is wrong with the probe flags, or `null`. A flag that went unheard would leave the check
 * green on a probe it never ran, so every misuse is refused; a saved probe output replaces the real
 * probe only beside a saved output of the tree, never in the check of the tree itself.
 */
function probeFlagsProblem(input) {
    const valued = ['--input', '--threshold', '--config', '--source-gone', '--probe-input', '--probe-omit', '--pass-root', '--pass-oxlint'];
    const bare = ['--write', '--verbose', '--probe-real'];
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i += 1) {
        if (valued.includes(args[i])) {
            if (args[i + 1] === undefined || args[i + 1].startsWith('--')) return `${args[i]} takes a value`;
            i += 1;
        } else if (!bare.includes(args[i])) {
            return `«${args[i]}» is not a flag of this check`;
        }
    }
    const twice = [...valued, ...bare].find((name) => args.filter((a) => a === name).length > 1);
    if (twice) return `${twice} is given twice`;
    const real = process.argv.includes('--probe-real');
    const probeInput = flag('--probe-input');
    const omit = flag('--probe-omit');
    if (flag('--pass-root') && !input) return '--pass-root walks a directory beside a saved output, give --input too: the check of the tree walks the tree';
    if (flag('--pass-oxlint') && !flag('--pass-root')) return '--pass-oxlint replaces oxlint of a pass over --pass-root, give --pass-root too';
    const gone = flag('--source-gone');
    if (gone && !process.argv.includes('--write')) return '--source-gone names a source for --write, give --write too';
    if (gone && !PROBE_SOURCES.includes(gone)) return `--source-gone takes one of ${PROBE_SOURCES.join(', ')}, not «${gone}»`;
    if (gone && input && !probeInput && !real) return '--source-gone writes a source away only beside the probe that shows it running, give --probe-input or --probe-real';
    if (probeInput && !input) return '--probe-input judges a saved probe beside a saved output of the tree, give --input too';
    if (probeInput && real) return '--probe-input and --probe-real are two probes, give one';
    if (omit && !real) return '--probe-omit drops a construct of the real probe, give --probe-real too';
    if (omit && !PROBE_SOURCES.includes(omit)) return `--probe-omit takes one of ${PROBE_SOURCES.join(', ')}, not «${omit}»`;
    return null;
}

/** What is wrong with the tree's settings of the tool, or `null`; no settings file is no problem. */
function configProblem(path) {
    if (!existsSync(path)) return null;
    let config;
    try {
        config = JSON.parse(readFileSync(path, 'utf8'));
    } catch (error) {
        return `the settings of angular-doctor are not read: ${error.message}`;
    }
    const extra = Object.keys(config ?? {}).filter((key) => !CONFIG_FIELDS.includes(key));
    if (extra.length === 0) return null;
    return `the settings of angular-doctor hold ${extra.map((k) => `«${k}»`).join(', ')}: only ${CONFIG_FIELDS.join(', ')} is allowed — rules stay on by the owner's word, and the probe does not read these settings`;
}

async function main() {
    const input = flag('--input');
    const misuse = probeFlagsProblem(input);
    if (misuse) {
        console.error(`check-ngdoctor: ${misuse}`);
        return 1;
    }
    const settings = configProblem(flag('--config') ?? CONFIG_FILE);
    if (settings) {
        console.error(`check-ngdoctor: ${settings}`);
        return 1;
    }
    const probe = probeVerdict(input);
    if (probe && !probe.ok) {
        for (const l of probe.lines) console.error(l);
        if (process.argv.includes('--write')) console.error('check-ngdoctor: nothing written');
        return 1;
    }
    // The run of the tree and the pass share one temporary directory: the pass reads the oxlint
    // settings the tool wrote there. Beside a saved output the pass runs only on `--pass-root`.
    const own = mkdtempSync(join(tmpdir(), 'ngdoctor-'));
    let text;
    let pass = null;
    try {
        const run = input ? { text: readFileSync(input, 'utf8'), why: null } : runTool(own, []);
        if (run.text === null) {
            console.error(`check-ngdoctor: ${run.why}`);
            return 1;
        }
        text = run.text;
        const passRoot = input ? flag('--pass-root') : ROOT;
        if (passRoot !== null && resultOf(text).problem === undefined) {
            let settings = join(own, 'angular-doctor', 'oxlintrc.json');
            if (input) {
                mkdirSync(dirname(settings), { recursive: true });
                writeFileSync(settings, JSON.stringify(PASS_OXLINT_SETTINGS));
            }
            pass = existsSync(settings)
                ? await passOver(resolve(passRoot), text, settings, flag('--pass-oxlint') ? resolve(flag('--pass-oxlint')) : undefined)
                : { failures: [`angular-doctor wrote no oxlint settings into ${dirname(settings)}`], line: '' };
        }
    } finally {
        rmSync(own, { recursive: true, force: true });
    }
    if (pass && pass.failures.length > 0) {
        console.error('check-ngdoctor: angular-doctor lost a file of the tree silently, the result says nothing:');
        for (const f of pass.failures) console.error(`  ${f}`);
        if (process.argv.includes('--write')) console.error('check-ngdoctor: nothing written');
        return 1;
    }
    if (probe) console.log(probe.lines[0]);
    if (pass) console.log(pass.line);
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

process.exit(await main());
