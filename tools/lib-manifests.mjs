// rt-kit v0.26.0 · checks/lib-manifests.mjs · 75d83514d0f9 · правится надстройкой, не здесь
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

import { LIB_PREFIX, REQUIRED_FILES, importAlias, projectName, projectTag, readJson, report } from './lib-common.mjs';
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
    if (project.name !== projectName(libPath)) {
        report(libPath, `the project name «${project.name}» does not match the path, expected «${projectName(libPath)}»`);
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

    const tags = project.tags ?? [];
    if (tags.length !== 1) {
        report(libPath, `tags ${tags.length}, and there must be exactly one: ${projectTag(libPath)}`);
    } else if (tags[0] !== projectTag(libPath)) {
        report(libPath, `the tag «${tags[0]}» does not match the path, expected «${projectTag(libPath)}»`);
    }
}

function checkAliases(libs) {
    const paths = readJson('tsconfig.base.json').compilerOptions.paths;
    for (const libPath of libs) {
        const alias = importAlias(libPath);
        const target = `./${libPath}/src/index.ts`;
        if (!paths[alias]) {
            report(libPath, `tsconfig.base.json has no alias ${alias}`);
        } else if (paths[alias][0] !== target) {
            report(libPath, `the alias ${alias} points at ${paths[alias][0]}, not at ${target}`);
        }
    }
}

export { checkAliases, checkLib };
