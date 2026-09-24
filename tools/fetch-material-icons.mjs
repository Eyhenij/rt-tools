#!/usr/bin/env node
/**
 * Вынимает рисунки Material для второго набора значков кита.
 *
 * Набор скачивается один раз и лежит под гитом: пакета Material в дереве нет ни в зависимостях
 * сборки, ни в смежных — ради этого набор и заводится. Скрипт остаётся рядом не ради обновлений,
 * а как запись происхождения: по нему видно, какое имя Material закрыло какое имя кита и откуда
 * приехал файл.
 *
 * Имена берутся из перечня соответствий, а не из своего списка: свой список разошёлся бы с
 * перечнем молча.
 *
 * Запуск: node tools/fetch-material-icons.mjs
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MAP_FILE = join(ROOT, 'projects/ui-kit-v2/src/lib/components/icon/rt-icon-material-map.ts');
const OUT_DIR = join(ROOT, 'projects/ui-kit-v2/src/assets/icons-material');
const BASE = 'https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web';

/** Пара «имя первого кита — имя во втором»: `to` пустое у имён, которым рисунка не нашлось. */
const ENTRY_RE = /\{\s*from:\s*'([^']+)'\s*,\s*to:\s*(?:'([^']+)'|null)/g;

/**
 * Имена, переименованные Material между старым набором и нынешним. Первый кит звал значок так,
 * как звал его старый набор, и по этому имени нынешний отвечает «не найдено» — а читается это
 * как промах перечня соответствий, хотя перечень верен.
 */
const RENAMED = {
    // Ценник: старое имя `local_offer`, нынешнее `sell`.
    local_offer: 'sell',
    // Конверт: старое имя `email`, нынешнее `mail`.
    email: 'mail',
};

/**
 * Два рисунка на имя — контурный и залитый, оба толщиной 700: так первый кит рисует значки
 * шрифтом Material Symbols (`'FILL' 0|1, 'wght' 700`). Залитый лежит рядом с суффиксом `.fill`.
 */
const DRAWINGS = [
    { variant: 'wght700', suffix: '' },
    { variant: 'wght700fill1', suffix: '.fill' },
];

async function pairs() {
    const src = await readFile(MAP_FILE, 'utf8');
    const found = [];
    for (const m of src.matchAll(ENTRY_RE)) {
        if (m[2]) {
            found.push({ material: m[1], kit: m[2] });
        }
    }
    return found;
}

/**
 * Рисунок Material красится своим цветом: заливки в нём нет вовсе, и без неё значок выходит
 * чёрным на любой теме. Признак ставится на само тело, а не на корень: корневой `<svg>` реестр
 * срезает, оставляя одно тело.
 */
function paint(raw) {
    return raw.replace(/<path\b(?![^>]*\bfill=)/g, '<path fill="currentColor"');
}

async function main() {
    const list = await pairs();
    await mkdir(OUT_DIR, { recursive: true });

    const failed = [];
    for (const { material, kit } of list) {
        const symbol = RENAMED[material] ?? material;
        for (const drawing of DRAWINGS) {
            const url = `${BASE}/${symbol}/materialsymbolsoutlined/${symbol}_${drawing.variant}_24px.svg`;
            const answer = await fetch(url);
            if (!answer.ok) {
                failed.push(`${material} ${drawing.variant} — ${answer.status}`);
                continue;
            }
            const raw = await answer.text();
            // Имя файла — имя КИТА: реестр просит значок именем кита, а какое имя Material его
            // закрыло, знает перечень соответствий.
            await writeFile(join(OUT_DIR, `${kit}${drawing.suffix}.svg`), `${paint(raw.trim())}\n`, 'utf8');
        }
    }

    if (failed.length > 0) {
        console.error(`fetch-material-icons: не приехали — ${failed.join(', ')}`);
        process.exit(1);
    }

    console.log(`fetch-material-icons: имён ${list.length}, рисунков ${list.length * DRAWINGS.length}, все легли в assets/icons-material`);
}

await main();
