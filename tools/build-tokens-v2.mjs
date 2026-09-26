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

import * as prettier from 'prettier';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const stylesDir = resolve(root, 'projects/ui-kit-v2/src/styles');
const typesFile = resolve(root, 'projects/ui-kit-v2/src/lib/tokens/rt-design-tokens.ts');

const source = await import(`file://${stylesDir}/tokens.source.mjs`);
const { scale, light, darkLayout, coarsePointer, material } = source;

const BANNER = `/* Built by the generator \`tools/build-tokens-v2.mjs\` from \`tokens.source.mjs\` — edited there, not here:
   an edit on the spot is lost on the next build, and \`pnpm run check:tokens-build\` names it. */`;

const PREAMBLE = {
    coexist: `/* Coexistence with the first kit for the time of migration. The first kit declares ten steps of the
   same names on the page root with its own values, and an application holding both kits gets them
   inside the second kit's components: a 4px rounding becomes 8px. Here the second kit's values stand
   on the preset node, and the preset is drawn by its own scale whatever lies on the root.

   The selector outweighs the first kit's root by one step wherever the preset flag stands, the page
   root included: there both kits declare the steps on the same node, and without the extra weight
   the order of inclusion decides.

   The application includes it only while it holds the first kit, and removes it together with it:
   the values repeat the scale, so without the first kit the look does not change. */`,
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

    materialDark: `/* The preset under a dark theme: the names the preset reads from Material keep the Material chain,
   and its last fallback is the dark answer. Material switches its own colours with the application's
   theme, so the search, the fields and the pagination follow the page; without Material the look is
   the former dark one. A name mixed by \`color-mix\` has no fallback to swap and stays on its dark answer. */`,

    scope: `/* A local piece of the theme: the sign answers on an ordinary node too, not at the root of the page
   alone. A dark card inside a light page, a light card inside a dark one, and either of them inside
   a page of the styling set.

   Every rule here declares the whole set of the assignments on one node rather than only the
   difference from the page. That is not a repetition: the value of a property that refers to another
   one is resolved where it is declared, not where it is read. A node carrying only the difference
   inherits the rest from the root already resolved — by the values of the root — and the piece comes
   out half of one theme and half of the other, whole and green in the frame.

   The root is cut out of every rule by \`:not(:root)\`: there the layers already lie in the right
   order, and laying the base over them once more would wipe the set on a dark page.

   The file stands last in the aggregator: its rules are stronger than the root ones by their place,
   not by specificity, and a piece must win over the page around it. */`,
};

const COARSE_NOTE = `/* On touch devices an input is not smaller than 16px: WebKit (all of iOS, Chrome included)
   zooms the page on focusing a field with font-size < 16px — hence the horizontal
   shift of the layout. The desktop keeps the dense 14px. */`;

/* The sign of the theme answers on an ordinary node too, not at the root of the page alone: that is
   what a local piece of the theme stands on — a dark card inside a light page and a light card
   inside a dark one. The whole set goes over together, because a piece repainting the ground alone
   reads as a defect of the layout at the first shadow left from the other theme.

   The properties of a custom property are inherited, so a node carrying the sign wins over what it
   inherited from the root, and the nearer sign wins over the farther one by the same rule. */
const SCOPE_NOTE = {
    light: `/* A light piece inside a page of another theme. */`,
    dark: `/* A dark piece inside a page of another theme. The light base goes under the dark answers, exactly
   as it lies under them at the root: a piece carrying the dark answers alone would inherit the rest
   from the root already resolved by the light values, and come out half dark. */`,
    presetNode: `/* A node carrying the set on a light page. The set alone rewrites only its own names, and a name
   whose value refers to one of them would stay resolved at the root by the base values: the text
   button in a panel of the set kept the base blue while the brand beside it followed the theme. The
   node therefore declares the light base under the set. The dark rules below have the same force and
   stand after this one, so a node under a dark theme still takes them. */`,
    presetOnDark: `/* A piece carrying the set under a dark theme — of the page or of a piece around it. A component
   draws the look of the first kit by carrying the set on its own host, and the plain rule of the set
   would lay its light values over the dark ones the node inherited: the table came out light with
   dark text in a dark piece. The node therefore declares the whole set in the order the root has —
   light base, the set, the dark answers. A light piece between the dark one and the node answers
   with the light base and the set; one level of such nesting is told apart, the next is not. */`,
    presetRootDark: `/* The set and a dark theme both on the page root. The dark answers come after the set there by order,
   and this rule lays the Material chains back over them: it is heavier than both root rules, so the
   order of the files does not decide. */`,
    preset: `/* A piece inside a page of the styling set, and a piece carrying the set itself. The set lies over
   the light base and under the dark answers — the same order the root has, and there the order is
   what the dark theme wins over the set by. */`,
};

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

