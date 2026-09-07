/**
 * It builds the social network marks for the second kit's set: a white mark from `simple-icons` on a
 * rounded plate of the network's brand colour. It is run by hand after a change of the package's
 * version or of the list of networks:
 *
 *   node tools/build-social-icons.mjs
 *
 * The files land in `projects/ui-kit-v2/src/assets/icons/social-<network>.svg` and travel into the
 * repository: the package build does not call this script and does not depend on `simple-icons`.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as icons from 'simple-icons';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'projects/ui-kit-v2/src/assets/icons');

/** The plate's side in viewBox units: the same as the rest of the set's marks. */
const TILE = 24;
/** The plate's rounding. */
const TILE_RADIUS = 5;
/** The mark's side inside the plate: the `simple-icons` outline is drawn in a square of 24. */
const GLYPH = 14;

/**
 * The networks in the card's order. The mark's colour is white except KakaoTalk: by its brand
 * rules it has a dark mark on yellow. Instagram carries its own gradient instead of a flat fill.
 */
const NETWORKS = [
    { name: 'facebook', icon: icons.siFacebook },
    { name: 'instagram', icon: icons.siInstagram, gradient: ['#F9CE34', '#EE2A7B', '#6228D7'] },
    { name: 'youtube', icon: icons.siYoutube },
    { name: 'tiktok', icon: icons.siTiktok },
    { name: 'x', icon: icons.siX },
    { name: 'pinterest', icon: icons.siPinterest },
    { name: 'line', icon: icons.siLine },
    { name: 'wechat', icon: icons.siWechat },
    { name: 'xiaohongshu', icon: icons.siXiaohongshu },
    { name: 'kakaotalk', icon: icons.siKakaotalk, glyph: '#191919' },
    { name: 'naver', icon: icons.siNaver },
    { name: 'vk', icon: icons.siVk },
];

function tile(name, icon, gradient) {
    if (!gradient) {
        return { defs: '', fill: `#${icon.hex}` };
    }
    // An identifier with the mark's name: the page's sprite is one for all the symbols, and a second
    // gradient with the same name would cover the first.
    const id = `rt-icon-social-${name}-tile`;
    const stops = gradient
        .map((color, index) => `<stop offset="${Math.round((index / (gradient.length - 1)) * 100)}%" stop-color="${color}"/>`)
        .join('');
    return {
        defs: `<defs><linearGradient id="${id}" x1="0" y1="1" x2="1" y2="0">${stops}</linearGradient></defs>`,
        fill: `url(#${id})`,
    };
}

function svgOf({ name, icon, gradient, glyph = '#FFFFFF' }) {
    const { defs, fill } = tile(name, icon, gradient);
    const offset = (TILE - GLYPH) / 2;
    const scale = GLYPH / 24;
    return [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE} ${TILE}" aria-hidden="true">`,
        defs,
        `<rect width="${TILE}" height="${TILE}" rx="${TILE_RADIUS}" fill="${fill}"/>`,
        `<path fill="${glyph}" transform="translate(${offset} ${offset}) scale(${scale})" d="${icon.path}"/>`,
        '</svg>',
        '',
    ].join('\n');
}

mkdirSync(OUT_DIR, { recursive: true });
const files = [];
for (const network of NETWORKS) {
    if (!network.icon) {
        throw new Error(`build-social-icons: simple-icons has no mark «${network.name}»`);
    }
    const file = join(OUT_DIR, `social-${network.name}.svg`);
    writeFileSync(file, svgOf(network));
    files.push(file);
}
// The formatter edits the files on commit; what is built is brought to the same shape at once,
// otherwise a repeated run of the script gives a divergence on marks that did not change.
execFileSync('pnpm', ['exec', 'prettier', '--write', '--log-level', 'silent', ...files], { cwd: ROOT, stdio: 'inherit' });
console.log(`build-social-icons: marks built ${NETWORKS.length} in ${OUT_DIR}`);
