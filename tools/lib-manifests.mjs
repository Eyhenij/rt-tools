// rt-kit v0.12.0 · checks/lib-manifests.mjs · 8523c7ccb6ba · правится надстройкой, не здесь
/**
 * Сама либа: обязательные файлы, имя проекта, приставка селекторов, тег и алиас импорта —
 * всё, чем `project.json` и `tsconfig.base.json` обязаны совпадать с путём либы на диске.
 *
 * Имя не начинается с `check-`: перебором таких имён умолчание пакета собирает набор гейта
 * пуша, и помощник с ним гейт стал бы гонять как отдельную проверку.
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
    // Приставка — про селекторы компонентов, а у бэкенда компонентов нет. Само слово принадлежит
    // дереву: у каждого оно своё, и зашитое здесь краснело бы на всех либах первого же дерева,
    // назвавшего свои селекторы иначе. Дерево, не назвавшее приставки, этой проверки не получает.
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
