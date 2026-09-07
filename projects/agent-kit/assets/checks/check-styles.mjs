#!/usr/bin/env node
/**
 * The check that a BEM element class is backed by a rule.
 *
 * A class without a rule appears silently: the layout moves from the screen's file into the
 * shared layer, and `rtElem` stays in the template and corresponds to nothing any more. Neither
 * the linter nor the build nor the browser shows this — a superfluous class simply does nothing,
 * and the markup grows names with nothing behind them.
 *
 * A match is counted by the element name, not by the pair "block — element": `rtElem` takes the
 * block name from the nearest ancestor with `rtBlock`, and there is nothing to repeat that
 * reasoning by over the text of the template. Because of this the check lets through a class that
 * has a rule, but under a different block — the direction is chosen towards false misses rather
 * than false refusals.
 *
 * What arrived with a connected package counts as a declaration too: a screen assembled from
 * ready-made code keeps no declarations of its own at all. Exactly the file the application named
 * itself is read — the walk is one step deep, and the dependencies directory does not get into
 * the source roots.
 *
 * A dynamic `[rtElem]` does not count: the name there is known only at runtime.
 *
 * What had accumulated by the moment the check was started lies in tools/styles-allowlist.json
 * and does not count as a refusal: the gate falls on a NEW class without a rule, while the old
 * stays a visible number in the digest. A line of the list is recognised by the class name: the
 * list of files next to it changes with every edit of the markup, and audited whole it would make
 * the former line superfluous and the very same debt a new divergence.
 *
 * A non-zero return code and a list of divergences.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, join } from 'node:path';

import { allowlistOf, baselineOf, CONFIG, ROOT, parseAllowlist } from './rt-kit-checks.config.mjs';

const ALLOWLIST = allowlistOf('styles');
const SOURCE_ROOTS = CONFIG.sourceRoots;
const SKIPPED_DIRS = CONFIG.skippedDirs;

const ELEM_RE = /rtElem="([a-z0-9-]+)"/g;
/** The declaration of an element: both a nested `&__item` and a full `.<block>__item` */
const RULE_RE = /__([a-z0-9-]+)/g;
/** The head of the nesting: the line an element block starts with */
const HEAD_RE = /^&__([a-z0-9-]+)/;
/** A joint of the nesting: `&-<tail>` inside an element block appends to the name instead of starting its own */
const TAIL_RE = /^&-([a-z0-9-]+)/;
/** A connection in a style file: `@use` and `@forward` are taken by one parse */
const USE_RE = /@(?:use|forward)\s+['"]([^'"]+)['"]/g;
/** A line of the known list: the class name and the list of files next to it */
const KEY_RE = /^elem (\S+) @ (.*)$/;

const allowlist = parseAllowlist('styles');
const known = allowlist.keys;
const debt = new Set(allowlist.debt.keys());

/** The lines of the list by class name: the list of files is part of the key but is audited apart */
const knownByName = new Map();
for (const key of known) {
    const parsed = KEY_RE.exec(key);
    if (parsed) {
        knownByName.set(parsed[1], { key, files: new Set(parsed[2].split(', ').filter(Boolean)) });
    }
}

function collectFiles(dir, extension) {
    const files = [];
    for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
        if (SKIPPED_DIRS.includes(entry.name)) {
            continue;
        }
        const path = `${dir}/${entry.name}`;
        if (entry.isDirectory()) {
            files.push(...collectFiles(path, extension));
        } else if (entry.name.endsWith(extension)) {
            files.push(path);
        }
    }
    return files;
}

/**
 * The package name and the path inside it. A relative and an absolute specifier are never a
 * package; the prefixes `pkg:` and `~` are stripped — different bundlers call the same package by
 * them.
 */
