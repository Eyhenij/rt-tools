#!/usr/bin/env node
/**
 * Вынимает рисунки Material для набора значков `material`.
 *
 * Набор скачивается один раз и лежит под гитом: пакета Material в дереве нет ни в зависимостях
 * сборки, ни в смежных. Скрипт остаётся рядом не ради обновлений, а как запись происхождения:
 * по нему и по списку рядом видно, откуда приехал файл.
 *
 * Какое имя Material закрыло какое имя кита, говорит `material-icon-sources.json`.
 *
 * Вызов: node tools/fetch-material-icons.mjs — без ключей. Любой аргумент даёт отказ: скрипт
 * переписывает всю папку набора, и опечатка в ключе не должна начинать скачивание.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCES_FILE = join(ROOT, 'tools/material-icon-sources.json');
const OUT_DIR = join(ROOT, 'projects/ui-kit-v2/src/assets/icons-material');
const BASE = 'https://raw.githubusercontent.com/google/material-design-icons/master/symbols/web';

/**
 * Два рисунка на имя — контурный и залитый, оба толщиной 700 и оптического размера 48: так первый
 * кит рисует значки шрифтом Material Symbols (`'FILL' 0|1, 'wght' 700, 'opsz' 48`). Оптический
 * размер 24 рисует линии на четверть толще — полоса `drag_handle` 126 единиц против 94, и список
 * второго кита выходил заметно жирнее первого. Залитый лежит рядом с суффиксом `.fill`.
 */
const OPTICAL_SIZE = '48px';
const DRAWINGS = [
    { variant: 'wght700', suffix: '' },
    { variant: 'wght700fill1', suffix: '.fill' },
];

/**
 * Рисунок Material красится своим цветом: заливки в нём нет вовсе, и без неё значок выходит
 * чёрным на любой теме. Признак ставится на само тело, а не на корень: корневой `<svg>` реестр
 * срезает, оставляя одно тело.
 */
function paint(raw) {
    return withViewBox(raw)
        .replace(/<path\b(?![^>]*\bfill=)/g, '<path fill="currentColor"')
        .replace(/\bwidth="48"/, 'width="24"')
        .replace(/\bheight="48"/, 'height="24"');
}

/**
 * Часть рисунков Material лежит в старом виде: без `viewBox`, в сетке 48 × 48. Без него браузер
 * рисует такой значок в первых 24 единицах сетки, то есть четвертью. Сетка старого вида всегда 48 —
 * размер, который скрипт и просит.
 */
function withViewBox(raw) {
    return /\bviewBox=/.test(raw) ? raw : raw.replace(/<svg\b/, '<svg viewBox="0 0 48 48"');
}

async function main() {
    const unknown = process.argv.slice(2);

    if (unknown.length > 0) {
        console.error(`fetch-material-icons: незнакомый аргумент: ${unknown.join(', ')}. Ключей у скрипта нет, ничего не скачано.`);
        process.exit(2);
    }

    const list = Object.entries(JSON.parse(await readFile(SOURCES_FILE, 'utf8')));

    if (list.length === 0) {
        console.error(`fetch-material-icons: список ${SOURCES_FILE} пуст, ничего не скачано.`);
        process.exit(1);
    }

    await mkdir(OUT_DIR, { recursive: true });

    const failed = [];
    for (const [kit, material] of list) {
        for (const drawing of DRAWINGS) {
            const url = `${BASE}/${material}/materialsymbolsoutlined/${material}_${drawing.variant}_${OPTICAL_SIZE}.svg`;
            const answer = await fetch(url);
            if (!answer.ok) {
                failed.push(`${material} ${drawing.variant} — ${answer.status}`);
                continue;
            }
            const raw = await answer.text();
            // Имя файла — имя КИТА: реестр просит значок именем кита.
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
