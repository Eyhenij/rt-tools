#!/usr/bin/env node
/**
 * The check of the second kit's cascade layer: a kit rule is declared inside the layer rather than in
 * the common cascade.
 *
 * The layer is created for one promise — an application's rule beats a kit's rule without a count of
 * specificity. It holds exactly until the first style file that arrived past the layer: such a file
 * goes on working, drops nothing and is visible only by eye at a consumer, who has nothing to
 * override it with again except going around somebody else's layout. Eighty-seven files were wrapped
 * at once, and without the check the eighty-eighth would arrive just as silently.
 *
 * What the check judges:
 *
 * 1. A component's style file without a declaration of the sublayer `rt-kit.components`.
 * 2. A second layer declaration in the same file — the wrapper is one per file, otherwise part of the
 *    rules stays outside while the file looks wrapped.
 * 3. A rule standing in the file before the wrapper. Outside only the declarations `@use`, `@forward`
 *    and `@import` are lawful: sass demands them at the file's beginning and drops the build on a
 *    wrapped one.
 * 4. The order of the sublayers declared by the styling layer. A sublayer not named in advance takes
 *    its place in the cascade by its first appearance, and they appear in the order of loading —
 *    Angular injects a component's styles as a separate block, and it is able to outrun the base.
 * 5. A declaration of properties on the page root that drifted into the styling layer inside a
 *    `@layer` block: a consumer's repainting of the brand holds by order rather than by the layer.
 * 6. A rule standing AFTER the wrapper's closing brace. Such a file looks wrapped and until this
 *    article passed silently: the check judged the number of wrappers and the rules before the first
 *    one. A move out is sometimes needed on the merits — a kit rule arguing with a non-layered rule
 *    of a foreign library loses inside the layer whatever the specificity — so a deliberate move out
 *    is told from a miss by the mark `rt-layer-outside` in the explanation next to the moved rules.
 *
 * What has piled up lies in the accepted list, does not count as a refusal and is visible as a
 * number; the check falls on a NEW place. The list only shrinks: a record nothing answers to any more
 * drops the run.
 *
 * A non-zero exit code and a list of the divergences.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { ROOT, allowlistOf, baselineOf, parseAllowlist } from './rt-kit-checks.config.mjs';

/** The set of component styles and the styling layer declaring the order of the sublayers. */
const COMPONENTS = 'projects/ui-kit-v2/src/lib';
const STYLES = 'projects/ui-kit-v2/src/styles';
const LAYERS_FILE = join(STYLES, '_layers.scss');
const ALLOWLIST = allowlistOf('cascade-layer');

/** The wrapper of a component's styles and the declaration of the sublayer order. */
const COMPONENT_LAYER = '@layer rt-kit.components {';
const LAYER_ORDER = /@layer\s+rt-kit\.vendor\s*,\s*rt-kit\.base\s*,\s*rt-kit\.components\s*;/;

/** Outside the wrapper only sass declarations are lawful: it demands them at the file's beginning. */
const OUTSIDE_OK = /^@(use|forward|import)\b/;

/**
 * The mark of a deliberate move out of the layer. It stands in the explanation next to the moved
 * rules and is read by whoever edits the file — the accepted list would be read only by whoever opened it.
 */
const OUTSIDE_MARK = 'rt-layer-outside';

const findings = [];
const add = (key, text) => findings.push({ key, text });

/** How many files moved part of their rules out of the layer on purpose, with the mark. */
let marked = 0;

/**
 * The code lines out of the set of lines: the empty ones and the explanations are removed.
 *
 * A comment is judged by state rather than by the line's beginning: a block one is sometimes
 * continued without a leading star, and such a line would read as a rule.
 */
function codeLines(lines) {
    const code = [];
    let inComment = false;

    for (const line of lines) {
        const bare = line.trim();
        if (inComment) {
            if (bare.includes('*/')) inComment = false;
            continue;
        }
        if (bare === '' || bare.startsWith('//')) continue;
        if (bare.startsWith('/*')) {
            if (!bare.includes('*/')) inComment = true;
            continue;
        }
        code.push(bare);
    }

    return code;
}

/** The position past the closing brace of the block opened at the place `at`. */
function closingBrace(text, at) {
    let depth = 0;
    let index = text.indexOf('{', at);

    while (index < text.length) {
        if (text[index] === '{') depth += 1;
        if (text[index] === '}') depth -= 1;
        index += 1;
        if (depth === 0) return index;
    }

    return text.length;
}

