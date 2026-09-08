#!/usr/bin/env node
/**
 * The check of the second kit's dark theme: the completeness of the answers and the contrast of the
 * pairs «the text colour and its background».
 *
 * The light theme assigns a colour, the dark one answers with an override — or does not answer, and
 * then the colour is one in both themes. There is nothing to tell a deliberately shared colour from a
 * forgotten one: both look like a missing line, and that is visible only by eye on the showcase and
 * only if somebody looked there.
 *
 * What the check judges:
 *
 * 1. A silent colour assignment — the dark theme does not answer it, and nobody named the colour
 *    shared. An answer counts through a chain of references too: an assignment referring to an
 *    overridden one changes together with it, and there is no point duplicating the line in the dark
 *    theme.
 * 2. The mark «the colour is shared» at an assignment the dark theme does answer: the mark outlived
 *    an edit and lies.
 * 3. An override in the dark theme without an assignment in the light one — the dark half of the
 *    pair is left alone.
 * 4. A dark answer in a component's styles: it is declared by a theme sign past the styling layer.
 *    The component's own property is lawful at that — the component is tuned by it.
 * 5. An override of a scale step by the dark theme: the scale is unchanging, the theme is held by the
 *    assignments.
 * 6. A pair «the text colour and its background» below the threshold 4.5:1 — in any of the four
 *    looks: the light theme, the dark one, the material preset and the preset under the dark theme.
 * 7. A divergence of the list of pairs from the measurement table in `Colors.mdx`: no two lists about
 *    one and the same thing are created without a matching.
 *
 * What has piled up lies in the accepted list, does not count as a refusal and is visible as a
 * number; the check falls on a NEW place. The list only shrinks: a record nothing answers to any more
 * drops the run.
 *
 * A non-zero exit code and a list of the divergences.
 */
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { CONFIG, ROOT, allowlistOf, baselineOf, parseAllowlist } from './rt-kit-checks.config.mjs';
import {
    LOOKS,
    SINGLE_VAR_RE,
    colorOf,
    dark,
    declarations,
    light,
    linkOf,
    luminance,
    mixOf,
    mixinBody,
    over,
    primitives,
    read,
} from './tokens-looks.mjs';

const COMPONENTS = 'projects/ui-kit-v2/src/lib';
const PAIRS_FILE = 'tools/tokens-contrast-pairs.json';
const COLORS_DOC = 'projects/ui-kit-v2/docs/Colors.mdx';
const ALLOWLIST = allowlistOf('tokens-theme');

/** The contrast threshold, one for all the pairs. The owner's decision, the agreement's «Decisions» section. */
const THRESHOLD = 4.5;

const COLOR_LITERAL_RE = /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|linear-gradient\(.*\)|transparent)$/i;
const BLOCK_RE = /^--rt-([a-z0-9]+)-/;

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

/** Is the value a colour: a colour literal or a reference reaching a literal. */
function isColor(value, seen = new Set()) {
    if (COLOR_LITERAL_RE.test(value)) {
        return true;
    }
    const mix = mixOf(value);
    if (mix) {
        return isColor(mix.source, seen);
    }
    const link = linkOf(value);
    if (!link || seen.has(link)) {
        return false;
    }
    seen.add(link);
    const next = light.get(link)?.value ?? primitives.get(link)?.value;

    return next ? isColor(next, seen) : false;
}

/**
 * Does the assignment answer the dark theme: directly, through a chain of references or not at all.
 * The mark of a shared colour and a record of the accepted list act by the same chain — an
 * assignment inherits both the colour and the reason of the link it refers to.
 */
function answerOf(name, accepted, seen = new Set()) {
    if (dark.has(name)) {
        return { kind: 'directly' };
    }
    if (light.get(name)?.shared) {
        return { kind: 'marked' };
    }
    /**
     * An accepted link mutes those that refer to it but does not mute itself: otherwise the check
     * reads its own record as «the place is gone», and the accepted list turns red on itself.
     */
    if (seen.size > 0 && accepted.has(`silent ${name}`)) {
        return { kind: 'accepted' };
    }
    const link = linkOf(light.get(name)?.value ?? '');
    if (!link || seen.has(link) || !light.has(link)) {
        return null;
    }
    seen.add(link);
    const upstream = answerOf(link, accepted, seen);

    return upstream ? { kind: upstream.kind === 'directly' ? 'through a chain' : upstream.kind, via: link } : null;
}

const contrast = (first, second) => {
    const [bright, dim] = [luminance(first), luminance(second)].sort((left, right) => right - left);

    return (bright + 0.05) / (dim + 0.05);
};

/**
 * The accepted list is pairs «the place and the reason it is accepted». The reason is mandatory:
 * without it the list reads in a month as a list of places somebody once decided not to fix.
 */
const allowlist = parseAllowlist('tokens-theme', ['accepted']);
const accepted = new Set(allowlist.accepted.keys());
const findings = [];
const add = (key, text) => findings.push({ key, text });

const colorAssignments = [...light].filter(([, declaration]) => isColor(declaration.value));
const answers = new Map(colorAssignments.map(([name]) => [name, answerOf(name, accepted)]));

/** 1–2. Silence without a reason and a mark the override outlived. */
for (const [name, declaration] of colorAssignments) {
    if (!answers.get(name)) {
        add(
            `silent ${name}`,
            `${name} — the light theme assigns a colour, the dark one does not answer, and nobody named it shared: either an override or the mark rt-theme-shared with a reason`
        );
    }
    if (declaration.shared && dark.has(name)) {
        add(
            `an extra mark ${name}`,
            `${name} is marked shared for both themes, but the dark theme overrides it — the mark lies`
        );
    }
}

