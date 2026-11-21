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
 * 4. A divergence of the handle list from its human half in `Theming.mdx`: no two lists about one
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

/** The kit whose graph is judged. */
const KIT = 'projects/ui-kit-v2/src';
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
/** The names the kit declares itself, a showcase story's declarations left out. */
const kitDeclared = new Set();
const references = [];

/**
 * A showcase story sets a handle the way an application does, so its declarations are a consumer's,
 * not the kit's. They keep a name the story declares and reads itself from reading as dead, but they
 * do not make a handle the kit's own: counted so, every handle a story shows would read as declared
 * by the kit, and its fallback value as a hidden miss.
 */
const isShowcase = (path) => path.includes('/stories/');

for (const path of files) {
    const text = read(path);
    for (const name of namesIn(text, DECLARATION_RE)) {
        declared.add(name);
        if (!isShowcase(path)) {
            kitDeclared.add(name);
        }
    }
    for (const match of text.matchAll(REFERENCE_RE)) {
        references.push({ name: match[1], path, hasFallback: Boolean(match[2]) });
    }
}

const handles = JSON.parse(read(HANDLES_FILE)).handles ?? {};
const handleNames = new Set(Object.keys(handles));

const findings = [];
const add = (key, text) => findings.push({ key, text });

/**
 * 1. A dead reference: not declared and not named a handle. A story's declaration answers only the
 * story's own reading: a kit reference it answered would pass both this rule and the next one, and
 * the published package, which carries no story, would hold a dead name behind a fallback value.
 */
const isAnswered = (reference) =>
    handleNames.has(reference.name) || kitDeclared.has(reference.name) || (isShowcase(reference.path) && declared.has(reference.name));
for (const name of [...new Set(references.map((reference) => reference.name))].sort()) {
    const unanswered = references.filter((reference) => reference.name === name && !isAnswered(reference));
    if (unanswered.length === 0) {
        continue;
    }
    const where = [...new Set(unanswered.map((reference) => reference.path))];
    add(`a dead reference ${name}`, `${name} — declared by no layer and not named a handle: ${where.join(', ')}`);
}

/** 2. A fallback value at a name the kit declares itself. */
for (const reference of references) {
    if (reference.hasFallback && kitDeclared.has(reference.name)) {
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

/** 4. The list of handles against its human half. */
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
