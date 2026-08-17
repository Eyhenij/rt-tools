// rt-kit v0.8.3 · checks/lib-boundaries.mjs · 7345e62ab2ab · правится надстройкой, не здесь
/**
 * Границы и теги: где либа описана как источник, чей список зависимостей обязан оставаться
 * пустым и что видно основанию семейства. Все три предмета читают одни и те же файлы
 * `eslint/boundaries/domains/`, и врозь их не разложить.
 *
 * Имя не начинается с `check-`: перебором таких имён умолчание пакета собирает набор гейта
 * пуша, и помощник с ним гейт стал бы гонять как отдельную проверку.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { BOUNDARIES_DIR, FAMILIES, isDir, projectTag, report } from './lib-common.mjs';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

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
 *
 * Теги называет дерево: имя тега — его собственное слово, и зашитое здесь требовало бы описания
 * границ под либу, которой в дереве нет вовсе. Пусто — таких либ дерево не держит.
 */
const NO_DEPENDENCY_TAGS = CONFIG.noDependencyTags;

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
    // Свод границ есть не у всякого дерева с доменной сеткой: он собирается отдельным файлом, и
    // пока его отсутствие не обрабатывалось, проверка падала на импорте — то есть отвечала
    // поломкой на дерево, где границы объявлены иначе.
    const boundaries = join(ROOT, 'eslint/boundaries/index.mjs');
    if (!existsSync(boundaries)) {
        console.log('пропущено: свода границ eslint/boundaries/index.mjs в дереве нет');

        return;
    }
    const { allBoundaries } = await import(boundaries);

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

export { checkBoundaries, checkCoreLibs, checkNoDependencyLibs };
