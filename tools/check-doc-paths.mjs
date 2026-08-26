#!/usr/bin/env node
// rt-kit v0.16.1 · checks/check-doc-paths.mjs · 8971a897ffd3 · правится надстройкой, не здесь
/**
 * Проверка того, что адреса, названные в документации, существуют.
 *
 * Документ, ссылающийся на исчезнувший файл, хуже отсутствующего: он выглядит
 * действующей справкой и уводит читателя в каталог, которого нет. Накапливается
 * это молча — перекладка дерева правит код и ломает текст, а текст никто не
 * собирает.
 *
 * Считаются только адреса в обратных кавычках и вне блоков кода: в блоках лежат
 * команды и вывод, где путь до собранного — результат сборки, а не файл
 * репозитория. Шаблоны (`*`, `<…>`, `{…}`) пропускаются: это форма адреса, а не адрес.
 *
 * Адрес бывает трёх родов, и все три судятся одинаково: укоренённый в дереве путь,
 * голое имя файла и каталог. Каталогами занята половина таблиц «Где это лежит», и
 * проверка, знающая только строку с расширением, их не видит вовсе.
 *
 * Документы, которые по устройству говорят о несуществующем — планы будущего, архив
 * и папки задач, — из проверки выведены. Там же переносимый текст: его адреса
 * принадлежат тому дереву, куда правило ложится, и в этом они примеры, а не ссылки.
 *
 * Вторым заходом сверяется полнота указателя каталога: обзорный документ перечисляет
 * записи таблицей, и читатель ищет по ней, а не обходом. Это обратная сторона той же
 * договорённости — не только адрес из текста ведёт в файл, но и файл назван в тексте,
 * по которому его ищут.
 *
 * Ненулевой код возврата и перечень расхождений.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { allowlistOf, CONFIG, ROOT, parseAllowlist } from './rt-kit-checks.config.mjs';

const ALLOWLIST = allowlistOf('doc-paths');
// `worktrees` — копии репозитория под каталогом агента: их документы описывают раскладку
// своей ветки, а проверка ищет адреса в дереве текущей. Одна брошенная копия дала 73
// расхождения и красный сквозной прогон на ветке, которая её не заводила.
const SKIPPED_DIRS = CONFIG.skippedDirs;
/**
 * Архив описывает раскладку, бывшую на момент записи. Править в нём адреса — значит
 * переписывать историю задним числом, поэтому он выведен из проверки целиком.
 */
const ARCHIVE_DIR = CONFIG.archiveDir;
/**
 * Папка задачи описывает ход работы, и снятое она называет по имени: раздел находок
 * перечисляет ровно то, чего в дереве нет. Отличить такое упоминание от ссылки машине
 * нечем, а живёт папка до слияния — поэтому она выведена из проверки, как архив.
 */
const TASKS_DIR = CONFIG.tasksDir.endsWith('/') ? CONFIG.tasksDir : `${CONFIG.tasksDir}/`;
/**
 * Каталоги, чей указатель сверяется с содержимым. Каталог, выведенный из проверки адресов,
 * иначе не судит ничто: запись, приехавшая слиянием соседней ветки, остаётся неназванной, а
 * читатель ищет по указателю. Сверенный руками указатель расходится снова через сутки.
 */
const INDEXED_DIRS = (CONFIG.indexedDirs ?? []).map((dir) => (dir.endsWith('/') ? dir : `${dir}/`));
/**
 * Исходники переносимых текстов: правило, которое ложится в другое дерево, называет адреса
 * того дерева. Разложенная копия узнаётся по шапке, а исходник шапки не несёт — её ставит
 * раскладка, — поэтому его каталог называется настройкой.
 */
const PORTABLE_DIRS = (CONFIG.portableDirs ?? []).map((dir) => (dir.endsWith('/') ? dir : `${dir}/`));
/** Шапка разложенного файла: версия пакета, ресурс и сумма тела. */
const STAMP_LINE = /rt-kit\s+v\S+\s+·\s+\S+\s+·\s+[0-9a-f]{12}/;
/** Шапка встаёт первой строкой тела, а тело начинается после вступления скила. */
const STAMP_LOOKAHEAD = 12;
/** Расширения, по которым голое имя считается файлом, а не именем сущности */
const EXTENSIONS = 'ts|mts|cts|js|mjs|cjs|json|jsonc|scss|css|html|proto|conf|ya?ml|sh|md|sql|txt|xml|svg|webp|png|ico|env|Dockerfile|lock';
/**
 * Берётся любая строка в кавычках: каталог расширения не несёт, и требовать его в самой
 * выборке значило бы не видеть половину таблиц «Где это лежит». Отсев — в `looksLikePath`.
 */
