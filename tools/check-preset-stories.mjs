#!/usr/bin/env node
/**
 * The check that the second kit's showcase shows both styling presets side by side.
 *
 * A preset is a second layer of colour assignments: the markup and the sizes stay, the paint moves.
 * Nothing but a pair of frames answers whether it moved where it should — a single frame of either
 * half reads as "so it was", and a divergence between the halves is the one thing invisible while
 * looking at one of them. So the demand is not "the preset builds" but "a person can see both".
 *
 * What the check judges:
 *
 * 1. A family whose styles read a name the preset rewrites has a story showing both halves.
 * 2. A family whose styles read no such name is named in the accepted list with a reason: there the
 *    pair would be two identical halves, and its reference would stay green under any breakage.
 * 3. An entry of either side that nothing answers to any more fails the run — the list only shrinks.
 *
 * The sign of the showing is one and declared: a story of the family whose part is `presets`. That
 * part is what the shared showing harness draws the pair by; a family that shows the pair by some
 * other technique is not seen by the check at all and goes into the list by name.
 *
 * The sign of "the preset touches this family" follows the reference rather than looking for the
 * assignment name in the family's own styles. Taken as a direct mention, the sign answered wrong
 * about a quarter of the kit: a component takes its paint through a property of its own —
 * `--rt-toggle-color-track`, `--rt-field-label-color` — while the default of that property is
 * declared in the shared styling layer and reads there as the very assignment the preset rewrites.
 * By the direct sign such a family looks untouched, and its pair would be excused as empty while the
 * preset moves it on screen.
 *
 * So the check builds the graph of declarations of the styling layer and asks each name the family
 * reads whether any path from it reaches a preset name. What has no path is untouched in substance:
 * there the pair would be two identical halves.
 *
 * A family that shows the pair is asked nothing: showing more than demanded is never a defect, and
 * an entry excusing it would outlive the story it was written next to.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { allowlistOf, baselineOf, parseAllowlist, ROOT, skipUnless } from './rt-kit-checks.config.mjs';

const COMPONENTS = 'projects/ui-kit-v2/src/lib/components';
const PRESET_SOURCE = 'projects/ui-kit-v2/src/styles/tokens.material.mjs';
const STYLES = 'projects/ui-kit-v2/src/styles';
const PRESET_PART = "part: 'presets'";
const ALLOWLIST = allowlistOf('preset-stories');

skipUnless(existsSync(join(ROOT, COMPONENTS)) && existsSync(join(ROOT, PRESET_SOURCE)), `the directory ${COMPONENTS}`);

/** Every file of a directory, to any depth: a family keeps its styles and its stories in subdirectories. */
function filesOf(dir) {
    const found = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
            found.push(...filesOf(path));
        } else {
            found.push(path);
        }
    }

    return found;
}

const { material } = await import(new URL(`../${PRESET_SOURCE}`, import.meta.url));
// The preset source is a list of entries, not a map: an entry carries the assignment name, its value
// and sometimes the comment above it. Read as a map, it hands out indices instead of names — and
// then every family whose styles hold the digit of an index reads as touched. That measurement named
// eight families untouched out of seventy-four, and not one of the eight was measured at all.
const preset = new Set(material.map((entry) => entry.name));

// The graph of the styling layer: a name against the names its value refers to. Only the kit's own
// layer is read here — a family's own file declares properties too, and those are added to the graph
// together with the family being asked.
const DECLARATION = /(--rt-[\w-]+)\s*:\s*([^;]*)/g;
const REFERENCE = /var\(\s*(--rt-[\w-]+)/g;

function declarationsOf(text, into) {
    for (const [, name, value] of text.matchAll(DECLARATION)) {
        const refs = into.get(name) ?? new Set();
        for (const [, reference] of value.matchAll(REFERENCE)) {
            refs.add(reference);
        }
        into.set(name, refs);
    }

    return into;
}

const layer = new Map();
for (const file of filesOf(join(ROOT, STYLES)).filter((path) => path.endsWith('.scss'))) {
    declarationsOf(readFileSync(file, 'utf8'), layer);
}

/** Whether any path from the names read reaches a name the preset rewrites. */
function reachesPreset(read, own) {
    const queue = [...read];
    const seen = new Set(queue);
    while (queue.length > 0) {
        const name = queue.shift();
        if (preset.has(name)) {
            return true;
        }
        for (const next of own.get(name) ?? layer.get(name) ?? []) {
            if (!seen.has(next)) {
                seen.add(next);
                queue.push(next);
            }
        }
    }

    return false;
}
const root = join(ROOT, COMPONENTS);
const families = readdirSync(root)
    .filter((entry) => statSync(join(root, entry)).isDirectory())
    .sort();

const touched = [];
const untouched = [];
const shows = new Set();

for (const family of families) {
    const files = filesOf(join(root, family));
    const styles = files.filter((file) => file.endsWith('.scss')).map((file) => readFileSync(file, 'utf8'));
    const stories = files.filter((file) => file.endsWith('.stories.ts')).map((file) => readFileSync(file, 'utf8'));
    const own = new Map();
    const read = new Set();
    for (const text of styles) {
        declarationsOf(text, own);
        for (const [, reference] of text.matchAll(REFERENCE)) {
            read.add(reference);
        }
    }
    (reachesPreset(read, own) ? touched : untouched).push(family);
    if (stories.some((text) => text.includes(PRESET_PART))) {
        shows.add(family);
    }
}

const list = parseAllowlist('preset-stories');
const missing = touched.filter((family) => !shows.has(family));

if (process.argv.includes('--baseline')) {
    console.log(baselineOf(missing.sort(), list));
    process.exit(0);
}

const problems = [
    ...missing
        .filter((family) => !list.debt.has(family))
        .map((family) => `${relative(ROOT, join(root, family))}: the preset rewrites what these styles read, and no story shows both halves`),
    ...untouched
        .filter((family) => !shows.has(family) && !list.accepted.has(family))
        .map((family) => `${relative(ROOT, join(root, family))}: the preset touches nothing here — name it in «accepted» of ${ALLOWLIST} with a reason, or show the pair`),
    ...[...list.debt.keys()]
        .filter((family) => !missing.includes(family))
        .map((family) => `${family}: it stands in the debt of ${ALLOWLIST}, and the pair is already shown or the preset no longer touches it — remove the line`),
    ...[...list.accepted.keys()]
        .filter((family) => !untouched.includes(family) || shows.has(family))
        .map((family) => `${family}: it stands in «accepted» of ${ALLOWLIST}, and the preset now touches these styles — the pair is shown rather than excused`),
];

if (problems.length > 0) {
    console.error(`check-preset-stories: divergences ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    process.exit(1);
}

console.log(
    `check-preset-stories: families ${families.length}, the preset rewrites assignments ${preset.size}; ` +
        `touched by it ${touched.length}, of them showing the pair ${touched.length - missing.length} and awaiting their turn ${missing.length}; ` +
        `not touched and named with a reason ${untouched.length}`
);
