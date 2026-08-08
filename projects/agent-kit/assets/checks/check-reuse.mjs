#!/usr/bin/env node
/**
 * Сплошная проверка того, что готовое не обошли.
 *
 * Гард `reuse-first-guard.sh` судит правку в момент, когда её пишут, и знает только
 * добавленный текст. Написанное до него не считает никто: проверка стилей меряет классы,
 * линтеры — типы и приёмы, а то, что экран собран нативной кнопкой вместо кнопки кита, не
 * видно ни одному из них. Эта проверка отвечает на другой вопрос — «а сколько такого в
 * дереве сейчас», — и потому смотрит на файл целиком, а не на правку.
 *
 * Признаки те же, что у гарда, и берутся оттуда же: расходиться им нельзя, иначе правка
 * проходит гард и падает на гейте. Отличий два. Первое: инвентарь кита не читается — гард
 * спрашивает диск, потому что отвечает одной правке, а сплошной проверке важно накопленное,
 * и пропавший пакет молча обнулял бы сводку. Второе: маркер `native-ok` снимает свою
 * строку, а не весь файл.
 *
 * Накопленное к моменту заведения проверки лежит в tools/reuse-allowlist.json и отказом не
 * считается: гейт падает на новом расхождении, а старое остаётся видимым числом в сводке.
 * Снимок списка — `node tools/check-reuse.mjs --baseline`.
 *
 * Ненулевой код возврата и перечень расхождений.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { allowlistOf, CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const ALLOWLIST = allowlistOf('reuse');
const SOURCE_ROOTS = CONFIG.sourceRoots;
const SKIPPED_DIRS = CONFIG.skippedDirs;

/**
 * Признак расхождения: чем он виден в тексте и на что готовое его меняет. Порядок строк —
 * порядок в сводке, поэтому родственные признаки стоят рядом.
 */