const PATH_IN_BACKTICKS = /`([^`\n]+?)`/g;

const problems = [];
const indexProblems = [];
const report = (doc, line, path) => problems.push(`${doc}:${line}: нет файла \`${path}\``);

function collectDocs(dir = '.') {
    const entries = readdirSync(join(ROOT, dir), { withFileTypes: true });
    const found = [];

    for (const entry of entries) {
        const relativePath = dir === '.' ? entry.name : `${dir}/${entry.name}`;
        if (entry.isDirectory()) {
            if (!SKIPPED_DIRS.includes(entry.name)) {
                found.push(...collectDocs(relativePath));
            }
        } else if (entry.name.endsWith('.md')) {
            found.push(relativePath);
        }
    }

    return found.sort();
}

/**
 * Документы, которые в репозиторий не попадут: личный черновик, лежащий в дереве и
 * закрытый настройкой неотслеживаемого. Проверка судит репозиторий, а не рабочий стол того,
 * кто её запустил: мёртвая ссылка в чужом черновике держала гейт пуша, хотя ни в одну ветку
 * этот файл не едет.
 */
function droppedByGit(docs) {
    if (docs.length === 0) {
        return new Set();
    }

    // `--stdin` вместо аргументов: список длиннее ограничения командной строки
    const ignored = spawnSync('git', ['check-ignore', '--stdin'], {
        cwd: ROOT,
        encoding: 'utf8',
        input: docs.join('\n'),
    });

    // Нет git — судить нечем, и проверка остаётся строже нужного
    return new Set((ignored.stdout ?? '').split('\n').filter(Boolean));
}

/** Верхний уровень дерева: по нему узнаётся адрес, укоренённый в репозитории */
const ROOTED_IN = new Set(
    readdirSync(ROOT, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !SKIPPED_DIRS.includes(entry.name))
        .map((entry) => entry.name)
);

/**
 * Дерево спрашивается у системы контроля версий, а не обходом каталогов: каталоги агента и
 * конвейера начинаются с точки, и обход мимо них проходит молча — всё, что в них лежит,
 * читалось бы как несуществующее. Неотслеживаемое берётся вместе с отслеживаемым: файл,
 * заведённый этой же веткой и ещё не добавленный, существует ничуть не меньше.
 */
function treeOfRepo() {
    const listed = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
        cwd: ROOT,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
    });
    const paths = (listed.stdout ?? '').split('\n').filter(Boolean);
    const files = new Set(paths);
    const dirs = new Set();
    const byName = new Map();

    for (const path of paths) {
        const segments = path.split('/');
        for (let depth = 1; depth < segments.length; depth += 1) {
            dirs.add(segments.slice(0, depth).join('/'));
        }
        byName.set(segments[segments.length - 1], true);
    }
    for (const dir of dirs) {
        byName.set(dir.split('/').pop(), true);
    }

    return { files, dirs, byName };
}

const TREE = treeOfRepo();

/**
 * Адрес ли это вообще. Отсекается всё, что описывает форму, а не адрес: шаблоны, сетевые
 * ссылки, имена пакетов, флаги и привязка «путь:символ» — её судит сверка спеков. Дальше
 * кандидат бывает двух родов: укоренённый в дереве и голое имя. Голым именем зовут и файл, и
 * каталог — оба ищутся по дереву, потому что адрес у них один, а написан он коротко.
 */
function looksLikePath(candidate) {
    if (/[*<>{}$|\s]|\.\.\.|…/.test(candidate)) {
        return false;
    }
    if (/^(https?:|@|~|\/|-)/.test(candidate) || candidate.includes(':')) {
        return false;
    }
    // Каталог, который проверка не обходит, она и не судит: там чужое, сборка и служебное
    if (SKIPPED_DIRS.some((dir) => candidate.startsWith(`${dir}/`))) {
        return false;
    }
    // Начинается с точки и стоит без каталога — род файла, а не файл
    if (/^\.[^/]+$/.test(candidate)) {
        return false;
    }

    return candidate.includes('/') || new RegExp(`\\.(?:${EXTENSIONS})$`).test(candidate);
}

/**
 * Есть ли такой адрес в дереве. Укоренённый спрашивается у файловой системы: он назван
 * целиком, и промах в нём — промах. Голое имя ищется по дереву целиком — и среди файлов, и
 * среди каталогов: имя каталога в обзорном документе либы означает каталог рядом, а не
 * каталог в корне.
 */
function existsInTree(candidate) {
    const bare = candidate.replace(/\/$/, '');

    if (ROOTED_IN.has(bare.split('/')[0])) {
        return existsSync(join(ROOT, bare));
    }
    if (TREE.files.has(bare) || TREE.dirs.has(bare)) {
        return true;
    }
    if (bare.includes('/')) {
        return [...TREE.files, ...TREE.dirs].some((path) => path.endsWith(`/${bare}`));
    }

    return TREE.byName.has(bare);
}

