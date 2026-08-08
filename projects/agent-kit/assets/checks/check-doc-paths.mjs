#!/usr/bin/env node
/**
 * Проверка того, что пути, названные в документации, существуют.
 *
 * Документ, ссылающийся на исчезнувший файл, хуже отсутствующего: он выглядит
 * действующей справкой и уводит читателя в каталог, которого нет. Накапливается
 * это молча — перекладка дерева правит код и ломает текст, а текст никто не
 * собирает. К моменту заведения проверки из 159 путей, названных в `docs/`,
 * не существовало 80.
 *
 * Считаются только пути в обратных кавычках и вне блоков кода: в блоках лежат
 * команды и вывод, где `dist/apps/api/main.js` — результат сборки, а не файл
 * репозитория. Шаблоны (`*`, `<…>`, `{…}`) пропускаются: это форма пути, а не путь.
 *
 * Документы, которые по устройству говорят о несуществующем — планы будущего и
 * архив, — перечислены в tools/doc-paths-allowlist.json.
 *
 * Ненулевой код возврата и перечень расхождений.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { allowlistOf, CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const ALLOWLIST = allowlistOf('doc-paths');
// `worktrees` — копии репозитория под `.claude/`: их документы описывают раскладку своей
// ветки, а проверка ищет пути в дереве текущей. Одна брошенная копия дала 73 расхождения и
// красный сквозной прогон на ветке, которая её не заводила.
const SKIPPED_DIRS = CONFIG.skippedDirs;
/**
 * Архив описывает раскладку, бывшую на момент записи. Править в нём пути — значит
 * переписывать историю задним числом, поэтому он выведен из проверки целиком.
 */
const ARCHIVE_DIR = CONFIG.archiveDir;
/** Расширения, по которым строка в кавычках считается путём, а не именем сущности */
const EXTENSIONS = 'ts|mts|cts|js|mjs|cjs|json|jsonc|scss|css|html|proto|conf|ya?ml|sh|md|sql|txt|xml|svg|webp|png|ico|env|Dockerfile|lock';
const PATH_IN_BACKTICKS = new RegExp(`\`([^\`\\n]+?\\.(?:${EXTENSIONS}))\``, 'g');

const problems = [];
const report = (doc, line, path) => problems.push(`${doc}:${line}: нет файла \`${path}\``);

function readAllowlist() {
    const path = join(ROOT, ALLOWLIST);
    if (!existsSync(path)) {
        return { files: [], paths: [] };
    }

    const raw = JSON.parse(readFileSync(path, 'utf8'));

    return { files: raw.files ?? [], paths: raw.paths ?? [] };
}

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
 * закрытый `.gitignore` или `.git/info/exclude`. Проверка судит репозиторий, а не рабочий
 * стол того, кто её запустил: мёртвая ссылка в чужом черновике держала гейт пуша, хотя ни
 * в одну ветку этот файл не едет.
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

/**
 * Верхний уровень дерева. Проверяются только адреса, укоренённые в нём: `src/index.ts`
 * в правиле означает «любой файл такого вида», а `services/theme/theme.service.ts` —
 * обрывок чужого пути. Ни то, ни другое адресом не является, и требовать их
 * существования значит ловить форму записи вместо ссылки.
 */
const ROOTED_IN = new Set(
    readdirSync(ROOT, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !SKIPPED_DIRS.includes(entry.name))
        .map((entry) => entry.name)
);

/**
 * Путь ли это вообще. Отсекается всё, что описывает форму, а не адрес: шаблоны,
 * URL и пакеты npm.
 */
function looksLikePath(candidate) {
    if (/[*<>{}$|\s]|\.\.\.|…/.test(candidate)) {
        return false;
    }
    if (/^(https?:|@|~|\/)/.test(candidate)) {
        return false;
    }

    return ROOTED_IN.has(candidate.split('/')[0]);
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
            if (!existsSync(join(ROOT, candidate))) {
                report(doc, index + 1, candidate);
            }
        }
    });
}

const allowlist = readAllowlist();
const allowedPaths = new Set(allowlist.paths);
const collected = collectDocs().filter((doc) => !allowlist.files.includes(doc) && !doc.startsWith(ARCHIVE_DIR));
const dropped = droppedByGit(collected);
const docs = collected.filter((doc) => !dropped.has(doc));

docs.forEach((doc) => checkDoc(doc, allowedPaths));

if (problems.length > 0) {
    console.error(`check-doc-paths: расхождений ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    console.error(
        `\nЛибо путь устарел и его надо поправить, либо документ описывает ещё не созданное —\nтогда он вносится в ${ALLOWLIST}.`
    );
    process.exit(1);
}

console.log(`check-doc-paths: проверено документов ${docs.length}, расхождений нет`);
