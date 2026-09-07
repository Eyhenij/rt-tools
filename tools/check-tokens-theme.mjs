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
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { CONFIG, ROOT, allowlistOf, baselineOf, parseAllowlist } from './rt-kit-checks.config.mjs';

/** The styling layer: the scale, the light theme's assignments, the dark theme's overrides. */
const STYLES = 'projects/ui-kit-v2/src/styles';
const COMPONENTS = 'projects/ui-kit-v2/src/lib';
const PAIRS_FILE = 'tools/tokens-contrast-pairs.json';
const COLORS_DOC = 'projects/ui-kit-v2/docs/Colors.mdx';
const ALLOWLIST = allowlistOf('tokens-theme');

/** The contrast threshold, one for all the pairs. The owner's decision, the agreement's «Decisions» section. */
const THRESHOLD = 4.5;

const LIGHT_MIXIN = 'rt-theme-light-tokens';
const DARK_MIXIN = 'rt-theme-dark-tokens';
const PRESET_MIXIN = 'rt-preset-material-tokens';

/**
 * The four looks a pair is measured in. The material preset is a second layer of assignments, and
 * the dark theme is stronger than it: a name the dark theme answers keeps the dark colour in the
 * material set too, and a name it stays silent about takes the preset's. So the fourth look is not
 * a repetition of the second — it is the only place where those two rules meet.
 */
const LOOKS = ['light', 'dark', 'material', 'material dark'];

/** A declaration with an optional mark of a shared colour on the same line. */
const DECLARATION_RE = /^[ \t]*(--rt-[a-z0-9-]+)[ \t]*:[ \t]*([^;]+);[ \t]*(?:\/\* rt-theme-shared:[ \t]*([^*]*?)[ \t]*\*\/)?/gm;
const COLOR_LITERAL_RE = /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|linear-gradient\(.*\)|transparent)$/i;
const SINGLE_VAR_RE = /^var\(\s*(--rt-[a-z0-9-]+)\s*\)$/;
/**
 * A transparent shade counted from a colour: a share of the colour, the rest transparency. There is
 * one form, because the kit counts shades only that way; an unknown form stays unparsed, and a pair
 * with it is declared a divergence rather than passed over silently.
 */
const COLOR_MIX_RE = /^color-mix\(\s*in\s+srgb\s*,\s*(.+?)\s+([\d.]+)%\s*,\s*transparent\s*\)$/i;
const BLOCK_RE = /^--rt-([a-z0-9]+)-/;

const read = (path) => readFileSync(join(ROOT, path), 'utf8');

/** A mixin's body: from its heading to the line with the closing brace at zero indent. */
function mixinBody(text, name) {
    const start = text.indexOf(`@mixin ${name}`);
    if (start < 0) {
        return '';
    }
    const end = text.indexOf('\n}', start);

    return text.slice(start, end < 0 ? undefined : end);
}

/** The declarations of a piece of text: name → value and the mark of a shared colour. */
function declarations(text) {
    const map = new Map();
    for (const match of text.matchAll(DECLARATION_RE)) {
        map.set(match[1], { value: match[2].trim().replace(/\s+/g, ' '), shared: match[3]?.trim() || null });
    }

    return map;
}

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

const primitives = declarations(read(`${STYLES}/_primitives.scss`));
const light = declarations(mixinBody(read(`${STYLES}/_semantic.scss`), LIGHT_MIXIN));
const dark = declarations(mixinBody(read(`${STYLES}/_theme-dark.scss`), DARK_MIXIN));
const preset = declarations(mixinBody(read(`${STYLES}/_preset-material.scss`), PRESET_MIXIN));

/** A name's value in a look: the dark over the preset, the preset over the light, the scale under all. */
const valueOf = (name, look) =>
    (look.includes('dark') ? dark.get(name)?.value : undefined) ??
    (look.includes('material') ? preset.get(name)?.value : undefined) ??
    light.get(name)?.value ??
    primitives.get(name)?.value;

/** The reference chain of a value: only a whole reference, a compound value does not count as a chain. */
const linkOf = (value) => value.match(SINGLE_VAR_RE)?.[1];

/** The reading of a counted shade: from which colour it is counted and what share of it is taken. */
function mixOf(value) {
    const parts = value.match(COLOR_MIX_RE);

    return parts ? { source: parts[1].trim(), share: Number(parts[2]) / 100 } : undefined;
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

/** A colour parsed: r, g, b and the share of opacity. */
function parseColor(text) {
    const hex = text.match(/^#([0-9a-f]{3,8})$/i)?.[1];
    if (hex) {
        const full = hex.length <= 4 ? [...hex].map((char) => char + char).join('') : hex;
        const channel = (index) => parseInt(full.slice(index * 2, index * 2 + 2), 16);

        return { r: channel(0), g: channel(1), b: channel(2), a: full.length === 8 ? channel(3) / 255 : 1 };
    }
    const rgb = text.match(/^rgba?\(([^)]*)\)$/i)?.[1];
    if (rgb) {
        const parts = rgb.split(/[\s,/]+/).filter(Boolean);
        const alpha = parts[3] ?? '1';

        return {
            r: Number(parts[0]),
            g: Number(parts[1]),
            b: Number(parts[2]),
            a: alpha.endsWith('%') ? Number(alpha.slice(0, -1)) / 100 : Number(alpha),
        };
    }

    return null;
}

/** A name's colour in a theme: by the chain of references down to a literal. */
function colorOf(name, theme, seen = new Set()) {
    const value = valueOf(name, theme);
    if (!value || seen.has(name)) {
        return null;
    }
    seen.add(name);
    const mix = mixOf(value);
    if (mix) {
        const base = colorOfValue(mix.source, theme, seen);

        return base ? { ...base, a: base.a * mix.share } : null;
    }

    return colorOfValue(value, theme, seen);
}

/** A value's colour: a reference goes further along the chain, a literal is parsed on the spot. */
function colorOfValue(value, theme, seen) {
    const link = linkOf(value);

    return link ? colorOf(link, theme, seen) : parseColor(value);
}

/** A semi-transparent colour over an opaque one. */
const over = (front, back) => ({
    r: front.r * front.a + back.r * (1 - front.a),
    g: front.g * front.a + back.g * (1 - front.a),
    b: front.b * front.a + back.b * (1 - front.a),
    a: 1,
});

/** The relative brightness by the WCAG definition. */
function luminance({ r, g, b }) {
    const channel = (value) => {
        const part = value / 255;

        return part <= 0.03928 ? part / 12.92 : ((part + 0.055) / 1.055) ** 2.4;
    };

    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
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
