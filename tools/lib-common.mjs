// rt-kit v0.14.0 · checks/lib-common.mjs · 1d9de45dc1cf · правится надстройкой, не здесь
/**
 * Общее для всех предметов сверки раскладки либ: состав слоёв каждой формы домена, чтение
 * дерева, список принятых долгов и то, как из пути либы получаются её имя, тег и алиас.
 *
 * Модуль назван не `check-*`, и это не украшение: умолчание пакета собирает набор гейта пуша
 * перебором имён `check-<что>.mjs` в каталоге проверок, и помощник с таким именем гейт стал бы
 * гонять как отдельную проверку.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { CONFIG, ROOT, parseAllowlist } from './rt-kit-checks.config.mjs';

const FAMILIES = CONFIG.families;
/**
 * Корень либ и семья бэкенда берутся из настройки дерева, а не из кода: у дерева, которое
 * держит либы под другим именем, обход шёл мимо кода и проверка зеленела на пустом каталоге —
 * то есть отвечала «нарушений нет» там, где она не смотрела вовсе.
 */
const LIBS_ROOT = CONFIG.libsRoot;
const API_FAMILY = CONFIG.apiFamily;
/**
 * Приставка селекторов, обязательная либам фронта. Слово принадлежит дереву целиком; пусто —
 * приставка здесь ничего не значит, и проверка о ней молчит.
 */
const LIB_PREFIX = CONFIG.libPrefix;
/**
 * Имена, под которыми в этом дереве лежит барель. Их несколько: публикуемый пакет зовёт свой
 * `public-api.ts`, а либа доменной сетки — `index.ts`, и оба живут в одном дереве. Имя, не
 * названное здесь, барелем не считается, и собственный файл в нём читается реэкспортом.
 */
const BARREL_FILES = CONFIG.barrelFiles;
const FLAT_LAYERS = ['api', 'data-access', 'ui', 'util'];
const FEATURE_DOMAIN_LAYERS = [...FLAT_LAYERS, 'feature', 'shell'].sort();
const COMMON_DOMAIN_LAYERS = [...FLAT_LAYERS, 'feature'].sort();
/** У бэкенда нет `ui` и `shell`: отдавать разметку и роутиться ему нечем */
const API_DOMAIN_LAYERS = ['api', 'data-access', 'feature', 'util'];
/** Где ищутся либы, оказавшиеся вне доменной сетки */
const LIB_ROOTS = [...FAMILIES, API_FAMILY].map((family) => `${LIBS_ROOT}/${family}`);
const REQUIRED_FILES = ['project.json', 'tsconfig.json', 'vitest.config.mts', 'src/index.ts'];
const BOUNDARIES_DIR = 'eslint/boundaries/domains';

const problems = [];
const report = (path, message) => problems.push(`${path}: ${message}`);

const readJson = (path) => JSON.parse(readFileSync(join(ROOT, path), 'utf8'));
const isDir = (path) => existsSync(join(ROOT, path)) && statSync(join(ROOT, path)).isDirectory();
const IGNORED_DIRS = ['src', 'node_modules'];
const dirsIn = (path) =>
    isDir(path)
        ? readdirSync(join(ROOT, path), { withFileTypes: true })
              .filter((entry) => entry.isDirectory() && !IGNORED_DIRS.includes(entry.name))
              .map((entry) => entry.name)
              .sort()
        : [];
const isLib = (path) => existsSync(join(ROOT, path, 'project.json'));

/**
 * Список принятых долгов. Читается помощником настроек, а не напрямую: файла в свежем дереве
 * нет вовсе, и прямое чтение роняло проверку отказом «нет такого файла» — то есть первая же
 * установка получала поломку вместо отчёта о том, что долгов нет.
 */
const allowlist = parseAllowlist('lib-layers', ['notDomains', 'legacyDomains', 'legacyLibs', 'singleLayerDomains', 'accepted', 'debt']);
const pathsOf = (key) => [...allowlist[key].keys()];

/** Паттерн `<корень>/x/*` покрывает и сам каталог `<корень>/x`: исключение снимается целиком */
const matches = (patterns, path) =>
    patterns.some((pattern) => {
        if (!pattern.endsWith('/*')) {
            return path === pattern;
        }
        const prefix = pattern.slice(0, -2);

        return path === prefix || path.startsWith(`${prefix}/`);
    });

/** Каталог, который доменом не является вовсе: основание семейства, общие либы, бэкенд */
const isNotDomain = (path) => matches(pathsOf('notDomains'), path);

/** Домен старой раскладки: не проверяется ни как домен, ни как набор либ — уезжает целиком */
const isLegacyDomain = (path) => matches(pathsOf('legacyDomains'), path);

/** Либа старой раскладки внутри живого домена: домен проверяется, сама либа — нет */
const isLegacyLib = (path) => matches(pathsOf('legacyLibs'), path);

/** Домен, которому один заполненный слой разрешён: причина названа в списке исключений */
const isSingleLayerDomain = (path) => matches(pathsOf('singleLayerDomains'), path);

/** Пути, которые обход либ обязан пропустить */
const isIgnoredLib = (path) => isNotDomain(path) || isLegacyDomain(path) || isLegacyLib(path);

const projectName = (libPath) => libPath.replace(/^libs\//, '').replaceAll('/', '-');
const projectTag = (libPath) => `scope:${projectName(libPath)}`;
const importAlias = (libPath) => `${CONFIG.importScope}/${libPath.slice(`${LIBS_ROOT}/`.length)}`;

/**
 * Файлы либы, кроме бареля: барель есть у пустого слоя так же, как у заполненного, и
 * пустой слой от заполненного по нему не отличить.
 */
function sourceCount(libPath) {
    const inside = (dir) => {
        let total = 0;
        for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
            if (entry.isDirectory()) {
                if (!IGNORED_DIRS.includes(entry.name)) {
                    total += inside(`${dir}/${entry.name}`);
                }
            } else if (entry.name.endsWith('.ts')) {
                total += 1;
            }
        }

        return total;
    };

    return isDir(`${libPath}/src/lib`) ? inside(`${libPath}/src/lib`) : 0;
}

export {
    FAMILIES,
    LIBS_ROOT,
    API_FAMILY,
    LIB_PREFIX,
    BARREL_FILES,
    FLAT_LAYERS,
    FEATURE_DOMAIN_LAYERS,
    COMMON_DOMAIN_LAYERS,
    API_DOMAIN_LAYERS,
    LIB_ROOTS,
    REQUIRED_FILES,
    BOUNDARIES_DIR,
    IGNORED_DIRS,
    allowlist,
    problems,
    report,
    readJson,
    isDir,
    dirsIn,
    isLib,
    isNotDomain,
    isLegacyDomain,
    isLegacyLib,
    isSingleLayerDomain,
    isIgnoredLib,
    projectName,
    projectTag,
    importAlias,
    sourceCount,
};
