#!/usr/bin/env node
/**
 * Заменяет в коде приложения имена значков первого кита именами `@rt-tools/ui-kit-v2`.
 *
 * Без `--write` только перечисляет места. С `--write` заменяет статические атрибуты `glyph`, `icon`,
 * `iconEnd`, `invitationGlyph`, `invitationIcon` и `loadingIcon` на тегах `rt-*` и элементах с
 * `rtButton`. Свойства объектов, выражения, чужие теги и `info` перечисляются для ручной замены:
 * там скрипт не знает, значок ли это и чей он. Имя `info` в ките есть и рисует другой значок, чем
 * прежний перевод, поэтому его выбирает человек.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const USAGE = `Использование: node rename-icon-names.mjs [--write] <файл или папка> …

Без --write ничего не меняется: печатается список мест «файл:строка».
Приложению с glyphStrategy: 'font' запускать --write не нужно: там glyph рисуется шрифтом Material,
и замена имён поменяла бы рисунки. Имена у rt-menu-item и в пунктах rt-side-menu замените вручную:
меню шрифтом их не рисует. Тег со своим glyphStrategy="font" или с [glyphStrategy] скрипт не меняет.

Список мест неполный: ручные места ищутся только на строках, где есть слово icon или glyph, а при
обходе папки читаются только .html и .ts. Остальное ищите по именам из icon-names.json рядом со
скриптом. Свой тег приложения с приставкой rt- скрипт считает тегом кита: сначала запустите без --write.`;

const NAMES_FILE = join(dirname(fileURLToPath(import.meta.url)), 'icon-names.json');
const ATTRIBUTES = new Set(['glyph', 'icon', 'iconEnd', 'invitationGlyph', 'invitationIcon', 'loadingIcon']);
const MANUAL_ONLY = new Set(['info']);
const EXTENSIONS = new Set(['.html', '.ts']);
const SKIPPED_DIRS = new Set(['node_modules', 'dist', '.git', '.angular', '.nx', 'coverage']);

/** Открывающий тег с атрибутами; значения атрибутов в кавычках могут содержать `>`. */
const TAG_RE = /<([A-Za-z][\w-]*)((?:\s+[^\s=<>/"']+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>/g;
const ATTRIBUTE_RE = /(\s+)([^\s=<>/"']+)(\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
/** Свой способ рисования у тега: по `font` замена имени сменила бы лигатуру на текст. */
const OWN_STRATEGY_RE = /\s(?:\[glyphStrategy\]\s*=|glyphStrategy\s*=\s*(?:"font"|'font'|font(?![\w-])))/;
const QUOTED_RE = /(['"`])([a-z0-9_]+)\1/g;
const ICON_LINE_RE = /icon|glyph/i;

function fail(message) {
    console.error(`rename-icon-names: ${message}\n\n${USAGE}`);
    process.exit(2);
}

const args = process.argv.slice(2);
const unknown = args.filter((arg) => arg.startsWith('-') && arg !== '--write' && arg !== '--help');

if (unknown.length > 0) fail(`незнакомый ключ: ${unknown.join(', ')}`);

if (args.includes('--help')) {
    console.log(USAGE);
    process.exit(0);
}

const write = args.includes('--write');
const roots = args.filter((arg) => !arg.startsWith('-'));

if (roots.length === 0) fail('не назван ни один файл или папка');

const pairs = new Map(
    JSON.parse(readFileSync(NAMES_FILE, 'utf8'))
        .filter((entry) => entry.from !== entry.to)
        .map((entry) => [entry.from, entry.to])
);

if (pairs.size === 0) fail(`в ${NAMES_FILE} нет ни одной пары`);

function filesUnder(path) {
    if (!statSync(path).isDirectory()) return [path];

    return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
        if (entry.isDirectory()) return SKIPPED_DIRS.has(entry.name) ? [] : filesUnder(join(path, entry.name));

        return entry.isFile() && EXTENSIONS.has(extname(entry.name)) ? [join(path, entry.name)] : [];
    });
}

const lineOf = (text, index) => text.slice(0, index).split('\n').length;

/** Автоматические замены файла: где в тексте стоит старое значение и чем его заменить. */
function automatic(text) {
    const found = [];

    for (const tag of text.matchAll(TAG_RE)) {
        const [whole, name, attributes] = tag;
        const kitTag = name.startsWith('rt-') || /\srtButton(?=[\s=/>])/.test(whole);

        if (!kitTag || OWN_STRATEGY_RE.test(whole)) continue;

        const base = tag.index + 1 + name.length;

        for (const attribute of attributes.matchAll(ATTRIBUTE_RE)) {
            const [, space, key, equals, double, single, bare] = attribute;
            const value = double ?? single ?? bare;

            if (!ATTRIBUTES.has(key) || !pairs.has(value) || MANUAL_ONLY.has(value)) continue;

            const quote = bare === undefined ? 1 : 0;
            const start = base + attribute.index + space.length + key.length + equals.length + quote;

            found.push({ start, end: start + value.length, key, from: value, to: pairs.get(value) });
        }
    }

    return found;
}

/** Остальные старые имена в кавычках на строках про значки: их заменяет человек. */
function manual(text, taken) {
    const found = [];
    let offset = 0;

    for (const [index, line] of text.split('\n').entries()) {
        if (ICON_LINE_RE.test(line)) {
            for (const quoted of line.matchAll(QUOTED_RE)) {
                const start = offset + quoted.index + 1;

                if (pairs.has(quoted[2]) && !taken.has(start)) {
                    found.push({ line: index + 1, from: quoted[2], to: pairs.get(quoted[2]) });
                }
            }
        }

        offset += line.length + 1;
    }

    return found;
}

let replaced = 0;
let left = 0;

for (const file of roots.flatMap(filesUnder)) {
    const text = readFileSync(file, 'utf8');
    const changes = automatic(text);
    const rest = manual(text, new Set(changes.map((change) => change.start)));

    for (const change of changes) {
        console.log(`${write ? 'заменено' : 'заменит'}: ${file}:${lineOf(text, change.start)} ${change.key} ${change.from} → ${change.to}`);
    }

    for (const place of rest) {
        console.log(`вручную: ${file}:${place.line} ${place.from} → ${place.to}`);
    }

    replaced += changes.length;
    left += rest.length;

    if (write && changes.length > 0) {
        const next = [...changes]
            .sort((a, b) => b.start - a.start)
            .reduce((current, change) => current.slice(0, change.start) + change.to + current.slice(change.end), text);

        writeFileSync(file, next);
    }
}

console.log(`rename-icon-names: ${write ? 'заменено' : 'заменит'} ${replaced}, вручную ${left}`);
