/**
 * The pass of `tools/check-ngdoctor.mjs` over the files Angular Doctor scanned. The tool drops a file
 * silently three ways: oxlint that fails prints nothing, a template the linter cannot parse yields
 * a message without a rule, and a file it cannot read is skipped. Apart from its file list it also
 * reads `package.json` files, skipping one it cannot read or parse, and, with tailwindcss 4 or later,
 * stylesheets, skipping one it cannot read. So the check walks the same files with the tool's own
 * modules and names the file it lost. What the pass judges is written in the header of the check;
 * this file holds the walk only.
 *
 * The modules are resolved from the tool's package, not from the tree: the tree resolves other
 * versions of the parser and eslint, and does not resolve oxlint and fast-glob at all.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdir, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { listNoDotDirs } from './ngdoctor-dot-dirs.mjs';

/** The version of the tool whose file list, ignore list and oxlint settings the pass copies. */
const PASS_VERSION = '0.3.0';
const PASS_GLOBS = ['**/*.ts', '**/*.html'];
const PASS_IGNORE = ['**/node_modules/**', '**/dist/**', '**/.angular/**', '**/coverage/**', '**/*.spec.ts', '**/angular-doctor-report.html'];
/** The oxlint settings version 0.3.0 writes; the pass uses them beside a saved output only. */
export const PASS_OXLINT_SETTINGS = {
    $schema: './node_modules/oxlint/configuration_schema.json',
    env: { browser: true, es2022: true, node: true },
    rules: { 'typescript/no-explicit-any': 'warn', 'typescript/no-unused-vars': 'warn', eqeqeq: 'warn' },
};
const PASS_TEMPLATE_FILES = ['**/*.html', '/**/*.html', '**/*.ts', '/**/*.ts'];
/**
 * What `deprecated-animations` and `tailwind-v3-syntax` of 0.3.0 read apart from the file list: their
 * own globs and a shorter ignore list — `coverage/` is not in it.
 */
const PASS_PACKAGE_GLOB = '**/package.json';
const PASS_STYLE_GLOB = '**/*.{css,scss}';
const PASS_TOOL_IGNORE = ['**/node_modules/**', '**/dist/**', '**/.angular/**'];

/**
 * The files of `root` by the glob of the tool, the dot directories left out. A fast-glob that does not
 * list by the given file system walks them again, so it is a failure, not a slow pass.
 */
async function listOf(fromTool, root, pattern, options) {
    let listings = 0;
    const fs = listNoDotDirs(root, { readdir, readdirSync }, () => (listings += 1));
    const files = await fromTool('fast-glob')(pattern, { cwd: root, absolute: true, fs, ...options });
    if (listings === 0) throw new Error('fast-glob does not list by the file system that skips the dot directories');
    return files;
}

/**
 * The major version of `tailwindcss` a package names, as 0.3.0 takes it: the first section that
 * names it by a string decides, even when the string does not parse; a section that names it by
 * another value is passed over.
 */
function tailwindMajor(pkg, semver) {
    for (const section of ['dependencies', 'devDependencies', 'peerDependencies']) {
        const deps = pkg[section];
        if (!deps || typeof deps !== 'object' || !('tailwindcss' in deps)) continue;
        const raw = deps.tailwindcss;
        if (typeof raw !== 'string') continue;
        return semver.coerce(raw.replace(/^[\^~]/, ''))?.major ?? null;
    }
    return null;
}

/**
 * The package.json files and the stylesheets the tool reads silently. A package.json it cannot read
 * or parse yields no finding of `deprecated-animations`; the stylesheets are read only when a package
 * names tailwindcss 4 or later. Returns the counts.
 */
async function packagesOf(fromTool, root, failures) {
    const semver = fromTool('semver');
    const listed = async (pattern, options) => {
        try {
            return await listOf(fromTool, root, pattern, { ignore: PASS_TOOL_IGNORE, ...options });
        } catch (error) {
            failures.push(`the pass cannot list the ${pattern} files of ${root}: ${error.code ?? error.message}`);
            return [];
        }
    };
    const packages = await listed(PASS_PACKAGE_GLOB, { dot: false });
    let tailwind4 = false;
    for (const f of packages) {
        const relative = f.replace(`${root}/`, '');
        let text;
        try {
            text = readFileSync(f, 'utf8');
        } catch (error) {
            failures.push(`the pass cannot read ${relative}: ${error.code ?? error.message}`);
            continue;
        }
        let pkg;
        try {
            pkg = JSON.parse(text);
        } catch {
            failures.push(`${relative} is not JSON: angular-doctor reads no finding from it`);
            continue;
        }
        const major = pkg !== null && typeof pkg === 'object' ? tailwindMajor(pkg, semver) : null;
        if (major !== null && major >= 4) tailwind4 = true;
    }
    if (!tailwind4) return { packages: packages.length, stylesheets: 0 };
    const sheets = await listed(PASS_STYLE_GLOB, {});
    for (const f of sheets) {
        try {
            readFileSync(f, 'utf8');
        } catch (error) {
            failures.push(`the pass cannot read ${f.replace(`${root}/`, '')}: ${error.code ?? error.message}`);
        }
    }
    return { packages: packages.length, stylesheets: sheets.length };
}