// The steps the first kit declares on the page root under the same names with its own values. The
// application moving from one kit to the other holds both, the first kit's file comes later, and inside
// the second kit's components its steps win. The coexistence file declares the second kit's values on
// the preset node — whatever stands on the root, the preset is drawn by its own scale. The list goes
// together with the first kit: when it leaves the tree, the file and this list leave with it.
const COEXIST_NAMES = [
    '--rt-radius-xs',
    '--rt-radius-sm',
    '--rt-radius-md',
    '--rt-radius-lg',
    '--rt-radius-xl',
    '--rt-radius-2xl',
    '--rt-radius-full',
    '--rt-shadow-sm',
    '--rt-shadow-md',
    '--rt-shadow-lg',
];
const coexistNodes = COEXIST_NAMES.map((name) => scale.find((node) => node.name === name));
COEXIST_NAMES.forEach((name, index) => {
    if (!coexistNodes[index]) fail(`the coexistence file names '${name}', which the scale does not declare`);
});

// The preset under a dark theme. A preset name read from Material by a chain `var(--mat-…)` follows the
// application's Material theme, and that theme answers dark by itself — the kit's graphite answer laid
// over it drew the search, the filter fields and the pagination unlike the page around them. So such a
// name keeps its chain under a dark theme too, and the last fallback of the chain — the light step —
// becomes the dark answer of the same name: without Material on the page the look is the former dark one
// to the dot. A name mixed by `color-mix` stays on its dark answer: there is no fallback to swap there.
const darkByName = new Map(darkNodes.filter((n) => n.name).map((n) => [n.name, n.value]));
const LIGHT_STEP = /var\(--rt-mat-[\w-]+\)/g;
const materialDark = material
    .filter((node) => node.name && node.value.startsWith('var(--mat-') && darkByName.has(node.name))
    .map((node) => {
        const steps = node.value.match(LIGHT_STEP) ?? [];
        if (steps.length !== 1) fail(`the preset chain of '${node.name}' has ${steps.length} light steps, one is expected`);
        return { name: node.name, value: node.value.replace(LIGHT_STEP, darkByName.get(node.name)) };
    });

if (errors.length > 0) {
    console.error(`build-tokens-v2: refusals ${errors.length}, what is built is not rewritten\n`);
    for (const message of errors) console.error(`  ${message}`);
    process.exit(1);
}

