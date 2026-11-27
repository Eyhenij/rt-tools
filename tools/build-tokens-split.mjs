#!/usr/bin/env node
/**
 * Раздельная поставка токенов кита.
 *
 * Полный `tokens.css` держит между головой (слои, шрифты, назначения, наборы, тёмная тема) и хвостом
 * (плотность, полоса прокрутки, вход, форма, директивы) местные куски темы — острова темы внутри
 * страницы другой темы. Они весят около 60 % файла, а приложению без островов не нужны.
 * Скрипт режет готовый полный файл на два, не пересобирая значений:
 *
 *   tokens.base.css   голова и хвост без местных кусков темы и копия правила корня страницы с набором
 *                     Material и тёмной темой вместе (оно выигрывает весом, а не местом);
 *   tokens.scope.css  местные куски темы и следом плотность: плотность в полном файле стоит за ними
 *                     и выигрывает у них местом, в раздельной поставке это место иначе заняли бы они.
 *
 * Приложение с островами подключает оба файла в этом порядке. Полный `tokens.css` остаётся как был.
 * Скрипт отказывает, если полный файл не складывается из головы, середины и хвоста.
 *
 *   node tools/build-tokens-split.mjs
 *
 * Папка с полным файлом и результатом — `dist/ui-kit-v2/styles`; `RT_TOKENS_OUT` называет другую.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const STYLES = join(ROOT, 'projects', 'ui-kit-v2', 'src', 'styles');
const OUT = process.env.RT_TOKENS_OUT ?? join(ROOT, 'dist', 'ui-kit-v2', 'styles');
/** Начало правила корня: набор Material и тёмная тема вместе на корне страницы, не на узле. */
const ROOT_RULE_START = '/* The set and a dark theme both on the page root.';
const FONTS = `@use 'fonts' with ($rt-fonts-url: '../src/assets/fonts');\n`;

/** Собирает исходник Sass из стандартного ввода: тот же путь поиска, что у основной сборки. */
function compile(source) {
    return execFileSync('pnpm', ['exec', 'sass', '--no-source-map', `--load-path=${STYLES}`, '--stdin'], {
        cwd: ROOT,
        input: source,
        maxBuffer: 64 * 1024 * 1024,
    }).toString();
}

/**
 * Правило корня страницы с набором Material и тёмной темой вместе: оно выигрывает весом, а не местом,
 * поэтому его копия в конце базы работает без `tokens.scope.css`. В scope оно остаётся как в полном файле.
 */
function rootRuleOf(scope) {
    const start = scope.indexOf(ROOT_RULE_START);
    if (start < 0) {
        throw new Error('the root rule of the set Material under the dark theme is not found in the local pieces');
    }
    const end = scope.indexOf('\n}\n', start);
    if (end < 0) {
        throw new Error('the root rule of the set Material under the dark theme does not close');
    }
    return scope.slice(start, end + 3);
}

function main() {
    const full = readFileSync(join(OUT, 'tokens.css'), 'utf8');
    const head = compile(`${FONTS}@use 'index-head';\n`);
    const base = compile(`${FONTS}@use 'index-head';\n@use 'index-tail';\n`);
    const density = compile(`${FONTS}@use 'index-head';\n@use 'density';\n`).slice(head.length);
    if (!base.startsWith(head) || !full.startsWith(head)) {
        throw new Error('the head of the tokens does not open the base or the full file');
    }
    const tail = base.slice(head.length);
    if (!full.endsWith(tail)) {
        throw new Error('the tail of the tokens does not close the full file');
    }
    const scope = full.slice(head.length, full.length - tail.length);
    if (scope.length === 0 || density.length === 0) {
        throw new Error('the local pieces of the theme or the density came out empty');
    }
    const rootRule = rootRuleOf(scope);
    const baseOut = `${base}\n${rootRule}`;
    writeFileSync(join(OUT, 'tokens.base.css'), baseOut);
    writeFileSync(join(OUT, 'tokens.scope.css'), `${scope}${density}`);
    const bytes = (text) => Buffer.byteLength(text);
    console.log(`build-tokens-split: base ${bytes(baseOut)}, scope ${bytes(scope) + bytes(density)}, full ${bytes(full)} bytes`);
}

main();
