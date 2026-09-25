#!/usr/bin/env node
/**
 * The check of the second kit's token graph: a name has exactly three states — declared by the
 * styling layer, named a consumer's handle, a dead reference.
 *
 * The third state should not exist, and it is exactly what piled up: thirty-three names the kit uses
 * without declaring in any layer, and there was nothing for a machine to tell them apart with. Some
 * of them are handles: the value comes from the application, and until it does the fallback works.
 * Some are misses the fallback value makes invisible: the rule works, the colour is wrong, and the
 * error is no different from the intent. That is exactly how a disabled button stayed light grey on
 * graphite.
 *
 * What the check judges:
 *
 * 1. A dead reference — the name is not declared and not named a handle.
 * 2. A fallback value at a name the kit declares itself — it hides a miss and outlives a change of
 *    theme: there is nothing to override.
 * 3. A declaration of a shared name on the page root from a component's styles. Its own block's name
 *    (`--rt-<block>-*`) passes: that is the third layer, and a component must have it.
 * 4. A new name colliding with the first kit. Today's collisions are accepted by the list: fixing
 *    them means touching the published first kit, taken beyond the boundary of the line.
 * 5. A divergence of the handle list from its human half in `Theming.mdx`: no two lists about one
 *    and the same thing are created without a matching.
 *
 * What has piled up lies in the accepted list, does not count as a refusal and is visible as a
 * number; the check falls on a NEW place. The list only shrinks: a record nothing answers to any
 * more drops the run.
 *
 * A non-zero exit code and a list of the divergences.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { allowlistOf, baselineOf, parseAllowlist } from './rt-kit-checks.config.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** The kit whose graph is judged, and the kit whose names collisions are matched against. */
const KIT = 'projects/ui-kit-v2/src';
const OTHER_KIT = 'projects/ui-kit/src';
const HANDLES_FILE = 'tools/tokens-handles.json';
const THEMING_DOC = 'projects/ui-kit-v2/docs/Theming.mdx';
const ALLOWLIST = allowlistOf('tokens-graph');

const DECLARATION_RE = /^[ \t]*(--rt-[a-z0-9-]+)[ \t]*:/gm;
const REFERENCE_RE = /var\(\s*(--rt-[a-z0-9-]+)\s*(,)?/g;
/** The block's name inside a token name: `--rt-dialog-width` → `dialog`. */
const BLOCK_RE = /^--rt-([a-z0-9]+)-/;

function scssFiles(dir) {
    const files = [];
    for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
        if (entry.name === 'node_modules') {
            continue;
        }
        const path = `${dir}/${entry.name}`;
        if (entry.isDirectory()) {
            files.push(...scssFiles(path));
        } else if (entry.name.endsWith('.scss')) {
            files.push(path);
        }
    }
    return files;
}

const read = (path) => readFileSync(join(ROOT, path), 'utf8');
const namesIn = (text, regexp) => [...text.matchAll(regexp)].map((match) => match[1]);

const files = scssFiles(KIT);
const declared = new Set();
const references = [];

for (const path of files) {
    const text = read(path);
    namesIn(text, DECLARATION_RE).forEach((name) => declared.add(name));
    for (const match of text.matchAll(REFERENCE_RE)) {
        references.push({ name: match[1], path, hasFallback: Boolean(match[2]) });
    }
}

const handles = JSON.parse(read(HANDLES_FILE)).handles ?? {};
const handleNames = new Set(Object.keys(handles));

const findings = [];
const add = (key, text) => findings.push({ key, text });

/** 1. A dead reference: not declared and not named a handle. */
for (const name of [...new Set(references.map((reference) => reference.name))].sort()) {
    if (declared.has(name) || handleNames.has(name)) {
        continue;
    }
    const where = [...new Set(references.filter((reference) => reference.name === name).map((reference) => reference.path))];
    add(`a dead reference ${name}`, `${name} — declared by no layer and not named a handle: ${where.join(', ')}`);
}

/** 2. A fallback value at a name the kit declares itself. */
for (const reference of references) {
    if (reference.hasFallback && declared.has(reference.name)) {
        add(
            `a fallback value ${reference.name} @ ${reference.path}`,
            `${reference.name} in ${reference.path} — a fallback value stands at a token the kit declares itself: it hides a miss and outlives a change of theme`
        );
    }
}

/**
 * 3. A declaration of a shared name on the page root from a component's styles. The reading is
 * rough — by the rule's text from `:root` to the closing brace — and that is enough: there are no
 * nested rules inside such a block in the kit, and a name is judged on its own.
 */
