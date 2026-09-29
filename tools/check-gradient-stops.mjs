#!/usr/bin/env node
/**
 * The check of the second kit's gradients: a transition whose ends resolve to one and the same
 * colour.
 *
 * A gradient is written to move a colour. Its ends are colour names, and a name says a role — the
 * subtle background, the default border — not a paint: what paint comes out of a role is decided by
 * the look. Two different roles are free to land on one paint in one look and part in another, and
 * each of them is right in its own place. The gradient between them is then a flat fill: the wave of
 * the loading placeholder ran and had nothing to move, and that stood in the light theme while the
 * dark one was fine.
 *
 * Nothing else sees this. The build assembles it, the styles linter judges the properties, and a
 * snapshot pins a still frame in which a flat fill looks like a lawful placeholder. Only the
 * resolution of every end in every look answers.
 *
 * What the check judges: a gradient written with two or more different stop expressions whose
 * colours, in some look, all come out the same. One name repeated at both ends is lawful — that is
 * how a wave with a crest in the middle is written; the refusal is about a gradient that draws
 * nothing.
 *
 * What it does not judge: how far apart the ends are. A barely visible transition and a bright one
 * are both a transition, and where the boundary lies nobody has said — a number invented here would
 * refuse deliberate work. Flatness has no such boundary: either there is a transition or there is
 * not.
 *
 * The check has no known list: it was created green, and there is nothing in it to accept.
 *
 * A non-zero exit code and a list of the divergences.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';
import { LOOKS, colorOf, parseColor } from './tokens-looks.mjs';

/** Where the kit's gradients live: the components' styles and the styling layer itself. */
const ROOTS = ['projects/ui-kit-v2/src/lib', 'projects/ui-kit-v2/src/rich-editor/lib', 'projects/ui-kit-v2/src/styles'];

const GRADIENT_RE = /\b(?:repeating-)?(?:linear|radial|conic)-gradient\(/g;
const VAR_RE = /^var\(\s*(--rt-[a-z0-9-]+)\s*\)$/;
/** What stands in a stop besides the colour: its position. It says nothing about the colour and is dropped. */
const POSITION_RE = /\s+(-?[\d.]+(?:%|px|rem|em|deg|turn)|calc\([^)]*\))$/;
/** The first argument of a gradient may set the direction rather than a colour. */
const DIRECTION_RE = /^(to\s+[a-z\s]+|-?[\d.]+(?:deg|rad|grad|turn)|(?:circle|ellipse)\b.*|at\s+.*|in\s+\w+.*)$/i;

/** The whole call of a gradient from its opening bracket: brackets are counted, they nest. */
function callAt(text, open) {
    let depth = 1;
    let index = open + 1;
    while (depth > 0 && index < text.length) {
        if (text[index] === '(') {
            depth += 1;
        }
        if (text[index] === ')') {
            depth -= 1;
        }
        index += 1;
    }

    return text.slice(open + 1, index - 1);
}

/** The arguments of a call, split by the commas of the top level: a nested call keeps its own. */
function args(call) {
    const parts = [];
    let depth = 0;
    let start = 0;
    for (let index = 0; index < call.length; index += 1) {
        if (call[index] === '(') {
            depth += 1;
        }
        if (call[index] === ')') {
            depth -= 1;
        }
        if (call[index] === ',' && depth === 0) {
            parts.push(call.slice(start, index));
            start = index + 1;
        }
    }
    parts.push(call.slice(start));

    return parts.map((part) => part.trim().replace(/\s+/g, ' ')).filter(Boolean);
}

/** The colour of a stop in a look: a name goes down its chain, a literal is parsed on the spot. */
function stopColor(stop, look) {
    const name = stop.match(VAR_RE)?.[1];

    return name ? colorOf(name, look) : parseColor(stop);
}

const sameColor = (first, second) =>
    first.r === second.r && first.g === second.g && first.b === second.b && first.a === second.a;

function scssFiles(dir) {
    const files = [];
    for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
        if (CONFIG.skippedDirs.includes(entry.name)) {
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

/** Every gradient of a text with its stops: the direction is dropped, and so is the position of a stop. */
function gradientsOf(text) {
    const found = [];
    for (const match of text.matchAll(GRADIENT_RE)) {
        const open = match.index + match[0].length - 1;
        const parts = args(callAt(text, open));
        const stops = parts
            .filter((part, index) => !(index === 0 && DIRECTION_RE.test(part)))
            .map((part) => part.replace(POSITION_RE, '').trim());
        found.push({ line: text.slice(0, match.index).split('\n').length, stops });
    }

    return found;
}

const findings = [];
let counted = 0;

for (const root of ROOTS.filter((dir) => existsSync(join(ROOT, dir)))) {
    for (const file of scssFiles(root)) {
        const text = readFileSync(join(ROOT, file), 'utf8');
        for (const gradient of gradientsOf(text)) {
            const distinct = [...new Set(gradient.stops)];
            /**
             * A single stop expression is not a transition at all: such a gradient is written
             * deliberately — to hold a place or to be overridden from outside.
             */
            if (distinct.length < 2) {
                continue;
            }
            /**
             * A stop the check cannot resolve makes the whole gradient unjudgeable: an unknown value
             * could well differ from its neighbour, and a refusal on a guess is worse than silence.
             * Such a gradient stays uncounted, so the number in the output is the honest one.
             */
            if (distinct.some((stop) => !stopColor(stop, LOOKS[0]))) {
                continue;
            }
            counted += 1;
            for (const look of LOOKS) {
                const resolved = distinct.map((stop) => stopColor(stop, look));
                if (resolved.some((color) => !color) || !resolved.every((color) => sameColor(color, resolved[0]))) {
                    continue;
                }
                const { r, g, b } = resolved[0];
                findings.push(
                    `${file}:${gradient.line} — written with ${distinct.length} different stops, and in the ` +
                        `${look} look they all come out rgb(${r} ${g} ${b}): ${distinct.join(' → ')}`
                );
            }
        }
    }
}

if (findings.length) {
    console.error('check-gradient-stops: a gradient whose ends come out one colour — it draws nothing\n');
    for (const line of findings) {
        console.error(`  ${line}`);
    }
    console.error(
        '\nA colour name says a role, not a paint: two roles are free to meet on one paint in one look\n' +
            'and part in another. Give the transition names of its own and set them apart in every look —\n' +
            'or write it with a single stop, if a flat fill is what was meant.'
    );
    process.exit(1);
}

console.log(
    `check-gradient-stops: gradients with resolvable stops ${counted} in ${LOOKS.length} looks — ` +
        'none of them comes out one colour'
);
