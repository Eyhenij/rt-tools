#!/usr/bin/env node
/**
 * Проверка слоя каскада второго кита: правило кита объявлено в слое, а не в общем каскаде.
 *
 * Слой заводится ради одного обещания — правило приложения выигрывает у правила кита без счёта
 * специфичности. Держится оно ровно до первого файла стилей, который приехал мимо слоя: такой
 * файл продолжает работать, ничего не роняет и виден только глазами у потребителя, которому
 * перебить его снова нечем, кроме обхода чужой вёрстки. Восемьдесят семь файлов обёрнуты разом,
 * и без проверки восемьдесят восьмой приедет так же молча.
 *
 * Что проверка судит:
 *
 * 1. Файл стилей компонента без объявления подслоя `rt-kit.components`.
 * 2. Второе объявление слоя в том же файле — обёртка одна на файл, иначе часть правил остаётся
 *    снаружи, а выглядит файл обёрнутым.
 * 3. Правило, стоящее в файле до обёртки. Снаружи законны только объявления `@use`, `@forward` и
 *    `@import`: sass требует их в начале файла и роняет сборку на обёрнутом.
 * 4. Порядок подслоёв, объявленный слоем оформления. Подслой, не названный заранее, встаёт в
 *    каскад по первому появлению, а появляются они в порядке загрузки — стили компонента Angular
 *    инжектит отдельным блоком, и он способен опередить основу.
 * 5. Объявление свойств на корне страницы, уехавшее в слой оформления внутрь блока `@layer`:
 *     перекраска бренда потребителем держится порядком, а не слоем.
 *
 * Накопленное лежит в списке принятого, отказом не считается и видно числом; падает проверка на
 * НОВОМ месте. Список только убывает: запись, которой больше ничего не отвечает, роняет прогон.
 *
 * Ненулевой код возврата и перечень расхождений.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { ROOT, allowlistOf, readAllowlist } from './rt-kit-checks.config.mjs';

/** Набор стилей компонентов и слой оформления, объявляющий порядок подслоёв. */
const COMPONENTS = 'projects/ui-kit-v2/src/lib';
const STYLES = 'projects/ui-kit-v2/src/styles';
const LAYERS_FILE = join(STYLES, '_layers.scss');
const ALLOWLIST = allowlistOf('cascade-layer');

/** Обёртка стилей компонента и объявление порядка подслоёв. */
const COMPONENT_LAYER = '@layer rt-kit.components {';
const LAYER_ORDER = /@layer\s+rt-kit\.vendor\s*,\s*rt-kit\.base\s*,\s*rt-kit\.components\s*;/;

/** Снаружи обёртки законны только объявления sass: он требует их в начале файла. */
const OUTSIDE_OK = /^@(use|forward|import)\b/;

const findings = [];
const add = (key, text) => findings.push({ key, text });

const scssIn = (dir) => {
    const out = [];
    for (const entry of readdirSync(resolve(ROOT, dir), { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) out.push(...scssIn(path));
        else if (entry.name.endsWith('.scss')) out.push(path);
    }
    return out;
};

const files = scssIn(COMPONENTS).sort();

for (const file of files) {
    const text = readFileSync(resolve(ROOT, file), 'utf8');
    const count = text.split(COMPONENT_LAYER).length - 1;

    if (count === 0) {
        add(`${file}: без слоя`, `${file}: правила стоят вне слоя — обернуть в «${COMPONENT_LAYER} … }»`);
        continue;
    }

    if (count > 1) {
        add(
            `${file}: обёрток ${count}`,
            `${file}: обёрток слоя ${count}, а нужна одна: часть правил остаётся снаружи, а файл выглядит обёрнутым`
        );
    }

    // Комментарий судится состоянием, а не началом строки: у блочного продолжение бывает и без
    // ведущей звёздочки, и такая строка читалась бы как правило вне слоя.
    const before = text.slice(0, text.indexOf(COMPONENT_LAYER)).split('\n');
    const stray = [];
    let inComment = false;

    for (const line of before) {
        const bare = line.trim();
        if (inComment) {
            if (bare.includes('*/')) inComment = false;
            continue;
        }
        if (bare === '' || bare.startsWith('//')) continue;
        if (bare.startsWith('/*')) {
            if (!bare.includes('*/')) inComment = true;
            continue;
        }
        if (!OUTSIDE_OK.test(bare)) stray.push(bare);
    }

    if (stray.length > 0) {
        add(
            `${file}: правило до обёртки`,
            `${file}: до обёртки стоит «${stray[0].slice(0, 60)}» — снаружи законны только @use, @forward и @import`
        );
    }
}

const layers = readFileSync(resolve(ROOT, LAYERS_FILE), 'utf8');

if (!LAYER_ORDER.test(layers)) {
    add(
        `${LAYERS_FILE}: порядок подслоёв`,
        `${LAYERS_FILE}: порядок подслоёв не объявлен строкой «@layer rt-kit.vendor, rt-kit.base, rt-kit.components;» — не названный заранее подслой встаёт в каскад по первому появлению`
    );
}

for (const file of scssIn(STYLES).sort()) {
    if (relative(ROOT, resolve(ROOT, file)) === relative(ROOT, resolve(ROOT, LAYERS_FILE))) continue;

    const text = readFileSync(resolve(ROOT, file), 'utf8');
    let depth = 0;

    for (const line of text.split('\n')) {
        if (/^\s*@layer\s+rt-kit\.\w+\s*\{/.test(line)) {
            depth = 1;
            continue;
        }
        if (depth > 0) {
            if (/^\s*:root[\s,{]/.test(line)) {
                add(
                    `${file}: :root в слое`,
                    `${file}: объявление на корне страницы уехало внутрь слоя — потребитель перебивает его порядком, и слой отнимает у него эту возможность`
                );
                break;
            }
            depth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
            if (depth <= 0) depth = 0;
        }
    }
}

if (process.argv.includes('--baseline')) {
    console.log(JSON.stringify({ accepted: [...new Set(findings.map((finding) => finding.key))].sort() }, null, 4));
    process.exit(0);
}

const known = new Set(readAllowlist('cascade-layer').accepted ?? []);
const seen = new Set(findings.map((finding) => finding.key));

const problems = [
    ...findings.filter((finding) => !known.has(finding.key)).map((finding) => finding.text),
    ...[...known]
        .filter((key) => !seen.has(key))
        .map((key) => `${key}: значится в ${ALLOWLIST}, но в стилях этого больше нет — строку убрать`),
];

if (problems.length > 0) {
    console.error(`check-cascade-layer: расхождений ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    process.exit(1);
}

console.log(
    `check-cascade-layer: файлов стилей ${files.length}, все в подслое rt-kit.components; порядок подслоёв объявлен, принято списком ${seen.size}`
);
