#!/usr/bin/env node
/**
 * Прогон снимков витрины второго кита.
 *
 * Три вещи, которых сам `test-storybook` не делает и делать не умеет:
 *
 * 1. **Опознаёт витрину по адресу.** Витрины двух китов — оба сторибука, отличимые только
 *    содержимым. Прогон, наведённый на чужую или на оставшуюся от прошлого раза, даёт либо гору
 *    ненайденных историй, либо, что хуже, сверку чужих кадров с эталонами второго кита — и
 *    причину ищут в обвязке, а она в порту.
 * 2. **Ловит осиротевшие эталоны.** История переименована, а её кадр остался: такой эталон вечно
 *    зелен, потому что прогон его не открывает. Через несколько волн каталог перестаёт отвечать
 *    на вопрос, что проверено, а вес растёт от файлов, которые не сверяет никто.
 * 3. **Разводит точечную пересъёмку и пересъёмку всего каталога.** Пересъёмка всего разом
 *    стирает и то расхождение, которого не ждали, поэтому она — отдельная команда с явным
 *    признаком, а не умолчание.
 *
 * Договорённость — `docs/specs/ui-kit-v2/proposed/visual-snapshots/`.
 *
 *   node tools/visual-snapshots-v2.mjs                      # сверка с эталонами
 *   node tools/visual-snapshots-v2.mjs --update '<файл>'    # пересъёмка названных файлов историй
 *   node tools/visual-snapshots-v2.mjs --update-all         # пересъёмка всего каталога
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** Адрес уже поднятой витрины: прогон свою не поднимает. */
const URL = process.env.STORYBOOK_URL ?? 'http://localhost:6007';

/** Настройка витрины второго кита — своя, общей с первым китом нет. */
const CONFIG_DIR = 'projects/ui-kit-v2/.storybook';

/** Каталог эталонов лежит при витрине: их читают вместе с историями. */
const SNAPSHOT_DIR = `${CONFIG_DIR}/__snapshots__`;

/** По этому пути в историях витрины опознаётся, что по адресу именно второй кит. */
const OWN_IMPORT_MARKER = 'projects/ui-kit-v2/';

function fail(message) {
    console.error(`\n  ${message}\n`);
    process.exit(1);
}

/**
 * Опознаёт витрину по её указателю историй.
 *
 * Признак — путь исходника: у второго кита каждая история лежит под `projects/ui-kit-v2/`.
 * Заголовки для этого не годятся — `Components/Button` есть у обоих китов.
 */
async function requireOwnShowcase() {
    let index;

    try {
        const response = await fetch(`${URL}/index.json`);
        if (!response.ok) {
            fail(`По адресу ${URL} витрина не отдала указатель историй (${response.status}). Подними её: pnpm run storybook:ui-kit-v2`);
        }
        index = await response.json();
    } catch (error) {
        fail(`По адресу ${URL} никто не отвечает (${error.message}). Подними витрину: pnpm run storybook:ui-kit-v2`);
    }

    const entries = Object.values(index.entries ?? {});
    if (entries.length === 0) {
        fail(`По адресу ${URL} витрина без единой истории — сверять нечего.`);
    }

    const own = entries.filter((entry) => (entry.importPath ?? '').includes(OWN_IMPORT_MARKER));
    if (own.length === 0) {
        const sample = entries[0]?.importPath ?? '—';
        fail(`По адресу ${URL} отвечает не витрина второго кита: истории приходят из «${sample}», а ожидались из «${OWN_IMPORT_MARKER}».`);
    }

    return own.length;
}

/**
 * Сверяет каталог эталонов с реестром снятого.
 *
 * Реестр пишет обвязка на каждом снятом кадре; всё, что лежит в каталоге и в реестре не названо,
 * не сверялось ничем.
 */