const SIGNALS = [
    {
        key: 'input',
        ext: '.html',
        find: (text) => count(text, /<input\b/g),
        instead: 'rt-input / rt-input-number / rt-checkbox / rt-file-input',
    },
    { key: 'textarea', ext: '.html', find: (text) => count(text, /<textarea\b/g), instead: 'rt-textarea' },
    { key: 'select', ext: '.html', find: (text) => count(text, /<select\b/g), instead: 'rt-select / rt-multiselect' },
    {
        key: 'button',
        ext: '.html',
        find: (text) => count(withoutKitButtons(text), /<button\b/g),
        instead: 'button[rtButton] / rt-icon-button',
    },
    { key: 'table', ext: '.html', find: (text) => count(text, /<table\b/g), instead: 'rt-table' },
    { key: 'dialog', ext: '.html', find: (text) => count(text, /<dialog\b/g), instead: 'rt-dialog' },
    { key: 'alert', ext: '.html', find: (text) => count(text, /role="alert"/g), instead: 'rt-message' },

    { key: 'overlay', ext: '.scss', find: fullScreenOverlays, instead: 'rt-dialog / rt-aside / rt-bottom-sheet' },
    {
        key: 'backdrop',
        ext: '.scss',
        find: (text) => count(text, /backdrop-filter|background(-color)?: *(rgba\( *0 *, *0 *, *0|rgb\( *0 +0 +0)/g),
        instead: 'backdrop рисует rt-dialog',
    },
    { key: 'z-index', ext: '.scss', find: (text) => count(text, /z-index: *\d{4,}/g), instead: 'слой оверлеев кита уже выше' },
    { key: 'spin', ext: '.scss', find: (text) => count(text, /@keyframes[^{]*(spin|rotate|loading)/g), instead: 'rt-spinner' },
    {
        key: 'shimmer',
        ext: '.scss',
        find: (text) => count(text, /@keyframes[^{]*(shimmer|skeleton|pulse)/g),
        instead: 'rt-skeleton / rt-skeleton-wrapper',
    },

    { key: 'inline-template', ext: '.component.ts', find: (text) => count(text, /^ *template: *['"`]/gm), instead: 'шаблон в своём .html' },
    // Список стилей открывается своей строкой, а строка с кавычкой идёт следующей
    {
        key: 'inline-styles',
        ext: '.component.ts',
        find: (text) => count(text, /^ *styles: *(\[\s*)?['"`\n]/gm),
        instead: 'стили в своём .scss',
    },
    {
        key: 'value-accessor',
        ext: '.component.ts',
        find: (text) => (/ControlValueAccessor|NG_VALUE_ACCESSOR/.test(text) && !/extends VmFormControlBase/.test(text) ? 1 : 0),
        instead: 'VmFormControlBase',
    },
    {
        key: 'mapper-base',
        ext: '.mapper.ts',
        // На бэкенде перевод сущности написан свободными функциями — это долг `Q-S-1`,
        // а не место для этой проверки
        skip: (path) => path.startsWith('libs/api/') || path.startsWith('apps/api/'),
        find: (text) => (/class +[A-Za-z0-9_]+Mapper/.test(text) && !/extends BaseMapper/.test(text) ? 1 : 0),
        instead: 'BaseMapper и this.typeCast',
    },
    {
        key: 'procedure-mark',
        ext: '.procedure.ts',
        find: (text) => (/export class/.test(text) && !/@ConnectProcedure/.test(text) ? 1 : 0),
        instead: '@ConnectProcedure()',
    },
    {
        key: 'aside-base',
        ext: '.component.ts',
        onlyNamed: /aside[^/]*\.component\.ts$/,
        find: (text) => (/export class/.test(text) && !/extends VmRouteAsideComponent/.test(text) ? 1 : 0),
        instead: 'VmRouteAsideComponent',
    },
];

function count(text, expression) {
    return [...text.matchAll(expression)].length;
}

/** `button[rtButton]` — предписанный вариант, а подстрока `<button` у него та же */
function withoutKitButtons(text) {
    return text.replace(/<button\b[^>]*rtButton[^>]*>/gs, '');
}

/** Хост, растянутый на весь экран: `inset: 0` либо все четыре стороны в нуле */
function fullScreenOverlays(text) {
    if (!/position: *fixed/.test(text)) {
        return 0;
    }
    const stretched =
        /inset: *0/.test(text) ||
        (/(^|[^-])top: *0/.test(text) && /left: *0/.test(text) && /right: *0/.test(text) && /bottom: *0/.test(text));

    return stretched ? 1 : 0;
}

function collectFiles(dir) {
    const files = [];
    for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
        if (SKIPPED_DIRS.includes(entry.name)) {
            continue;
        }
        const path = `${dir}/${entry.name}`;
        if (entry.isDirectory()) {
            files.push(...collectFiles(path));
        } else if (/\.(html|scss|ts)$/.test(entry.name)) {
            files.push(path);
        }
    }

    return files;
}

/** Тесты, storybook и сквозные тесты не судятся: там нативное уместно */
function judged(path) {
    return !/\.stories\.(ts|html)$|\.spec\.ts$|\/site-e2e\/|\/admin-e2e\//.test(path);
}

/**
 * Строка с маркером — осознанное отступление, названное автором. Снимается только она сама:
 * весь файл маркер не гасит, иначе один разрешённый случай прикрывал бы соседние.
 */
function withoutMarked(text) {
    return text
        .split('\n')
        .filter((line) => !line.includes('native-ok'))
        .join('\n');
}

const allowlist = JSON.parse(readFileSync(join(ROOT, ALLOWLIST), 'utf8'));
const known = new Set([...(allowlist.accepted ?? []), ...(allowlist.debt ?? [])]);
const debt = new Set(allowlist.debt ?? []);

const findings = [];
for (const root of SOURCE_ROOTS) {
    for (const path of collectFiles(root).filter(judged).sort()) {
        const text = withoutMarked(readFileSync(join(ROOT, path), 'utf8'));
        for (const signal of SIGNALS) {
            if (!path.endsWith(signal.ext) || signal.skip?.(path) || (signal.onlyNamed && !signal.onlyNamed.test(path))) {
                continue;
            }
            const found = signal.find(text);
            if (found > 0) {
                findings.push({ key: `${signal.key} ×${found} @ ${path}`, instead: signal.instead });
            }
        }
    }
}

const fresh = findings.filter((finding) => !known.has(finding.key));
const stale = [...known].filter((key) => !findings.some((finding) => finding.key === key));

if (process.argv.includes('--baseline')) {
    console.log(JSON.stringify({ ...allowlist, debt: findings.map((finding) => finding.key).sort() }, null, 4));
    process.exit(0);
}

const problems = [
    ...fresh.map((finding) => `${finding.key} — готовое: ${finding.instead}`),
    ...stale.map((key) => `${key}: значится в ${ALLOWLIST}, а в дереве такого расхождения больше нет — строку поправить или убрать`),
];

if (problems.length > 0) {
    console.error(`check-reuse: расхождений ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    console.error('\nПравило единообразия — скил `reuse-first`.');
    process.exit(1);
}

const places = findings.reduce((sum, finding) => sum + Number(finding.key.match(/×(\d+)/)[1]), 0);
console.log(
    `check-reuse: мест, где готовое обошли, ${places} в ${findings.length} признаках — принято ${findings.length - debt.size}, долг ${debt.size}, новых нет`
);
