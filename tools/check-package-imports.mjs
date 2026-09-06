#!/usr/bin/env node
/**
 * Импортирует ли пакет из соседнего `@rt-tools/*` символы, которых в опубликованной версии
 * соседа нет.
 *
 * Зачем это есть. Сборка и типы в дереве читают исходники соседа, а потребитель ставит соседа
 * из реестра — той версии, которую разрешает манифест пакета. Символ, заведённый у соседа и не
 * опубликованный, в дереве зелёный, а у потребителя пакет не собирается. Так вышли два кита:
 * один с `EListSortOrder` из утилит, второй с `EPosition` из ядра — в реестре лежали версии
 * без них.
 *
 * Как судится. Импорты читаются из исходников пакета, а не из сборки: сборка пишет их в тот же
 * вид, а исходники читаются без неё. Экспорты соседа читаются из типов опубликованного пакета
 * той версии, которая наибольшая в реестре под диапазон манифеста. Пакет забирается командой
 * упаковки и кладётся в кэш под `node_modules/.cache/` — на одну версию сеть спрашивается раз.
 *
 * Реестр не ответил — проверка пропускается и говорит об этом: гейт пуша работает и без сети,
 * а молчаливый пропуск неотличим от сошедшейся сверки.
 *
 * Два режима. В гейте пуша и в конвейере символ, которого у опубликованного соседа нет, а в
 * исходниках соседа в дереве есть, называется ждущим публикации соседа и проверку не роняет:
 * между двумя выпусками такое состояние обычное, а чинится оно порядком публикации. Со флагом
 * `--strict` — в конвейере публикации — любой недостающий символ роняет проверку: выпуск с ним
 * не соберётся у потребителя. Флаг `--package <имя>` сужает суд до одного пакета.
 *
 * Ненулевой код возврата и строка на каждый символ: пакет, символ, сосед и его версия.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Каталог пакетов переопределяется переменной: набор проб судит дерево-фикстуру, а не своё. */
const PROJECTS = process.env.RT_PROJECTS_DIR || join(ROOT, 'projects');

/** Кэш распакованных версий: `<кэш>/<пакет>/<версия>/package/…`. Проба подставляет сюда фикстуру. */
const CACHE = process.env.RT_PUBLISHED_DIR || join(ROOT, 'node_modules/.cache/rt-published');

/** С фикстурой реестр не спрашивается: версии берутся из каталога. */
const OFFLINE = Boolean(process.env.RT_PUBLISHED_DIR);

const ARGS = process.argv.slice(2);
const STRICT = ARGS.includes('--strict');
const ONLY = ARGS.includes('--package') ? ARGS[ARGS.indexOf('--package') + 1] : null;

const SCOPE = '@rt-tools/';

/** Файлы, которые в пакет не едут: пробы и истории витрины. */
const NOT_SHIPPED = /\.(spec|stories|test)\.ts$/;

/** Именованный импорт из соседа, в одну строку или в несколько. */
const IMPORT = /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+'(@rt-tools\/[a-z0-9-]+)'/g;

/** Комментарии снимаются до поиска импортов: пример в описании — не импорт. */
const COMMENTS = /\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm;

/** Объявление с экспортом в типах: имя стоит после рода объявления. */
const DECLARED =
    /^export\s+(?:declare\s+)?(?:abstract\s+)?(?:enum|const\s+enum|class|interface|type|const|function|let|var|namespace)\s+([A-Za-z_$][\w$]*)/gm;

/** Список экспорта: `export { A, B as C }` и `export type { … }`; имя наружу — то, что после `as`. */
const LISTED = /^export\s+(?:type\s+)?\{([^}]*)\}\s*(?:from\s+'[^']+')?\s*;?/gm;

/** Цепочка `export * from './…'`; `export * as ns from` сюда не входит — имён она не даёт. */
const CHAINED = /^export\s+\*\s+from\s+'([^']+)'/gm;

function readJson(path) {
    return JSON.parse(readFileSync(path, 'utf8'));
}

function walk(dir, out = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name !== 'node_modules') walk(path, out);
        } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts') && !NOT_SHIPPED.test(entry.name)) {
            out.push(path);
        }
    }
    return out;
}

/** Имена из списка `{ A, B as C, type D }`: при импорте нужно имя у соседа, то есть до `as`. */
function namesOf(list, { after = false } = {}) {
    return list
        .split(',')
        .map((item) => item.trim().replace(/^type\s+/, ''))
        .filter(Boolean)
        .map((item) => {
            const [before, alias] = item.split(/\s+as\s+/);
            return (after && alias ? alias : before).trim();
        })
        .filter((name) => name && name !== 'default');
}

