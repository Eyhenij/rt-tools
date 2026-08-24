#!/usr/bin/env node
// rt-kit v0.14.0 · checks/check-file-size.mjs · 60bfdd886dd3 · правится надстройкой, не здесь
/**
 * Проверка того, что файл не длиннее предела.
 *
 * Файл, который не влезает на экран целиком, читают по частям, и правку в нём
 * делают, не увидев остального. У кода длину стережёт линтер; здесь — всё, до
 * чего он не доходит: проза, стили, шаблоны, обвязка разработки и сами гарды.
 *
 * Судятся `.md`, `.scss`, `.html`, `.js`, `.mjs` и `.sh`. Данные не судятся
 * вовсе: словарь локали и настройка сборки читаются поиском, а не подряд, и
 * делить их не на что. Код на языке, где длину стережёт линтер, тоже не
 * судится — два отказа на один файл читаются как две разные претензии.
 *
 * Строки считаются все, включая пустые и комментарии, и тем же способом, каким
 * их считает линтер: по числу разрывов плюс один. Файл, кончающийся переводом
 * строки, поэтому весит на строку больше, чем показывает `wc -l`, — зато у обеих
 * проверок дерева одно понятие длины.
 *
 * Описание прошлого из счёта выведено: архив по устройству перечисляет то, чего
 * в дереве уже нет, а папка задачи умирает со слиянием. Сгенерированное выведено
 * каталогом: его переписывает генератор целиком, и спорить с ним о длине некому.
 *
 * Накопленное к моменту заведения проверки лежит в списке известного и отказом
 * не считается: гейт падает на НОВОМ длинном файле, а старое остаётся видимым
 * числом в сводке. Принятое и долг там различаются: принятое дерево делить не
 * собирается, на долг заведена работа. Строка снимается вместе с делением своего
 * файла, и проверка сама говорит, какую строку пора убрать.
 *
 * Ненулевой код возврата и перечень расхождений.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { allowlistOf, baselineOf, CONFIG, ROOT, parseAllowlist } from './rt-kit-checks.config.mjs';

const ALLOWLIST = allowlistOf('file-size');
/** Пределов два: код и текст слоя правил. Какой из них применён, каждая строка отказа называет. */
const LIMIT = CONFIG.fileSizeLimit;
const PROSE_LIMIT = CONFIG.proseSizeLimit ?? CONFIG.fileSizeLimit;
/** Корни текста слоя правил; дерево, их не назвавшее, судится одним пределом. */
const PROSE_ROOTS = CONFIG.proseRoots ?? [];

/** Предел для файла и имя предела для отказа: по корню, а не по расширению — код лежит и в `.md`. */
function limitOf(path) {
    return PROSE_ROOTS.some((root) => root && path.startsWith(root))
        ? { limit: PROSE_LIMIT, title: 'предел текста' }
        : { limit: LIMIT, title: 'предел кода' };
}

/** Роды файлов, которых не читает линтер. Код остаётся за ним. */
const JUDGED = ['.md', '.scss', '.html', '.js', '.mjs', '.sh'];

/** Описание прошлого, папка задачи и то, что переписывает генератор. */
const SKIPPED_PREFIXES = [CONFIG.archiveDir, `${CONFIG.tasksDir}/`, ...CONFIG.generatedDirs];

/** Дерево спрашивается у системы контроля версий: иначе каталоги с точки не видны, а сборка видна. */
function trackedFiles() {
    return execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1024 * 1024 * 32 })
        .split('\n')
        .filter(Boolean);
}

function judged(path) {
    if (SKIPPED_PREFIXES.some((prefix) => prefix && path.startsWith(prefix))) {
        return false;
    }

    return JUDGED.some((extension) => path.endsWith(extension));
}

/** Тем же способом, каким считает линтер: число разрывов плюс один. */
function lineCount(path) {
    return readFileSync(join(ROOT, path), 'utf8').split('\n').length;
}

/**
 * Список известного читается отдельно от общего читателя: у этой проверки нет файла — это
 * не пустой список, а нечитаемая настройка, и молчать о ней нельзя. Пустой список законен
 * ровно один раз — в дереве, где длинных файлов нет вовсе.
 */
const allowlist = parseAllowlist('file-size');
const { accepted, debt } = allowlist;
const known = new Map([...[...accepted.keys()].map((path) => [path, 'принято']), ...[...debt.keys()].map((path) => [path, 'долг'])]);

const tooLong = new Map();
const tracked = trackedFiles().filter(judged);

for (const path of tracked) {
    const lines = lineCount(path);
    if (lines > limitOf(path).limit) {
        tooLong.set(path, lines);
    }
}

if (process.argv.includes('--baseline')) {
    console.log(baselineOf([...tooLong.keys()].sort(), allowlist));
    process.exit(0);
}

const fresh = [...tooLong].filter(([path]) => !known.has(path));
/** Строка на файл, которого в дереве нет, — устаревшая: иначе список копит мёртвое. */
const gone = [...known.keys()].filter((path) => !existsSync(join(ROOT, path)));
/** Файл поделили, а строку оставили: список перестал бы отвечать за то, что в нём стоит. */
const shrunk = [...known.keys()].filter((path) => !tooLong.has(path) && existsSync(join(ROOT, path)));

const problems = [
    ...fresh.map(([path, lines]) => {
        const { limit, title } = limitOf(path);
        return `${path}: ${lines} строк, ${title} ${limit} — делить, а не дописывать строку в ${ALLOWLIST}`;
    }),
    ...gone.map((path) => `${path}: строка в ${ALLOWLIST} устарела — файла в дереве нет`),
    ...shrunk.map((path) => `${path}: значится в ${ALLOWLIST}, но уже короче предела — строку убрать`),
];

if (problems.length > 0) {
    console.error(`check-file-size: расхождений ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    console.error('\nПредел длины файла — правило о языке для кода и правило о текстах для прозы.');
    process.exit(1);
}

const limits = PROSE_ROOTS.length > 0 ? `предел кода ${LIMIT}, предел текста ${PROSE_LIMIT}` : `предел ${LIMIT}`;

console.log(
    `check-file-size: проверено ${tracked.length} файлов, ${limits}, длиннее предела ${tooLong.size}, ` +
        `из них принято ${accepted.size}, долг ${debt.size} — новых нет`
);
