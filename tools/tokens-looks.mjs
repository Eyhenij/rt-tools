/**
 * The looks of the second kit's styling layer, and the resolution of a colour name in each of them.
 *
 * Two checks ask the same question — «what colour does this name give in this look»: the dark
 * theme's check counts the contrast of a pair, the gradient check counts whether the ends of a
 * transition have anything to move between. Written twice, the answer drifts silently: one place
 * learns of a new layer of assignments and the other does not, and both stay green.
 *
 * There is no check of its own here and no output: the module only reads the styling layer and
 * answers. Whoever calls it decides what counts as a divergence.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ROOT } from './rt-kit-checks.config.mjs';

/** The styling layer: the scale, the light theme's assignments, the dark theme's and the preset's overrides. */
export const STYLES = 'projects/ui-kit-v2/src/styles';

const LIGHT_MIXIN = 'rt-theme-light-tokens';
const DARK_MIXIN = 'rt-theme-dark-tokens';
const PRESET_MIXIN = 'rt-preset-material-tokens';

/**
 * The four looks the kit can be drawn in. The material preset is a second layer of assignments, and
 * the dark theme is stronger than it: a name the dark theme answers keeps the dark colour in the
 * material set too, and a name it stays silent about takes the preset's. So the fourth look is not
 * a repetition of the second — it is the only place where those two rules meet.
 */
export const LOOKS = ['light', 'dark', 'material', 'material dark'];

/** A declaration with an optional mark of a shared colour on the same line. */
const DECLARATION_RE = /^[ \t]*(--rt-[a-z0-9-]+)[ \t]*:[ \t]*([^;]+);[ \t]*(?:\/\* rt-theme-shared:[ \t]*([^*]*?)[ \t]*\*\/)?/gm;
export const SINGLE_VAR_RE = /^var\(\s*(--rt-[a-z0-9-]+)\s*\)$/;
/**
 * A transparent shade counted from a colour: a share of the colour, the rest transparency. There is
 * one form, because the kit counts shades only that way; an unknown form stays unparsed, and the
 * caller decides what to do with a name it could not resolve.
 */
const COLOR_MIX_RE = /^color-mix\(\s*in\s+srgb\s*,\s*(.+?)\s+([\d.]+)%\s*,\s*transparent\s*\)$/i;

export const read = (path) => readFileSync(join(ROOT, path), 'utf8');

/** A mixin's body: from its heading to the line with the closing brace at zero indent. */
export function mixinBody(text, name) {
    const start = text.indexOf(`@mixin ${name}`);
    if (start < 0) {
        return '';
    }
    const end = text.indexOf('\n}', start);

    return text.slice(start, end < 0 ? undefined : end);
}

/**
 * A Material name with a fallback: `var(--mat-sys-primary, #4284d7)`. The material preset reads
 * the theme of the page this way, and a page without one gets the fallback. The checks judge the kit
 * on its own, so the value they see is the fallback.
 */
const MATERIAL_THEME_RE = /^var\(\s*--mat-[a-z0-9-]+\s*,\s*(.+)\)$/;

/** A value with its Material names unwrapped, name by name, down to the kit's own fallback. */
export function withoutMaterial(value) {
    let result = value;
    while (MATERIAL_THEME_RE.test(result)) {
        result = result.replace(MATERIAL_THEME_RE, '$1').trim();
    }

    return result;
}

/** The declarations of a piece of text: name → value and the mark of a shared colour. */
export function declarations(text) {
    const map = new Map();
    for (const match of text.matchAll(DECLARATION_RE)) {
        map.set(match[1], { value: withoutMaterial(match[2].trim().replace(/\s+/g, ' ')), shared: match[3]?.trim() || null });
    }

    return map;
}

export const primitives = declarations(read(`${STYLES}/_primitives.scss`));
export const light = declarations(mixinBody(read(`${STYLES}/_semantic.scss`), LIGHT_MIXIN));
export const dark = declarations(mixinBody(read(`${STYLES}/_theme-dark.scss`), DARK_MIXIN));
export const preset = declarations(mixinBody(read(`${STYLES}/_preset-material.scss`), PRESET_MIXIN));

/** A name's value in a look: the dark over the preset, the preset over the light, the scale under all. */
export const valueOf = (name, look) =>
    (look.includes('dark') ? dark.get(name)?.value : undefined) ??
    (look.includes('material') ? preset.get(name)?.value : undefined) ??
    light.get(name)?.value ??
    primitives.get(name)?.value;

/** The reference chain of a value: only a whole reference, a compound value does not count as a chain. */
export const linkOf = (value) => value.match(SINGLE_VAR_RE)?.[1];

/** The reading of a counted shade: from which colour it is counted and what share of it is taken. */
export function mixOf(value) {
    const parts = value.match(COLOR_MIX_RE);

    return parts ? { source: parts[1].trim(), share: Number(parts[2]) / 100 } : undefined;
}

/** A colour parsed: r, g, b and the share of opacity. */
export function parseColor(text) {
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

/** A value's colour: a reference goes further along the chain, a literal is parsed on the spot. */
export function colorOfValue(value, look, seen) {
    // The source of a counted shade may itself be a Material name with a fallback.
    const link = linkOf(withoutMaterial(value));

    return link ? colorOf(link, look, seen) : parseColor(withoutMaterial(value));
}

/** A name's colour in a look: by the chain of references down to a literal. */
export function colorOf(name, look, seen = new Set()) {
    const value = valueOf(name, look);
    if (!value || seen.has(name)) {
        return null;
    }
    seen.add(name);
    const mix = mixOf(value);
    if (mix) {
        const base = colorOfValue(mix.source, look, seen);

        return base ? { ...base, a: base.a * mix.share } : null;
    }

    return colorOfValue(value, look, seen);
}

/** A semi-transparent colour over an opaque one. */
export const over = (front, back) => ({
    r: front.r * front.a + back.r * (1 - front.a),
    g: front.g * front.a + back.g * (1 - front.a),
    b: front.b * front.a + back.b * (1 - front.a),
    a: 1,
});

/** The relative brightness by the WCAG definition. */
export function luminance({ r, g, b }) {
    const channel = (value) => {
        const part = value / 255;

        return part <= 0.03928 ? part / 12.92 : ((part + 0.055) / 1.055) ** 2.4;
    };

    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
