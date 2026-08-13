#!/usr/bin/env node
// Собирает слой оформления второго кита из источника: три файла стилей и типы имён.
//
// Источник — projects/ui-kit-v2/src/styles/tokens.source.mjs. Собранное правится только здесь:
// правка в собранном файле теряется на следующей сборке, и её ловит tools/check-tokens-build.mjs.
//
// Ссылка на имя, которого источник не объявляет и которое не названо ручкой потребителя в
// tools/tokens-handles.json, роняет сборку — ни один файл при этом не переписывается.
//
// Вызов:
//   node tools/build-tokens-v2.mjs            пишет собранное на диск
//   node tools/build-tokens-v2.mjs --check    ничего не пишет, отвечает кодом возврата

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const stylesDir = resolve(root, 'projects/ui-kit-v2/src/styles');
const typesFile = resolve(root, 'projects/ui-kit-v2/src/lib/tokens/rt-design-tokens.ts');

const source = await import(`file://${stylesDir}/tokens.source.mjs`);
const { scale, light, darkLayout, coarsePointer } = source;

const BANNER = `/* Собрано генератором \`tools/build-tokens-v2.mjs\` из \`tokens.source.mjs\` — правится там, не здесь:
   правка на месте теряется на следующей сборке, и её называет \`pnpm run check:tokens-build\`. */`;

const PREAMBLE = {
    primitives: `/* Ступени шкал — значения, из которых слой назначений выбирает. Единственное место кита, где
   код цвета и размер числом законны по определению. */`,
    semantic: `/* Назначения светлой темы.

   Тело вынесено в @mixin по той же причине, что и у тёмной темы: набор нужен не
   только на \`:root\`, но и на отдельном контейнере. Без этого светлую половину
   пары «светлая ↔ тёмная» нельзя показать, пока приложение стоит в тёмной теме, —
   контейнер унаследует тёмные значения, и обе половины покажут одно и то же. */`,
    dark: `/* Тёмная тема — переопределение назначений; ступени шкалы неизменны.

   Тело вынесено в @mixin, чтобы тот же набор переопределений можно было
   применить не только на html-уровне (тема приложения), но и к локальному
   контейнеру (side-by-side light/dark в Storybook) — без дублирования значений.

   База (\`rt-theme-dark-tokens\`) — тёплый графит для приложений и всех
   CDK-overlay'ев (асайды/диалоги/меню рендерятся на уровне body, вне
   host-классов шеллов — поэтому графит держим на :root, иначе overlay'и
   не наследовали бы палитру).

   Значения ответов живут в источнике рядом со своим светлым назначением: забытая половина
   пары видна там же, а не вылавливается сверкой двух файлов. */`,
};

const COARSE_NOTE = `/* На тач-устройствах инпут не меньше 16px: WebKit (весь iOS, включая Chrome)
   зумит страницу при фокусе на поле с font-size < 16px — отсюда горизонтальный
   сдвиг вёрстки. Десктоп сохраняет плотный 14px. */`;

const errors = [];
function fail(message) {
    errors.push(message);
}

/** Объявление и его записки в том виде, в каком они уедут в собранный файл. */
function renderNodes(nodes) {
    const out = [];
    for (const node of nodes) {
        if (node.space && out.length > 0) out.push('');
        if (node.lead) out.push(node.lead);
        if (node.tailComment) {
            out.push(node.tailComment);
            continue;
        }
        if (!node.name) continue;
        // Длинное составное значение переносится под своё имя: так его ставит форматтер, и
        // собранное совпадает с ним без второй правки.
        const value = node.value.includes('\n') ? `\n        ${node.value}` : ` ${node.value}`;
        out.push(`    ${node.name}:${value};${node.note ? ` /* ${node.note} */` : ''}`);
    }
    return out.join('\n');
}

const lightByName = new Map(light.filter((n) => n.name).map((n) => [n.name, n]));

// Тёмная раскладка называет имена; значения приходят из источника, от светлого назначения.
const darkNodes = darkLayout.map((node) => {
    if (!node.name) return node;
    const owner = lightByName.get(node.name);
    if (owner) {
        if (owner.dark === undefined) {
            fail(`тёмная раскладка называет '${node.name}', а ответа тёмной темы у него нет`);
        }
        return { ...node, value: owner.dark, note: node.note ?? owner.darkNote };
    }
    if (node.value === undefined) {
        fail(`'${node.name}' стоит в тёмной раскладке, но значения нет ни там, ни в светлых назначениях`);
    }
    return node;
});

// Каждое имя, объявленное источником, и каждая ручка потребителя.
const declared = new Set([...scale, ...light, ...darkLayout].filter((n) => n.name).map((n) => n.name));
const handles = new Set(Object.keys(JSON.parse(readFileSync(resolve(root, 'tools/tokens-handles.json'), 'utf8')).handles ?? {}));

