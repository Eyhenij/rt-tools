#!/usr/bin/env node
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
/**
 * Второй предел текста — в знаках. Строки меряют, сколько текста помещается на экран, но веса
 * не меряют вовсе: правило о заявках занимает 282 строки при 13 595 знаках, а правило поставки —
 * 272 строки при 21 508. Сжатие слоя срезает знаки, а число переносов оставляет прежним, и
 * строковый предел достигнутого не закрепляет. Дерево, не назвавшее этого числа, судится
 * по-прежнему одними строками.
 */
const PROSE_CHARS = CONFIG.proseCharLimit ?? 0;
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

/**
 * Дерево спрашивается у системы контроля версий: иначе каталоги с точки не видны, а сборка видна.
 *
 * Снятое из рабочего дерева отсеивается здесь, а не в счётчиках: система контроля версий помнит
 * файл, пока снос не заведён в историю, а прочитать его нечем — проверка падала трассировкой
 * `ENOENT` и читалась как сломанная, хотя сломан был только незаведённый снос. Счётчиков два, и
 * охрана при каждом разошлась бы.
 */
function trackedFiles() {
    return execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1024 * 1024 * 32 })
        .split('\n')
        .filter(Boolean)
        .filter((path) => existsSync(join(ROOT, path)));
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

/** Спутник — таблица связи, а не проза: компаньон правила и перечень сценариев спека. */
function companion(path) {
    return path.endsWith('/implementation.md') || path.endsWith('/scenarios.md');
}

/** Знаки, а не байты: кириллица весит по два байта, и байтовый счёт судил бы язык, а не текст. */
function charCount(path) {
    return readFileSync(join(ROOT, path), 'utf8').length;
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

const overweight = new Map();

for (const path of tracked) {
    const lines = lineCount(path);
    if (lines > limitOf(path).limit) {
        tooLong.set(path, lines);
    }

    // Вес судится только у текста слоя правил и только там, где дерево назвало число: у кода
    // длину стережёт ещё и линтер, а у прозы — одни эти два предела.
    //
    // Спутники из счёта веса выведены. Компаньон правила и перечень сценариев — таблицы связи:
    // заголовок привязки дословно повторяет утверждение, потому что связь идёт по его тексту, и
    // резать там нечего, не порвав саму связь. Вес такого файла растёт с числом утверждений, а
    // не с многословием: у правила поставки семьдесят шесть привязок на 24 326 знаков, из них
    // пояснений всего 5 729. Строковый предел на них остаётся — он ловит другое.
    if (PROSE_CHARS > 0 && PROSE_ROOTS.length > 0 && limitOf(path).title === 'предел текста' && !companion(path)) {
        const chars = charCount(path);
        if (chars > PROSE_CHARS) {
            overweight.set(path, chars);
        }
    }
}

if (process.argv.includes('--baseline')) {
    console.log(baselineOf([...new Set([...tooLong.keys(), ...overweight.keys()])].sort(), allowlist));
    process.exit(0);
}

const fresh = [...tooLong].filter(([path]) => !known.has(path));
/** Строка на файл, которого в дереве нет, — устаревшая: иначе список копит мёртвое. */
const gone = [...known.keys()].filter((path) => !existsSync(join(ROOT, path)));
/**
 * Файл поделили, а строку оставили: список перестал бы отвечать за то, что в нём стоит.
 * Тяжёлый по знакам файл под предел строк не подпадает, и без второй проверки его запись
 * читалась бы устаревшей — долг нельзя было бы ни записать, ни оставить.
 */
const shrunk = [...known.keys()].filter(
    (path) => !tooLong.has(path) && !overweight.has(path) && existsSync(join(ROOT, path))
);

/** Тяжёлое по знакам судится тем же списком известного: один долг на файл, а не два. */
const heavy = [...overweight].filter(([path]) => !known.has(path) && !tooLong.has(path));

const problems = [
    ...heavy.map(([path, chars]) => `${path}: ${chars} знаков, предел веса текста ${PROSE_CHARS} — резать довод, а не дописывать строку в ${ALLOWLIST}`),
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
/**
 * Предел веса называется только там, где дерево задало и число, и корни текста: вес судится у
 * прозы слоя правил, а дерево, её корней не назвавшее, судится одним числом строк — и вторая
 * цифра в сводке говорила бы о проверке, которая там не работает.
 */
const weight = PROSE_CHARS > 0 && PROSE_ROOTS.length > 0 ? `, предел веса текста ${PROSE_CHARS} знаков` : '';

console.log(
    `check-file-size: проверено ${tracked.length} файлов, ${limits}${weight}, длиннее предела ${tooLong.size}, ` +
        `из них принято ${accepted.size}, долг ${debt.size} — новых нет`
);
