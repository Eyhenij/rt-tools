#!/usr/bin/env node
// rt-kit v0.9.1 · checks/check-lib-layers.mjs · 296e4efcbc3d · правится надстройкой, не здесь
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
 * Каждый предмет сверки живёт своим модулем рядом: доменная сетка и состав слоёв —
 * `lib-domains.mjs`, файлы либы вместе с её именем, тегом и алиасом — `lib-manifests.mjs`,
 * границы и списки зависимостей — `lib-boundaries.mjs`, барели и реэкспорты —
 * `lib-reexports.mjs`, общее чтение дерева — `lib-common.mjs`. Здесь остаётся прогон: он
 * собирает либы, зовёт по ним каждый предмет и складывает найденное в один перечень.
 *
 * Исключения перечислены в tools/lib-layers-allowlist.json.
 * Ненулевой код возврата и перечень расхождений.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { checkBoundaries, checkCoreLibs, checkNoDependencyLibs } from './lib-boundaries.mjs';
import { LIB_ROOTS, isDir, problems, report } from './lib-common.mjs';
import { collectAllDomainLibs, collectApiDomainLibs, collectFlatLibs, collectStrayLibs } from './lib-domains.mjs';
import { checkAliases, checkLib } from './lib-manifests.mjs';
import { checkReexports } from './lib-reexports.mjs';
import { ROOT, allowlistOf, skipUnless } from './rt-kit-checks.config.mjs';

// Дерево без доменной сетки проверять нечем: раскладка либ есть не у всякого, кто берёт пакет.
// Пока пропуска не было, первая же установка получала отказ «нет tsconfig.base.json» — то есть
// поломку вместо ответа «этой раскладки здесь нет».
skipUnless(
    LIB_ROOTS.some((root) => isDir(root)) && existsSync(join(ROOT, 'tsconfig.base.json')),
    `раскладки либ ${LIB_ROOTS.join(', ')} или файла tsconfig.base.json`
);

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