// Ссылка в никуда роняет сборку: имя, к которому обратились с опечаткой, иначе просто не
// применяется, и увидеть это можно только на витрине и только если посмотреть.
for (const node of [...scale, ...light, ...darkLayout]) {
    if (!node.name) continue;
    for (const value of [node.value, node.dark]) {
        if (typeof value !== 'string') continue;
        for (const match of value.matchAll(/var\(\s*(--rt-[a-z0-9-]+)/g)) {
            const ref = match[1];
            if (!declared.has(ref) && !handles.has(ref)) {
                fail(`'${node.name}' ссылается на '${ref}', которого источник не объявляет и который не назван ручкой потребителя`);
            }
        }
    }
}

// Тёмный ответ без своего имени в раскладке в собранный файл не попадёт вовсе.
const darkNames = new Set(darkLayout.filter((n) => n.name).map((n) => n.name));
for (const node of light) {
    if (node.name && node.dark !== undefined && !darkNames.has(node.name)) {
        fail(`у '${node.name}' есть ответ тёмной темы, но тёмная раскладка его не называет`);
    }
}

if (errors.length > 0) {
    console.error(`build-tokens-v2: отказов ${errors.length}, собранное не переписано\n`);
    for (const message of errors) console.error(`  ${message}`);
    process.exit(1);
}

const files = {
    [`${stylesDir}/_primitives.scss`]: `${BANNER}\n\n${PREAMBLE.primitives}\n\n:root {\n${renderNodes(scale)}\n}\n`,

    [`${stylesDir}/_semantic.scss`]:
        `${BANNER}\n\n${PREAMBLE.semantic}\n\n@mixin rt-theme-light-tokens {\n${renderNodes(light)}\n}\n\n` +
        `:root {\n    @include rt-theme-light-tokens;\n}\n\n${COARSE_NOTE}\n@media (pointer: coarse) {\n    :root {\n` +
        coarsePointer.map((token) => `        ${token.name}: ${token.value};`).join('\n') +
        `\n    }\n}\n`,

    [`${stylesDir}/_theme-dark.scss`]:
        `${BANNER}\n\n${PREAMBLE.dark}\n\n@mixin rt-theme-dark-tokens {\n${renderNodes(darkNodes)}\n}\n\n` +
        `:root[data-theme='dark'],\nhtml.rt-theme-dark {\n    @include rt-theme-dark-tokens;\n}\n`,

    [typesFile]: renderTypes(),
};

function renderTypes() {
    const names = [...scale, ...light, ...darkLayout].filter((n) => n.name).map((n) => n.name);
    const unique = [...new Set(names)].sort();
    const handleNames = [...handles].sort();
    return (
        `/* Собрано генератором \`tools/build-tokens-v2.mjs\` из \`tokens.source.mjs\` — правится там, не здесь. */\n\n` +
        `/** Имя свойства оформления, которое кит объявляет сам. */\n` +
        `export type RtDesignTokenName =\n` +
        unique.map((name) => `    | '${name}'`).join('\n') +
        `;\n\n` +
        `/** Имя ручки потребителя — свойства, которое кит намеренно не объявляет. */\n` +
        `export type RtConsumerHandleName =\n` +
        handleNames.map((name) => `    | '${name}'`).join('\n') +
        `;\n\n` +
        `/** Все свойства оформления, объявленные китом. */\n` +
        `export const RT_DESIGN_TOKEN_NAMES: readonly RtDesignTokenName[] = [\n` +
        unique.map((name) => `    '${name}',`).join('\n') +
        `\n];\n\n` +
        `/** Все ручки потребителя: значение приходит от приложения, до него работает запасное. */\n` +
        `export const RT_CONSUMER_HANDLE_NAMES: readonly RtConsumerHandleName[] = [\n` +
        handleNames.map((name) => `    '${name}',`).join('\n') +
        `\n];\n`
    );
}

const check = process.argv.includes('--check');
const stale = [];
for (const [path, content] of Object.entries(files)) {
    let onDisk = null;
    try {
        onDisk = readFileSync(path, 'utf8');
    } catch {
        onDisk = null;
    }
    if (onDisk === content) continue;
    if (check) {
        stale.push(path.replace(`${root}/`, ''));
    } else {
        writeFileSync(path, content);
    }
}

if (check) {
    if (stale.length > 0) {
        console.error(`check:tokens-build: собранное разошлось с источником — файлов ${stale.length}\n`);
        for (const path of stale) console.error(`  ${path}`);
        console.error(`\nСобранное правится не руками: правь projects/ui-kit-v2/src/styles/tokens.source.mjs`);
        console.error(`и пересобирай командой \`pnpm run build:tokens-source\`.`);
        process.exit(1);
    }
    console.log(`check:tokens-build: собранное совпадает с источником — файлов ${Object.keys(files).length}`);
} else {
    console.log(`build-tokens-v2: собрано файлов ${Object.keys(files).length}`);
}
