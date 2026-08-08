#!/usr/bin/env node
/**
 * Проверка того, что образец не написан второй раз.
 *
 * Повтор заводится молча: домен пишет своё перечисление статусов, потому что
 * чужое лежит в либе, которая ему не видна, — и дальше два набора расходятся
 * по одному значению за раз. Ни линт, ни сборка, ни тесты этого не видят:
 * каждая копия сама по себе исправна.
 *
 * Ловится двумя признаками:
 *
 *   1. Одно имя экспортировано из двух разных либ. Имя совпадает не случайно —
 *      его выбирали под одно и то же понятие.
 *   2. Два перечисления с одинаковым набором членов под разными именами.
 *      Имя разошлось, а понятие осталось одно.
 *   3. Настройка под одним именем объявлена в двух либах. Экспорта у неё нет,
 *      поэтому первый признак её не видел: `DEFAULT_PAGE_SIZE` разошёлся на
 *      шесть объявлений, и одно из них успело стать `25` против `20` у
 *      остальных. Считаются только имена вида `SCREAMING_SNAKE_CASE` — форма,
 *      которой в этом коде записывают настройки, а не местные переменные.
 *   4. Перечисление, повторяющее набор из внешнего пакета. Наборы `@rt-tools/utils`
 *      читаются из его `.d.ts` наравне с либами: копия оператора условия и
 *      направления порядка лежала на бэкенде дословно, а признак 2 сравнивал
 *      только либы между собой и до `node_modules` не доходил.
 *
 * Сравнение членов идёт по нижнему регистру без подчёркиваний, поэтому
 * `NOT_EQUALS` контракта и `NotEquals` приложения считаются одним членом.
 *
 * Ключ повтора несёт и список либ: без него третья копия уже известного имени
 * проходила молча — состав менялся, а ключ оставался прежним.
 *
 * Накопленное к моменту заведения проверки лежит в tools/dupes-allowlist.json
 * и отказом не считается: гейт падает на НОВОМ повторе, а старое остаётся
 * видимым числом в сводке. Разбор долга идёт отдельными задачами — иначе
 * проверку пришлось бы заводить вместе с правкой сорока мест.
 *
 * Ненулевой код возврата и перечень расхождений.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { allowlistOf, CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const ALLOWLIST = allowlistOf('dupes');
const SOURCE_ROOT = 'libs';
/**
 * `gen` и `generated` — контракт и клиент Prisma: их объявления и есть источник, с
 * которым сверяются остальные. Считать их копией значит требовать правки того, что
 * пересобирается генератором.
 */
const SKIPPED_DIRS = CONFIG.skippedDirs;
/** Минимум членов, при котором совпадение набора перечислений о чём-то говорит */
const MIN_ENUM_MEMBERS = 2;

const allowlist = JSON.parse(readFileSync(join(ROOT, ALLOWLIST), 'utf8'));
const known = new Set([...(allowlist.accepted ?? []), ...(allowlist.debt ?? [])]);
const debt = new Set(allowlist.debt ?? []);

function collectFiles(dir) {
    const files = [];
    for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
        if (SKIPPED_DIRS.includes(entry.name)) {
            continue;
        }
        const path = `${dir}/${entry.name}`;
        if (entry.isDirectory()) {
            files.push(...collectFiles(path));
        } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
            files.push(path);
        }
    }
    return files;
}

/** Корень либы: путь до каталога `src`. Повтор внутри одной либы повтором не считается */
function libOf(path) {
    const parts = path.split('/');
    const at = parts.indexOf('src');
    return at === -1 ? path : parts.slice(0, at).join('/');
}

const EXPORT_RE = /^export (?:const|function|interface|enum|type|class|abstract class) (\w+)/gm;
const ENUM_RE = /export (?:declare )?enum (\w+)\s*\{([^}]*)\}/g;
const MEMBER_RE = /(\w+)\s*=/g;
/**
 * Настройка-число: имя в верхнем регистре и значение из одних чисел — предел,
 * размер, длительность. Строки и таблицы соответствий сюда не подпадают
 * намеренно: `LOG_CONTEXT` объявлен в восьми либах, и у каждой он свой по смыслу,
 * а совпадение имени числа означает совпадение понятия.
 */