const files = {
    [`${stylesDir}/_primitives.scss`]: `${BANNER}\n\n${PREAMBLE.primitives}\n\n:root {\n${renderNodes(scale)}\n}\n`,

    [`${stylesDir}/_semantic.scss`]:
        `${BANNER}\n\n${PREAMBLE.semantic}\n\n@mixin rt-theme-light-tokens {\n${renderNodes(light)}\n}\n\n` +
        `:root {\n    @include rt-theme-light-tokens;\n}\n`,

    // The coarse pointer lives in a file of its own: together with the light set the file outgrew the
    // length limit. The aggregator forwards it right after the light set — the query rule has the
    // same weight as the root one and wins by coming later.
    [`${stylesDir}/_coarse-pointer.scss`]:
        `${BANNER}\n\n${COARSE_NOTE}\n@media (pointer: coarse) {\n    :root {\n` +
        coarsePointer.map((token) => `        ${token.name}: ${token.value};`).join('\n') +
        `\n    }\n}\n`,

    [`${stylesDir}/_theme-dark.scss`]:
        `${BANNER}\n\n${PREAMBLE.dark}\n\n@mixin rt-theme-dark-tokens {\n${renderNodes(darkNodes)}\n}\n\n` +
        `:root[data-theme='dark'],\nhtml.rt-theme-dark {\n    @include rt-theme-dark-tokens;\n}\n`,

    [`${stylesDir}/_preset-material.scss`]:
        `${BANNER}\n\n${PREAMBLE.material}\n\n@mixin rt-preset-material-tokens {\n${renderNodes(material)}\n}\n\n` +
        `${PREAMBLE.materialDark}\n@mixin rt-preset-material-dark-tokens {\n${renderNodes(materialDark)}\n}\n\n` +
        `:root[data-preset='material'],\n[data-preset='material'],\n.rt-preset-material {\n` +
        `    @include rt-preset-material-tokens;\n}\n`,

    [`${stylesDir}/_theme-scope.scss`]:
        `${BANNER}\n\n${PREAMBLE.scope}\n\n@use './semantic' as semantic;\n@use './theme-dark' as dark;\n` +
        `@use './preset-material' as material;\n\n` +
        `${SCOPE_NOTE.light}\n[data-theme='light']:not(:root) {\n    @include semantic.rt-theme-light-tokens;\n}\n\n` +
        `${SCOPE_NOTE.dark}\n[data-theme='dark']:not(:root) {\n    @include semantic.rt-theme-light-tokens;\n` +
        `    @include dark.rt-theme-dark-tokens;\n}\n\n` +
        `${SCOPE_NOTE.presetNode}\n[data-preset='material']:not(:root),\n.rt-preset-material:not(:root) {\n` +
        `    @include semantic.rt-theme-light-tokens;\n    @include material.rt-preset-material-tokens;\n}\n\n` +
        `${SCOPE_NOTE.presetOnDark}\n[data-theme='dark'] [data-preset='material'],\n` +
        `[data-theme='dark'] .rt-preset-material,\nhtml.rt-theme-dark [data-preset='material'],\n` +
        `html.rt-theme-dark .rt-preset-material {\n` +
        `    @include semantic.rt-theme-light-tokens;\n    @include material.rt-preset-material-tokens;\n` +
        `    @include dark.rt-theme-dark-tokens;\n    @include material.rt-preset-material-dark-tokens;\n}\n\n` +
        `[data-theme='dark'] [data-theme='light'] [data-preset='material'],\n` +
        `[data-theme='dark'] [data-theme='light'] .rt-preset-material,\n` +
        `html.rt-theme-dark [data-theme='light'] [data-preset='material'],\n` +
        `html.rt-theme-dark [data-theme='light'] .rt-preset-material {\n` +
        `    @include semantic.rt-theme-light-tokens;\n    @include material.rt-preset-material-tokens;\n}\n\n` +
        `${SCOPE_NOTE.preset}\n[data-preset='material'][data-theme='light']:not(:root),\n` +
        `[data-preset='material'] [data-theme='light']:not(:root),\n` +
        `.rt-preset-material[data-theme='light']:not(:root),\n.rt-preset-material [data-theme='light']:not(:root) {\n` +
        `    @include semantic.rt-theme-light-tokens;\n    @include material.rt-preset-material-tokens;\n}\n\n` +
        `[data-preset='material'][data-theme='dark']:not(:root),\n[data-preset='material'] [data-theme='dark']:not(:root),\n` +
        `.rt-preset-material[data-theme='dark']:not(:root),\n.rt-preset-material [data-theme='dark']:not(:root) {\n` +
        `    @include semantic.rt-theme-light-tokens;\n    @include material.rt-preset-material-tokens;\n` +
        `    @include dark.rt-theme-dark-tokens;\n    @include material.rt-preset-material-dark-tokens;\n}\n\n` +
        `${SCOPE_NOTE.presetRootDark}\n:root[data-theme='dark'][data-preset='material'],\n:root[data-theme='dark'].rt-preset-material,\n` +
        `html.rt-theme-dark[data-preset='material'],\nhtml.rt-theme-dark.rt-preset-material {\n` +
        `    @include material.rt-preset-material-dark-tokens;\n}\n`,

    [`${stylesDir}/_coexist.scss`]:
        `${BANNER}\n\n${PREAMBLE.coexist}\n\n[data-preset='material']:is(:root, :not(:root)),\n.rt-preset-material:is(:root, :not(:root)) {\n` +
        coexistNodes
            .filter(Boolean)
            .map((node) => `    ${node.name}:${node.value.includes('\n') ? `\n        ${node.value}` : ` ${node.value}`};`)
            .join('\n') +
        `\n}\n`,

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

// What is built passes through the formatter the tree runs on commit: otherwise the formatter wraps a
// long line in the committed file, and the next check reads the wrap as a hand edit.
for (const path of Object.keys(files)) {
    if (!path.endsWith('.scss')) continue;
    const options = (await prettier.resolveConfig(path)) ?? {};
    files[path] = await prettier.format(files[path], { ...options, filepath: path });
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
