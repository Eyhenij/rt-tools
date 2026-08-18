#!/usr/bin/env node
// rt-kit v0.9.0 · checks/check-styles.mjs · 8abf6b3f572f · правится надстройкой, не здесь
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
 * Объявлением считается и то, что приехало подключённым пакетом: экран,
 * собранный из готового, своих объявлений не держит вовсе. Читается ровно тот
 * файл, который приложение назвало само, — обход односложный, и каталог
 * зависимостей в корни исходников не попадает.
 *
 * Динамическое `[rtElem]` не считается: имя там известно только в рантайме.
 *
 * Накопленное к моменту заведения проверки лежит в tools/styles-allowlist.json
 * и отказом не считается: гейт падает на НОВОМ классе без правила, а старое
 * остаётся видимым числом в сводке. Строка списка опознаётся по имени класса:
 * перечень файлов при нём меняется от каждой правки разметки, и сверенный
 * целиком он делал бы прежнюю строку лишней, а тот же самый долг — новым
 * расхождением.
 *
 * Ненулевой код возврата и перечень расхождений.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, join } from 'node:path';

import { allowlistOf, CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const ALLOWLIST = allowlistOf('styles');
const SOURCE_ROOTS = CONFIG.sourceRoots;
const SKIPPED_DIRS = CONFIG.skippedDirs;

const ELEM_RE = /rtElem="([a-z0-9-]+)"/g;
/** Объявление элемента: и вложенное `&__item`, и полное `.<блок>__item` */
const RULE_RE = /__([a-z0-9-]+)/g;
/** Голова вложенности: строка, с которой начинается блок элемента */
const HEAD_RE = /^&__([a-z0-9-]+)/;
/** Колено вложенности: `&-<хвост>` внутри блока элемента дописывает имя, а не заводит своё */
const TAIL_RE = /^&-([a-z0-9-]+)/;
/** Подключение в файле стилей: `@use` и `@forward` берутся одним разбором */
const USE_RE = /@(?:use|forward)\s+['"]([^'"]+)['"]/g;
/** Строка списка известного: имя класса и перечень файлов при нём */
const KEY_RE = /^elem (\S+) @ (.*)$/;

const allowlist = JSON.parse(readFileSync(join(ROOT, ALLOWLIST), 'utf8'));
const known = new Set([...(allowlist.accepted ?? []), ...(allowlist.debt ?? [])]);
const debt = new Set(allowlist.debt ?? []);

/** Строки списка по имени класса: перечень файлов в ключ входит, но сверяется отдельно */
const knownByName = new Map();
for (const key of known) {
    const parsed = KEY_RE.exec(key);
    if (parsed) {
        knownByName.set(parsed[1], { key, files: new Set(parsed[2].split(', ').filter(Boolean)) });
    }
}

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

/**
 * Имя пакета и путь внутри него. Относительный и абсолютный спецификаторы пакетом не бывают;
 * приставки `pkg:` и `~` снимаются — ими зовут тот же пакет разные сборщики.
 */
function packageOf(specifier) {
    const clean = specifier.replace(/^pkg:/, '').replace(/^~/, '');
    if (clean === '' || clean.startsWith('.') || clean.startsWith('/')) {
        return null;
    }
    const parts = clean.split('/');
    const name = clean.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
    if (clean.startsWith('@') && parts.length < 2) {
        return null;
    }

    return { name, rest: clean.slice(name.length).replace(/^\//, '') };
}

/**
 * Файл пакета, названный подключением. Каталог ищется разрешением модуля от того места, где
 * подключение написано: пакет подпроекта в корне дерева не лежит вовсе, а менеджер вправе
 * держать рядом несколько версий сразу. Не нашлось — `null`: дерево без этого пакета получает
 * сверку своих объявлений, а не отказ чтения.
 */
function fileOfPackage(from, { name, rest }) {
    let manifest;
    try {
        manifest = createRequire(join(ROOT, from, 'package.json')).resolve(`${name}/package.json`);
    } catch {
        return null;
    }

    const base = dirname(manifest);
    const tail = rest === '' ? 'index' : rest;
    const candidates = [
        join(base, tail),
        join(base, `${tail}.scss`),
        join(base, dirname(tail), `_${basename(tail)}.scss`),
        join(base, tail, '_index.scss'),
        join(base, tail, 'index.scss'),
    ];

    return candidates.find((path) => existsSync(path) && statSync(path).isFile()) ?? null;
}

/**
 * Имена элементов, объявленных файлом стилей. Имя собирается из вложенности: `&__head { &-icon }`
 * объявляет `head-icon`, и колен у него бывает сколько угодно. Читая только то, что стоит после
 * `__` целиком, проверка числила долгом исправную вёрстку — правило работает, класс красит, а
 * снять его значило бы сломать экран.
 *
 * Хвост без головы именем не становится: `&-<хвост>`, стоящий вне блока элемента, принадлежит
 * чужому селектору, и приписать его было бы выдумыванием объявления.
 */
function elementNames(text) {
    const names = new Set();
    const stack = [];
    for (const raw of text.split('\n')) {
        const line = raw.trim();
        const parent = stack.length ? stack[stack.length - 1] : '';
        const head = HEAD_RE.exec(line);
        const tail = TAIL_RE.exec(line);
        let current = parent;

        if (head) {
            current = head[1];
        } else if (tail && parent) {
            current = `${parent}-${tail[1]}`;
            names.add(current);
        }

        for (const match of line.matchAll(RULE_RE)) {
            names.add(match[1]);
        }

        for (let index = 0; index < (line.match(/{/g) ?? []).length; index += 1) {
            stack.push(current);
        }
        for (let index = 0; index < (line.match(/}/g) ?? []).length && stack.length; index += 1) {
            stack.pop();
        }
    }

    return names;
}

/**
 * Объявления из пакетов, подключённых самим приложением. Читается ровно названный файл:
 * подключения внутри него не разбираются — объявленным считается то, что приложение назвало.
 */
function declarationsFromPackages(styleFiles) {
    const names = new Set();
    for (const path of styleFiles) {
        for (const [, specifier] of readFileSync(join(ROOT, path), 'utf8').matchAll(USE_RE)) {
            const parsed = packageOf(specifier);
            const file = parsed && fileOfPackage(dirname(path), parsed);
            if (!file) {
                continue;
            }
            elementNames(readFileSync(file, 'utf8')).forEach((name) => names.add(name));
        }
    }

    return names;
}

const declared = new Set();
const usedIn = new Map();

for (const root of SOURCE_ROOTS) {
    const styleFiles = collectFiles(root, '.scss');
    for (const path of styleFiles) {
        elementNames(readFileSync(join(ROOT, path), 'utf8')).forEach((name) => declared.add(name));
    }
    declarationsFromPackages(styleFiles).forEach((name) => declared.add(name));

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
    findings.push({
        name,
        files: new Set(files),
        key: `elem ${name} @ ${where}`,
        text: `rtElem="${name}" — правила нет ни в одном файле стилей: ${where}`,
    });
}

if (process.argv.includes('--baseline')) {
    console.log(JSON.stringify({ ...allowlist, debt: findings.map((finding) => finding.key).sort() }, null, 4));
    process.exit(0);
}

/**
 * Чем перечень файлов у находки разошёлся со строкой списка: что добавилось и что ушло. Рост —
 * расхождение, сокращение — починка; одинаково их читать нельзя, а сверять ключ целиком значило
 * бы объявлять тот же долг новым.
 */
function changedFiles(finding, line) {
    return {
        added: [...finding.files].filter((path) => !line.files.has(path)).sort(),
        gone: [...line.files].filter((path) => !finding.files.has(path)).sort(),
    };
}

const problems = [];
const notes = [];
const matchedKeys = new Set();

for (const finding of findings) {
    const line = knownByName.get(finding.name);
    if (!line) {
        problems.push(finding.text);
        continue;
    }
    matchedKeys.add(line.key);

    const { added, gone } = changedFiles(finding, line);
    if (added.length > 0) {
        problems.push(`elem ${finding.name}: долг разросся — класс появился ещё в ${added.join(', ')}; снять его оттуда`);
    } else if (gone.length > 0) {
        notes.push(
            `elem ${finding.name}: долг сократился — класса больше нет в ${gone.join(', ')}; перечень в строке списка можно поправить`
        );
    }
}

for (const key of known) {
    if (!matchedKeys.has(key)) {
        problems.push(`${key}: значится в ${ALLOWLIST}, но класс уже подкреплён правилом — строку убрать`);
    }
}

if (problems.length > 0) {
    console.error(`check-styles: расхождений ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    process.exit(1);
}

notes.forEach((note) => console.log(`  ${note}`));
console.log(
    `check-styles: классов без правила ${findings.length}, из них принято ${findings.length - debt.size}, долг ${debt.size} — новых нет`
);
