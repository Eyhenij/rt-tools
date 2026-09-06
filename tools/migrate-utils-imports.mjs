#!/usr/bin/env node
/**
 * Переставляет импорты, разъехавшиеся по двум пакетам: `@rt-tools/utils` остался без фреймворка,
 * а всё, чему фреймворк нужен, уехало в `@rt-tools/core`.
 *
 * Обратной совместимости у этого переезда нет и быть не может: реэкспорт переехавшего вернул бы
 * Angular в граф зависимостей `utils` и отменил бы весь переезд. Поэтому каждый потребитель правит
 * импорты у себя, и делает это инструмент, а не руки: имён три десятка, и объявление, где рядом
 * стоят переехавшее и оставшееся, руками делится не всегда.
 *
 * О приложении инструмент не знает ничего: его единственное знание о предмете — таблица ниже.
 *
 *     node tools/migrate-utils-imports.mjs <каталог> [--dry]
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** Пакет, откуда имена уехали, и пакет, куда они приехали. */
const FROM = '@rt-tools/utils';
const TO = '@rt-tools/core';

/**
 * Имена, уехавшие из `utils` в `core`. Значение — имя в новом пакете: у перечисления положений оно
 * другое, потому что переименование приехало следом за переездом. Таблица, повторившая старое имя,
 * дала бы объявление, которое собирается адресом и падает именем.
 */
const MOVED = new Map([
    // директивы
    ['RtEscapeKeyDirective', 'RtEscapeKeyDirective'],
    ['RtIconOutlinedDirective', 'RtIconOutlinedDirective'],
    ['RtNavigationDirective', 'RtNavigationDirective'],
    ['RtScrollDirective', 'RtScrollDirective'],
    ['RtScrollToElementDirective', 'RtScrollToElementDirective'],
    ['RtTabQueryParamDirective', 'RtTabQueryParamDirective'],
    // пайпы
    ['BreakStringPipe', 'BreakStringPipe'],
    ['EmptyToDashPipe', 'EmptyToDashPipe'],
    ['EntityToStringPipe', 'EntityToStringPipe'],
    ['EqualChainPipe', 'EqualChainPipe'],
    ['EqualPipe', 'EqualPipe'],
    ['IsEmailPipe', 'IsEmailPipe'],
    ['NotEqualChainPipe', 'NotEqualChainPipe'],
    ['NotEqualPipe', 'NotEqualPipe'],
    ['SanitizePipe', 'SanitizePipe'],
    ['TernaryPipe', 'TernaryPipe'],
    // службы и их настройка
    ['BreakpointService', 'BreakpointService'],
    ['Breakpoints', 'Breakpoints'],
    ['IBreakpoints', 'IBreakpoints'],
    ['DeviceDetectorService', 'DeviceDetectorService'],
    ['WINDOWS', 'WINDOWS'],
    ['MAC_OS', 'MAC_OS'],
    ['LINUX', 'LINUX'],
    ['ANDROID', 'ANDROID'],
    ['IOS', 'IOS'],
    ['UNKNOWN', 'UNKNOWN'],
    // признак окружения, проверки значений, перекрытие и провайдер
    ['NAVIGATOR', 'NAVIGATOR'],
    ['arraysNotEmptyValidator', 'arraysNotEmptyValidator'],
    ['checkIsMatchingValues', 'checkIsMatchingValues'],
    ['OVERLAY_POSITIONS', 'OVERLAY_POSITIONS'],
    ['POSITION_ENUM', 'EPosition'],
    ['isHTMLElement', 'isHTMLElement'],
    ['provideRtUtils', 'provideRtUtils'],
]);

/** Расширения файлов кода. Разметку и стили инструмент не читает: импортов в них нет. */
const CODE = new Set(['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs']);

/** Каталоги, куда обход не заходит: собранное и установленное правится своим источником. */
const SKIP = new Set(['node_modules', 'dist', 'coverage', '.git', '.angular', '.nx', 'tmp']);

/**
 * Объявление, называющее имена в фигурных скобках, — импорт или реэкспорт, со словом `type` перед
 * скобками или без. Звёздочный и умолчательный импорт сюда не попадают: разделить их нечем, и
 * инструмент называет их отдельно.
 */
const NAMED = new RegExp(
    String.raw`(?<head>\b(?:import|export)\s+(?:type\s+)?)\{(?<names>[^}]*)\}(?<mid>\s*from\s*)(?<quote>['"])` +
        FROM.replace('/', String.raw`\/`) +
        String.raw`\k<quote>`,
    'g'
);

/** Звёздочный и умолчательный импорт из того же пакета: делится он только руками. */
const WHOLE = new RegExp(
    String.raw`\bimport\s+(?:\*\s+as\s+\w+|\w+)\s+from\s*['"]` + FROM.replace('/', String.raw`\/`) + String.raw`['"]`,
    'g'
);

/** Именованный импорт из пакета назначения, уже стоящий в файле: в него дописывают, а не заводят второй. */
const EXISTING_TO = new RegExp(
    String.raw`\bimport\s+\{(?<names>[^}]*)\}\s*from\s*(?<quote>['"])` + TO.replace('/', String.raw`\/`) + String.raw`\k<quote>`
);