const SETTING_RE = /^(?:export )?const ([A-Z][A-Z0-9_]*)\s*(?::\s*number\s*)?=\s*\d[\d\s*+\-/_.]*;/gm;
/**
 * Настройка-строка и настройка-список. Сверяются по значению, а не по имени: одно имя
 * значит здесь разное — `BEM_BLOCK` объявлен в тридцати шести либах, `LOG_CONTEXT` в
 * десяти, и у каждой либы своё. Одинаковое значение под разными именами — наоборот,
 * почти всегда одно понятие, записанное дважды: имя события правки, код отказа о повторе,
 * набор принимаемых типов вложений.
 */
const STRING_SETTING_RE =
    /^(?:export )?const ([A-Z][A-Z0-9_]*)\s*(?::[^=]*)?=\s*('[^']*'|"[^"]*"|`[^`]*`|\[[^\]]*\])\s*(?:as const\s*)?;/gm;
/** Таблица соответствий: перевод статуса в контракт, колонки в поля сортировки, ключи подписей */
const TABLE_RE = /^(?:export )?const ([A-Z][A-Z0-9_]*)\s*(?::[^=]*)?=\s*\{([^}]*?)\}\s*(?:as const\s*)?;/gms;
const PAIR_RE = /([\w'"[\].]+)\s*:\s*([^,\n]+)/g;
/**
 * Значение короче этого о совпадении понятий не говорит: пустая строка, дефис и `id`
 * совпадают у всех подряд.
 */
const MIN_VALUE_LENGTH = 4;
/** Минимум пар, при котором совпадение таблиц о чём-то говорит */
const MIN_TABLE_PAIRS = 2;

/**
 * Пакеты, чьи наборы считаются наравне с либами. Своё перечисление под уже
 * объявленный там набор — такая же копия, как и между двумя либами.
 */
const EXTERNAL_ENUM_SOURCES = ['node_modules/@rt-tools/utils/esm/lib/interfaces'];

const exportsByName = new Map();
const settingsByName = new Map();
const enums = [];
/** Строковые настройки и списки под ключом значения: `значение → [{ имя, либа }]` */
const namesByValue = new Map();
/** Таблицы соответствий: набор пар под ключом, имя и либа рядом */
const tables = [];

/** Значение без кавычек и пробелов; список — отсортированным набором членов */
function valueOf(raw) {
    if (raw.startsWith('[')) {
        const items = [...raw.matchAll(/'([^']*)'|"([^"]*)"|`([^`]*)`/g)].map((item) => item[1] ?? item[2] ?? item[3]);

        return items.length > 0 ? `[${[...items].sort().join('|')}]` : '';
    }

    return raw.slice(1, -1).trim();
}

function collectEnums(text, lib) {
    for (const match of text.matchAll(ENUM_RE)) {
        const members = [...match[2].matchAll(MEMBER_RE)].map((member) => member[1].toLowerCase().replaceAll('_', ''));
        enums.push({ name: match[1], lib, members: new Set(members) });
    }
}

for (const path of collectFiles(SOURCE_ROOT)) {
    const text = readFileSync(join(ROOT, path), 'utf8');
    const lib = libOf(path);

    for (const match of text.matchAll(EXPORT_RE)) {
        const name = match[1];
        if (!exportsByName.has(name)) {
            exportsByName.set(name, new Set());
        }
        exportsByName.get(name).add(lib);
    }

    for (const match of text.matchAll(SETTING_RE)) {
        const name = match[1];
        if (!settingsByName.has(name)) {
            settingsByName.set(name, new Set());
        }
        settingsByName.get(name).add(lib);
    }

    for (const [, name, raw] of text.matchAll(STRING_SETTING_RE)) {
        const value = valueOf(raw);
        if (value.length < MIN_VALUE_LENGTH) {
            continue;
        }
        if (!namesByValue.has(value)) {
            namesByValue.set(value, []);
        }
        namesByValue.get(value).push({ name, lib });
    }

    for (const [, name, body] of text.matchAll(TABLE_RE)) {
        const pairs = [...body.matchAll(PAIR_RE)].map(
            ([, key, value]) => `${key.replaceAll(/['"[\]]/g, '')}:${value.trim().replace(/,$/, '')}`
        );
        if (pairs.length >= MIN_TABLE_PAIRS) {
            tables.push({ name, lib, pairs: [...pairs].sort().join('|') });
        }
    }

    collectEnums(text, lib);
}

for (const dir of EXTERNAL_ENUM_SOURCES) {
    for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
        if (entry.isFile() && entry.name.endsWith('.d.ts')) {
            collectEnums(readFileSync(join(ROOT, dir, entry.name), 'utf8'), dir.replace('node_modules/', ''));
        }
    }
}

const findings = [];

for (const [name, libs] of [...exportsByName.entries()].sort()) {
    if (libs.size < 2) {
        continue;
    }
    const where = [...libs].sort().join(', ');
    findings.push({ key: `export ${name} @ ${where}`, text: `${name} экспортируется из ${libs.size} либ: ${where}` });
}

for (const [name, libs] of [...settingsByName.entries()].sort()) {
    if (libs.size < 2) {
        continue;
    }
    const where = [...libs].sort().join(', ');
    findings.push({ key: `setting ${name} @ ${where}`, text: `${name} объявлена в ${libs.size} либах: ${where}` });
}

for (const [value, places] of [...namesByValue.entries()].sort()) {
    const libs = new Set(places.map((place) => place.lib));
    if (libs.size < 2) {
        continue;
    }
    const where = places
        .map((place) => `${place.name} @ ${place.lib}`)
        .sort()
        .join(' ~ ');
    findings.push({ key: `value ${value} @ ${where}`, text: `значение ${value} объявлено в ${libs.size} либах: ${where}` });
}

for (let i = 0; i < tables.length; i++) {
    for (let j = i + 1; j < tables.length; j++) {
        const [first, second] = [tables[i], tables[j]];
        if (first.lib === second.lib || first.pairs !== second.pairs) {
            continue;
        }
        const key = `table ${[`${first.name} @ ${first.lib}`, `${second.name} @ ${second.lib}`].sort().join(' ~ ')}`;
        findings.push({ key, text: `${first.name} (${first.lib}) и ${second.name} (${second.lib}) — одна таблица соответствий` });
    }
}

const sameMembers = (first, second) =>
    first.size === second.size && first.size >= MIN_ENUM_MEMBERS && [...first].every((member) => second.has(member));

for (let i = 0; i < enums.length; i++) {
    for (let j = i + 1; j < enums.length; j++) {
        const [first, second] = [enums[i], enums[j]];
        if (first.lib === second.lib || first.name === second.name || !sameMembers(first.members, second.members)) {
            continue;
        }
        const key = `enum ${[`${first.name} @ ${first.lib}`, `${second.name} @ ${second.lib}`].sort().join(' ~ ')}`;
        findings.push({
            key,
            text: `${first.name} (${first.lib}) и ${second.name} (${second.lib}) — один набор членов: ${[...first.members].sort().join(', ')}`,
        });
    }
}

const fresh = findings.filter((finding) => !known.has(finding.key));
const staleKeys = [...known].filter((key) => !findings.some((finding) => finding.key === key));

if (process.argv.includes('--baseline')) {
    const keys = findings.map((finding) => finding.key).sort();
    console.log(JSON.stringify({ ...allowlist, debt: keys }, null, 4));
    process.exit(0);
}

const problems = [
    ...fresh.map((finding) => finding.text),
    ...staleKeys.map((key) => `${key}: значится в ${ALLOWLIST}, но повтора больше нет — строку убрать`),
];

if (problems.length > 0) {
    console.error(`check-dupes: расхождений ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    process.exit(1);
}

console.log(`check-dupes: повторов ${findings.length}, из них принято ${findings.length - debt.size}, долг ${debt.size} — новых нет`);