/** A module's default export or the module itself, as the tool takes it. */
async function importOf(fromTool, name) {
    const module = await import(pathToFileURL(fromTool.resolve(name)).href);
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
        const said = String(run.stderr ?? '').trim().split('\n')[0];
        return { json: null, why: `oxlint printed no JSON, exit ${run.status ?? run.signal}${said ? ` (${said})` : ''}` };
    }
}

/**
 * The files oxlint fails on, found by halving the list until one file fails alone. `null` when
 * both halves of the list fail: then the run fails, not a file, and halving would start oxlint
 * twice per file of the tree only to name every one of them.
 */
function oxlintCulprits(binary, settings, root, files) {
    if (files.length <= 1) return files;
    const half = Math.ceil(files.length / 2);
    const failing = [files.slice(0, half), files.slice(half)].filter((part) => runOxlint(binary, settings, root, part).json === null);
    if (failing.length === 2) return null;
    return failing.flatMap((part) => oxlintCulprits(binary, settings, root, part) ?? part);
}

/** The files of the list that hold a finding of the tool; only a `.ts` or `.html` file can be in it. */
function outsideOf(report, root, listed) {
    // A finding without a file (oxlint/unknown gives ""), on a directory or on another kind of file —
    // package.json, a stylesheet — names no file the list could hold.
    const named = report.diagnostics.filter((d) => d.file).map((d) => resolve(root, String(d.file)));
    return [...new Set(named)].filter((f) => /\.(ts|html)$/.test(f) && !listed.has(f) && existsSync(f) && statSync(f).isFile());
}

/** The templates of the files, parsed by the tool's parser: the count and a failure per fatal message. */
async function templatesOf(fromTool, root, contents, failures) {
    const { Linter } = await import(pathToFileURL(fromTool.resolve('eslint')).href);
    const plugin = await importOf(fromTool, '@angular-eslint/eslint-plugin-template');
    const parser = await importOf(fromTool, '@angular-eslint/template-parser');
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
    return templates;
}

/** oxlint over the `.ts` files of the list; returns the count it linted. */
function oxlintOver(fromTool, root, settings, binaryOverride, ts, report, failures) {
    // The tool does not start oxlint without files, and oxlint given none lints the whole directory.
    if (ts.length === 0) return 0;
    const binary = binaryOverride ?? join(dirname(fromTool.resolve('oxlint/package.json')), 'bin', 'oxlint');
    const { json, why } = runOxlint(binary, settings, root, ts);
    if (json === null) {
        const culprits = why.startsWith('oxlint did not start') ? [] : oxlintCulprits(binary, settings, root, ts);
        const where = culprits === null ? ' — it fails on every part of the list: the run fails, not a file' : culprits.length > 0 ? ` — it fails on ${culprits.map((f) => f.replace(`${root}/`, '')).join(', ')}` : '';
        failures.push(`${why}${where}`);
        return 0;
    }
    const linted = json.number_of_files;
    if (linted !== ts.length) failures.push(`oxlint linted ${linted} files of ${ts.length}: it skipped a file silently`);
    const ours = (Array.isArray(json) ? json : (json.diagnostics ?? [])).length;
    const theirs = report.diagnostics.filter((d) => String(d.ruleId).startsWith('oxlint/')).length;
    if (ours !== theirs) failures.push(`oxlint gave ${ours} findings in the pass, ${theirs} in the run of angular-doctor: the two runs differ`);
    return linted;
}

/**
 * The pass over `root` against the tool's output `text`. `tool` is the path of the tool's
 * package.json, `version` its version, `settings` the oxlint settings file, `binary` a stand-in
 * oxlint or `undefined`. Returns `{ failures, line }`.
 */
export async function passOver({ root, text, tool, version, settings, binary }) {
    if (version !== PASS_VERSION) {
        const why = `the pass copies the file list of angular-doctor ${PASS_VERSION}, the tree has ${version}: compare the globs and the ignore list of the new version and update the pass`;
        return { failures: [why], line: '' };
    }
    const failures = [];
    const fromTool = createRequire(realpathSync(tool));
    let files;
    try {
        files = await listOf(fromTool, root, PASS_GLOBS, { ignore: PASS_IGNORE, dot: false });
    } catch (error) {
        return { failures: [`the pass cannot list the files of ${root}: ${error.code ?? error.message}`], line: '' };
    }
    const report = JSON.parse(text);
    if (files.length !== report.filesScanned) {
        failures.push(`the pass found ${files.length} files, angular-doctor scanned ${report.filesScanned}: the file lists differ, or the tree changed during the run`);
    }
    for (const f of outsideOf(report, root, new Set(files))) failures.push(`a finding of angular-doctor lies in ${f.replace(`${root}/`, '')}, outside the file list of the pass`);

    const contents = new Map();
    for (const f of files) {
        try {
            contents.set(f, readFileSync(f, 'utf8'));
        } catch (error) {
            failures.push(`the pass cannot read ${f.replace(`${root}/`, '')}: ${error.code ?? error.message}`);
        }
    }
    const templates = await templatesOf(fromTool, root, contents, failures);
    const ts = files.filter((f) => f.endsWith('.ts'));
    const linted = oxlintOver(fromTool, root, settings, binary, ts, report, failures);
    const { packages, stylesheets } = await packagesOf(fromTool, root, failures);
    return {
        failures,
        line: `check-ngdoctor: the pass read every file: ${files.length} files, ${templates} templates, oxlint ${linted} files, ${packages} package.json, ${stylesheets} stylesheets`,
    };
}