/** Импорты пакета из соседей: сосед → имя → первый файл, где имя встретилось. */
function importsOf(dir, own) {
    const imports = new Map();
    for (const file of walk(join(dir, 'src'))) {
        const text = readFileSync(file, 'utf8').replace(COMMENTS, '');
        for (const match of text.matchAll(IMPORT)) {
            const neighbour = match[2];
            if (neighbour === own) continue;
            if (!imports.has(neighbour)) imports.set(neighbour, new Map());
            const names = imports.get(neighbour);
            for (const name of namesOf(match[1])) {
                if (!names.has(name)) names.set(name, file.startsWith(ROOT) ? file.slice(ROOT.length + 1) : file);
            }
        }
    }
    return imports;
}

function parseVersion(text) {
    const match = /^(\d+)\.(\d+)\.(\d+)/.exec(text.trim());
    return match ? match.slice(1, 4).map(Number) : null;
}

function compare(a, b) {
    for (let i = 0; i < 3; i += 1) {
        if (a[i] !== b[i]) return a[i] - b[i];
    }
    return 0;
}

/**
 * Разрешает ли диапазон манифеста версию. Формы — те, что пишут скрипты подъёма версии: `^`,
 * `~`, точная, `>=` и любая. Диапазон, которого разбор не знает, не разрешает ничего: это
 * лучше, чем принять наугад, и отказ называет диапазон.
 */
function satisfies(range, version) {
    const text = range.trim();
    if (text === '*' || text === '' || text === 'latest') return true;
    const bound = parseVersion(text.replace(/^[\^~>=]+/, ''));
    if (!bound) return false;
    if (text.startsWith('^')) {
        const upper = bound[0] > 0 ? [bound[0] + 1, 0, 0] : bound[1] > 0 ? [0, bound[1] + 1, 0] : [0, 0, bound[2] + 1];
        return compare(version, bound) >= 0 && compare(version, upper) < 0;
    }
    if (text.startsWith('~')) {
        return compare(version, bound) >= 0 && compare(version, [bound[0], bound[1] + 1, 0]) < 0;
    }
    if (text.startsWith('>=')) return compare(version, bound) >= 0;
    return compare(version, bound) === 0;
}

function maxSatisfying(versions, range) {
    const fit = versions.map((v) => [v, parseVersion(v)]).filter(([, p]) => p && satisfies(range, p));
    fit.sort((a, b) => compare(a[1], b[1]));
    return fit.length ? fit[fit.length - 1][0] : null;
}