function requireNoOrphans(registryPath) {
    if (!existsSync(SNAPSHOT_DIR)) {
        return 0;
    }

    const taken = new Set(
        existsSync(registryPath)
            ? readFileSync(registryPath, 'utf8')
                  .split('\n')
                  .map((line) => line.trim())
                  .filter((line) => line !== '')
            : []
    );

    const stored = readdirSync(SNAPSHOT_DIR).filter((name) => name.endsWith('.png'));
    const orphans = stored.filter((name) => !taken.has(name.replace(/\.png$/, '')));

    if (orphans.length > 0) {
        fail(
            `Эталоны, которым нет истории (${orphans.length}):\n    ${orphans.join('\n    ')}\n\n` +
                `  Они вечно зелены — прогон их не открывает. Удали их или верни историю, которой они принадлежали.`
        );
    }

    return stored.length;
}

const args = process.argv.slice(2);
const updateAll = args.includes('--update-all');
const updateIndex = args.indexOf('--update');
const updateOne = updateIndex >= 0 ? args[updateIndex + 1] : undefined;

if (updateIndex >= 0 && (updateOne === undefined || updateOne.startsWith('--'))) {
    fail(
        `Пересъёмка идёт по названному файлу историй: --update '<образец пути>'. Пересъёмка всего каталога — отдельная команда --update-all.`
    );
}

const own = await requireOwnShowcase();
console.log(`Витрина второго кита на ${URL}: историй ${own}.`);

const registryDir = mkdtempSync(join(tmpdir(), 'rt-snapshots-'));
const registryPath = join(registryDir, 'taken.txt');
writeFileSync(registryPath, '');

/**
 * Сколько историй открывается разом.
 *
 * Витрина по адресу одна, и умолчание Jest — по потоку на ядро — её обгоняет: приложение истории
 * не успевает встать, ожидание готовности внутри сборщика витрины завершается пустым, и история
 * падает с «no elements in sequence». На этой машине шесть потоков давали от двух до девяти таких
 * отказов за заход, четыре — один, два — ни одного за три захода подряд.
 *
 * Повтором это не лечится намеренно: повтор превращает мигающую историю в зелёную со второго
 * раза, и правило про детерминированность кадра становится непроверяемым. Лечится это тем, что
 * витрину перестают перегружать.
 */
const MAX_WORKERS = '2';

const runnerArgs = ['test-storybook', '--config-dir', CONFIG_DIR, '--url', URL, '--maxWorkers', MAX_WORKERS];

if (updateAll) {
    runnerArgs.push('--', '-u');
} else if (updateOne !== undefined) {
    // Образец отбирает файлы историй по пути, а не по имени истории. Отбор по имени (`-t`)
    // здесь не годится вовсе: с ним окружение прогона не создаёт страницы, и все файлы падают
    // на `Cannot read properties of undefined (reading 'goto')` — то же самое и у первого кита.
    // Проверено флаг за флагом: `-u` работает, `-t` ломает.
    runnerArgs.push('--', '-u', updateOne);
}

const run = spawnSync('pnpm', ['exec', ...runnerArgs], {
    stdio: 'inherit',
    env: {
        ...process.env,
        RT_SNAPSHOT_REGISTRY: registryPath,
        // Настройку витрины прогон читает в Node, а аддон состояний в Node не грузится: он
        // трогает `Element` на верхнем уровне. Без этого признака импорт падает, окружение
        // остаётся без страницы, и все истории валятся на `undefined (reading 'goto')`.
        // На саму витрину это не влияет — она поднята отдельно и со всеми аддонами.
        RT_SNAPSHOT_RUN: '1',
        // Эталон появляется на диске только в заходе пересъёмки: в обычном прогоне отсутствие
        // эталона — отказ, а не повод его дописать.
        RT_SNAPSHOT_UPDATE: updateAll || updateOne !== undefined ? '1' : '0',
    },
});

// Осиротевшие ищутся и после красного прогона: иначе о них узнают только тогда, когда всё
// остальное сойдётся, то есть в последнюю очередь.
let stored = 0;
try {
    // Точечная пересъёмка открывает не весь каталог, и всё, что она не тронула, выглядело бы
    // осиротевшим. Сверка каталога идёт только на полном заходе.
    if (updateOne === undefined) {
        stored = requireNoOrphans(registryPath);
    }
} finally {
    rmSync(registryDir, { recursive: true, force: true });
}

if (run.status !== 0) {
    process.exit(run.status ?? 1);
}

console.log(`Эталонов в каталоге: ${stored}. Осиротевших нет.`);
