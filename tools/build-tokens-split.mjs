#!/usr/bin/env node
/**
 * Раздельная поставка токенов кита.
 *
 * Полный `tokens.css` держит между головой (слои, шрифты, назначения, наборы, тёмная тема) и хвостом
 * (плотность, полоса прокрутки, вход, форма, директивы) местные куски темы — острова темы внутри
 * страницы другой темы. Они весят около трёх четвертей файла, а приложению без островов не нужны.
 * Скрипт режет готовый полный файл на два, не пересобирая значений:
 *
 *   tokens.base.css   голова и хвост без местных кусков темы;
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
const FONTS = `@use 'fonts' with ($rt-fonts-url: '../src/assets/fonts');\n`;

/** Собирает исходник Sass из стандартного ввода: тот же путь поиска, что у основной сборки. */
function compile(source) {
    return execFileSync('pnpm', ['exec', 'sass', '--no-source-map', `--load-path=${STYLES}`, '--stdin'], {
        cwd: ROOT,
        input: source,
        maxBuffer: 64 * 1024 * 1024,
    }).toString();
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
    writeFileSync(join(OUT, 'tokens.base.css'), base);
    writeFileSync(join(OUT, 'tokens.scope.css'), `${scope}${density}`);
    const bytes = (text) => Buffer.byteLength(text);
    console.log(`build-tokens-split: base ${bytes(base)}, scope ${bytes(scope) + bytes(density)}, full ${bytes(full)} bytes`);
}

main();
