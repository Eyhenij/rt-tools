#!/usr/bin/env node
/**
 * The check of the dependencies rule: three statements of it that the tree can be asked about.
 *
 * 1. A package version is an exact number. A range in the manifest lets two installs of one commit
 *    differ, and nothing in the tree shows which of them a run was made on.
 * 2. The waiting term for a fresh version is written in the install settings. Left to the default of
 *    the package manager, the number is visible nowhere and moves with its version.
 * 3. The commit formatter takes only the files a linter reads. A formatter that rewrites every
 *    staged file changes texts and settings nobody checks, and it rewrites laid-out resources whose
 *    body is closed by a digest in the header.
 *
 * The check belongs to this tree and is not carried by the package: it reads the manifest, the
 * settings of pnpm and the commit hook of husky, and a consumer tree may have none of the three.
 *
 * FAIL-OPEN: a tree without a manifest has nothing to judge, zero code. A manifest that does not
 * parse is a broken subject, non-zero code.
 *
 * A non-zero exit code and one line per finding.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = join(ROOT, 'package.json');
const WORKSPACE = join(ROOT, 'pnpm-workspace.yaml');
const COMMIT_HOOK = join(ROOT, '.husky/pre-commit');

/** The sections of the manifest whose versions are installed. Peer ranges are ranges by design. */
const SECTIONS = ['dependencies', 'devDependencies', 'optionalDependencies'];

/** An exact version: three numbers and an optional pre-release tail. */
const EXACT = /^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/;

/** A version that names no number of the registry at all: a workspace link, a file, an address. */
const NOT_A_REGISTRY_VERSION = /^(workspace:|file:|link:|git\+|https?:|npm:)/;

/** The extensions a linter of this tree reads: the code linter and the styles linter. */
const LINTED = new Set(['js', 'mjs', 'cjs', 'ts', 'html', 'scss', 'css']);

/** The extensions a glob of the staged-files runner names: `*.ts` and `*.{js,ts}` alike. */
export function extensionsOf(glob) {
    const braces = /\.\{([^}]+)\}$/.exec(glob);
    if (braces) {
        return braces[1].split(',').map((part) => part.trim());
    }
    const single = /\.([\w]+)$/.exec(glob);
    return single ? [single[1]] : ['*'];
}

function rangedVersions(manifest) {
    return SECTIONS.flatMap((section) =>
        Object.entries(manifest[section] ?? {})
            .filter(([, version]) => !NOT_A_REGISTRY_VERSION.test(version) && !EXACT.test(version))
            .map(([name, version]) => `${section}: ${name}@${version} — a range, the rule asks an exact number`)
    );
}

function waitingTerm() {
    if (!existsSync(WORKSPACE)) {
        return [];
    }
    const found = /^minimumReleaseAge:\s*(\S+)\s*$/m.exec(readFileSync(WORKSPACE, 'utf8'));
    if (!found) {
        return ['pnpm-workspace.yaml: no minimumReleaseAge — the waiting term is left to the default of the package manager'];
    }
    return Number(found[1]) > 0 ? [] : [`pnpm-workspace.yaml: minimumReleaseAge is ${found[1]} — a fresh version does not wait at all`];
}

function formatterPaths(manifest) {
    const findings = [];
    if (existsSync(COMMIT_HOOK)) {
        readFileSync(COMMIT_HOOK, 'utf8')
            .split('\n')
            .filter((line) => /^\s*(npx |pnpm exec |pnpm dlx )?prettier\b/.test(line))
            .forEach(() => findings.push('.husky/pre-commit: the formatter is called over every staged file — its paths belong in lint-staged'));
    }
    for (const [glob, command] of Object.entries(manifest['lint-staged'] ?? {})) {
        if (![command].flat().some((line) => /\bprettier\b/.test(line))) {
            continue;
        }
        const foreign = extensionsOf(glob).filter((extension) => !LINTED.has(extension));
        if (foreign.length > 0) {
            findings.push(`package.json lint-staged «${glob}»: the formatter takes ${foreign.join(', ')} — no linter reads these`);
        }
    }
    return findings;
}

function main() {
    if (!existsSync(MANIFEST)) {
        console.log('check-dependencies: no package.json — nothing to judge');
        return 0;
    }
    let manifest;
    try {
        manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
    } catch (error) {
        console.error(`check-dependencies: package.json does not parse — ${error.message}`);
        return 2;
    }
    const findings = [...rangedVersions(manifest), ...waitingTerm(), ...formatterPaths(manifest)];
    if (findings.length === 0) {
        console.log('check-dependencies: versions are exact, the waiting term is written, the formatter takes linted files only');
        return 0;
    }
    findings.forEach((line) => console.error(line));
    console.error(`check-dependencies: ${findings.length} — the rule dependencies, .claude/skills/dependencies/SKILL.md`);
    return 1;
}

process.exit(main());
