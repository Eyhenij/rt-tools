/**
 * Собирает знаки соцсетей для набора второго кита: белый знак из `simple-icons` на скруглённой
 * плашке фирменного цвета сети. Запускается руками после смены версии пакета или списка сетей:
 *
 *   node tools/build-social-icons.mjs
 *
 * Файлы ложатся в `projects/ui-kit-v2/src/assets/icons/social-<сеть>.svg` и едут в репозиторий:
 * сборка пакета этот сценарий не зовёт и от `simple-icons` не зависит.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as icons from 'simple-icons';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'projects/ui-kit-v2/src/assets/icons');

/** Сторона плашки в единицах viewBox: та же, что у остальных знаков набора. */
const TILE = 24;
/** Скругление плашки. */
const TILE_RADIUS = 5;
/** Сторона знака внутри плашки: контур `simple-icons` нарисован в квадрате 24. */
const GLYPH = 14;

/**
 * Сети по порядку карточки. Цвет знака белый, кроме KakaoTalk: у него по фирменным правилам
 * тёмный знак на жёлтом. Instagram вместо ровной заливки несёт свой градиент.
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
    // Идентификатор с именем знака: спрайт страницы один на все символы, и второй градиент с
    // тем же именем перекрыл бы первый.
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
for (const network of NETWORKS) {
    if (!network.icon) {
        throw new Error(`build-social-icons: в simple-icons нет знака «${network.name}»`);
    }
    writeFileSync(join(OUT_DIR, `social-${network.name}.svg`), svgOf(network));
}
console.log(`build-social-icons: собрано знаков ${NETWORKS.length} в ${OUT_DIR}`);
