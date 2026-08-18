#!/usr/bin/env node
/**
 * Снимки витрины кита одной командой: поднять витрину, сверить кадры, остановить витрину.
 *
 * Прогонщики снимков свою витрину не поднимают намеренно — они сверяют кадры на **уже**
 * поднятой, и в задании конвейера её поднимает сам шаг. Гейту пуша шага нет: он зовёт по
 * команде на строку и стенда за собой не оставляет. Здесь и живёт то, что в задании написано
 * строками шага.
 *
 * Порт берётся свободный, а не постоянный: раннер конвейера — та же машина, что у
 * разработчика, и витрина, поднятая руками на 6006, ответила бы прогону вместо своей. Ровно за
 * этим у задания конвейера свои порты; постоянный порт у гейта столкнул бы гейт с прогоном.
 *
 * Витрина останавливается вместе со своим деревом процессов: запускает её прогонщик задач, и
 * снятие одного родителя оставило бы работающий сервер держать порт до конца сеанса.
 *
 *   node tools/visual-gate.mjs ui-kit       # снимки первой витрины
 *   node tools/visual-gate.mjs ui-kit-v2    # снимки второй витрины
 */
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';

/**
 * Киты разведены намеренно: у каждого своя витрина, свой прогонщик снимков и свой каталог
 * эталонов. Здесь они стоят рядом только как две строки набора — общего кода съёмки у них нет,
 * и правка ради одного не двигает кадров другого.
 */
const KITS = {
    'ui-kit': { target: '@rt-tools/ui-kit:storybook', snapshots: 'test:visual' },
    'ui-kit-v2': { target: '@rt-tools/ui-kit-v2:storybook', snapshots: 'test:visual:v2' },
};

/** Предел ожидания поднявшейся витрины. Не мерило готовности, а признак того, что она не встала. */
const READY_TIMEOUT_MS = 240_000;

/** Как часто спрашивать витрину. Опрос дешёвый: это один запрос к указателю историй. */
const POLL_MS = 2_000;

const kit = process.argv[2];

if (!Object.hasOwn(KITS, kit)) {
    console.error(`\n  Кит не назван или неизвестен: «${kit ?? ''}». Ожидается один из: ${Object.keys(KITS).join(', ')}\n`);
    process.exit(1);
}

/**
 * Свободный порт спрашивается у системы, а не берётся из головы.
 *
 * Между ответом и подъёмом витрины остаётся щель, в которую успел бы влезть чужой слушатель, —
 * но постоянный порт хуже: он не щель, а гарантированное столкновение гейта с прогоном
 * конвейера на этой же машине.
 */
function freePort() {
    return new Promise((resolve, reject) => {
        const probe = createServer();
        probe.once('error', reject);
        probe.listen(0, '127.0.0.1', () => {
            const { port } = probe.address();
            probe.close(() => resolve(port));
        });
    });
}

async function ready(url) {
    const deadline = Date.now() + READY_TIMEOUT_MS;

    while (Date.now() < deadline) {
        try {
            const response = await fetch(`${url}/index.json`);
            if (response.ok) {
                return true;
            }
        } catch {
            // Витрина ещё собирается — по адресу пока никого. Это ожидаемое состояние, а не отказ.
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    }

    return false;
}

const port = await freePort();
const url = `http://localhost:${port}`;

console.log(`visual-gate: поднимаю витрину ${kit} на ${url}`);

const showcase = spawn('pnpm', ['exec', 'nx', 'run', KITS[kit].target, '--port', String(port), '--no-open'], {
    stdio: ['ignore', 'ignore', 'ignore'],
    // Своя группа процессов: снятие одного родителя оставило бы сервер держать порт.
    detached: true,
});

let stopped = false;

function stop() {
    if (stopped) {
        return;
    }
    stopped = true;
    try {
        process.kill(-showcase.pid, 'SIGTERM');
    } catch {
        // Дерево процессов уже кончилось само — останавливать нечего.
    }
}

process.on('exit', stop);
process.on('SIGINT', () => process.exit(130));
process.on('SIGTERM', () => process.exit(143));

if (!(await ready(url))) {
    stop();
    console.error(`\n  Витрина ${kit} не встала за ${READY_TIMEOUT_MS / 1000} с — снимать нечего.\n`);
    process.exit(1);
}

const run = spawnSync('pnpm', ['run', KITS[kit].snapshots], {
    stdio: 'inherit',
    env: { ...process.env, STORYBOOK_URL: url },
});

stop();

process.exit(run.status ?? 1);