/** 3. An override of the dark theme without an assignment in the light one. */
for (const [name] of dark) {
    if (!light.has(name) && !primitives.has(name)) {
        add(
            `dark without light ${name}`,
            `${name} is overridden by the dark theme, but the light one does not assign it — half the pair is left alone`
        );
    }
}

/** 5. The dark theme rewrites a scale step. */
for (const [name] of dark) {
    if (primitives.has(name) && !light.has(name)) {
        add(
            `a scale step in the dark ${name}`,
            `${name} — a scale step rewritten by the dark theme: the scale is unchanging, the theme is held by the assignments`
        );
    }
}

/** 4. A dark answer in a component's styles, past the styling layer. */
for (const path of scssFiles(COMPONENTS)) {
    const text = read(path);
    const block = path.split('/').pop().replace(/^_?rt-/, '').replace(/\.component\.scss$/, '');
    for (const match of text.matchAll(/(?:^|\n)([^\n{]*(?:data-theme|rt-theme-dark)[^\n{]*)\{([^}]*)\}/g)) {
        const own = [...declarations(match[2]).keys()];
        if (own.length > 0 && own.every((name) => block.startsWith(name.match(BLOCK_RE)?.[1] ?? ''))) {
            continue;
        }
        add(
            `a dark block ${path}`,
            `${path} — a dark answer is declared by a theme sign in a component's styles: it lives in the styling layer or declares the component's own property`
        );
    }
}

/** 6–7. The contrast of the pairs and the measurement table. */
const pairs = existsSync(join(ROOT, PAIRS_FILE)) ? JSON.parse(read(PAIRS_FILE)).pairs ?? [] : [];
const doc = existsSync(join(ROOT, COLORS_DOC)) ? read(COLORS_DOC) : '';
/** A pair is named in the measurement table if both its names stand on one line of the page. */
const docLines = doc.split('\n');
const measured = [];

for (const pair of pairs) {
    for (const theme of LOOKS) {
        const page = colorOf('--rt-color-bg-page', theme);
        const backdrop = colorOf(pair.bg, theme);
        const ink = colorOf(pair.text, theme);
        if (!backdrop || !ink) {
            add(
                `a pair without a colour ${pair.text} on ${pair.bg}`,
                `${pair.text} on ${pair.bg} — the colour does not resolve to a code in the ${theme} look: the list of pairs named a name the layer does not declare`
            );
            break;
        }
        const solidBackdrop = backdrop.a < 1 && page ? over(backdrop, page) : backdrop;
        const ratio = contrast(ink.a < 1 ? over(ink, solidBackdrop) : ink, solidBackdrop);
        measured.push({ ...pair, theme, ratio });
        if (ratio < THRESHOLD) {
            add(
                `contrast ${pair.text} on ${pair.bg} in the ${theme}`,
                `${pair.text} on ${pair.bg} in the ${theme} look — ${ratio.toFixed(2)}:1 at the threshold ${THRESHOLD}:1`
            );
        }
    }
    if (doc && !docLines.some((line) => line.includes(pair.text) && line.includes(pair.bg))) {
        add(
            `a pair outside ${COLORS_DOC}: ${pair.text} on ${pair.bg}`,
            `${pair.text} on ${pair.bg} stands in ${PAIRS_FILE}, but the measurement table ${COLORS_DOC} has no such pair`
        );
    }
}

if (process.argv.includes('--baseline')) {
    const keys = [...new Set(findings.map((finding) => finding.key))].sort();
    console.log(baselineOf(keys, allowlist, 'accepted'));
    process.exit(0);
}

if (process.argv.includes('--measure')) {
    for (const row of measured) {
        console.log(`${row.text} on ${row.bg} — ${row.theme}: ${row.ratio.toFixed(2)}:1`);
    }
    process.exit(0);
}

const seen = new Set(findings.map((finding) => finding.key));
const problems = [
    ...findings.filter((finding) => !accepted.has(finding.key)).map((finding) => finding.text),
    ...[...accepted]
        .filter((key) => !seen.has(key))
        .map((key) => `${key}: it stands in ${ALLOWLIST}, but the styles no longer hold it — remove the line`),
];

if (problems.length > 0) {
    console.error(`check-tokens-theme: divergences ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    process.exit(1);
}

const kinds = [...answers.values()].filter(Boolean);
const count = (kind) => kinds.filter((answer) => answer.kind === kind).length;
const acceptedOf = (prefix) => [...seen].filter((key) => key.startsWith(prefix)).length;

console.log(
    `check-tokens-theme: colour assignments ${colorAssignments.length} — answered directly ${count('directly')}, ` +
        `through a chain ${count('through a chain')}, marked shared ${count('marked')}, accepted by the list ${acceptedOf('silent ')}`
);
console.log(
    `check-tokens-theme: dark answers past the styling layer accepted by the list ` +
        `${acceptedOf('a dark block ') + acceptedOf('a scale step in the dark ')}`
);
console.log(
    `check-tokens-theme: contrast pairs ${pairs.length} in ${LOOKS.length} looks, the threshold ${THRESHOLD}:1 — ` +
        `below the threshold ${acceptedOf('contrast ')}, and all are accepted by the list`
);