const scssIn = (dir) => {
    const out = [];
    for (const entry of readdirSync(resolve(ROOT, dir), { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) out.push(...scssIn(path));
        else if (entry.name.endsWith('.scss')) out.push(path);
    }
    return out;
};

const files = scssIn(COMPONENTS).sort();

for (const file of files) {
    const text = readFileSync(resolve(ROOT, file), 'utf8');
    const count = text.split(COMPONENT_LAYER).length - 1;

    if (count === 0) {
        add(`${file}: without a layer`, `${file}: the rules stand outside the layer — wrap them in «${COMPONENT_LAYER} … }»`);
        continue;
    }

    if (count > 1) {
        add(
            `${file}: wrappers ${count}`,
            `${file}: layer wrappers ${count}, and one is needed: part of the rules stays outside while the file looks wrapped`
        );
    }

    // A comment is judged by state rather than by the line's beginning: a block one is sometimes
    // continued without a leading star, and such a line would read as a rule outside the layer.
    const before = text.slice(0, text.indexOf(COMPONENT_LAYER)).split('\n');
    const stray = codeLines(before).filter((line) => !OUTSIDE_OK.test(line));

    if (stray.length > 0) {
        add(
            `${file}: a rule before the wrapper`,
            `${file}: before the wrapper stands «${stray[0].slice(0, 60)}» — outside only @use, @forward and @import are lawful`
        );
    }

    // The tail past the wrapper's closing brace. It is empty at eighty-seven files out of
    // eighty-eight; a non-empty one means either a deliberate move out or a part of the file that
    // drifted past the brace, and the mark tells them apart.
    const tail = text.slice(closingBrace(text, text.indexOf(COMPONENT_LAYER)));
    const outside = codeLines(tail.split('\n'));

    if (outside.length === 0) continue;

    if (!tail.includes(OUTSIDE_MARK)) {
        add(
            `${file}: a rule after the wrapper`,
            `${file}: after the wrapper stands «${outside[0].slice(0, 60)}» — part of the file is left outside the layer while the file looks wrapped. A deliberate move out is marked «${OUTSIDE_MARK}» in the explanation next to the moved rules`
        );
        continue;
    }

    marked += 1;
}

const layers = readFileSync(resolve(ROOT, LAYERS_FILE), 'utf8');

if (!LAYER_ORDER.test(layers)) {
    add(
        `${LAYERS_FILE}: the sublayer order`,
        `${LAYERS_FILE}: the sublayer order is not declared by the line «@layer rt-kit.vendor, rt-kit.base, rt-kit.components;» — a sublayer not named in advance takes its place in the cascade by its first appearance`
    );
}

for (const file of scssIn(STYLES).sort()) {
    if (relative(ROOT, resolve(ROOT, file)) === relative(ROOT, resolve(ROOT, LAYERS_FILE))) continue;

    const text = readFileSync(resolve(ROOT, file), 'utf8');
    let depth = 0;

    for (const line of text.split('\n')) {
        if (/^\s*@layer\s+rt-kit\.\w+\s*\{/.test(line)) {
            depth = 1;
            continue;
        }
        if (depth > 0) {
            if (/^\s*:root[\s,{]/.test(line)) {
                add(
                    `${file}: :root inside the layer`,
                    `${file}: a declaration on the page root drifted inside the layer — a consumer overrides it by order, and the layer takes that possibility away`
                );
                break;
            }
            depth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
            if (depth <= 0) depth = 0;
        }
    }
}

if (process.argv.includes('--baseline')) {
    console.log(baselineOf([...new Set(findings.map((finding) => finding.key))].sort(), parseAllowlist('cascade-layer')));
    process.exit(0);
}

const known = parseAllowlist('cascade-layer').keys;
const seen = new Set(findings.map((finding) => finding.key));

const problems = [
    ...findings.filter((finding) => !known.has(finding.key)).map((finding) => finding.text),
    ...[...known]
        .filter((key) => !seen.has(key))
        .map((key) => `${key}: it stands in ${ALLOWLIST}, but the styles no longer hold it — remove the line`),
];

if (problems.length > 0) {
    console.error(`check-cascade-layer: divergences ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    process.exit(1);
}

console.log(
    `check-cascade-layer: style files ${files.length}, all in the sublayer rt-kit.components; moved out of the layer with the mark ${marked}; the sublayer order is declared, accepted by the list ${seen.size}`
);
