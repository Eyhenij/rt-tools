#!/usr/bin/env node
/**
 * Проверка того, что класс элемента BEM подкреплён правилом.
 *
 * Класс без правила заводится молча: раскладка переезжает из файла экрана в
 * общий слой, а `rtElem` остаётся в шаблоне и больше ничему не соответствует.
 * Ни линт, ни сборка, ни браузер этого не показывают — лишний класс просто
 * ничего не делает, и разметка обрастает именами, за которыми ничего нет.
 *
 * Совпадение считается по имени элемента, а не по паре «блок — элемент»:
 * `rtElem` берёт имя блока у ближайшего предка с `rtBlock`, и повторить этот
 * разбор по тексту шаблона нечем. Из-за этого проверка пропускает класс, у
 * которого правило есть, но у чужого блока, — направление выбрано в сторону
 * ложных пропусков, а не ложных отказов.
 *
 * Динамическое `[rtElem]` не считается: имя там известно только в рантайме.
 *
 * Накопленное к моменту заведения проверки лежит в tools/styles-allowlist.json
 * и отказом не считается: гейт падает на НОВОМ классе без правила, а старое
 * остаётся видимым числом в сводке.
 *
 * Ненулевой код возврата и перечень расхождений.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { allowlistOf, CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const ALLOWLIST = allowlistOf('styles');
const SOURCE_ROOTS = CONFIG.sourceRoots;
const SKIPPED_DIRS = CONFIG.skippedDirs;

const ELEM_RE = /rtElem="([a-z0-9-]+)"/g;
/** Объявление элемента: и вложенное `&__item`, и полное `.<блок>__item` */
const RULE_RE = /__([a-z0-9-]+)/g;

const allowlist = JSON.parse(readFileSync(join(ROOT, ALLOWLIST), 'utf8'));
const known = new Set([...(allowlist.accepted ?? []), ...(allowlist.debt ?? [])]);
const debt = new Set(allowlist.debt ?? []);

function collectFiles(dir, extension) {
    const files = [];
    for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
        if (SKIPPED_DIRS.includes(entry.name)) {
            continue;
        }
        const path = `${dir}/${entry.name}`;
        if (entry.isDirectory()) {
            files.push(...collectFiles(path, extension));
        } else if (entry.name.endsWith(extension)) {
            files.push(path);
        }
    }
    return files;
}

const declared = new Set();
const usedIn = new Map();

for (const root of SOURCE_ROOTS) {
    for (const path of collectFiles(root, '.scss')) {
        for (const match of readFileSync(join(ROOT, path), 'utf8').matchAll(RULE_RE)) {
            declared.add(match[1]);
        }
    }

    for (const path of collectFiles(root, '.html')) {
        for (const match of readFileSync(join(ROOT, path), 'utf8').matchAll(ELEM_RE)) {
            const name = match[1];
            if (!usedIn.has(name)) {
                usedIn.set(name, new Set());
            }
            usedIn.get(name).add(path);
        }
    }
}

const findings = [];

for (const [name, files] of [...usedIn].sort(([first], [second]) => first.localeCompare(second))) {
    if (declared.has(name)) {
        continue;
    }
    const where = [...files].sort().join(', ');
    findings.push({ key: `elem ${name} @ ${where}`, text: `rtElem="${name}" — правила нет ни в одном файле стилей: ${where}` });
}

const fresh = findings.filter((finding) => !known.has(finding.key));
const staleKeys = [...known].filter((key) => !findings.some((finding) => finding.key === key));

if (process.argv.includes('--baseline')) {
    console.log(JSON.stringify({ ...allowlist, debt: findings.map((finding) => finding.key).sort() }, null, 4));
    process.exit(0);
}

const problems = [
    ...fresh.map((finding) => finding.text),
    ...staleKeys.map((key) => `${key}: значится в ${ALLOWLIST}, но класс уже подкреплён правилом — строку убрать`),
];

if (problems.length > 0) {
    console.error(`check-styles: расхождений ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    process.exit(1);
}

console.log(
    `check-styles: классов без правила ${findings.length}, из них принято ${findings.length - debt.size}, долг ${debt.size} — новых нет`
);
