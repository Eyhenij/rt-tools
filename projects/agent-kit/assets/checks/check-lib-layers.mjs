#!/usr/bin/env node
/**
 * Проверка инварианта доменной сетки: у каждого домена ровно те слои, что положены
 * его форме, а у каждой либы — имя, тег, алиас и конфиги, совпадающие с её путём.
 *
 * Четыре формы домена:
 *   фичевый  libs/{site,admin}/<домен>/          api, data-access, feature/<экран>+, shell, ui, util
 *   общий    libs/{site,admin}/common/<домен>/   api, data-access, feature, ui, util   (shell — ошибка)
 *   контейнер                                    та же пятёрка, что у общего
 *   бэкенд   libs/api/<домен>/                   api, data-access, feature, util
 *
 * Исключения перечислены в tools/lib-layers-allowlist.json.
 * Ненулевой код возврата и перечень расхождений.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { allowlistOf, CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const FAMILIES = CONFIG.families;
const FLAT_LAYERS = ['api', 'data-access', 'ui', 'util'];
const FEATURE_DOMAIN_LAYERS = [...FLAT_LAYERS, 'feature', 'shell'].sort();
const COMMON_DOMAIN_LAYERS = [...FLAT_LAYERS, 'feature'].sort();
/** У бэкенда нет `ui` и `shell`: отдавать разметку и роутиться ему нечем */
const API_DOMAIN_LAYERS = ['api', 'data-access', 'feature', 'util'];
/** Где ищутся либы, оказавшиеся вне доменной сетки */
const LIB_ROOTS = [...FAMILIES, 'api'].map((family) => `libs/${family}`);
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

const allowlist = readJson(allowlistOf('lib-layers'));
const pathsOf = (key) => (allowlist[key] ?? []).map((exception) => exception.path);

/** Паттерн `libs/x/*` покрывает и сам каталог `libs/x`: исключение снимается целиком */
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

/**
 * Домен ли это. Домен заводится под предмет, и предмет виден по тому, что заполнен у
 * домена не один слой: экраны и состояние, запросы и механика, выход к чужому и то,
 * что мы отдаём. Заполнен ровно один — это слот, который заполнит следующая задача, и
 * от домена он не отличим ничем, кроме намерения.
 *
 * Домен вносится строкой в список исключений вместе с причиной, и причина бывает
 * настоящей: сборка PDF со своими шрифтами не едет ни в чей чужой граф зависимостей.
 */
function checkDomainIsFilled(domainPath, libs) {
    if (isSingleLayerDomain(domainPath)) {
        return;
    }
    const filled = libs.filter((libPath) => sourceCount(libPath) > 0);
    if (libs.length > 1 && filled.length === 1) {
        report(
            domainPath,
            `заполнен один слой — \`${filled[0].slice(domainPath.length + 1)}\`: домен от слота этим не отличить. ` +
                'Либо содержимое переезжает в существующую либу, либо домен вносится строкой с причиной в `singleLayerDomains`'
        );
    }
}

/** Пути, которые обход либ обязан пропустить */
const isIgnoredLib = (path) => isNotDomain(path) || isLegacyDomain(path) || isLegacyLib(path);

