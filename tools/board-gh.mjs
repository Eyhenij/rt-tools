#!/usr/bin/env node
// rt-kit v0.25.0 · checks/board-gh.github.mjs · e24021074778 · правится надстройкой, не здесь
/**
 * Вызов клиента хостинга: как его находят, чем подписывают и что считается временным отказом.
 *
 * Отделено от работы с очередью работ потому, что предмет здесь другой — не задача и не колонка,
 * а сам вызов: где взять исполняемый файл, каким токеном его подписать, что читать как «сети
 * нет» и что повторить. Вместе с очередью это переросло предел длины файла.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';

import { CONFIG } from './rt-kit-checks.config.mjs';

const BOARD = CONFIG.board ?? {};
const BOT_TOKEN_FILE = BOARD.tokenPath ? BOARD.tokenPath.replace(/^~/, homedir()) : '';

/**
 * `gh` у владельца подменён обёрткой менеджера паролей, и вызов по имени уходит в неё.
 * Поэтому сначала пробуется настоящий исполняемый файл, и только потом имя из PATH.
 */
function ghBinary() {
    if (process.env.GH_BIN) {
        return process.env.GH_BIN;
    }
    const homebrew = '/opt/homebrew/bin/gh';
    return existsSync(homebrew) ? homebrew : 'gh';
}

/**
 * Токен машинной записи лежит вне репозитория и в вывод не попадает. Его отсутствие — не отказ:
 * дерево, не назвавшее токена в `board.tokenPath`, работает с очередью учётной записью, под
 * которой залогинен клиент хостинга.
 *
 * Подставляют токен чтение задачи, перевод колонки и список своих спорящих заявок. Чтение
 * заявки идёт без него намеренно: полям разбора нужны права на учётные записи организации,
 * которых машинной записи не давали, и запрос с токеном отказывает целиком. Чьими глазами снят
 * ответ, говорит поле `viewer` в нём.
 */
export function botToken() {
    if (!existsSync(BOT_TOKEN_FILE)) {
        return null;
    }
    const token = readFileSync(BOT_TOKEN_FILE, 'utf8').trim();
    return token.length > 0 ? token : null;
}

export class OfflineError extends Error {}

/**
 * Отказ сети от отказа по существу отличается только текстом: `gh` на оба отвечает
 * ненулевым кодом. Сюда попадает то, после чего проверять нечем, — а не то, что
 * проверено и оказалось не так.
 */
function isOffline(stderr) {
    return /dial tcp|no such host|network is unreachable|timeout|TLS handshake|connection refused|Bad credentials|authentication|not logged/i.test(
        stderr
    );
}

/**
 * Отказ, который проходит сам: хостинг ответил, но не смог.
 *
 * Отличается от отказа по существу тем, что повтор его снимает: пятисотые коды, шлюз и его
 * таймаут. Отказ по праву, по несуществующей записи и по незнакомой колонке сюда не попадают —
 * они не пройдут и на третий раз, а ждать заставят.
 */
function isUnavailable(stderr) {
    return /HTTP 50[0234]\b|Bad Gateway|Service Unavailable|Gateway Time-?out|Server Error/i.test(stderr);
}

/** Сколько раз пробовать вызов, который отбит недоступностью хостинга. */
const TRIES = 3;

/**
 * Пауза перед следующей попыткой, вдвое длиннее прежней. Синхронная: вызов хостинга здесь тоже
 * синхронный, и уводить его в обещание пришлось бы вместе со всеми, кто его зовёт.
 *
 * Число берётся из окружения ради проб: своей паузы им не нужно, а ждать три секунды на каждый
 * сценарий они не обязаны.
 */
const PAUSE_MS = Number(process.env.RT_GH_RETRY_MS ?? 1000) || 0;

function pause(ms) {
    if (ms > 0) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
    }
}

export function gh(args, { token } = {}) {
    const env = { ...process.env };
    if (token) {
        env.GH_TOKEN = token;
    }

    let waited = PAUSE_MS;
    for (let attempt = 1; ; attempt += 1) {
        try {
            return execFileSync(ghBinary(), args, { env, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
        } catch (error) {
            const stderr = String(error.stderr ?? error.message ?? '');
            if (error.code === 'ENOENT' || isOffline(stderr)) {
                throw new OfflineError(stderr.trim() || 'gh недоступен');
            }
            // Правило требует двигать колонку тем же движением, что и работу, а хостинг отвечал
            // недоступностью час подряд: без повтора исполнитель либо крутит вызов руками, либо
            // оставляет колонку отставшей — и находит это сверка уже после открытия заявки.
            if (isUnavailable(stderr) && attempt < TRIES) {
                pause(waited);
                waited *= 2;
                continue;
            }
            const failure = new Error(stderr.trim() || `gh ${args[0]} завершился с ошибкой`);
            failure.stderr = stderr;
            throw failure;
        }
    }
}

export function ghJson(args, options) {
    return JSON.parse(gh(args, options));
}

export function graphql(query, options) {
    return ghJson(['api', 'graphql', '-f', `query=${query}`], options);
}