function packageOf(specifier) {
    const clean = specifier.replace(/^pkg:/, '').replace(/^~/, '');
    if (clean === '' || clean.startsWith('.') || clean.startsWith('/')) {
        return null;
    }
    const parts = clean.split('/');
    const name = clean.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
    if (clean.startsWith('@') && parts.length < 2) {
        return null;
    }

    return { name, rest: clean.slice(name.length).replace(/^\//, '') };
}

/**
 * The file of a package named by a connection. The directory is found by module resolution from
 * the place where the connection is written: a subproject's package does not lie at the tree root
 * at all, and the manager is free to keep several versions side by side. Not found — `null`: a
 * tree without that package gets an audit of its own declarations, not a refusal to read.
 */
function fileOfPackage(from, { name, rest }) {
    let manifest;
    try {
        manifest = createRequire(join(ROOT, from, 'package.json')).resolve(`${name}/package.json`);
    } catch {
        return null;
    }

    const base = dirname(manifest);
    const tail = rest === '' ? 'index' : rest;
    const candidates = [
        join(base, tail),
        join(base, `${tail}.scss`),
        join(base, dirname(tail), `_${basename(tail)}.scss`),
        join(base, tail, '_index.scss'),
        join(base, tail, 'index.scss'),
    ];

    return candidates.find((path) => existsSync(path) && statSync(path).isFile()) ?? null;
}

/**
 * The names of the elements declared by a style file. The name is assembled from the nesting:
 * `&__head { &-icon }` declares `head-icon`, and it can have any number of joints. Reading only
 * what stands after `__` whole, the check counted sound markup as a debt — the rule works, the
 * class paints, and removing it would mean breaking the screen.
 *
 * A tail without a head does not become a name: `&-<tail>` standing outside an element block
 * belongs to a different selector, and ascribing it would be inventing a declaration.
 */
function elementNames(text) {
    const names = new Set();
    const stack = [];
    for (const raw of text.split('\n')) {
        const line = raw.trim();
        const parent = stack.length ? stack[stack.length - 1] : '';
        const head = HEAD_RE.exec(line);
        const tail = TAIL_RE.exec(line);
        let current = parent;

        if (head) {
            current = head[1];
        } else if (tail && parent) {
            current = `${parent}-${tail[1]}`;
            names.add(current);
        }

        for (const match of line.matchAll(RULE_RE)) {
            names.add(match[1]);
        }

        for (let index = 0; index < (line.match(/{/g) ?? []).length; index += 1) {
            stack.push(current);
        }
        for (let index = 0; index < (line.match(/}/g) ?? []).length && stack.length; index += 1) {
            stack.pop();
        }
    }

    return names;
}

/**
 * The declarations from the packages connected by the application itself. Exactly the named file
 * is read: the connections inside it are not parsed — what the application named is what counts
 * as declared.
 */
function declarationsFromPackages(styleFiles) {
    const names = new Set();
    for (const path of styleFiles) {
        for (const [, specifier] of readFileSync(join(ROOT, path), 'utf8').matchAll(USE_RE)) {
            const parsed = packageOf(specifier);
            const file = parsed && fileOfPackage(dirname(path), parsed);
            if (!file) {
                continue;
            }
            elementNames(readFileSync(file, 'utf8')).forEach((name) => names.add(name));
        }
    }

    return names;
}

const declared = new Set();
const usedIn = new Map();

for (const root of SOURCE_ROOTS) {
    const styleFiles = collectFiles(root, '.scss');
    for (const path of styleFiles) {
        elementNames(readFileSync(join(ROOT, path), 'utf8')).forEach((name) => declared.add(name));
    }
    declarationsFromPackages(styleFiles).forEach((name) => declared.add(name));

    for (const path of collectFiles(root, '.html')) {
        for (const match of readFileSync(join(ROOT, path), 'utf8').matchAll(ELEM_RE)) {
            const name = match[1];
            if (!usedIn.has(name)) {
                usedIn.set(name, new Set());
            }
            usedIn.get(name).add(path);
        }
    }
}

const findings = [];

for (const [name, files] of [...usedIn].sort(([first], [second]) => first.localeCompare(second))) {
    if (declared.has(name)) {
        continue;
    }
    const where = [...files].sort().join(', ');
    findings.push({
        name,
        files: new Set(files),
        key: `elem ${name} @ ${where}`,
        text: `rtElem="${name}" — правила нет ни в одном файле стилей: ${where}`,
    });
}

if (process.argv.includes('--baseline')) {
    console.log(baselineOf(findings.map((finding) => finding.key).sort(), allowlist));
    process.exit(0);
}

/**
 * How the list of files of a finding has diverged from the line of the list: what was added and
 * what went away. Growth is a divergence, shrinking is a repair; they cannot be read alike, and
 * auditing the key whole would mean declaring the very same debt a new one.
 */
function changedFiles(finding, line) {
    return {
        added: [...finding.files].filter((path) => !line.files.has(path)).sort(),
        gone: [...line.files].filter((path) => !finding.files.has(path)).sort(),
    };
}

const problems = [];
const notes = [];
const matchedKeys = new Set();

for (const finding of findings) {
    const line = knownByName.get(finding.name);
    if (!line) {
        problems.push(finding.text);
        continue;
    }
    matchedKeys.add(line.key);

    const { added, gone } = changedFiles(finding, line);
    if (added.length > 0) {
        problems.push(`elem ${finding.name}: долг разросся — класс появился ещё в ${added.join(', ')}; снять его оттуда`);
    } else if (gone.length > 0) {
        notes.push(
            `elem ${finding.name}: долг сократился — класса больше нет в ${gone.join(', ')}; перечень в строке списка можно поправить`
        );
    }
}

for (const key of known) {
    if (!matchedKeys.has(key)) {
        problems.push(`${key}: значится в ${ALLOWLIST}, но класс уже подкреплён правилом — строку убрать`);
    }
}

if (problems.length > 0) {
    console.error(`check-styles: расхождений ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    process.exit(1);
}

notes.forEach((note) => console.log(`  ${note}`));
console.log(
    `check-styles: классов без правила ${findings.length}, из них принято ${findings.length - debt.size}, долг ${debt.size} — новых нет`
);