const projectName = (libPath) => libPath.replace(/^libs\//, '').replaceAll('/', '-');
const projectTag = (libPath) => `scope:${projectName(libPath)}`;
const importAlias = (libPath) => `${CONFIG.importScope}/${libPath.replace(/^libs\//, '')}`;

/** Собирает пути всех либ домена и попутно проверяет состав его слоёв */
function collectDomainLibs(domainPath, isCommon) {
    const expected = isCommon ? COMMON_DOMAIN_LAYERS : FEATURE_DOMAIN_LAYERS;
    const actual = dirsIn(domainPath);

    const missing = expected.filter((layer) => !actual.includes(layer));
    const extra = actual.filter((layer) => !expected.includes(layer));
    if (missing.length > 0) {
        report(domainPath, `нет слоёв: ${missing.join(', ')}`);
    }
    if (extra.length > 0) {
        report(
            domainPath,
            `лишние каталоги: ${extra.join(', ')}${extra.includes('shell') && isCommon ? ' (у общего домена shell не бывает: он не роутится)' : ''}`
        );
    }

    const libs = actual.filter((layer) => FLAT_LAYERS.includes(layer) || layer === 'shell').map((layer) => `${domainPath}/${layer}`);

    if (actual.includes('feature')) {
        const featurePath = `${domainPath}/feature`;
        if (isCommon) {
            libs.push(featurePath);
        } else {
            const screens = dirsIn(featurePath).filter((screen) => isLib(`${featurePath}/${screen}`));
            if (screens.length === 0) {
                report(featurePath, 'у фичевого домена `feature` — каталог с либой на экран, здесь ни одной');
            }
            libs.push(...screens.map((screen) => `${featurePath}/${screen}`));
        }
    }

    checkDomainIsFilled(domainPath, libs);

    return libs;
}

/**
 * Домены бэкенда: `libs/api/<домен>` с четырьмя слоями. `feature` бывает и либой,
 * и каталогом с либой на proto-сервис — по тому же правилу, по которому у
 * фичевого домена фронта `feature/<экран>`.
 *
 * Пустой слой — не дефект: `api` пуст у домена, который ни с кем чужим не
 * говорит, `data-access` — у того, что не касается базы. Слой всё равно заводится
 * либой, иначе граница домена объявлена не полностью.
 */
function collectApiDomainLibs() {
    const libs = [];

    for (const entry of dirsIn('libs/api')) {
        const domainPath = `libs/api/${entry}`;
        if (isNotDomain(domainPath) || isLegacyDomain(domainPath)) {
            continue;
        }

        const actual = dirsIn(domainPath);
        const missing = API_DOMAIN_LAYERS.filter((layer) => !actual.includes(layer));
        const extra = actual.filter((layer) => !API_DOMAIN_LAYERS.includes(layer));
        if (missing.length > 0) {
            report(domainPath, `нет слоёв: ${missing.join(', ')}`);
        }
        if (extra.length > 0) {
            report(
                domainPath,
                `лишние каталоги: ${extra.join(', ')}${extra.includes('shell') || extra.includes('ui') ? ' (у бэкенда ui и shell не бывает)' : ''}`
            );
        }

        const domainLibs = actual
            .filter((layer) => layer !== 'feature' && API_DOMAIN_LAYERS.includes(layer))
            .map((layer) => `${domainPath}/${layer}`);

        if (actual.includes('feature')) {
            const featurePath = `${domainPath}/feature`;
            if (isLib(featurePath)) {
                domainLibs.push(featurePath);
            } else {
                const services = dirsIn(featurePath).filter((service) => isLib(`${featurePath}/${service}`));
                if (services.length === 0) {
                    report(featurePath, '`feature` — либа или каталог с либой на proto-сервис, здесь ни того ни другого');
                }
                domainLibs.push(...services.map((service) => `${featurePath}/${service}`));
            }
        }

        checkDomainIsFilled(domainPath, domainLibs);
        libs.push(...domainLibs);
    }

    return libs.sort();
}

/** Все либы доменной сетки обоих семейств */
function collectAllDomainLibs() {
    const libs = [];

    for (const family of FAMILIES) {
        for (const entry of dirsIn(`libs/${family}`)) {
            if (entry === 'common') {
                for (const commonDomain of dirsIn(`libs/${family}/common`)) {
                    libs.push(...collectDomainLibs(`libs/${family}/common/${commonDomain}`, true));
                }
                continue;
            }
            const domainPath = `libs/${family}/${entry}`;
            if (isNotDomain(domainPath) || isLegacyDomain(domainPath)) {
                continue;
            }
            libs.push(...collectDomainLibs(domainPath, false));
        }
    }

    return libs.sort();
}

/** Каждая либа на диске должна быть либой доменной сетки или значиться в allowlist */
function collectStrayLibs(knownLibs) {
    const strays = [];
    const walk = (path) => {
        if (isLegacyDomain(path) || isNotDomain(path)) {
            return;
        }
        if (isLib(path)) {
            if (!knownLibs.includes(path) && !isIgnoredLib(path)) {
                strays.push(path);
            }
            // либа старой раскладки может держать внутри себя новые слои — обход продолжается
            if (!isLegacyLib(path)) {
                return;
            }
        }
        dirsIn(path).forEach((entry) => walk(`${path}/${entry}`));
    };
    LIB_ROOTS.forEach((root) => walk(root));
    return strays;
}

/**
 * Плоские либы бэкенда: `libs/api/<домен>`. Лесенки слоёв у них нет по
 * устройству — домен это одна либа, — но всё остальное проверяется наравне с
 * доменной сеткой. До сужения исключение `libs/api/*` снимало с них и состав
 * файлов, и тег, и алиас: новая либа заводилась без `vitest.config.mts`, и
 * `nx test` по ней молча не гонял ни одной спеки.
 */
function collectFlatLibs() {
    return (allowlist.flatLibRoots ?? [])
        .flatMap((root) => dirsIn(root).map((entry) => `${root}/${entry}`))
        .filter((path) => isLib(path))
        .sort();
}

function checkLib(libPath, { requirePrefix = true } = {}) {
    for (const file of REQUIRED_FILES) {
        if (!existsSync(join(ROOT, libPath, file))) {
            report(libPath, `нет файла ${file}`);
        }
    }

    if (!existsSync(join(ROOT, libPath, 'project.json'))) {
        return;
    }

    const project = readJson(`${libPath}/project.json`);
    if (project.name !== projectName(libPath)) {
        report(libPath, `имя проекта «${project.name}» не совпадает с путём, ожидается «${projectName(libPath)}»`);
    }
    if (project.sourceRoot !== `${libPath}/src`) {
        report(libPath, `sourceRoot «${project.sourceRoot}» не совпадает с путём`);
    }
    // Префикс — про селекторы компонентов, а у бэкенда компонентов нет
    if (requirePrefix && project.prefix !== 'vm') {
        report(libPath, `prefix «${project.prefix}» вместо обязательного «vm»`);
    }

    const tags = project.tags ?? [];
    if (tags.length !== 1) {
        report(libPath, `тегов ${tags.length}, а должен быть ровно один: ${projectTag(libPath)}`);
    } else if (tags[0] !== projectTag(libPath)) {
        report(libPath, `тег «${tags[0]}» не совпадает с путём, ожидается «${projectTag(libPath)}»`);
    }
}

function checkAliases(libs) {
    const paths = readJson('tsconfig.base.json').compilerOptions.paths;
    for (const libPath of libs) {
        const alias = importAlias(libPath);
        const target = `./${libPath}/src/index.ts`;
        if (!paths[alias]) {
            report(libPath, `в tsconfig.base.json нет алиаса ${alias}`);
        } else if (paths[alias][0] !== target) {
            report(libPath, `алиас ${alias} указывает на ${paths[alias][0]}, а не на ${target}`);
        }
    }
}

/**
 * Либа должна быть описана ровно одним `sourceTag` и ровно в одном файле границ:
 * описанная дважды либа означает два разных allowlist'а на неё, и какой победит —
 * вопрос порядка сборки. В чужих allowlist'ах тег, наоборот, встречается сколько
 * угодно раз: это перечисление тех, кому либа видна.
 */
function checkBoundaries(libs) {
    if (!isDir(BOUNDARIES_DIR)) {
        report(BOUNDARIES_DIR, 'каталога с файлами границ нет');
        return;
    }

    const files = readdirSync(join(ROOT, BOUNDARIES_DIR)).filter((name) => name.endsWith('.config.mjs'));
    const sources = files.map((name) => ({ name, text: readFileSync(join(ROOT, BOUNDARIES_DIR, name), 'utf8') }));

    for (const libPath of libs) {
        const tag = projectTag(libPath);
        const declaration = `sourceTag: '${tag}'`;
        const owners = sources.flatMap(({ name, text }) => {
            const count = text.split(declaration).length - 1;
            return count > 0 ? Array.from({ length: count }, () => name) : [];
        });

        if (owners.length === 0) {
            report(libPath, `тег ${tag} не описан ни в одном файле ${BOUNDARIES_DIR}/`);
        } else if (owners.length > 1) {
            report(libPath, `тег ${tag} описан ${owners.length} раза: ${owners.join(', ')}`);
        }
    }
}

/**
 * Либы, у которых список зависимостей обязан оставаться пустым. Барель такой либы
 * уезжает в бандл бэкенда, а сборка API идёт без tree-shaking: любая зависимость
 * расходится оттуда по всему графу.
 */
const NO_DEPENDENCY_TAGS = ['scope:common-util'];

function checkNoDependencyLibs() {
    if (!isDir(BOUNDARIES_DIR)) {
        return;
    }

    const files = readdirSync(join(ROOT, BOUNDARIES_DIR)).filter((name) => name.endsWith('.config.mjs'));

    for (const tag of NO_DEPENDENCY_TAGS) {
        const declaration = `sourceTag: '${tag}'`;
        let described = false;

        for (const name of files) {
            const text = readFileSync(join(ROOT, BOUNDARIES_DIR, name), 'utf8');
            const declaredAt = text.indexOf(declaration);
            if (declaredAt === -1) {
                continue;
            }
            described = true;

            const rest = text.slice(declaredAt);
            const listAt = rest.indexOf('onlyDependOnLibsWithTags:');
            const opensAt = rest.indexOf('[', listAt);
            const closesAt = rest.indexOf(']', opensAt);
            if (listAt === -1 || opensAt === -1 || closesAt === -1) {
                report(`${BOUNDARIES_DIR}/${name}`, `у ${tag} не найден список зависимостей`);
                continue;
            }

            const dependencies = rest.slice(opensAt + 1, closesAt).trim();
            if (dependencies.length > 0) {
                report(`${BOUNDARIES_DIR}/${name}`, `${tag} ни от кого не зависит, а его список непуст: ${dependencies}`);
            }
        }

        if (!described) {
            report(BOUNDARIES_DIR, `тег ${tag} не описан ни в одном файле границ`);
        }
    }
}

/** Барель собирает наружу собственные файлы либы, и только они в нём законны */
const isBarrel = (path) => path.endsWith('/index.ts');

/** Файл той же либы адресуется относительным путём, чужая либа — алиасом */
const isOwnFile = (module) => module.startsWith('.');

/** `export { X } from '…'` и `import { X } …` вместе с `export { X };` */
const REEXPORT_FROM = /^export\s+(?:type\s+)?\{([^}]*)\}\s*from\s*'([^']+)';/gm;
const BARE_EXPORT = /^export\s+(?:type\s+)?\{([^}]*)\};/gm;
const IMPORTED_NAMES = /^import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*'([^']+)';/gm;

