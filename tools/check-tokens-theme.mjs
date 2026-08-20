#!/usr/bin/env node
/**
 * Проверка тёмной темы второго кита: полнота ответов и контраст пар «цвет текста и его фон».
 *
 * Светлая тема назначает цвет, тёмная отвечает переопределением — либо не отвечает, и тогда цвет
 * в обеих темах один. Отличить намеренно общий цвет от забытого нечем: и то и другое выглядит как
 * отсутствие строки, а видно это только глазами на витрине и только если туда посмотрели.
 *
 * Что проверка судит:
 *
 * 1. Молчащее цветовое назначение — тёмная тема на него не отвечает, и общим цвет никем не назван.
 *    Ответ засчитывается и через цепочку ссылок: назначение, ссылающееся на переопределённое,
 *    меняется вместе с ним, и дублировать строку в тёмной теме незачем.
 * 2. Пометка «цвет общий» у назначения, на которое тёмная тема всё-таки отвечает: пометка
 *    пережила правку и врёт.
 * 3. Переопределение в тёмной теме без назначения в светлой — тёмная половина пары осталась одна.
 * 4. Тёмный ответ в стилях компонента: он объявлен признаком темы мимо слоя оформления. Своё
 *    свойство компонента при этом законно — им компонент и настраивается.
 * 5. Переопределение ступени шкалы тёмной темой: шкала неизменна, тему держат назначения.
 * 6. Пара «цвет текста и его фон» ниже порога 4.5:1 — в любой из двух тем.
 * 7. Расхождение перечня пар с таблицей замера в `Colors.mdx`: двух перечней об одном и том же
 *    без сверки не заводится.
 *
 * Накопленное лежит в списке принятого, отказом не считается и видно числом; падает проверка на
 * НОВОМ месте. Список только убывает: запись, которой больше ничего не отвечает, роняет прогон.
 *
 * Ненулевой код возврата и перечень расхождений.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { CONFIG, ROOT, allowlistOf, baselineOf, parseAllowlist } from './rt-kit-checks.config.mjs';

/** Слой оформления: шкала, назначения светлой темы, переопределения тёмной. */
const STYLES = 'projects/ui-kit-v2/src/styles';
const COMPONENTS = 'projects/ui-kit-v2/src/lib';
const PAIRS_FILE = 'tools/tokens-contrast-pairs.json';
const COLORS_DOC = 'projects/ui-kit-v2/docs/Colors.mdx';
const ALLOWLIST = allowlistOf('tokens-theme');

/** Порог контраста, один на все пары. Решение владельца, раздел «Решения» договорённости. */
const THRESHOLD = 4.5;

const LIGHT_MIXIN = 'rt-theme-light-tokens';
const DARK_MIXIN = 'rt-theme-dark-tokens';

/** Объявление с необязательной пометкой общего цвета в той же строке. */
const DECLARATION_RE = /^[ \t]*(--rt-[a-z0-9-]+)[ \t]*:[ \t]*([^;]+);[ \t]*(?:\/\* rt-theme-shared:[ \t]*([^*]*?)[ \t]*\*\/)?/gm;
const COLOR_LITERAL_RE = /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|linear-gradient\(.*\)|transparent)$/i;
const SINGLE_VAR_RE = /^var\(\s*(--rt-[a-z0-9-]+)\s*\)$/;
/**
 * Прозрачный оттенок, посчитанный от цвета: доля цвета, остальное — прозрачность. Форма одна,
 * потому что кит считает оттенки только так; неизвестная форма остаётся неразобранной, и пара
 * с ней объявляется расхождением, а не пропускается молча.
 */
const COLOR_MIX_RE = /^color-mix\(\s*in\s+srgb\s*,\s*(.+?)\s+([\d.]+)%\s*,\s*transparent\s*\)$/i;
const BLOCK_RE = /^--rt-([a-z0-9]+)-/;

const read = (path) => readFileSync(join(ROOT, path), 'utf8');

/** Тело миксина: от его заголовка до строки с закрывающей скобкой на нулевом отступе. */
function mixinBody(text, name) {
    const start = text.indexOf(`@mixin ${name}`);
    if (start < 0) {
        return '';
    }
    const end = text.indexOf('\n}', start);

    return text.slice(start, end < 0 ? undefined : end);
}

