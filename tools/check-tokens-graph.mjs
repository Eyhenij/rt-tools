#!/usr/bin/env node
/**
 * Проверка графа токенов второго кита: у имени ровно три состояния — объявлено слоем оформления,
 * названо ручкой потребителя, мёртвая ссылка.
 *
 * Третьего состояния быть не должно, но именно оно и накопилось: тридцать три имени кит
 * употребляет, не объявляя ни в одном слое, и разделить их машине было нечем. Часть из них —
 * ручки: значение приходит от приложения, а до него работает запасное. Часть — промахи, которые
 * запасное значение делает невидимыми: правило работает, цвет неверен, и ошибка не отличается от
 * замысла. Ровно так отключённая кнопка осталась светло-серой на графите.
 *
 * Что проверка судит:
 *
 * 1. Мёртвая ссылка — имя не объявлено и не названо ручкой.
 * 2. Запасное значение у имени, которое кит объявляет сам, — оно скрывает промах и переживает
 *    смену темы: переопределять нечего.
 * 3. Объявление общего имени на корне страницы из стилей компонента. Имя своего блока
 *    (`--rt-<блок>-*`) проходит: это третий слой, он у компонента и должен быть.
 * 4. Новое имя, столкнувшееся с первым китом. Сегодняшние совпадения приняты списком: чинить их
 *    значит трогать выпущенный первый кит, выведенный за границу линии.
 * 5. Расхождение перечня ручек с его человеческой половиной в `Theming.mdx`: двух перечней об
 *    одном и том же без сверки не заводится.
 *
 * Накопленное лежит в списке принятого, отказом не считается и видно числом; падает проверка на
 * НОВОМ месте. Список только убывает: запись, которой больше ничего не отвечает, роняет прогон.
 *
 * Ненулевой код возврата и перечень расхождений.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { allowlistOf, baselineOf, parseAllowlist } from './rt-kit-checks.config.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Кит, чей граф судят, и кит, с чьими именами сверяют столкновения. */
const KIT = 'projects/ui-kit-v2/src';
const OTHER_KIT = 'projects/ui-kit/src';
const HANDLES_FILE = 'tools/tokens-handles.json';
const THEMING_DOC = 'projects/ui-kit-v2/docs/Theming.mdx';
const ALLOWLIST = allowlistOf('tokens-graph');

const DECLARATION_RE = /^[ \t]*(--rt-[a-z0-9-]+)[ \t]*:/gm;
const REFERENCE_RE = /var\(\s*(--rt-[a-z0-9-]+)\s*(,)?/g;
/** Имя блока в имени токена: `--rt-dialog-width` → `dialog`. */
const BLOCK_RE = /^--rt-([a-z0-9]+)-/;

function scssFiles(dir) {
    const files = [];
    for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
        if (entry.name === 'node_modules') {
            continue;
        }
        const path = `${dir}/${entry.name}`;
        if (entry.isDirectory()) {
            files.push(...scssFiles(path));
        } else if (entry.name.endsWith('.scss')) {
            files.push(path);
        }
    }
    return files;
}

const read = (path) => readFileSync(join(ROOT, path), 'utf8');
const namesIn = (text, regexp) => [...text.matchAll(regexp)].map((match) => match[1]);

const files = scssFiles(KIT);
const declared = new Set();
const references = [];

for (const path of files) {
    const text = read(path);
    namesIn(text, DECLARATION_RE).forEach((name) => declared.add(name));
    for (const match of text.matchAll(REFERENCE_RE)) {
        references.push({ name: match[1], path, hasFallback: Boolean(match[2]) });
    }
}

const handles = JSON.parse(read(HANDLES_FILE)).handles ?? {};
const handleNames = new Set(Object.keys(handles));

const findings = [];
const add = (key, text) => findings.push({ key, text });