/**
 * Переносимый текст: разложенный пакетом — по шапке, его исходник — по каталогу из настройки.
 * Адреса в нём принадлежат тому дереву, куда правило ложится: `libs/common/util` в дереве,
 * которое зовёт свои корни иначе, — не мёртвая ссылка, а пример. Судить их здесь значит
 * краснеть на полтораста строк, ни одна из которых не чинится правкой этого дерева.
 */
function isPortable(doc) {
    if (PORTABLE_DIRS.some((dir) => doc.startsWith(dir))) {
        return true;
    }

    return readFileSync(join(ROOT, doc), 'utf8')
        .split('\n', STAMP_LOOKAHEAD)
        .some((line) => STAMP_LINE.test(line));
}

/** Из проверки адресов выведены документы, которые по устройству говорят о несуществующем. */
const isSkipped = (doc) => doc.startsWith(ARCHIVE_DIR) || doc.startsWith(TASKS_DIR) || isPortable(doc);

/**
 * Полнота указателя каталога: у каждой записи каталога есть строка в таблице, у каждой
 * строки — запись. Записью считается первое имя в обратных кавычках строки таблицы: во
 * второй колонке стоит проза, и брать оттуда было бы нечего. Каталог берётся у системы
 * контроля версий той же выборкой, что и дерево: черновик, закрытый настройкой
 * неотслеживаемого, в репозиторий не едет и указателю не нужен.
 */
function checkIndex(dir) {
    const index = `${dir}README.md`;
    if (!existsSync(join(ROOT, index))) {
        return;
    }

    const named = new Set(
        readFileSync(join(ROOT, index), 'utf8')
            .split('\n')
            .filter((line) => line.startsWith('|'))
            .map((line) => line.match(PATH_IN_BACKTICKS)?.[0].replaceAll('`', ''))
            .filter((name) => name?.endsWith('.md'))
    );
    const stored = new Set(
        [...TREE.files]
            .filter((path) => path.startsWith(dir) && path.endsWith('.md') && path !== index)
            .map((path) => path.slice(dir.length))
    );

    [...stored]
        .filter((name) => !named.has(name))
        .sort()
        .forEach((name) => indexProblems.push(`${index}: запись \`${name}\` лежит в каталоге, но в таблице не названа`));
    [...named]
        .filter((name) => !stored.has(name))
        .sort()
        .forEach((name) => indexProblems.push(`${index}: строка \`${name}\` названа в таблице, но записи в каталоге нет`));
}

function checkDoc(doc, allowed) {
    const lines = readFileSync(join(ROOT, doc), 'utf8').split('\n');
    let insideFence = false;

    lines.forEach((line, index) => {
        if (/^\s*(```|~~~)/.test(line)) {
            insideFence = !insideFence;

            return;
        }
        if (insideFence) {
            return;
        }

        for (const [, candidate] of line.matchAll(PATH_IN_BACKTICKS)) {
            if (!looksLikePath(candidate) || allowed.has(candidate)) {
                continue;
            }
            if (!existsInTree(candidate)) {
                report(doc, index + 1, candidate);
            }
        }
    });
}

/** Расхождение указателя печатается своим списком: чинится оно строкой в таблице, а не молчанием. */
function reportIndex() {
    if (indexProblems.length === 0) {
        return;
    }

    console.error(`\nуказатель разошёлся с каталогом, расхождений ${indexProblems.length}\n`);
    indexProblems.forEach((problem) => console.error(`  ${problem}`));
    console.error(
        '\nЗапись называется в таблице указателя тем же изменением, которым кладётся:\nчитатель ищет по указателю, а не обходом каталога.'
    );
}

const allowlist = parseAllowlist('doc-paths', ['files', 'paths']);
const allowedPaths = new Set(allowlist.paths.keys());
const collected = collectDocs().filter((doc) => !allowlist.files.has(doc) && !isSkipped(doc));
const dropped = droppedByGit(collected);
const docs = collected.filter((doc) => !dropped.has(doc));

docs.forEach((doc) => checkDoc(doc, allowedPaths));
INDEXED_DIRS.forEach((dir) => checkIndex(dir));

if (problems.length > 0) {
    console.error(`check-doc-paths: расхождений ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    console.error(
        `\nЛибо адрес устарел и его надо поправить, либо документ описывает ещё не созданное —\nтогда он вносится в ${ALLOWLIST}.`
    );
}

reportIndex();

if (problems.length > 0 || indexProblems.length > 0) {
    process.exit(1);
}

console.log(`check-doc-paths: проверено документов ${docs.length}, расхождений нет`);
