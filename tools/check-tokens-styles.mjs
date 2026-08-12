#!/usr/bin/env node
/**
 * Проверка того, что оформление в стилях второго кита берётся токеном, а не значением на месте.
 *
 * Правило `rt-tools/no-hardcoded-design-tokens` и запрет кода цвета написаны давно, но навешаны
 * были только на первый кит. Второй рос без них, и к моменту заведения этой проверки в его
 * стилях накопилось больше двух сотен пиксельных литералов и четыре десятка кодов цвета. Течь
 * при этом продолжала течь: каждый новый компонент добавлял к счёту, и заметить это было нечем.
 *
 * Порядок выбран обратный привычному: сначала гейт, потом уборка. Иначе течь закрывается тогда
 * же, когда закончится уборка, то есть неизвестно когда. Накопленное лежит в списке принятого,
 * отказом не считается и видно числом в сводке; падает проверка на НОВОМ месте.
 *
 * Своего списка принятого у stylelint нет, а `lint:styles` идёт с `--max-warnings 0` — поэтому
 * правила навешаны своим конфигом (`tools/stylelint-tokens.config.mjs`), а не общим, и зовётся
 * stylelint отсюда программно.
 *
 * Ключ записи — файл, свойство и значение, без номера строки: строка едет от любого
 * переформатирования, и список краснел бы на правках, которых не было.
 *
 * Ненулевой код возврата и перечень расхождений.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import stylelint from 'stylelint';

import { allowlistOf, readAllowlist } from './rt-kit-checks.config.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Набор, который судит проверка. Назван договорённостью и повторён в конфиге рядом. */
const FILES = 'projects/ui-kit-v2/src/lib/**/*.scss';
const CONFIG_FILE = join(ROOT, 'tools/stylelint-tokens.config.mjs');
const ALLOWLIST = allowlistOf('tokens-styles');

/**
 * Ключ находки: файл, свойство и значение. Номер строки в него не входит намеренно — см. шапку.
 * Свойство и значение достаются из текста сообщения правила: оно начинается кавычкой со
 * значением, а имя свойства называет после слова `in`. Сообщение без такой формы (запрет кода
 * цвета от `color-no-hex`) ключуется самим текстом.
 */
function keyOf(file, warning) {
    const relative = file.startsWith(ROOT) ? file.slice(ROOT.length + 1) : file;
    const value = warning.text.match(/"([^"]+)"/)?.[1];
    const property = warning.text.match(/ in ([a-z-]+) /)?.[1];

    if (value && property) {
        return `${relative} · ${property} · ${value}`;
    }
    if (value) {
        return `${relative} · ${value}`;
    }

    return `${relative} · ${warning.rule}`;
}

/**
 * `cwd` и `configBasedir` задаются корнем дерева намеренно: пути в `overrides.files` stylelint
 * считает от базовой директории конфига, а конфиг лежит в `tools/`. Без этого набор не совпадает
 * ни с одним файлом, проверка находит ноль мест и выглядит зелёной — то есть врёт молча.
 */
const { results } = await stylelint.lint({
    files: join(ROOT, FILES),
    configFile: CONFIG_FILE,
    configBasedir: ROOT,
    cwd: ROOT,
});

const findings = [];
const broken = [];

for (const result of results) {
    if (result.errored && result.parseErrors?.length) {
        broken.push(`${result.source}: файл не разобран — ${result.parseErrors.map((error) => error.text).join('; ')}`);
    }
    for (const warning of result.warnings) {
        findings.push({ key: keyOf(result.source, warning), text: `${keyOf(result.source, warning)} — ${warning.text}` });
    }
}

if (process.argv.includes('--baseline')) {
    const accepted = [...new Set(findings.map((finding) => finding.key))].sort();
    console.log(JSON.stringify({ accepted }, null, 4));
    process.exit(0);
}

const allowlist = readAllowlist('tokens-styles');
const known = new Set(allowlist.accepted ?? []);
const seen = new Set(findings.map((finding) => finding.key));

const fresh = findings.filter((finding) => !known.has(finding.key));
const stale = [...known].filter((key) => !seen.has(key));

const problems = [
    ...broken,
    ...fresh.map((finding) => finding.text),
    ...stale.map((key) => `${key}: значится в ${ALLOWLIST}, но в стилях этого больше нет — строку убрать`),
];

if (problems.length > 0) {
    console.error(`check-tokens-styles: расхождений ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    process.exit(1);
}

console.log(`check-tokens-styles: литералов в наборе ${seen.size}, все приняты списком — новых нет`);