/** Ответ реестра о версиях. `null` — реестр не ответил; пустой список — пакета в реестре нет. */
function publishedVersions(name) {
    if (OFFLINE) {
        const dir = join(CACHE, name);
        return existsSync(dir) ? readdirSync(dir).filter((v) => parseVersion(v)) : [];
    }
    try {
        const raw = execFileSync('npm', ['view', name, 'versions', '--json'], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch (error) {
        const said = String(error?.stderr || error?.message || '');
        if (/E404|404 Not Found/.test(said)) return [];
        return null;
    }
}

/** Каталог распакованной версии: из кэша либо забором из реестра. `null` — забрать не удалось. */
function unpacked(name, version) {
    const dir = join(CACHE, name, version);
    if (existsSync(join(dir, 'package', 'package.json'))) return dir;
    if (OFFLINE) return null;
    const scratch = mkdtempSync(join(tmpdir(), 'rt-published-'));
    try {
        execFileSync('npm', ['pack', `${name}@${version}`, '--pack-destination', scratch], {
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        const tarball = readdirSync(scratch).find((f) => f.endsWith('.tgz'));
        if (!tarball) return null;
        mkdirSync(dir, { recursive: true });
        execFileSync('tar', ['xzf', join(scratch, tarball), '-C', dir], { stdio: ['ignore', 'pipe', 'pipe'] });
        return dir;
    } catch {
        return null;
    } finally {
        rmSync(scratch, { recursive: true, force: true });
    }
}

/** Файл типов опубликованного пакета: первое из полей манифеста, которое ведёт к файлу. */
function typesEntry(packageDir) {
    const manifest = readJson(join(packageDir, 'package.json'));
    const candidates = [manifest.typings, manifest.types, manifest.exports?.['.']?.types, 'index.d.ts'].filter(
        Boolean,
    );
    for (const candidate of candidates) {
        const path = join(packageDir, candidate);
        if (existsSync(path) && statSync(path).isFile()) return path;
    }
    return null;
}

/**
 * Файл, на который ведёт `export * from`. Сначала типы, потом исходник: рядом с `.d.ts` лежит
 * одноимённый `.js`, и взятый первым он отдаёт пустой список имён.
 */
function resolveChained(from, target) {
    const base = join(dirname(from), target);
    const candidates = [
        base.replace(/\.js$/, '.d.ts'),
        `${base}.d.ts`,
        join(base, 'index.d.ts'),
        `${base}.ts`,
        join(base, 'index.ts'),
        join(base, 'public-api.ts'),
    ];
    if (/\.(d\.ts|ts)$/.test(base)) candidates.unshift(base);
    for (const candidate of candidates) {
        if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
    }
    return null;
}

/** Все имена, которые пакет экспортирует: объявления, списки и цепочки `export *`. */
function exportsOf(entry, seen = new Set(), out = new Set()) {
    if (!entry || seen.has(entry)) return out;
    seen.add(entry);
    const text = readFileSync(entry, 'utf8');
    for (const match of text.matchAll(DECLARED)) out.add(match[1]);
    for (const match of text.matchAll(LISTED)) for (const name of namesOf(match[1], { after: true })) out.add(name);
    for (const match of text.matchAll(CHAINED)) exportsOf(resolveChained(entry, match[1]), seen, out);
    return out;
}

const problems = [];
const notes = [];
let judged = 0;
let skipped = false;

const allPackages = readdirSync(PROJECTS, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(PROJECTS, entry.name, 'package.json')))
    .map((entry) => ({
        dir: join(PROJECTS, entry.name),
        manifest: readJson(join(PROJECTS, entry.name, 'package.json')),
    }))
    .filter(({ manifest }) => typeof manifest.name === 'string' && manifest.name.startsWith(SCOPE));
const packages = ONLY ? allPackages.filter(({ manifest }) => manifest.name === ONLY) : allPackages;

if (ONLY && packages.length === 0) {
    console.error(`check-package-imports: пакета ${ONLY} в «${PROJECTS}» нет — судить нечего`);
    process.exit(1);
}

const exportsCache = new Map();
const treeExports = new Map();

/** Что сосед экспортирует в дереве — по его точке входа; символ отсюда ждёт публикации соседа. */
function exportedInTree(neighbour) {
    if (!treeExports.has(neighbour)) {
        const found = allPackages.find(({ manifest }) => manifest.name === neighbour);
        const entry = found
            ? [join(found.dir, 'src/index.ts'), join(found.dir, 'src/public-api.ts')].find((p) => existsSync(p))
            : null;
        treeExports.set(neighbour, entry ? exportsOf(entry) : new Set());
    }
    return treeExports.get(neighbour);
}

for (const { dir, manifest } of packages) {
    const ranges = { ...(manifest.dependencies || {}), ...(manifest.peerDependencies || {}) };
    const imports = importsOf(dir, manifest.name);

    for (const [neighbour, names] of imports) {
        const range = ranges[neighbour];
        if (!range) {
            problems.push(
                `${manifest.name}: импортирует из ${neighbour}, а в манифесте соседа не называет — потребитель его не получит`,
            );
            continue;
        }

        judged += 1;
        const key = `${neighbour}@${range}`;
        if (!exportsCache.has(key)) {
            const versions = publishedVersions(neighbour);
            if (versions === null) {
                notes.push(`${neighbour}: реестр не ответил — сверка с опубликованным соседом пропущена`);
                skipped = true;
                exportsCache.set(key, null);
            } else {
                const version = maxSatisfying(versions, range);
                if (!version) {
                    problems.push(
                        `${manifest.name}: под диапазон ${neighbour}@${range} в реестре нет ни одной версии — потребителю ставить нечего`,
                    );
                    exportsCache.set(key, null);
                } else {
                    const packed = unpacked(neighbour, version);
                    const entry = packed ? typesEntry(join(packed, 'package')) : null;
                    if (!packed) {
                        notes.push(`${neighbour}@${version}: забрать из реестра не удалось — сверка пропущена`);
                        skipped = true;
                        exportsCache.set(key, null);
                    } else if (!entry) {
                        problems.push(`${neighbour}@${version}: в опубликованном пакете нет файла типов — сверять не с чем`);
                        exportsCache.set(key, null);
                    } else {
                        exportsCache.set(key, { version, names: exportsOf(entry) });
                    }
                }
            }
        }

        const published = exportsCache.get(key);
        if (!published) continue;

        for (const [name, file] of names) {
            if (published.names.has(name)) continue;
            const line = `${manifest.name}: импортирует ${name} из ${neighbour} (${file}), а в опубликованном ${neighbour}@${published.version} его нет`;
            if (!STRICT && exportedInTree(neighbour).has(name)) {
                notes.push(`${line} — ждёт публикации соседа; до неё этот пакет не публикуется`);
            } else {
                problems.push(line);
            }
        }
    }
}

for (const note of notes) console.error(`check-package-imports: ${note}`);

if (problems.length > 0) {
    console.error(`check-package-imports: расхождений ${problems.length}\n`);
    for (const problem of problems) console.error(`  ${problem}`);
    console.error(
        '\nСимвол, которого нет у опубликованного соседа, ломает сборку у потребителя: сначала публикуется сосед, потом пакет, который его импортирует.',
    );
    process.exit(1);
}

const pending = notes.filter((note) => note.includes('ждёт публикации')).length;
console.log(
    `check-package-imports: пакетов ${packages.length}, пар с соседом ${judged}, расхождений нет${pending ? `, ждут публикации соседа ${pending}` : ''}${skipped ? ' — часть сверок пропущена, реестр не ответил' : ''}`,
);
