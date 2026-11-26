#!/usr/bin/env node
/**
 * Вес частей кита на старте потребителя.
 *
 * Набор частей, которые потребитель тянет на старте, собирается esbuild'ом из собранного кита
 * (`dist/ui-kit-v2`) близко к сборке потребителя: с минификацией и без отладочных веток Angular,
 * со всеми экспортами частей (верхняя граница: потребитель берёт только нужное). Байты набора и каждой части сверяются с порогом из `tools/kit-weight-threshold.json`.
 * Расхождение с порогом в любую сторону красное; порог записывается командой `--write`: рост
 * принимается осознанно, снижение фиксируется ею же.
 *
 *   pnpm run check:kit-weight                  сборка кита и сверка с порогом
 *   pnpm run check:kit-weight -- --print   таблица байтов без сверки
 *   pnpm run check:kit-weight -- --write   запись порога по текущему измерению
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

import { createRequire } from 'node:module';

// esbuild приходит с `@angular/build`, который дерево объявляет само: свой пакет `esbuild` здесь не
// заводится, потому что рабочая область держит его нижнюю границу переопределением безопасности.
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('@angular/build/package.json'))('esbuild');
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist', 'ui-kit-v2', 'fesm2022');
/** Файл порога; переменная окружения нужна сценариям, которые проверяют код возврата на своём пороге. */
const THRESHOLD_FILE = process.env.RT_KIT_WEIGHT_THRESHOLD ?? join(ROOT, 'tools', 'kit-weight-threshold.json');
const FILE_PREFIX = 'rt-tools-ui-kit-v2-';
/** Допуск на разницу gzip между версиями zlib: полпроцента. */
const GZIP_TOLERANCE = 0.005;
const EXTERNAL = ['@angular/*', 'rxjs', 'rxjs/*', '@rt-tools/core', '@rt-tools/utils', 'd3-*'];

/** Части, которые потребитель тянет на старте; расширяется правкой этого списка и записью порога. */
const STARTUP_PARTS = ['select', 'menu', 'input', 'icon', 'popover', 'dialog', 'bottom-sheet'];

/** Адрес точки входа кита в собранном пакете: файл части называется по её имени; корень пакета лежит в файле без суффикса. */
function entryFile(part) {
    return join(DIST, `${FILE_PREFIX}${part}.mjs`);
}

/** Измерение набора: байты минифицированной сборки, gzip и байты каждого файла части. */
export async function measure(parts = STARTUP_PARTS) {
    const missing = parts.filter((part) => !existsSync(entryFile(part)));
    if (missing.length > 0) {
        throw new Error(`${DIST} has no parts: ${missing.join(', ')}; build the kit first: pnpm run build:ui-kit-v2`);
    }
    const alias = Object.fromEntries(readEntries().map((part) => [`@rt-tools/ui-kit-v2/${part}`, entryFile(part)]));
    const contents = parts.map((part) => `export * from '@rt-tools/ui-kit-v2/${part}';`).join('\n');
    const result = await build({
        stdin: { contents, resolveDir: ROOT, sourcefile: 'kit-weight-entry.mjs', loader: 'js' },
        bundle: true,
        minify: true,
        format: 'esm',
        write: false,
        metafile: true,
        outdir: 'out',
        absWorkingDir: ROOT,
        splitting: true,
        define: { ngDevMode: 'false' },
        external: EXTERNAL,
        alias,
        logLevel: 'error',
    });
    // Ленивый `import()` esbuild выносит в отдельный чанк, и на старте он не лежит. Чанк, который
    // файл точки входа подключает статически, грузится на старте и идёт в вес вместе с ним.
    const outputs = result.metafile.outputs;
    const entryKey = Object.keys(outputs).find((key) => outputs[key].entryPoint !== undefined);
    if (entryKey === undefined) {
        throw new Error('the bundle of the set has no entry file');
    }
    const startup = new Set();
    const visit = (key) => {
        if (startup.has(key) || outputs[key] === undefined) {
            return;
        }
        startup.add(key);
        for (const link of outputs[key].imports) {
            if (link.kind === 'import-statement') {
                visit(link.path);
            }
        }
    };
    visit(entryKey);
    if (startup.size === 0) {
        throw new Error('the bundle of the set has no entry file: a measurement from another directory or an empty set');
    }
    const code = Buffer.concat(
        result.outputFiles.filter((file) => startup.has(relative(ROOT, file.path))).map((file) => Buffer.from(file.contents)),
    );
    const entries = new Set(readEntries());
    const perPart = {};
    for (const key of startup) {
        for (const [file, info] of Object.entries(outputs[key].inputs)) {
            const match = /rt-tools-ui-kit-v2-(.+)\.mjs$/.exec(file);
            const part = match ? partOfFile(match[1], entries) : null;
            if (part !== null) {
                perPart[part] = (perPart[part] ?? 0) + info.bytesInOutput;
            }
        }
    }
    return { total: code.byteLength, gzip: gzipSync(code).byteLength, parts: perPart, styles: measureStyles() };
}

/** Байты глобальных файлов токенов, собранных в `dist/ui-kit-v2/styles`: их потребитель подключает целиком. */
function measureStyles() {
    const dir = join(ROOT, 'dist', 'ui-kit-v2', 'styles');
    if (!existsSync(dir)) {
        throw new Error(`${dir} is missing; run pnpm run build:tokens-v2 first`);
    }
    return Object.fromEntries(
        readdirSync(dir)
            .filter((name) => name.endsWith('.css'))
            .sort()
            .map((name) => [name, statSync(join(dir, name)).size]),
    );
}

