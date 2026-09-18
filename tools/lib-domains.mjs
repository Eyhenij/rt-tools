// rt-kit v0.29.0 · checks/lib-domains.mjs · 2eee8034c9a9 · правится надстройкой, не здесь
/**
 * The domain grid: which directories count as domains, which layers each of their forms is made of
 * and which libs lie in them. From here also come the libs that ended up outside the grid and the
 * flat libs of the backend — both groups are checked further on a par with the domain ones.
 *
 * The name does not start with `check-`: by walking such names the package default assembles the
 * set of the push gate, and a helper with one the gate would run as a check of its own.
 */
import {
    API_DOMAIN_LAYERS,
    API_FAMILIES,
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
 * Whether this is a domain. A domain is started for a subject, and the subject is seen by more
 * than one layer of the domain being filled: the screens and the state, the requests and the
 * mechanics, the way out to a stranger and what we hand over. Exactly one is filled — that is a
 * slot the next task will fill, and it differs from a domain by nothing but the intention.
 *
 * A domain is entered as a line into the list of exceptions together with a reason, and the reason
 * is sometimes real: a PDF build with fonts of its own travels into nobody else's dependency graph.
 */
function checkDomainIsFilled(domainPath, libs) {
    if (isSingleLayerDomain(domainPath)) {
        return;
    }
    const filled = libs.filter((libPath) => sourceCount(libPath) > 0);
    if (libs.length > 1 && filled.length === 1) {
        report(
            domainPath,
            `one layer is filled — \`${filled[0].slice(domainPath.length + 1)}\`: a domain cannot be told from a slot by that. ` +
                'Either the content moves into an existing lib, or the domain is entered by a line with a reason in `singleLayerDomains`'
        );
    }
}

/** Collects the paths of all the libs of a domain and checks the make-up of its layers on the way */
function collectDomainLibs(domainPath, isCommon) {
    const expected = isCommon ? COMMON_DOMAIN_LAYERS : FEATURE_DOMAIN_LAYERS;
    const actual = dirsIn(domainPath);

    const missing = expected.filter((layer) => !actual.includes(layer));
    const extra = actual.filter((layer) => !expected.includes(layer));
    if (missing.length > 0) {
        report(domainPath, `no layers: ${missing.join(', ')}`);
    }
    if (extra.length > 0) {
        report(
            domainPath,
            `extra directories: ${extra.join(', ')}${extra.includes('shell') && isCommon ? ' (a common domain never has shell: it is not routed)' : ''}`
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
                report(featurePath, 'in a feature domain `feature` is a directory with a lib per screen, here there is none');
            }
            libs.push(...screens.map((screen) => `${featurePath}/${screen}`));
        }
    }

    checkDomainIsFilled(domainPath, libs);

    return libs;
}

/**
 * The domains of the backend: `<libs root>/<backend family>/<domain>` with four layers, walked for
 * every family of the list. `feature`
 * is both a lib and a directory with a lib per proto service — by the same rule by which a
 * feature domain of the frontend has `feature/<screen>`.
 *
 * An empty layer is not a defect: `api` is empty at a domain that speaks with no stranger,
 * `data-access` at one that does not touch the database. The layer is started as a lib all the
 * same, otherwise the boundary of the domain is declared incompletely.
 */
function collectApiDomainLibs() {
    const libs = [];

    const domainPaths = API_FAMILIES.flatMap((family) =>
        dirsIn(`${LIBS_ROOT}/${family}`).map((entry) => `${LIBS_ROOT}/${family}/${entry}`)
    );
    for (const domainPath of domainPaths) {
        if (isNotDomain(domainPath) || isLegacyDomain(domainPath)) {
            continue;
        }

        const actual = dirsIn(domainPath);
        const missing = API_DOMAIN_LAYERS.filter((layer) => !actual.includes(layer));
        const extra = actual.filter((layer) => !API_DOMAIN_LAYERS.includes(layer));
        if (missing.length > 0) {
            report(domainPath, `no layers: ${missing.join(', ')}`);
        }
        if (extra.length > 0) {
            report(
                domainPath,
                `extra directories: ${extra.join(', ')}${extra.includes('shell') || extra.includes('ui') ? ' (the backend never has ui and shell)' : ''}`
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
                    report(featurePath, '`feature` is a lib or a directory with a lib per proto service, here there is neither');
                }
                domainLibs.push(...services.map((service) => `${featurePath}/${service}`));
            }
        }

        checkDomainIsFilled(domainPath, domainLibs);
        libs.push(...domainLibs);
    }

    return libs.sort();
}

/** All the libs of the domain grid of both families */
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

/** Every lib on the disk must be a lib of the domain grid or be listed in the allowlist */
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
            // a lib of the old layout may hold new layers inside itself — the walk goes on
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
 * The flat libs of the backend: `<libs root>/<backend family>/<domain>`. They have no ladder of
 * layers by their make-up — a domain is one lib — but everything else is checked on a par with
 * the domain grid. Before the narrowing, the exception on this root took off from them the
 * make-up of the files, the tag and the alias too: a new lib was started without
 * `vitest.config.mts`, and `nx test` silently ran not a single test over it.
 */
function collectFlatLibs() {
    return [...(allowlist.flatLibRoots?.keys() ?? [])]
        .flatMap((root) => dirsIn(root).map((entry) => `${root}/${entry}`))
        .filter((path) => isLib(path))
        .sort();
}

export { collectAllDomainLibs, collectApiDomainLibs, collectFlatLibs, collectStrayLibs };
