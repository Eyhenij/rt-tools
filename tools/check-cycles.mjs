#!/usr/bin/env node
/**
 * The check that the package's modules do not refer to one another in a circle.
 *
 * A circle is created silently and almost always through a directory barrel: a file takes its
 * neighbour not directly but from the `index.ts` next to it, and that one gathers the file itself.
 * Neither the build nor the linter judges this — the builder breaks the circle itself, giving half
 * the members a half-built module. It surfaces at a consumer: a symbol read at the start turns out
 * `undefined`, and that costs debugging in somebody else's application.
 *
 * Only what is visible without the builder counts: relative imports inside one package. An import by
 * a package name does not go here — circles between packages are judged by the lib layout check.
 *
 * A non-zero exit code and a list of the circles: one per line, with the members from file to file.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const ROOT = resolve(process.argv[2] ?? 'projects');
const SKIP = new Set(['node_modules', 'dist', '.angular', 'coverage', '__snapshots__']);

/** All the package's code files: the specs and the stories count on a par with the rest — their circle is shared. */
function filesOf(dir) {
    const found = [];

    for (const entry of readdirSync(dir)) {
        if (SKIP.has(entry)) {
            continue;
        }

        const path = join(dir, entry);

        if (statSync(path).isDirectory()) {
            found.push(...filesOf(path));
        } else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) {
            found.push(path);
        }
    }

    return found;
}

/**
 * An import path → a file on the disk. The extension in an import is sometimes written as `.js` —
 * that is what the utils package's build demands — so the candidates are gone over rather than
 * derived from the string.
 */
function fileOf(from, spec) {
    const base = resolve(dirname(from), spec.replace(/\.js$/, ''));
    const candidates = [`${base}.ts`, join(base, 'index.ts'), `${base}/index.ts`];

    for (const candidate of candidates) {
        if (existsSync(candidate) && statSync(candidate).isFile()) {
            return candidate;
        }
    }

    return null;
}

/**
 * An import is sometimes multi-line — the list of symbols in braces is wrapped — so the sample does
 * not forbid a line break inside. Otherwise a circle closed by a long import is not visible at all:
 * that is exactly how one of them outlived this check's first run.
 */
const IMPORT = /(?:^|\n)\s*(?:import|export)\b[\s\S]*?from\s*['"](\.[^'"]+)['"]/g;

function edgesOf(file) {
    const text = readFileSync(file, 'utf8');
    const links = new Set();

    for (const match of text.matchAll(IMPORT)) {
        const target = fileOf(file, match[1]);

        if (target && target !== file) {
            links.add(target);
        }
    }

    return links;
}

const graph = new Map();

for (const file of filesOf(ROOT)) {
    graph.set(file, edgesOf(file));
}

/** A depth-first walk: a circle is named by its members from the place where it closed. */
const cycles = [];
const seen = new Set();
const stack = [];
const onStack = new Set();

function walk(node) {
    seen.add(node);
    stack.push(node);
    onStack.add(node);

    for (const next of graph.get(node) ?? []) {
        if (onStack.has(next)) {
            cycles.push([...stack.slice(stack.indexOf(next)), next]);
        } else if (!seen.has(next)) {
            walk(next);
        }
    }

    stack.pop();
    onStack.delete(node);
}

for (const node of graph.keys()) {
    if (!seen.has(node)) {
        walk(node);
    }
}

const shown = new Map();

for (const cycle of cycles) {
    const names = cycle.map((file) => relative(ROOT, file));
    const key = [...names].sort().join('|');

    if (!shown.has(key)) {
        shown.set(key, names);
    }
}

if (shown.size === 0) {
    console.log(`check-cycles: files ${graph.size}, there are no circles`);
    process.exit(0);
}

console.log(`check-cycles: files ${graph.size}, circles ${shown.size}\n`);

for (const names of shown.values()) {
    console.log(`  ${names.join(' → ')}`);
}

console.log('\nA circle is broken by a direct import of the file instead of the directory barrel.');
process.exit(1);