/**
 * Имена частей по описанию пакета: ключ `exports` называет точку входа, файл рядом несёт имя части.
 * Кусок, который сборка выносит из части при ленивом `import()`, в описании не назван и частью не
 * считается: каталог файлов его не отличил бы.
 */
export function entryNamesFromExports(exportsMap) {
    const names = [];
    for (const value of Object.values(exportsMap ?? {})) {
        const file = typeof value === 'object' && value !== null ? value.default : undefined;
        const match = typeof file === 'string' ? /rt-tools-ui-kit-v2-(.+)\.mjs$/.exec(file) : null;
        if (match) {
            names.push(match[1]);
        }
    }
    return names;
}

/** Часть, которой принадлежит файл: сама точка входа или её кусок `<часть>-<имя>-<хэш>`; чужой файл — `null`. */
export function partOfFile(name, entries) {
    if (entries.has(name)) {
        return name;
    }
    let best = null;
    for (const entry of entries) {
        if (name.startsWith(`${entry}-`) && (best === null || entry.length > best.length)) {
            best = entry;
        }
    }
    return best;
}

/** Имена всех частей, лежащих в собранном пакете: нужны для подмены адресов внутри набора. */
function readEntries() {
    const manifest = JSON.parse(readFileSync(join(ROOT, 'dist', 'ui-kit-v2', 'package.json'), 'utf8'));
    return entryNamesFromExports(manifest.exports).filter((name) => existsSync(entryFile(name)));
}

function table(result) {
    const rows = Object.entries(result.parts).sort((first, second) => second[1] - first[1]);
    const lines = rows.map(([part, bytes]) => `  ${part.padEnd(14)} ${String(bytes).padStart(8)}`);
    const styles = Object.entries(result.styles).map(([file, bytes]) => `  ${file.padEnd(22)} ${String(bytes).padStart(8)}`);
    return [...lines, `  ${'итого'.padEnd(14)} ${String(result.total).padStart(8)}  gzip ${result.gzip}`, ...styles].join('\n');
}

/** Строка о расхождении одного числа с порогом: рост и снижение названы по-разному. */
function drift(label, limit, bytes) {
    if (bytes === limit) {
        return null;
    }
    return bytes > limit
        ? `${label} grew: ${limit} → ${bytes} bytes`
        : `${label} dropped: ${limit} → ${bytes} bytes; write the threshold: pnpm run check:kit-weight -- --write`;
}

/**
 * Сверка с порогом. Порог держит достигнутое в обе стороны: рост красный, потому что кит
 * утяжелился, снижение красное, потому что порог иначе остался бы выше веса и позволил бы вернуть
 * сброшенные байты незаметно. Состав набора, части и файлы стилей сверяются поимённо.
 */
export function compare(result, threshold) {
    const failures = [];
    if (JSON.stringify(threshold.set) !== JSON.stringify(STARTUP_PARTS)) {
        failures.push('the set of parts changed; write the threshold: pnpm run check:kit-weight -- --write');
    }
    failures.push(drift('the set', threshold.total, result.total));
    // Размер gzip зависит от версии zlib в Node: он сверяется с допуском, а не побайтно.
    if (typeof threshold.gzip !== 'number') {
        failures.push('gzip of the set is not in the threshold');
    } else if (Math.abs(result.gzip - threshold.gzip) > threshold.gzip * GZIP_TOLERANCE) {
        failures.push(drift('gzip of the set', threshold.gzip, result.gzip));
    }
    for (const [part, bytes] of Object.entries(result.parts)) {
        failures.push((threshold.parts ?? {})[part] === undefined ? `part ${part} is not in the threshold` : drift(`part ${part}`, threshold.parts[part], bytes));
    }
    for (const part of Object.keys(threshold.parts ?? {})) {
        failures.push(result.parts[part] === undefined ? `part ${part} is in the threshold but not in the measured set` : null);
    }
    for (const [file, bytes] of Object.entries(result.styles)) {
        failures.push((threshold.styles ?? {})[file] === undefined ? `styles file ${file} is not in the threshold` : drift(`styles file ${file}`, threshold.styles[file], bytes));
    }
    for (const file of Object.keys(threshold.styles ?? {})) {
        failures.push(result.styles[file] === undefined ? `styles file ${file} is in the threshold but not built` : null);
    }
    return failures.filter((line) => line !== null);
}

async function main() {
    const args = process.argv.slice(2);
    const result = await measure();
    if (args.includes('--print')) {
        console.log(table(result));
        return 0;
    }
    if (args.includes('--write')) {
        const record = { set: STARTUP_PARTS, total: result.total, gzip: result.gzip, parts: result.parts, styles: result.styles };
        writeFileSync(THRESHOLD_FILE, `${JSON.stringify(record, null, 2)}\n`);
        console.log(`check-kit-weight: порог записан, ${result.total} байт, gzip ${result.gzip}`);
        return 0;
    }
    if (!existsSync(THRESHOLD_FILE)) {
        console.error('check-kit-weight: tools/kit-weight-threshold.json is missing; write it: pnpm run check:kit-weight -- --write');
        return 1;
    }
    const threshold = JSON.parse(readFileSync(THRESHOLD_FILE, 'utf8'));
    const failures = compare(result, threshold);
    if (failures.length > 0) {
        console.error(`check-kit-weight: the weight of the kit at the consumer's start drifted from the threshold\n${failures.map((line) => `  ${line}`).join('\n')}\n${table(result)}`);
        return 1;
    }
    console.log(`check-kit-weight: ${result.total} байт при пороге ${threshold.total}, gzip ${result.gzip}`);
    return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main().then(
        (code) => process.exit(code),
        (error) => {
            console.error(`check-kit-weight: ${error.message}`);
            process.exit(1);
        },
    );
}