/** Объявления куска текста: имя → значение и пометка общего цвета. */
function declarations(text) {
    const map = new Map();
    for (const match of text.matchAll(DECLARATION_RE)) {
        map.set(match[1], { value: match[2].trim().replace(/\s+/g, ' '), shared: match[3]?.trim() || null });
    }

    return map;
}

function scssFiles(dir) {
    const files = [];
    for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
        if (CONFIG.skippedDirs.includes(entry.name)) {
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

const primitives = declarations(read(`${STYLES}/_primitives.scss`));
const light = declarations(mixinBody(read(`${STYLES}/_semantic.scss`), LIGHT_MIXIN));
const dark = declarations(mixinBody(read(`${STYLES}/_theme-dark.scss`), DARK_MIXIN));

/** Значение имени в теме: тёмная поверх светлой, шкала под обеими. */
const valueOf = (name, theme) =>
    (theme === 'тёмной' ? dark.get(name)?.value : undefined) ?? light.get(name)?.value ?? primitives.get(name)?.value;

/** Цепочка ссылок значения: только целиком-ссылка, составное значение цепочкой не считается. */
const linkOf = (value) => value.match(SINGLE_VAR_RE)?.[1];

/** Разбор посчитанного оттенка: от какого цвета считается и какая доля от него берётся. */
function mixOf(value) {
    const parts = value.match(COLOR_MIX_RE);

    return parts ? { source: parts[1].trim(), share: Number(parts[2]) / 100 } : undefined;
}

/** Цвет ли значение: литерал цвета либо ссылка, доходящая до литерала. */
function isColor(value, seen = new Set()) {
    if (COLOR_LITERAL_RE.test(value)) {
        return true;
    }
    const mix = mixOf(value);
    if (mix) {
        return isColor(mix.source, seen);
    }
    const link = linkOf(value);
    if (!link || seen.has(link)) {
        return false;
    }
    seen.add(link);
    const next = light.get(link)?.value ?? primitives.get(link)?.value;

    return next ? isColor(next, seen) : false;
}

/**
 * Отвечает ли назначение на тёмную тему: прямо, через цепочку ссылок или никак. Пометка общего
 * цвета и запись списка принятого действуют по той же цепочке — назначение наследует и цвет, и
 * причину того звена, на которое ссылается.
 */
function answerOf(name, accepted, seen = new Set()) {
    if (dark.has(name)) {
        return { kind: 'прямо' };
    }
    if (light.get(name)?.shared) {
        return { kind: 'помечено' };
    }
    /**
     * Принятое звено гасит тех, кто на него ссылается, но не гасит себя: иначе своя же запись
     * читается проверкой как «места больше нет», и список принятого краснеет на самом себе.
     */
    if (seen.size > 0 && accepted.has(`молчит ${name}`)) {
        return { kind: 'принято' };
    }
    const link = linkOf(light.get(name)?.value ?? '');
    if (!link || seen.has(link) || !light.has(link)) {
        return null;
    }
    seen.add(link);
    const upstream = answerOf(link, accepted, seen);

    return upstream ? { kind: upstream.kind === 'прямо' ? 'через цепочку' : upstream.kind, via: link } : null;
}

/** Цвет в разбор: r, g, b и доля непрозрачности. */
function parseColor(text) {
    const hex = text.match(/^#([0-9a-f]{3,8})$/i)?.[1];
    if (hex) {
        const full = hex.length <= 4 ? [...hex].map((char) => char + char).join('') : hex;
        const channel = (index) => parseInt(full.slice(index * 2, index * 2 + 2), 16);

        return { r: channel(0), g: channel(1), b: channel(2), a: full.length === 8 ? channel(3) / 255 : 1 };
    }
    const rgb = text.match(/^rgba?\(([^)]*)\)$/i)?.[1];
    if (rgb) {
        const parts = rgb.split(/[\s,/]+/).filter(Boolean);
        const alpha = parts[3] ?? '1';

        return {
            r: Number(parts[0]),
            g: Number(parts[1]),
            b: Number(parts[2]),
            a: alpha.endsWith('%') ? Number(alpha.slice(0, -1)) / 100 : Number(alpha),
        };
    }

    return null;
}

/** Цвет имени в теме: по цепочке ссылок до литерала. */
function colorOf(name, theme, seen = new Set()) {
    const value = valueOf(name, theme);
    if (!value || seen.has(name)) {
        return null;
    }
    seen.add(name);
    const mix = mixOf(value);
    if (mix) {
        const base = colorOfValue(mix.source, theme, seen);

        return base ? { ...base, a: base.a * mix.share } : null;
    }

    return colorOfValue(value, theme, seen);
}

/** Цвет значения: ссылка идёт дальше по цепочке, литерал разбирается на месте. */
function colorOfValue(value, theme, seen) {
    const link = linkOf(value);

    return link ? colorOf(link, theme, seen) : parseColor(value);
}

/** Полупрозрачный цвет поверх непрозрачного. */
const over = (front, back) => ({
    r: front.r * front.a + back.r * (1 - front.a),
    g: front.g * front.a + back.g * (1 - front.a),
    b: front.b * front.a + back.b * (1 - front.a),
    a: 1,
});

/** Относительная яркость по определению WCAG. */
function luminance({ r, g, b }) {
    const channel = (value) => {
        const part = value / 255;

        return part <= 0.03928 ? part / 12.92 : ((part + 0.055) / 1.055) ** 2.4;
    };

    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

const contrast = (first, second) => {
    const [bright, dim] = [luminance(first), luminance(second)].sort((left, right) => right - left);

    return (bright + 0.05) / (dim + 0.05);
};

/**
 * Список принятого — пары «место и причина, почему оно принято». Причина обязательна: без неё
 * список через месяц читается как перечень мест, которые кто-то когда-то решил не чинить.
 */
const allowlist = parseAllowlist('tokens-theme', ['accepted']);
const accepted = new Set(allowlist.accepted.keys());
const findings = [];
const add = (key, text) => findings.push({ key, text });

const colorAssignments = [...light].filter(([, declaration]) => isColor(declaration.value));
const answers = new Map(colorAssignments.map(([name]) => [name, answerOf(name, accepted)]));

/** 1–2. Молчание без причины и пометка, которую пережило переопределение. */
for (const [name, declaration] of colorAssignments) {
    if (!answers.get(name)) {
        add(
            `молчит ${name}`,
            `${name} — светлая тема назначает цвет, тёмная не отвечает, и общим он никем не назван: либо переопределение, либо пометка rt-theme-shared с причиной`
        );
    }
    if (declaration.shared && dark.has(name)) {
        add(
            `лишняя пометка ${name}`,
            `${name} помечено общим для обеих тем, но тёмная тема его переопределяет — пометка врёт`
        );
    }
}

/** 3. Переопределение тёмной темы без назначения в светлой. */
for (const [name] of dark) {
    if (!light.has(name) && !primitives.has(name)) {
        add(
            `тёмная без светлой ${name}`,
            `${name} переопределено тёмной темой, но светлая его не назначает — половина пары осталась одна`
        );
    }
}

/** 5. Тёмная тема переписывает ступень шкалы. */
for (const [name] of dark) {
    if (primitives.has(name) && !light.has(name)) {
        add(
            `ступень шкалы в тёмной ${name}`,
            `${name} — ступень шкалы, переписанная тёмной темой: шкала неизменна, тему держат назначения`
        );
    }
}

/** 4. Тёмный ответ в стилях компонента мимо слоя оформления. */
for (const path of scssFiles(COMPONENTS)) {
    const text = read(path);
    const block = path.split('/').pop().replace(/^_?rt-/, '').replace(/\.component\.scss$/, '');
    for (const match of text.matchAll(/(?:^|\n)([^\n{]*(?:data-theme|rt-theme-dark)[^\n{]*)\{([^}]*)\}/g)) {
        const own = [...declarations(match[2]).keys()];
        if (own.length > 0 && own.every((name) => block.startsWith(name.match(BLOCK_RE)?.[1] ?? ''))) {
            continue;
        }
        add(
            `тёмный блок ${path}`,
            `${path} — тёмный ответ объявлен признаком темы в стилях компонента: он живёт в слое оформления либо объявляет своё свойство компонента`
        );
    }
}

/** 6–7. Контраст пар и таблица замера. */
const pairs = existsSync(join(ROOT, PAIRS_FILE)) ? JSON.parse(read(PAIRS_FILE)).pairs ?? [] : [];
const doc = existsSync(join(ROOT, COLORS_DOC)) ? read(COLORS_DOC) : '';
/** Пара названа в таблице замера, если оба её имени стоят в одной строке страницы. */
const docLines = doc.split('\n');
const measured = [];

for (const pair of pairs) {
    for (const theme of ['светлой', 'тёмной']) {
        const page = colorOf('--rt-color-bg-page', theme);
        const backdrop = colorOf(pair.bg, theme);
        const ink = colorOf(pair.text, theme);
        if (!backdrop || !ink) {
            add(
                `пара без цвета ${pair.text} на ${pair.bg}`,
                `${pair.text} на ${pair.bg} — цвет не разрешается до кода ни в одной теме: перечень пар назвал имя, которого слой не объявляет`
            );
            break;
        }
        const solidBackdrop = backdrop.a < 1 && page ? over(backdrop, page) : backdrop;
        const ratio = contrast(ink.a < 1 ? over(ink, solidBackdrop) : ink, solidBackdrop);
        measured.push({ ...pair, theme, ratio });
        if (ratio < THRESHOLD) {
            add(
                `контраст ${pair.text} на ${pair.bg} в ${theme}`,
                `${pair.text} на ${pair.bg} в ${theme} теме — ${ratio.toFixed(2)}:1 при пороге ${THRESHOLD}:1`
            );
        }
    }
    if (doc && !docLines.some((line) => line.includes(pair.text) && line.includes(pair.bg))) {
        add(
            `пара вне ${COLORS_DOC}: ${pair.text} на ${pair.bg}`,
            `${pair.text} на ${pair.bg} стоит в ${PAIRS_FILE}, но в таблице замера ${COLORS_DOC} этой пары нет`
        );
    }
}

if (process.argv.includes('--baseline')) {
    const keys = [...new Set(findings.map((finding) => finding.key))].sort();
    console.log(baselineOf(keys, allowlist, 'accepted'));
    process.exit(0);
}

if (process.argv.includes('--measure')) {
    for (const row of measured) {
        console.log(`${row.text} на ${row.bg} — ${row.theme}: ${row.ratio.toFixed(2)}:1`);
    }
    process.exit(0);
}

const seen = new Set(findings.map((finding) => finding.key));
const problems = [
    ...findings.filter((finding) => !accepted.has(finding.key)).map((finding) => finding.text),
    ...[...accepted]
        .filter((key) => !seen.has(key))
        .map((key) => `${key}: значится в ${ALLOWLIST}, но в стилях этого больше нет — строку убрать`),
];

if (problems.length > 0) {
    console.error(`check-tokens-theme: расхождений ${problems.length}\n`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    process.exit(1);
}

const kinds = [...answers.values()].filter(Boolean);
const count = (kind) => kinds.filter((answer) => answer.kind === kind).length;
const acceptedOf = (prefix) => [...seen].filter((key) => key.startsWith(prefix)).length;

console.log(
    `check-tokens-theme: цветовых назначений ${colorAssignments.length} — отвечено прямо ${count('прямо')}, ` +
        `через цепочку ${count('через цепочку')}, помечено общими ${count('помечено')}, принято списком ${acceptedOf('молчит ')}`
);
console.log(
    `check-tokens-theme: тёмных ответов мимо слоя оформления принято списком ` +
        `${acceptedOf('тёмный блок ') + acceptedOf('ступень шкалы в тёмной ')}`
);
console.log(
    `check-tokens-theme: пар контраста ${pairs.length} в двух темах, порог ${THRESHOLD}:1 — ` +
        `ниже порога ${acceptedOf('контраст ')}, и все приняты списком`
);
