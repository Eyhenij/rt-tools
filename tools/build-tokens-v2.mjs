#!/usr/bin/env node
// It builds the second kit's styling layer from the source: three style files and the name types.
//
// The source is projects/ui-kit-v2/src/styles/tokens.source.mjs. What is built is edited only there:
// an edit in a built file is lost on the next build, and tools/check-tokens-build.mjs catches it.
//
// A reference to a name the source does not declare and which is not named a consumer's handle in
// tools/tokens-handles.json drops the build — and not one file is rewritten at that.
//
// The call:
//   node tools/build-tokens-v2.mjs            writes what is built to the disk
//   node tools/build-tokens-v2.mjs --check    writes nothing, answers with an exit code

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const stylesDir = resolve(root, 'projects/ui-kit-v2/src/styles');
const typesFile = resolve(root, 'projects/ui-kit-v2/src/lib/tokens/rt-design-tokens.ts');

const source = await import(`file://${stylesDir}/tokens.source.mjs`);
const { scale, light, darkLayout, coarsePointer, material } = source;

const BANNER = `/* Built by the generator \`tools/build-tokens-v2.mjs\` from \`tokens.source.mjs\` — edited there, not here:
   an edit on the spot is lost on the next build, and \`pnpm run check:tokens-build\` names it. */`;

const PREAMBLE = {
    primitives: `/* The scale steps — the values the assignment layer chooses from. The only place in the kit where
   a colour code and a size as a number are lawful by definition. */`,
    semantic: `/* The light theme's assignments.

   The body is carried into an @mixin for the same reason as the dark theme's: the set is needed not
   only on \`:root\` but on a separate container too. Without that the light half of the
   pair «light ↔ dark» cannot be shown while the application stands in the dark theme —
   the container would inherit the dark values, and both halves would show the same. */`,
    dark: `/* The dark theme — an override of the assignments; the scale steps are unchanging.

   The body is carried into an @mixin so that the same set of overrides could be
   applied not only at the html level (the application's theme) but to a local
   container too (side-by-side light/dark in Storybook) — without duplicating the values.

   The base (\`rt-theme-dark-tokens\`) is warm graphite for the applications and all the
   CDK overlays (asides/dialogs/menus are rendered at the body level, outside the
   shells' host classes — so the graphite is held on :root, otherwise the overlays
   would not inherit the palette).

   The values of the answers live in the source next to their light assignment: a forgotten half of
   a pair is visible right there rather than caught by matching two files. */`,
    material: `/* The material preset — a second layer of assignments: the kit drawn in the look of the first kit.

   It does not touch the scale steps: a rewritten step would repaint the dark theme as well,
   and the dark theme refers to those same steps. The values come from the material steps of the scale.

   The body is taken into a @mixin for the same reason as the dark theme's: the preset is needed not
   only on \`:root\` but on a separate container too — otherwise two presets cannot be shown side by side.

   The preset rule is declared before the dark theme on purpose: the root signs have equal
   specificity, and the order in the file is the only thing by which the dark theme wins over the preset. */`,
};

const COARSE_NOTE = `/* On touch devices an input is not smaller than 16px: WebKit (all of iOS, Chrome included)
   zooms the page on focusing a field with font-size < 16px — hence the horizontal
   shift of the layout. The desktop keeps the dense 14px. */`;

const errors = [];
function fail(message) {
    errors.push(message);
}

/** A declaration and its notes in the shape they will travel into the built file. */
function renderNodes(nodes) {
    const out = [];
    for (const node of nodes) {
        if (node.space && out.length > 0) out.push('');
        if (node.lead) out.push(node.lead);
        if (node.tailComment) {
            out.push(node.tailComment);
            continue;
        }
        if (!node.name) continue;
        // A long compound value is wrapped under its own name: that is how the formatter puts it, and
        // what is built matches it without a second edit.
        const value = node.value.includes('\n') ? `\n        ${node.value}` : ` ${node.value}`;
        out.push(`    ${node.name}:${value};${node.note ? ` /* ${node.note} */` : ''}`);
    }
    return out.join('\n');
}

const lightByName = new Map(light.filter((n) => n.name).map((n) => [n.name, n]));

// The dark layout names the names; the values come from the source, from the light assignment.
const darkNodes = darkLayout.map((node) => {
    if (!node.name) return node;
    const owner = lightByName.get(node.name);
    if (owner) {
        if (owner.dark === undefined) {
            fail(`the dark layout names '${node.name}', and it has no dark theme answer`);
        }
        return { ...node, value: owner.dark, note: node.note ?? owner.darkNote };
    }
    if (node.value === undefined) {
        fail(`'${node.name}' stands in the dark layout, but there is no value either there or in the light assignments`);
    }
    return node;
});

// The material preset declares no names of its own: it overrides the assignments of the base one. A name
// absent from the base set would otherwise be declared only under the preset sign — a page without the
// sign would get a dead reference, and that could be seen only on the showcase.
for (const node of material) {
    if (!node.name) continue;
    if (!lightByName.has(node.name)) {
        fail(`the material preset declares '${node.name}', which is absent from the base assignments`);
    }
}

// Every name declared by the source and every consumer's handle.
const declared = new Set([...scale, ...light, ...darkLayout].filter((n) => n.name).map((n) => n.name));
const handles = new Set(Object.keys(JSON.parse(readFileSync(resolve(root, 'tools/tokens-handles.json'), 'utf8')).handles ?? {}));