const namesIn = (list) =>
    list
        .split(',')
        .map(
            (part) =>
                part
                    .trim()
                    .replace(/^type\s+/, '')
                    .split(/\s+as\s+/)[0]
        )
        .filter(Boolean);

/**
 * Символ, объявленный в другой либе, наружу не проходит.
 *
 * Реэкспорт заводится тогда, когда потребителю не хватает прав на либу-источник,
 * и протаскивает её через соседа мимо границы тегов: по графу зависимостей
 * выходит, что слой её не видит. Ни линт, ни сборка реэкспорт от собственного
 * объявления не отличают.
 *
 * В бареле проверяются только чужие либы: собственные файлы он и собирает.
 * Пока барель пропускался целиком, чужой символ проходил через него молча —
 * так `common/util` отдавала работу с датами всему бэкенду через слой `util`
 * домена Postgres.
 */
function checkReexports() {
    for (const file of collectSourceFiles()) {
        if (file.includes('/gen/') || file.includes('/generated/')) {
            continue;
        }

        const ownFilesAllowed = isBarrel(file);
        const text = readFileSync(join(ROOT, file), 'utf8');
        for (const [, list, module] of text.matchAll(REEXPORT_FROM)) {
            if (ownFilesAllowed && isOwnFile(module)) {
                continue;
            }
            report(file, `реэкспорт из \`${module}\`: ${namesIn(list).join(', ')} — потребитель импортирует их у источника`);
        }

        const imported = new Map();
        for (const [, list, module] of text.matchAll(IMPORTED_NAMES)) {
            namesIn(list).forEach((name) => imported.set(name, module));
        }
        for (const [, list] of text.matchAll(BARE_EXPORT)) {
            for (const name of namesIn(list).filter((name) => imported.has(name))) {
                if (ownFilesAllowed && isOwnFile(imported.get(name))) {
                    continue;
                }
                report(file, `реэкспорт \`${name}\` из \`${imported.get(name)}\` — потребитель импортирует его у источника`);
            }
        }
    }
}

