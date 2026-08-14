#!/usr/bin/env node
// rt-kit v0.8.0 · checks/check-reuse.mjs · 05bb1a872c24 · правится надстройкой, не здесь
/**
 * Сплошная проверка того, что готовое не обошли.
 *
 * Гард `reuse-first-guard.sh` судит правку в момент, когда её пишут, и знает только
 * добавленный текст. Написанное до него не считает никто: проверка стилей меряет классы,
 * линтеры — типы и приёмы, а то, что экран собран нативной кнопкой вместо кнопки кита, не
 * видно ни одному из них. Эта проверка отвечает на другой вопрос — «а сколько такого в
 * дереве сейчас», — и потому смотрит на файл целиком, а не на правку.
 *
 * Признаки не лежат здесь: они объявлены наборами по пакетам rt-tools, и дерево называет в
 * настройке проверок те, что берёт. Тот же список читает гард — расходиться им нельзя, иначе
 * правка проходит гард и падает на гейте. Свои признаки дерево дописывает своим файлом.
 *
 * Отличий от гарда два. Первое: инвентарь кита не читается — гард спрашивает диск, потому что
 * отвечает одной правке, а сплошной проверке важно накопленное, и пропавший пакет молча
 * обнулял бы сводку. Второе: маркер `native-ok` снимает свою строку и следующую, а не весь файл.
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
import { loadSignals } from './signals.mjs';

const ALLOWLIST = allowlistOf('reuse');
const SOURCE_ROOTS = CONFIG.sourceRoots;
const SKIPPED_DIRS = CONFIG.skippedDirs;
const BACKEND_ROOTS = CONFIG.backendRoots;

const SIGNALS = loadSignals(CONFIG.reuse ?? {}, ROOT);

function count(text, expression) {
    return [...text.matchAll(expression)].length;
}

/**
 * Сколько раз признак виден в тексте.
 *
 * `strip` вычёркивает предписанный вариант до счёта: у кнопки кита та же подстрока `<button`, и
 * без вычёркивания она считалась бы нарушением сама по себе. `all` требует совпадения всех
 * образцов разом — так описан хост, растянутый на весь экран. `cancel` гасит признак целиком:
 * основа уже унаследована, готовое уже позвано.
 */
function found(signal, text) {
    const body = signal.strip ? text.replace(new RegExp(signal.strip, 'gs'), '') : text;
    if (signal.cancel && new RegExp(signal.cancel).test(body)) {
        return 0;
    }
    if (signal.all?.some((one) => !new RegExp(one).test(body))) {
        return 0;
    }
    if (signal.mode === 'presence') {
        return new RegExp(signal.find).test(body) ? 1 : 0;
    }

    return count(body, new RegExp(signal.find, signal.flags ?? 'g'));
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
 * Маркер — осознанное отступление, названное автором. Снимается строка, где он стоит, и та, что
 * идёт следом: в разметке маркер ставится комментарием над кодом, потому что форматировщик
 * разносит длинный тег по строкам и уводит первый атрибут со строки имени тега — признак считает
 * имя тега, а маркер оказывается ниже. Дальше следующей строки маркер не достаёт: весь файл он
 * не гасит, иначе один разрешённый случай прикрывал бы соседние.
 */
function withoutMarked(text) {
    const lines = text.split('\n');

    return lines.filter((line, index) => !line.includes('native-ok') && !lines[index - 1]?.includes('native-ok')).join('\n');
}

const allowlist = JSON.parse(readFileSync(join(ROOT, ALLOWLIST), 'utf8'));
const known = new Set([...(allowlist.accepted ?? []), ...(allowlist.debt ?? [])]);
const debt = new Set(allowlist.debt ?? []);

const findings = [];
for (const root of SOURCE_ROOTS) {
    for (const path of collectFiles(root).filter(judged).sort()) {
        const text = withoutMarked(readFileSync(join(ROOT, path), 'utf8'));
        for (const signal of SIGNALS) {
            const skipped = signal.skipBackendRoots && BACKEND_ROOTS.some((root) => path.startsWith(root));
            if (!path.endsWith(signal.ext) || skipped || (signal.onlyNamed && !new RegExp(signal.onlyNamed).test(path))) {
                continue;
            }
            const times = found(signal, text);
            if (times > 0) {
                findings.push({ key: `${signal.key} ×${times} @ ${path}`, instead: signal.instead });
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
