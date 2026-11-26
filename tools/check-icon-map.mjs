#!/usr/bin/env node
/**
 * Проверка наборов значков кита.
 *
 * Реестр ходит за каждым значком отдельно, поэтому имя без файла гасит только свой значок: на
 * экране пустое место, а тесты кита зелёные. Судится вот что:
 *
 *   - у каждого имени списка есть рисунок в наборе `kit`, и лишних рисунков там нет;
 *   - перечень набора `material` равен его папке: у каждого имени контурный и залитый рисунок,
 *     лишнего файла нет, а каждое имя перечня есть в списке имён кита;
 *   - список соответствий для загрузчика называет те же имена, что и перечень `material`;
 *   - цепочка запасных каждого встроенного набора без круга доходит до `kit`;
 *   - пары переходного файла ведут на имена кита, старое имя не повторяется, пояснение не пусто.
 *
 * Набор, который объявляет приложение, кит заранее не проверяет.
 *
 * Файлы TypeScript читаются разбором текста: поднимать ради проверки компилятор дороже. Пустой
 * разбор здесь отказ — иначе разошедшаяся форма записи читалась бы зелёным ответом.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ICON_DIR = join(ROOT, 'projects/ui-kit-v2/src/lib/components/icon');
const NAMES_FILE = join(ICON_DIR, 'rt-icon-names.ts');
const SETS_FILE = join(ICON_DIR, 'rt-icon-sets.ts');
const PAIRS_FILE = join(ROOT, 'projects/ui-kit-v2/migrations/icon-names.json');
const SOURCES_FILE = join(ROOT, 'tools/material-icon-sources.json');
const KIT_DIR = join(ROOT, 'projects/ui-kit-v2/src/assets/icons');
const MATERIAL_DIR = join(ROOT, 'projects/ui-kit-v2/src/assets/icons-material');

const NAME = 'check-icon-map';

/** Имя в списке или перечне: строка в кавычках с запятой на конце. */
const QUOTED_LINE_RE = /^\s+'([^']+)',$/gm;
const MATERIAL_LIST_RE = /RT_ICON_MATERIAL_NAMES[^=]*=\s*\[([^\]]*)\]/;
const BUILT_IN_RE = /rtIconBuiltInSets[^=]*=\s*\[([\s\S]*?)\n\];/;
const FILL_SUFFIX = '.fill';

function fail(lines) {
    console.error(`${NAME}: отказ, мест ${lines.length}\n`);
    for (const line of lines) console.error(`  ${line}`);
    console.error(
        '\nИмена — rt-icon-names.ts, наборы — rt-icon-sets.ts, рисунки — src/assets/icons и\n' +
            'src/assets/icons-material, пары переходного скрипта — migrations/icon-names.json.'
    );
    process.exit(1);
}

for (const file of [NAMES_FILE, SETS_FILE, PAIRS_FILE, SOURCES_FILE]) {
    if (!existsSync(file)) fail([`файла нет: ${file}`]);
}

const quotedLines = (text) => [...text.matchAll(QUOTED_LINE_RE)].map((match) => match[1]);
const svgNames = (dir) =>
    readdirSync(dir)
        .filter((file) => file.endsWith('.svg'))
        .map((file) => file.slice(0, -4));
const missing = (from, within) => [...from].filter((item) => !within.has(item));

const sets = readFileSync(SETS_FILE, 'utf8');
const union = new Set(quotedLines(readFileSync(NAMES_FILE, 'utf8')));
const material = new Set(quotedLines(sets.match(MATERIAL_LIST_RE)?.[1] ?? ''));
const builtIn = new Map(
    [...(sets.match(BUILT_IN_RE)?.[1] ?? '').matchAll(/\{[^{}]*\}/g)].map(([block]) => [
        block.match(/\bname:\s*'([^']+)'/)?.[1],
        block.match(/\bfallback:\s*'([^']+)'/)?.[1] ?? null,
    ])
);
const pairs = JSON.parse(readFileSync(PAIRS_FILE, 'utf8'));
const sources = new Set(Object.keys(JSON.parse(readFileSync(SOURCES_FILE, 'utf8'))));

const empty = [
    ['список имён кита', union.size],
    ['перечень набора material', material.size],
    ['описание встроенных наборов', builtIn.size],
    ['пары переходного файла', pairs.length],
]
    .filter(([, size]) => !size)
    .map(([what]) => `${what}: разбор пуст — форма записи разошлась с образцом проверки`);

if (empty.length > 0) fail(empty);

const problems = [];
const kitFiles = new Set(svgNames(KIT_DIR));

for (const name of missing(union, kitFiles)) problems.push(`${name}: имя в списке есть, а рисунка в наборе kit нет`);
for (const name of missing(kitFiles, union)) problems.push(`${name}: рисунок в наборе kit лежит, а имени в списке нет`);

const materialFiles = svgNames(MATERIAL_DIR);
const outlined = new Set(materialFiles.filter((name) => !name.endsWith(FILL_SUFFIX)));
const filled = new Set(materialFiles.filter((name) => name.endsWith(FILL_SUFFIX)).map((name) => name.slice(0, -FILL_SUFFIX.length)));

for (const name of missing(material, union)) problems.push(`${name}: имени из перечня material нет в списке имён кита`);
for (const name of missing(material, outlined)) problems.push(`${name}: в перечне material есть, а контурного рисунка нет`);
for (const name of missing(material, filled)) problems.push(`${name}: в перечне material есть, а залитого рисунка нет`);
for (const name of missing(new Set([...outlined, ...filled]), material)) {
    problems.push(`${name}: рисунок material лежит, а в перечне набора имени нет`);
}
for (const name of missing(material, sources)) problems.push(`${name}: в перечне material есть, а в material-icon-sources.json нет`);
for (const name of missing(sources, material)) problems.push(`${name}: в material-icon-sources.json есть, а в перечне material нет`);

if (!builtIn.has('kit')) problems.push('среди встроенных наборов нет kit');

for (const start of builtIn.keys()) {
    const walked = new Set();
    let current = start;

    while (current !== 'kit') {
        if (walked.has(current)) {
            problems.push(`набор ${start}: цепочка запасных замкнута в круг на ${current}`);
            break;
        }
        walked.add(current);

        if (!builtIn.get(current)) {
            problems.push(`набор ${start}: цепочка запасных обрывается на ${current} и не доходит до kit`);
            break;
        }
        current = builtIn.get(current);
    }
}

const seen = new Set();

for (const { from, to, why } of pairs) {
    if (seen.has(from)) problems.push(`${from}: старое имя в парах встречается дважды`);
    seen.add(from);

    if (!why) problems.push(`${from}: пояснение пары пусто`);
    if (!union.has(to)) problems.push(`${from} → ${to}: пара ведёт на имя, которого в списке кита нет`);
}

if (problems.length > 0) fail(problems);

console.log(
    `${NAME}: имён кита ${union.size}, с рисунком material ${material.size}, встроенных наборов ${builtIn.size}, ` +
        `пар переходного файла ${pairs.length} — расхождений нет`
);
