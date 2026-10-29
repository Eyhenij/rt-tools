#!/usr/bin/env node
/**
 * The match of a kit block with its Figma mockup: numbers and an overlay. The rule is `kit-approval`.
 *
 *   node tools/kit-match.mjs numbers <figma.json> <showcase.json>
 *   node tools/kit-match.mjs overlay <figma.png> <showcase.png> <diff.png>
 *
 * The numbers are the gate. Both files map one key per measured value — `<element>.<property>` —
 * to the value: the first is read from the Figma layers, the second from the computed styles of the
 * same elements in the showcase. Every key of the mockup must be measured and equal; the line it
 * prints goes into the approval record as is.
 *
 * The overlay is the picture for the owner: the share of diverged pixels and a frame where they
 * are painted. Figma and the browser raster text differently, so its number is shown, not gated.
 */
import { readFileSync, writeFileSync } from 'node:fs';

import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export { PNG };

/** One spelling for a value: colours to `r,g,b,a`, lengths to a number rounded to a hundredth. */
export function normalize(value) {
    const text = String(value).trim().toLowerCase();
    const hex = /^#([0-9a-f]{6})([0-9a-f]{2})?$/.exec(text);

    if (hex) {
        const [r, g, b] = [0, 2, 4].map((at) => parseInt(hex[1].slice(at, at + 2), 16));
        const a = hex[2] === undefined ? 1 : Math.round((parseInt(hex[2], 16) / 255) * 100) / 100;

        return `${r},${g},${b},${a}`;
    }

    const rgb = /^rgba?\(([^)]+)\)$/.exec(text);

    if (rgb) {
        const parts = rgb[1]
            .split(/[\s,/]+/)
            .filter(Boolean)
            .map(Number);

        return `${parts[0]},${parts[1]},${parts[2]},${parts[3] ?? 1}`;
    }

    const length = /^(-?\d+(?:\.\d+)?)(px)?$/.exec(text);

    return length ? String(Math.round(Number(length[1]) * 100) / 100) : text;
}

/** The keys of the mockup against the showcase: how many match and which do not. */
export function compareNumbers(figma, showcase) {
    const misses = Object.keys(figma)
        .filter((key) => normalize(figma[key]) !== normalize(showcase[key] ?? ''))
        .map((key) => `${key}: макет ${figma[key]}, витрина ${showcase[key] ?? '—'}`);
    const total = Object.keys(figma).length;

    return { total, matched: total - misses.length, misses };
}

/** The share of diverged pixels between two frames of one size, and the diff frame. */
export function overlay(figmaPng, showcasePng) {
    const a = PNG.sync.read(figmaPng);
    const b = PNG.sync.read(showcasePng);

    if (a.width !== b.width || a.height !== b.height) {
        return { error: `размеры кадров разные: макет ${a.width}×${a.height}, витрина ${b.width}×${b.height}` };
    }

    const diff = new PNG({ width: a.width, height: a.height });
    const diverged = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0 });

    return { diverged, share: diverged / (a.width * a.height), diff: PNG.sync.write(diff) };
}

const calledDirectly = process.argv[1] !== undefined && import.meta.url.endsWith(process.argv[1].split('/').pop());

if (calledDirectly) {
    const [mode, first, second, out] = process.argv.slice(2);

    if (mode === 'numbers') {
        const result = compareNumbers(JSON.parse(readFileSync(first, 'utf8')), JSON.parse(readFileSync(second, 'utf8')));

        result.misses.forEach((miss) => console.error(`  ${miss}`));
        console.log(`- **Совпадение:** ${result.matched} из ${result.total} чисел`);
        process.exit(result.total > 0 && result.matched === result.total ? 0 : 1);
    }

    if (mode === 'overlay') {
        const result = overlay(readFileSync(first), readFileSync(second));

        if (result.error) {
            console.error(result.error);
            process.exit(1);
        }

        writeFileSync(out, result.diff);
        console.log(`наложение: разошлось пикселей ${result.diverged} (${(result.share * 100).toFixed(2)}%), кадр разницы ${out}`);
        process.exit(0);
    }

    console.error('usage: kit-match.mjs numbers <figma.json> <showcase.json> | overlay <figma.png> <showcase.png> <diff.png>');
    process.exit(2);
}