/** Файлы либ, кроме спек: реэкспорт в спеке бессмыслен, а обходить их дешевле */
function collectSourceFiles() {
    const files = [];
    const walk = (dir) => {
        for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
            if (IGNORED_DIRS.includes(entry.name) && entry.name !== 'src') {
                continue;
            }
            const path = `${dir}/${entry.name}`;
            if (entry.isDirectory()) {
                walk(path);
            } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
                files.push(path);
            }
        }
    };

    ['libs', 'apps'].filter(isDir).forEach(walk);

    return files;
}

/**
 * Основание семейства видит `common/util` и слои `util` общих доменов своей
 * семьи. Всё сверх этого названо строкой здесь: основание зовут все домены, и
 * любая его зависимость становится общей для всей семьи.
 */
const CORE_EXCEPTIONS = {
    // Транспорт Connect в admin-transport.provider.ts: дескриптор логина и токен транспорта
    'scope:admin-core': ['scope:common-proto', 'scope:common-connect'],
};

/** `scope:<семья>-common-<домен>-util` — слой `util` общего домена той же семьи */
const isFamilyCommonUtil = (tag, family) => new RegExp(`^scope:${family}-common-[a-z0-9-]+-util$`).test(tag);

async function checkCoreLibs() {
    const { allBoundaries } = await import(join(ROOT, 'eslint/boundaries/index.mjs'));

    for (const family of FAMILIES) {
        const tag = `scope:${family}-core`;
        const rule = allBoundaries.find((entry) => entry.sourceTag === tag);
        if (!rule) {
            continue;
        }

        const allowed = CORE_EXCEPTIONS[tag] ?? [];
        for (const dependency of rule.onlyDependOnLibsWithTags ?? []) {
            if (dependency === 'scope:common-util' || isFamilyCommonUtil(dependency, family) || allowed.includes(dependency)) {
                continue;
            }
            report(
                `${BOUNDARIES_DIR}/${family}-core.config.mjs`,
                `${tag} видит ${dependency}: основанию семейства доступны только scope:common-util и scope:${family}-common-*-util`
            );
        }
    }
}

const domainLibs = collectAllDomainLibs();
const apiLibs = collectApiDomainLibs();
const flatLibs = collectFlatLibs();
const strays = collectStrayLibs([...domainLibs, ...apiLibs]);

strays.forEach((path) => report(path, `либа вне доменной сетки и не значится в ${allowlistOf('lib-layers')}`));
domainLibs.forEach((libPath) => checkLib(libPath));
apiLibs.forEach((libPath) => checkLib(libPath, { requirePrefix: false }));
flatLibs.forEach((libPath) => checkLib(libPath, { requirePrefix: false }));
checkAliases([...domainLibs, ...apiLibs, ...flatLibs]);
checkBoundaries([...domainLibs, ...apiLibs, ...flatLibs]);
checkNoDependencyLibs();
checkReexports();
await checkCoreLibs();

if (problems.length > 0) {
    console.error(`check-lib-layers: расхождений ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    process.exit(1);
}

console.log(
    `check-lib-layers: ${domainLibs.length} либ доменной сетки фронта, ${apiLibs.length} бэкенда и ${flatLibs.length} плоских, расхождений нет`
);
