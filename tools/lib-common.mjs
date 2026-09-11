// rt-kit v0.27.0 · checks/lib-common.mjs · 18248f13e8ad · правится надстройкой, не здесь
/**
 * Common to every subject of the lib layout audit: the layer set of each domain form, reading the
 * tree, the list of accepted debts and how a lib path yields its name, tag and alias.
 *
 * The module is not named `check-*`, and that is not decoration: the package default assembles the
 * push gate set by walking the names `check-<what>.mjs` in the checks directory, and a helper under
 * such a name would be run by the gate as a check of its own.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { CONFIG, ROOT, parseAllowlist } from './rt-kit-checks.config.mjs';

const FAMILIES = CONFIG.families;
/**
 * The lib root and the backend family come from the tree settings, not from the code: in a tree
 * that keeps its libs under another name the walk went past the code and the check went green on an
 * empty directory — that is, it answered "no violations" where it had not looked at all.
 */
const LIBS_ROOT = CONFIG.libsRoot;
const API_FAMILY = CONFIG.apiFamily;
/**
 * The selector prefix mandatory for frontend libs. The word belongs to the tree entirely; empty
 * means the prefix means nothing here, and the check says nothing about it.
 */
const LIB_PREFIX = CONFIG.libPrefix;
/**
 * The names under which a barrel lies in this tree. There are several: a published package calls
 * its own `public-api.ts`, while a lib of the domain grid calls it `index.ts`, and both live in one
 * tree. A name not listed here does not count as a barrel, and its own file inside it is read as a
 * re-export.
 */
const BARREL_FILES = CONFIG.barrelFiles;
const FLAT_LAYERS = ['api', 'data-access', 'ui', 'util'];
const FEATURE_DOMAIN_LAYERS = [...FLAT_LAYERS, 'feature', 'shell'].sort();
const COMMON_DOMAIN_LAYERS = [...FLAT_LAYERS, 'feature'].sort();
/** The backend has no `ui` and no `shell`: it renders no markup and does no routing */
const API_DOMAIN_LAYERS = ['api', 'data-access', 'feature', 'util'];
/** Where libs that ended up outside the domain grid are looked for */
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
 * The list of accepted debts. Read through the settings helper, not directly: in a fresh tree the
 * file does not exist at all, and a direct read dropped the check with a "no such file" refusal —
 * that is, the very first install got a breakage instead of a report that there are no debts.
 */
// `flatLibRoots` stands in the list alongside the rest: the collection of flat libs reads this side,
// and the parse did not gather it — the value came out empty and was silently substituted with an
// empty list. A tree with a non-empty set of flat roots got zero flat libs and a green check.
const allowlist = parseAllowlist('lib-layers', [
    'notDomains',
    'legacyDomains',
    'legacyLibs',
    'singleLayerDomains',
    'flatLibRoots',
    'accepted',
    'debt',
]);
const pathsOf = (key) => [...allowlist[key].keys()];

/** The pattern `<root>/x/*` covers the `<root>/x` directory itself: the exception is lifted whole */
const matches = (patterns, path) =>
    patterns.some((pattern) => {
        if (!pattern.endsWith('/*')) {
            return path === pattern;
        }
        const prefix = pattern.slice(0, -2);

        return path === prefix || path.startsWith(`${prefix}/`);
    });

/** A directory that is not a domain at all: the family base, the shared libs, the backend */
const isNotDomain = (path) => matches(pathsOf('notDomains'), path);

/** A domain of the old layout: checked neither as a domain nor as a set of libs — it leaves whole */
const isLegacyDomain = (path) => matches(pathsOf('legacyDomains'), path);

/** A lib of the old layout inside a live domain: the domain is checked, the lib itself is not */
const isLegacyLib = (path) => matches(pathsOf('legacyLibs'), path);

/** A domain allowed one filled layer: the reason is named in the exceptions list */
const isSingleLayerDomain = (path) => matches(pathsOf('singleLayerDomains'), path);

/** Paths the lib walk must skip */
const isIgnoredLib = (path) => isNotDomain(path) || isLegacyDomain(path) || isLegacyLib(path);

/**
 * The formula: what the name, the tag and the alias of a lib must become where the tree declared
 * nothing. It is not the name itself — the name is what the tree wrote down. A tree that names its
 * libs otherwise used to redden on flat ground, and the only way to silence that was the exceptions
 * list.
 */
const projectName = (libPath) => libPath.replace(/^libs\//, '').replaceAll('/', '-');
const projectTag = (libPath) => `scope:${projectName(libPath)}`;
const importAlias = (libPath) => `${CONFIG.importScope}/${libPath.slice(`${LIBS_ROOT}/`.length)}`;

/** The name the lib declared in its manifest; an empty string when it declared none. */
function declaredName(libPath) {
    if (!existsSync(join(ROOT, libPath, 'project.json'))) {
        return '';
    }
    try {
        return String(readJson(`${libPath}/project.json`).name ?? '');
    } catch {
        // Unreadable JSON is the business of the manifest check, and it says so in its own words:
        // here a refusal would take down the whole walk over the neighbouring libs as well.
        return '';
    }
}

/** The name of the lib: the declared one, and the formula only where nothing is declared. */
const libName = (libPath) => declaredName(libPath) || projectName(libPath);
/** The tag of the lib: derived from its own name, not from its path. */
const libTag = (libPath) => `scope:${libName(libPath)}`;

/**
 * The alias `tsconfig.base.json` points at this lib by. It is looked for by what it points at, not
 * by its spelling: a lib is reachable by an alias or it is not, and how the tree spells the alias is
 * the tree's own business. An empty string means no alias points here.
 */
function declaredAlias(libPath) {
    const target = `./${libPath}/src/index.ts`;
    let paths = {};
    try {
        paths = readJson('tsconfig.base.json').compilerOptions.paths ?? {};
    } catch {
        return '';
    }

    return Object.keys(paths).find((alias) => paths[alias]?.[0] === target) ?? '';
}

/**
 * The files of a lib, except the barrel: an empty layer has a barrel just as a filled one does, and
 * an empty layer cannot be told from a filled one by it.
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
    declaredName,
    declaredAlias,
    libName,
    libTag,
    sourceCount,
};
