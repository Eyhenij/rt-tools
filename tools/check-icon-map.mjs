#!/usr/bin/env node
/**
 * Проверка перечня соответствия значков первого кита значкам второго.
 *
 * Перечень — обычный файл репозитория, и промах в нём не ловится ничем другим: реестр значков
 * ходит за каждым именем отдельно, поэтому имя, которому файла нет, гасит только свой значок.
 * На экране это пустое место, а прогон при этом зелёный. Отсюда требование карточки —
 * подтверждено прогоном, а не чтением.
 *
 * Судится четыре вещи:
 *
 *   - каждая пара ведёт на имя, объявленное в союзе имён набора;
 *   - тому же имени отвечает файл рисунка на диске — союз и каталог расходятся молча;
 *   - имя первого кита не повторяется: два ответа одному имени и есть тот самый разнобой,
 *     ради устранения которого перечень заводится;
 *   - у имени без пары причина не пуста — молчание об имени неотличимо от того, что о нём забыли.
 *
 * Читается перечень разбором текста, а не импортом: файл лежит в исходниках пакета на TypeScript,
 * и поднимать ради проверки компилятор дороже, чем прочитать три поля записи. Плата за это —
 * разбор молча даёт ноль записей, если форма записи разойдётся с образцом; поэтому пустой разбор
 * здесь отказ, а не зелёный ответ.
 *
 * Стоит в наборе гейта пуша и шагом конвейера: проверка, живущая только в цели, которую зовут
 * руками, отвечает тому, кто о ней вспомнил.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ICON_DIR = join(ROOT, 'projects/ui-kit-v2/src/lib/components/icon');
const MAP_FILE = join(ICON_DIR, 'rt-icon-material-map.ts');
const NAMES_FILE = join(ICON_DIR, 'rt-icon-names.ts');
const ASSETS_DIR = join(ROOT, 'projects/ui-kit-v2/src/assets/icons');

const NAME = 'check-icon-map';

/** Запись перечня в тексте файла: имя первого кита, имя набора или `null`, довод. */
const ENTRY_RE = /\{\s*from:\s*'([^']+)'\s*,\s*to:\s*(?:'([^']+)'|null)\s*,\s*why:\s*(.+?)\s*\},/g;

/** Имя набора в союзе: строка в кавычках с запятой на конце. */
const UNION_RE = /^\s+'([^']+)',$/gm;

function fail(lines) {
    console.error(`${NAME}: ${lines.length} ${lines.length === 1 ? 'место' : 'мест'}\n`);
    for (const line of lines) console.error(`  ${line}`);
    console.error(
        '\nПеречень лежит в projects/ui-kit-v2/src/lib/components/icon/rt-icon-material-map.ts.\n' +
            'Имя набора берётся из rt-icon-names.ts, рисунок — из src/assets/icons: имя без файла гасит\n' +
            'только свой значок, и на экране это пустое место при зелёном прогоне.'
    );
    process.exit(1);
}

if (!existsSync(MAP_FILE)) fail([`перечня нет: ${MAP_FILE}`]);

const union = new Set([...readFileSync(NAMES_FILE, 'utf8').matchAll(UNION_RE)].map((match) => match[1]));
const files = new Set(
    readdirSync(ASSETS_DIR)
        .filter((file) => file.endsWith('.svg'))
        .map((file) => file.slice(0, -4))
);

const entries = [...readFileSync(MAP_FILE, 'utf8').matchAll(ENTRY_RE)].map((match) => ({
    from: match[1],
    to: match[2] ?? null,
    why: match[3],
}));

if (entries.length === 0) fail(['перечень разобрался пустым — форма записи разошлась с образцом проверки']);

const problems = [];
const seen = new Set();

for (const { from, to, why } of entries) {
    if (seen.has(from)) problems.push(`${from}: имя встречается дважды — второй ответ ведёт на ${to ?? '—'}`);
    seen.add(from);

    if (!why || why === "''" || why === '``') problems.push(`${from}: довод пуст`);

    if (to === null) continue;

    if (!union.has(to)) problems.push(`${from} → ${to}: такого имени нет в союзе имён набора`);
    else if (!files.has(to)) problems.push(`${from} → ${to}: имя в союзе есть, а файла рисунка нет`);
}

if (problems.length > 0) fail(problems);

const orphans = entries.filter((entry) => entry.to === null);

console.log(
    `${NAME}: записей ${entries.length}, из них с парой ${entries.length - orphans.length} и без пары ` +
        `${orphans.length} — каждая пара ведёт на имя союза и на существующий файл, имена не повторяются`
);

if (orphans.length > 0) {
    console.log(`${NAME}: без пары — ${orphans.map((entry) => entry.from).join(', ')}`);
}