// A reference into nowhere drops the build: a name addressed with a typo simply does not
// apply otherwise, and that can be seen only on the showcase and only if somebody looks.
for (const node of [...scale, ...light, ...darkLayout, ...material]) {
    if (!node.name) continue;
    for (const value of [node.value, node.dark]) {
        if (typeof value !== 'string') continue;
        for (const match of value.matchAll(/var\(\s*(--rt-[a-z0-9-]+)/g)) {
            const ref = match[1];
            if (!declared.has(ref) && !handles.has(ref)) {
                fail(`'${node.name}' refers to '${ref}', which the source does not declare and which is not named a consumer's handle`);
            }
        }
    }
}

// A dark answer without its own name in the layout will not get into the built file at all.
const darkNames = new Set(darkLayout.filter((n) => n.name).map((n) => n.name));
for (const node of light) {
    if (node.name && node.dark !== undefined && !darkNames.has(node.name)) {
        fail(`'${node.name}' has a dark theme answer, but the dark layout does not name it`);
    }
}

if (errors.length > 0) {
    console.error(`build-tokens-v2: refusals ${errors.length}, what is built is not rewritten\n`);
    for (const message of errors) console.error(`  ${message}`);
    process.exit(1);
}

const files = {
    [`${stylesDir}/_primitives.scss`]: `${BANNER}\n\n${PREAMBLE.primitives}\n\n:root {\n${renderNodes(scale)}\n}\n`,

    [`${stylesDir}/_semantic.scss`]:
        `${BANNER}\n\n${PREAMBLE.semantic}\n\n@mixin rt-theme-light-tokens {\n${renderNodes(light)}\n}\n\n` +
        `:root {\n    @include rt-theme-light-tokens;\n}\n\n${COARSE_NOTE}\n@media (pointer: coarse) {\n    :root {\n` +
        coarsePointer.map((token) => `        ${token.name}: ${token.value};`).join('\n') +
        `\n    }\n}\n`,

    [`${stylesDir}/_theme-dark.scss`]:
        `${BANNER}\n\n${PREAMBLE.dark}\n\n@mixin rt-theme-dark-tokens {\n${renderNodes(darkNodes)}\n}\n\n` +
        `:root[data-theme='dark'],\nhtml.rt-theme-dark {\n    @include rt-theme-dark-tokens;\n}\n`,

    [`${stylesDir}/_preset-material.scss`]:
        `${BANNER}\n\n${PREAMBLE.material}\n\n@mixin rt-preset-material-tokens {\n${renderNodes(material)}\n}\n\n` +
        `:root[data-preset='material'],\n[data-preset='material'],\n.rt-preset-material {\n` +
        `    @include rt-preset-material-tokens;\n}\n`,

    [typesFile]: renderTypes(),
};

function renderTypes() {
    const names = [...scale, ...light, ...darkLayout].filter((n) => n.name).map((n) => n.name);
    const unique = [...new Set(names)].sort();
    const handleNames = [...handles].sort();
    return (
        `/* Built by the generator \`tools/build-tokens-v2.mjs\` from \`tokens.source.mjs\` — edited there, not here. */\n\n` +
        `/** The name of a styling property the kit declares itself. */\n` +
        `export type TRtDesignTokenName =\n` +
        unique.map((name) => `    | '${name}'`).join('\n') +
        `;\n\n` +
        `/** The name of a consumer's handle — a property the kit deliberately does not declare. */\n` +
        `export type TRtConsumerHandleName =\n` +
        handleNames.map((name) => `    | '${name}'`).join('\n') +
        `;\n\n` +
        `/** All the styling properties declared by the kit. */\n` +
        `export const RT_DESIGN_TOKEN_NAMES: readonly TRtDesignTokenName[] = [\n` +
        unique.map((name) => `    '${name}',`).join('\n') +
        `\n];\n\n` +
        `/** All the consumer's handles: the value comes from the application, until then the fallback works. */\n` +
        `export const RT_CONSUMER_HANDLE_NAMES: readonly TRtConsumerHandleName[] = [\n` +
        handleNames.map((name) => `    '${name}',`).join('\n') +
        `\n];\n`
    );
}

const check = process.argv.includes('--check');
const stale = [];
for (const [path, content] of Object.entries(files)) {
    let onDisk = null;
    try {
        onDisk = readFileSync(path, 'utf8');
    } catch {
        onDisk = null;
    }
    if (onDisk === content) continue;
    if (check) {
        stale.push(path.replace(`${root}/`, ''));
    } else {
        writeFileSync(path, content);
    }
}

if (check) {
    if (stale.length > 0) {
        console.error(`check:tokens-build: what is built diverged from the source — files ${stale.length}\n`);
        for (const path of stale) console.error(`  ${path}`);
        console.error(`\nWhat is built is not edited by hand: edit projects/ui-kit-v2/src/styles/tokens.source.mjs`);
        console.error(`and rebuild by the command \`pnpm run build:tokens-source\`.`);
        process.exit(1);
    }
    console.log(`check:tokens-build: what is built matches the source — files ${Object.keys(files).length}`);
} else {
    console.log(`build-tokens-v2: files built ${Object.keys(files).length}`);
}
