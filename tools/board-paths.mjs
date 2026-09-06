// rt-kit v0.25.0 · checks/board-paths.github.mjs · 59b32cb13c66 · правится надстройкой, не здесь
// Пути, которых не слушает конвейер, и заявка, чей вклад целиком под ними.
//
// Вынесено из сверки очереди отдельным модулем: разбор образцов конвейера к состоянию борды
// отношения не имеет и читается сам по себе, а сверка от него росла быстрее предела длины.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ghJson } from './board.mjs';
import { CONFIG, ROOT } from './rt-kit-checks.config.mjs';

const PIPELINE = CONFIG.pushGate?.pipelineFile ?? '';
const HAS_PIPELINE = PIPELINE !== '' && existsSync(join(ROOT, PIPELINE));

/**
 * Пути, которых конвейер не слушает: `paths-ignore` у его событий.
 *
 * Разбирается построчно, а не разборщиком разметки: у проверки его нет, а список — плоский
 * перечень строк под одним ключом. Ключей в файле бывает несколько — по событию, — и все они
 * складываются в один набор: ветка, чей вклад целиком лежит под ними, прогона не создаёт ни на
 * одном событии.
 */
export function ignoredPaths() {
    if (!HAS_PIPELINE) {
        return [];
    }

    const lines = readFileSync(join(ROOT, PIPELINE), 'utf8').split('\n');
    const found = [];
    let inside = false;

    for (const line of lines) {
        if (/^\s*paths-ignore:\s*$/.test(line)) {
            inside = true;
            continue;
        }
        if (!inside) {
            continue;
        }
        const item = /^\s*-\s+['"]?([^'"\s]+)['"]?\s*$/.exec(line);
        if (item) {
            found.push(item[1]);
            continue;
        }
        inside = false;
    }

    return found;
}

const IGNORED_PATHS = ignoredPaths();

/** Знаки образца, у которых в выражении своё значение: кроме звёздочек, они значат себя. */
const escapeForRegExp = (value) => value.replace(/[.+?^${}()|[\]\\-]/g, '\\$&');

/** Подпадает ли путь под образец конвейера: `**` — любой хвост, `*` — кусок имени. */
function underPattern(path, pattern) {
    const body = pattern
        .split('**')
        .map((piece) => piece.split('*').map(escapeForRegExp).join('[^/]*'))
        .join('.*');

    return new RegExp(`^${body}$`).test(path);
}

/**
 * Вклад заявки целиком лежит под путями, которых конвейер не слушает.
 *
 * Такой ветке прогона не будет никогда, и требовать его — то же, что требовать его у ветки без
 * единого коммита: признак верен по букве и лжёт по существу, а действие, которое он советует,
 * не исполнимо. Красная строка при этом стоит рядом с настоящими расхождениями и учит
 * пропускать сверку целиком.
 *
 * Состав не прочитать — отвечаем «нет»: молчать наугад дороже одной лишней строки.
 */
export function onlyIgnoredPaths(pull, options) {
    if (!IGNORED_PATHS.length) {
        return false;
    }

    let files = [];
    try {
        files = ghJson(['pr', 'view', String(pull.number), '--json', 'files'], options).files ?? [];
    } catch {
        return false;
    }

    return files.length > 0 && files.every((file) => IGNORED_PATHS.some((pattern) => underPattern(file.path, pattern)));
}