/** 1. Мёртвая ссылка: не объявлено и не названо ручкой. */
for (const name of [...new Set(references.map((reference) => reference.name))].sort()) {
    if (declared.has(name) || handleNames.has(name)) {
        continue;
    }
    const where = [...new Set(references.filter((reference) => reference.name === name).map((reference) => reference.path))];
    add(`мёртвая ссылка ${name}`, `${name} — не объявлено ни одним слоем и не названо ручкой: ${where.join(', ')}`);
}

/** 2. Запасное значение у имени, которое кит объявляет сам. */
for (const reference of references) {
    if (reference.hasFallback && declared.has(reference.name)) {
        add(
            `запасное значение ${reference.name} @ ${reference.path}`,
            `${reference.name} в ${reference.path} — запасное значение стоит у токена, который кит объявляет сам: оно скрывает промах и переживает смену темы`
        );
    }
}

/**
 * 3. Объявление общего имени на корне страницы из стилей компонента. Разбор грубый — по тексту
 * правила от `:root` до закрывающей скобки, — и этого достаточно: вложенных правил внутри
 * такого блока в ките нет, а имя судится само по себе.
 */
for (const path of files.filter((file) => file.includes('/lib/'))) {
    const text = read(path);
    const block = path.split('/').pop().replace(/^_?rt-/, '').replace(/\.(component|directive)?\.?scss$/, '');
    for (const match of text.matchAll(/:root[^{]*\{([^}]*)\}/g)) {
        for (const name of namesIn(match[1], DECLARATION_RE)) {
            const owner = name.match(BLOCK_RE)?.[1];
            if (owner && block.startsWith(owner)) {
                continue;
            }
            add(
                `объявление на корне ${name} @ ${path}`,
                `${name} объявлено на корне страницы из стилей компонента ${path}: общее имя заводится слоем оформления, а не компонентом`
            );
        }
    }
}

/** 4. Имя, употребляемое обоими китами. */
if (existsSync(join(ROOT, OTHER_KIT))) {
    const otherNames = new Set(scssFiles(OTHER_KIT).flatMap((path) => [...read(path).matchAll(/(--rt-[a-z0-9-]+)/g)].map((m) => m[1])));
    for (const name of [...declared].filter((declaredName) => otherNames.has(declaredName)).sort()) {
        add(`общее имя с первым китом ${name}`, `${name} — имя употребляют оба кита; побеждает тот файл стилей, который подключён позже`);
    }
}

/** 5. Перечень ручек против его человеческой половины. */
const theming = existsSync(join(ROOT, THEMING_DOC)) ? read(THEMING_DOC) : '';
for (const name of [...handleNames].sort()) {
    if (!theming.includes(name)) {
        add(`ручка вне ${THEMING_DOC}: ${name}`, `${name} названо ручкой в ${HANDLES_FILE}, но в ${THEMING_DOC} о нём ни слова`);
    }
}
for (const name of namesIn(theming, /`(--rt-[a-z0-9-]+)`/g)) {
    if (theming.includes('## Ручки потребителя') && !handleNames.has(name) && !declared.has(name)) {
        add(`имя вне перечня ручек: ${name}`, `${name} названо в ${THEMING_DOC}, но ни объявлено китом, ни перечислено в ${HANDLES_FILE}`);
    }
}

if (process.argv.includes('--baseline')) {
    console.log(baselineOf([...new Set(findings.map((finding) => finding.key))].sort(), parseAllowlist('tokens-graph')));
    process.exit(0);
}

const known = parseAllowlist('tokens-graph').keys;
const seen = new Set(findings.map((finding) => finding.key));

const problems = [
    ...findings.filter((finding) => !known.has(finding.key)).map((finding) => finding.text),
    ...[...known]
        .filter((key) => !seen.has(key))
        .map((key) => `${key}: значится в ${ALLOWLIST}, но в стилях этого больше нет — строку убрать`),
];

if (problems.length > 0) {
    console.error(`check-tokens-graph: расхождений ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    process.exit(1);
}

console.log(
    `check-tokens-graph: объявлено ${declared.size}, ручек ${handleNames.size}, принято списком ${seen.size} — новых расхождений нет`
);