/** Разбор одного имени в скобках: `type Имя as Своё` — три части, любая из первых двух может отсутствовать. */
function parseName(raw) {
    const text = raw.trim();
    const typed = /^type\s+/.test(text);
    const rest = text.replace(/^type\s+/, '');
    const [source, alias] = rest.split(/\s+as\s+/);

    return { text, typed, source: source.trim(), alias: alias?.trim() };
}

/** Имя, каким оно поедет в новый пакет: переименование приезжает вместе с адресом. */
function renamed(name) {
    const target = MOVED.get(name.source);
    const head = name.typed ? 'type ' : '';

    if (name.alias) {
        return `${head}${target} as ${name.alias}`;
    }

    return target === name.source ? `${head}${target}` : `${head}${target} as ${name.source}`;
}

/**
 * Переписанный текст файла и счёт того, что с ним сделано.
 *
 * Объявление без переехавших имён не трогается вовсе: инструмент зовут на дереве целиком, и файл,
 * которого правка не касается, обязан остаться байт в байт прежним.
 */
function rewrite(text) {
    let moved = 0;
    let split = 0;
    const added = [];

    const next = text.replace(NAMED, (match, ...rest) => {
        const groups = rest.at(-1);
        const names = groups.names
            .split(',')
            .filter((one) => one.trim())
            .map(parseName);
        const goes = names.filter((one) => MOVED.has(one.source));

        if (goes.length === 0) {
            return match;
        }

        const stays = names.filter((one) => !MOVED.has(one.source));
        const fresh = goes.map(renamed);

        if (stays.length === 0) {
            moved += 1;

            return `${groups.head}{ ${fresh.join(', ')} }${groups.mid}${groups.quote}${TO}${groups.quote}`;
        }

        split += 1;
        added.push(...fresh);

        return `${groups.head}{ ${stays.map((one) => one.text).join(', ')} }${groups.mid}${groups.quote}${FROM}${groups.quote}`;
    });

    return { text: added.length ? place(next, added) : next, moved, split, added: added.length };
}

/**
 * Имена из поделённого объявления кладутся в импорт из пакета назначения. Уже стоящий в файле
 * дополняется: второе объявление того же адреса собирается, но линтер потребителя чаще всего
 * считает его дублем — и правку, сделанную инструментом, приходится доправлять руками.
 */
function place(text, added) {
    const existing = EXISTING_TO.exec(text);

    if (existing) {
        const names = existing.groups.names
            .split(',')
            .map((one) => one.trim())
            .filter(Boolean);

        return text.replace(
            existing[0],
            `import { ${[...names, ...added].join(', ')} } from ${existing.groups.quote}${TO}${existing.groups.quote}`
        );
    }

    // Своим объявлением — сразу за тем, из которого имена вынули: рядом с ним читателю видно, что
    // это одна правка, а не два несвязанных импорта.
    const anchor = new RegExp(String.raw`^.*from\s*['"]` + FROM.replace('/', String.raw`\/`) + String.raw`['"].*$`, 'm');
    const line = anchor.exec(text);
    const ending = line[0].trimEnd().endsWith(';') ? ';' : '';

    return text.replace(anchor, `${line[0]}\nimport { ${added.join(', ')} } from '${TO}'${ending}`);
}

/** Обход каталога: файлы кода, кроме собранного и установленного. */
function walk(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        if (entry.isDirectory()) {
            return SKIP.has(entry.name) ? [] : walk(join(dir, entry.name));
        }

        const dot = entry.name.lastIndexOf('.');

        return dot > 0 && CODE.has(entry.name.slice(dot)) ? [join(dir, entry.name)] : [];
    });
}

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const root = args.find((one) => !one.startsWith('--'));

if (args.includes('--help') || !root) {
    console.log('node tools/migrate-utils-imports.mjs <каталог> [--dry]');
    console.log(`Переставляет импорты переехавшего из ${FROM} в ${TO}.`);
    console.log('  <каталог>  что обойти; собранное и установленное пропускается');
    console.log('  --dry      сказать, что изменилось бы, и ничего не записать');
    process.exit(args.includes('--help') ? 0 : 1);
}

let files = 0;
let moved = 0;
let split = 0;
const whole = [];

for (const file of walk(root)) {
    const before = readFileSync(file, 'utf8');

    if (!before.includes(FROM)) {
        continue;
    }

    if (WHOLE.test(before)) {
        whole.push(file);
        WHOLE.lastIndex = 0;
    }

    const after = rewrite(before);

    if (after.text === before) {
        continue;
    }

    files += 1;
    moved += after.moved;
    split += after.split;

    if (!dry) {
        writeFileSync(file, after.text);
    }

    console.log(`${file}: переставлено ${after.moved}, поделено ${after.split}`);
}

// Итог печатается последним: читают его прогоном, а список ручного разбора длиннее его на каждый
// такой файл — и, встав ниже, он оставил бы итог там, где его никто не ищет.
if (whole.length) {
    console.log(`делится только руками — импорт пакета целиком (${whole.length}):`);
    whole.forEach((file) => console.log(`  ${file}`));
    console.log('');
}

console.log(`${dry ? 'сухой прогон: ' : ''}файлов ${files}, объявлений переставлено ${moved}, поделено ${split}`);
