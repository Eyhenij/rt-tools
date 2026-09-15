// rt-kit v0.28.0 · checks/lib-manifests.mjs · faba213e60d5 · правится надстройкой, не здесь
/**
 * The lib itself: the mandatory files, the project name, the selector prefix, the tag and the
 * import alias — everything `project.json` and `tsconfig.base.json` must match the lib path on
 * disk by.
 *
 * The name does not begin with `check-`: by walking such names the package default assembles the
 * push gate set, and a helper with one would be run by the gate as a check of its own.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { LIB_PREFIX, REQUIRED_FILES, declaredAlias, importAlias, libTag, projectName, readJson, report } from './lib-common.mjs';
import { ROOT } from './rt-kit-checks.config.mjs';

function checkLib(libPath, { requirePrefix = true } = {}) {
    for (const file of REQUIRED_FILES) {
        if (!existsSync(join(ROOT, libPath, file))) {
            report(libPath, `no file ${file}`);
        }
    }

    if (!existsSync(join(ROOT, libPath, 'project.json'))) {
        return;
    }

    const project = readJson(`${libPath}/project.json`);
    // The name the tree wrote down is the name. The formula speaks only where nothing is written:
    // it says what the name must become, and judging a declared name by it reddens a lib that
    // breaks nothing.
    if (!project.name) {
        report(libPath, `the manifest declares no project name, and by the path it must be «${projectName(libPath)}»`);
    }
    if (project.sourceRoot !== `${libPath}/src`) {
        report(libPath, `sourceRoot «${project.sourceRoot}» does not match the path`);
    }
    // The prefix is about component selectors, and the backend has no components. The word itself
    // belongs to the tree: everyone has their own, and one hard-coded here would go red on every lib
    // of the first tree that named its selectors otherwise. A tree that has not named a prefix does
    // not get this check.
    if (requirePrefix && LIB_PREFIX && project.prefix !== LIB_PREFIX) {
        report(libPath, `prefix «${project.prefix}» instead of the mandatory «${LIB_PREFIX}»`);
    }

    // One tag per lib stays mandatory — the linter boundaries are built on it — and the tag is
    // judged against the lib's own name, not against its path.
    const tags = project.tags ?? [];
    if (tags.length !== 1) {
        report(libPath, `tags ${tags.length}, and there must be exactly one: ${libTag(libPath)}`);
    } else if (tags[0] !== libTag(libPath)) {
        report(libPath, `the tag «${tags[0]}» does not match the name of the lib, expected «${libTag(libPath)}»`);
    }
}

/**
 * Every lib is reachable by an alias. Which alias is the tree's own business: it is looked for by
 * what it points at, and its spelling is judged by nothing. A lib nothing points at is named
 * together with the alias the formula would give it.
 */
function checkAliases(libs) {
    for (const libPath of libs) {
        if (declaredAlias(libPath) === '') {
            report(libPath, `tsconfig.base.json names no alias pointing at ./${libPath}/src/index.ts, and by the path it must be ${importAlias(libPath)}`);
        }
    }
}

export { checkAliases, checkLib };