for (const path of files.filter((file) => file.includes('/lib/'))) {
    const text = read(path);
    const block = path.split('/').pop().replace(/^_?rt-/, '').replace(/\.(component|directive)?\.?scss$/, '');
    for (const match of text.matchAll(/:root[^{]*\{([^}]*)\}/g)) {
        for (const name of namesIn(match[1], DECLARATION_RE)) {
            const owner = name.match(BLOCK_RE)?.[1];
            if (owner && block.startsWith(owner)) {
                continue;
            }
            add(
                `a declaration on the root ${name} @ ${path}`,
                `${name} is declared on the page root from the component's styles ${path}: a shared name is created by the styling layer, not by a component`
            );
        }
    }
}

/** The top-level keys of a Sass map `$name: ( … );` declared in the text, or null if there is none. */
function mapKeys(text, name) {
    const start = text.search(new RegExp(`^\\$${name}:\\s*\\(`, 'm'));
    if (start < 0) {
        return null;
    }
    const keys = [];
    let depth = 0;
    let segment = '';
    for (const char of text.slice(text.indexOf('(', start))) {
        if (char === '(') {
            depth += 1;
            if (depth === 1) {
                continue;
            }
        }
        if (char === ')') {
            depth -= 1;
            if (depth === 0) {
                break;
            }
        }
        if (depth === 1 && char === ',') {
            keys.push(segment);
            segment = '';
            continue;
        }
        segment += char;
    }
    keys.push(segment);
    return keys.map((part) => part.split(':')[0].trim()).filter((key) => /^[a-z0-9-]+$/.test(key));
}

/**
 * The names a file declares by interpolation over a map: `@each $token, $value in $shadow` with
 * `--rt-shadow-#{$token}` inside gives `--rt-shadow-sm`, `--rt-shadow-md` and the rest. A literal
 * search never sees them, and the first reference to such a name read as a new collision.
 * One interpolation at the end of the name is expanded; a name with two of them is left unread.
 */
function interpolatedNames(text) {
    const names = [];
    for (const loop of text.matchAll(/@each\s+\$([a-z0-9-]+)\s*,\s*\$[a-z0-9-]+\s+in\s+\$([a-z0-9-]+)\s*\{((?:#\{[^{}]*\}|[^{}])*)/g)) {
        const [, key, map, body] = loop;
        const keys = mapKeys(text, map);
        if (!keys) {
            continue;
        }
        for (const [, prefix] of body.matchAll(new RegExp(`(--rt-[a-z0-9-]*)#\\{\\$${key}\\}\\s*:`, 'g'))) {
            keys.forEach((token) => names.push(`${prefix}${token}`));
        }
    }
    return names;
}

/** 4. A name used by both kits. */
if (existsSync(join(ROOT, OTHER_KIT))) {
    const otherNames = new Set(
        scssFiles(OTHER_KIT).flatMap((path) => {
            const text = read(path);
            return [...namesIn(text, /(--rt-[a-z0-9-]+)/g), ...interpolatedNames(text)];
        })
    );
    for (const name of [...declared].filter((declaredName) => otherNames.has(declaredName)).sort()) {
        add(`a shared name with the first kit ${name}`, `${name} — the name is used by both kits; the style file connected later wins`);
    }
}

/** 5. The list of handles against its human half. */
const theming = existsSync(join(ROOT, THEMING_DOC)) ? read(THEMING_DOC) : '';
for (const name of [...handleNames].sort()) {
    if (!theming.includes(name)) {
    add(`a handle outside ${THEMING_DOC}: ${name}`, `${name} is named a handle in ${HANDLES_FILE}, but ${THEMING_DOC} says not a word about it`);
    }
}
for (const name of namesIn(theming, /`(--rt-[a-z0-9-]+)`/g)) {
    if (theming.includes('## Ручки потребителя') && !handleNames.has(name) && !declared.has(name)) {
        add(`a name outside the handle list: ${name}`, `${name} is named in ${THEMING_DOC}, but it is neither declared by the kit nor listed in ${HANDLES_FILE}`);
    }
}

if (process.argv.includes('--baseline')) {
    console.log(baselineOf([...new Set(findings.map((finding) => finding.key))].sort(), parseAllowlist('tokens-graph')));
    process.exit(0);
}

const known = parseAllowlist('tokens-graph').keys;
const seen = new Set(findings.map((finding) => finding.key));

const problems = [
    ...findings.filter((finding) => !known.has(finding.key)).map((finding) => finding.text),
    ...[...known]
        .filter((key) => !seen.has(key))
        .map((key) => `${key}: it stands in ${ALLOWLIST}, but the styles no longer hold it — remove the line`),
];

if (problems.length > 0) {
    console.error(`check-tokens-graph: divergences ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    process.exit(1);
}

console.log(
    `check-tokens-graph: declared ${declared.size}, handles ${handleNames.size}, accepted by the list ${seen.size} — there are no new divergences`
);
