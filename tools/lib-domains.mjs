// rt-kit v0.21.0 · checks/lib-domains.mjs · 5edef10b4a79 · правится надстройкой, не здесь
/**
 * Доменная сетка: какие каталоги считаются доменами, из каких слоёв состоит каждая их форма и
 * какие либы в них лежат. Отсюда же выходят либы, оказавшиеся вне сетки, и плоские либы
 * бэкенда — обе группы дальше проверяются наравне с доменными.
 *
 * Имя не начинается с `check-`: перебором таких имён умолчание пакета собирает набор гейта
 * пуша, и помощник с ним гейт стал бы гонять как отдельную проверку.
 */
import {
    API_DOMAIN_LAYERS,
    API_FAMILY,
    COMMON_DOMAIN_LAYERS,
    FAMILIES,
    FEATURE_DOMAIN_LAYERS,
    FLAT_LAYERS,
    LIBS_ROOT,
    LIB_ROOTS,
    allowlist,
    dirsIn,
    isIgnoredLib,
    isLegacyDomain,
    isLegacyLib,
    isLib,
    isNotDomain,
    isSingleLayerDomain,
    report,
    sourceCount,
} from './lib-common.mjs';

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
 * Домены бэкенда: `<корень либ>/<семья бэкенда>/<домен>` с четырьмя слоями. `feature` бывает и либой,
 * и каталогом с либой на proto-сервис — по тому же правилу, по которому у
 * фичевого домена фронта `feature/<экран>`.
 *
 * Пустой слой — не дефект: `api` пуст у домена, который ни с кем чужим не
 * говорит, `data-access` — у того, что не касается базы. Слой всё равно заводится
 * либой, иначе граница домена объявлена не полностью.
 */
function collectApiDomainLibs() {
    const libs = [];

    for (const entry of dirsIn(`${LIBS_ROOT}/${API_FAMILY}`)) {
        const domainPath = `${LIBS_ROOT}/${API_FAMILY}/${entry}`;
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
        for (const entry of dirsIn(`${LIBS_ROOT}/${family}`)) {
            if (entry === 'common') {
                for (const commonDomain of dirsIn(`${LIBS_ROOT}/${family}/common`)) {
                    libs.push(...collectDomainLibs(`${LIBS_ROOT}/${family}/common/${commonDomain}`, true));
                }
                continue;
            }
            const domainPath = `${LIBS_ROOT}/${family}/${entry}`;
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
 * Плоские либы бэкенда: `<корень либ>/<семья бэкенда>/<домен>`. Лесенки слоёв у них нет по
 * устройству — домен это одна либа, — но всё остальное проверяется наравне с
 * доменной сеткой. До сужения исключение по этому корню снимало с них и состав
 * файлов, и тег, и алиас: новая либа заводилась без `vitest.config.mts`, и
 * `nx test` по ней молча не гонял ни одной спеки.
 */
function collectFlatLibs() {
    return [...(allowlist.flatLibRoots?.keys() ?? [])]
        .flatMap((root) => dirsIn(root).map((entry) => `${root}/${entry}`))
        .filter((path) => isLib(path))
        .sort();
}

export { collectAllDomainLibs, collectApiDomainLibs, collectFlatLibs, collectStrayLibs };
