/**
 * Подъём стенда сквозного набора: прод-сборки, хранилище, засев, приёмник и раздача админки.
 *
 * Один скрипт на всё потому, что прогонщик спек умеет ждать один адрес: пока на нём не ответит
 * админка, набор не начнётся, а к этой минуте всё остальное — база, схема, засев и приёмник —
 * уже обязано стоять. Разложенное по трём командам, это держалось бы порядком их запуска, то
 * есть памятью того, кто запускает.
 *
 * Сборки идут прод-конфигурацией: набор проверяет то, что увидит человек, а дев-сборка собирает
 * иначе — вплоть до того, что часть отказов в ней не воспроизводится вовсе.
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { prepareDatabase, seed } from './seed.mjs';
import { ADMIN_ORIGIN, API_ORIGIN, API_PORT, STAND_DATABASE_URL } from './stand.mjs';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));

/** Сколько ждать ответа поднимаемой службы, миллисекунды. */
const WAIT_LIMIT = 60_000;

/** Через сколько спрашивать снова, миллисекунды. */
const WAIT_STEP = 300;

/** Дети этого процесса: их снимают, когда снимают его самого. */
const children = [];

/** Запуск с ожиданием конца: сборки идут до подъёма служб. */
function run(command, args, env = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { cwd: ROOT, stdio: 'inherit', env: { ...process.env, ...env } });

        child.on('error', reject);
        child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} — код выхода ${code}`))));
    });
}

/** Запуск службы: она живёт, пока жив стенд. */
function start(command, args, env = {}) {
    const child = spawn(command, args, { cwd: ROOT, stdio: 'inherit', env: { ...process.env, ...env } });

    children.push(child);

    return child;
}

/** Ожидание ответа на адресе. Отказ службы читается как «ещё не поднялась», а не как поломка. */
async function awaitAnswer(url) {
    const until = Date.now() + WAIT_LIMIT;

    while (Date.now() < until) {
        try {
            await fetch(url);

            return;
        } catch {
            await new Promise((resolve) => setTimeout(resolve, WAIT_STEP));
        }
    }

    throw new Error(`${url} не ответил за ${WAIT_LIMIT / 1000} секунд`);
}

/** Снятие поднятых служб: прогонщик спек гасит стенд сигналом, и дети обязаны уйти вместе с ним. */
function stopChildren() {
    for (const child of children) {
        child.kill('SIGTERM');
    }
}

process.on('SIGTERM', () => {
    stopChildren();
    process.exit(0);
});
process.on('SIGINT', () => {
    stopChildren();
    process.exit(0);
});

await run('npx', ['nx', 'run-many', '-t', 'build', '-p', 'message-bus', 'message-bus-admin', '--configuration', 'production'], {
    NX_SKIP_NX_INSTALL_CHECK: 'true',
});

await prepareDatabase();

/*
 * Признак входа помечен `secure`, а такую браузер шлёт только по защищённому соединению.
 * Исключение у него одно — `localhost`, и пока набор ходил с машины, исключения хватало. Браузер
 * из образа зовёт машину другим именем, исключение не работает, и признак не уходит вовсе: вход
 * проходит, а следующий запрос отвечает отказом. Стенд поэтому снимает пометку — он стоит на
 * своей машине и в сеть не смотрит.
 */
start('node', ['dist/apps/message-bus/main.js'], {
    DATABASE_URL: STAND_DATABASE_URL,
    PORT: String(API_PORT),
    CARGO_LIMIT: '2mb',
    SESSION_COOKIE_SECURE: 'false',
});
await awaitAnswer(`${API_ORIGIN}/api/trees`);

await seed();

start('node', ['apps/message-bus-admin-e2e/stand/serve-admin.mjs']);
await awaitAnswer(ADMIN_ORIGIN);

process.stdout.write('стенд сквозного набора поднят\n');
