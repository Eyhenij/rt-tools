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
    // The prefix is about component selectors, and the backend has no components. The word itself
    // belongs to the tree: everyone has their own, and one hard-coded here would go red on every lib
    // of the first tree that named its selectors otherwise. A tree that has not named a prefix does
    // not get this check.
    if (requirePrefix && LIB_PREFIX && project.prefix !== LIB_PREFIX) {
        report(libPath, `prefix «${project.prefix}» вместо обязательного «${LIB_PREFIX}»`);
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

export { checkAliases, checkLib };
