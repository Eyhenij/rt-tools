/**
 * Браузер для съёмки кадров: он поднимается в образе и отдаётся по входу тому, кто снимает.
 *
 * Растр знаков считает та машина, что рисует, и у двух машин он разный при одном и том же коде:
 * доля расхождения 0,01 по всем буквам сразу, разметка та же. Пока кадры снимала машина, эталон
 * не мог совпасть с обеими сторонами — снятый у разработчика ронял конвейер, снятый под конвейер
 * ронял проверку перед отправкой. Образ один на любой машине, и снятый им эталон годится всюду.
 *
 * Скрипт запускает переданную ему команду: поднимает образ, называет набору адрес браузера,
 * дожидается конца команды и снимает образ. Своего браузера у набора после этого нет вовсе:
 * дорог было две ровно до этой работы, и вторая давала кадр, которому нельзя верить.
 */
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { connect } from 'node:net';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/** Сколько ждать браузер образа, миллисекунды. Первый запуск качает образ, и это минуты. */
const WAIT_LIMIT = 600_000;

/** Через сколько спрашивать снова, миллисекунды. */
const WAIT_STEP = 300;

/** Целое из окружения. Пусто, не число или не положительное — умолчание. */
function intFromEnv(name, fallback) {
    const raw = Number(process.env[name]);

    return Number.isInteger(raw) && raw > 0 ? raw : fallback;
}

/** Непустая строка из окружения; иначе умолчание. */
function textFromEnv(name, fallback) {
    const raw = process.env[name]?.trim();

    return raw ? raw : fallback;
}

/**
 * Версия образа взята у прогонщика, а не написана числом.
 *
 * Прогонщик и браузер говорят по своему протоколу, и разные их издания друг друга не понимают:
 * связь обрывается на первом соединении. Написанное число расходится с деревом в день обновления
 * прогонщика и молчит об этом до первого запуска.
 */
const RUNNER_VERSION = createRequire(import.meta.url)('@playwright/test/package.json').version;

/** Образ с браузерами того же издания, что прогонщик. */
const SHOT_IMAGE = `mcr.microsoft.com/playwright:v${RUNNER_VERSION}-noble`;

/** Имя поднятого образа. Своё у каждого дерева: на машине с несколькими раннерами оно общее. */
const SHOT_CONTAINER = textFromEnv('E2E_SHOT_CONTAINER', 'rt-tools-shot');

/** Порт машины, на котором отвечает браузер образа. Второй запуск на той же машине называет свой. */
const SHOT_PORT = intFromEnv('E2E_SHOT_PORT', 43210);

/** Путь входа: он стоит в адресе и тем отличает наш браузер от чужого, занявшего тот же порт. */
const SHOT_PATH = '/shot';

/**
 * Доводы браузеру — все про то, чтобы один и тот же экран рисовался одинаково от запуска к
 * запуску. Без них расхождение выходило в десяток-другой пикселей на единицу-две по каналу и
 * показывалось на сглаженных уголках тёмной темы.
 *
 * Профиль цвета иначе берётся у дисплея машины. Растр без ускорителя считает процессор — одним и
 * тем же кодом, а не тем, что ответит видеокарта. Дорисовка кусками перерисовывает только
 * изменившееся, и уголок на границе куска сглаживается иначе, чем при отрисовке кадра целиком.
 *
 * Четвёртый довод — про язык, и названная набором `locale` его не закрывает: поле даты рисует сам
 * браузер и порядок дня и месяца берёт от своего языка. Задача RT-2129 нашла это кадром, где
 * первое августа стояло как `08/01/2026`.
 */
const SHOT_ARGS = ['--lang=ru-RU', '--force-color-profile=srgb', '--disable-gpu', '--disable-partial-raster'];

/**
 * Язык образа назван переменными, а не одним доводом при запуске.
 *
 * В образе стоит `LC_ALL=C.UTF-8`, и она сильнее довода: браузер отвечал `en-US@posix` при
 * названном `--lang=ru-RU`, а поле даты рисовало американский порядок. Проба на пустой странице с
 * тем же полем: с `LC_ALL=ru_RU.UTF-8` выходит `01.08.2026`, без неё — `08/01/2026`.
 */
const SHOT_LOCALE = ['-e', 'LC_ALL=ru_RU.UTF-8', '-e', 'LANG=ru_RU.UTF-8'];

/**
 * Что запускается внутри образа.
 *
 * Прогонщик приезжает из дерева, а браузеры лежат в самом образе: своей установки прогонщика в
 * образе нет, а скачивать её на каждом запуске — минуты на ровном месте. Доводы доходят до
 * браузера только так: готовая команда образа поднимает его сама и от соединения ничего не
 * принимает — проба показала, что доводы, переданные соединением, браузер не получает вовсе.
 */
const SHOT_SCRIPT = `const { chromium } = require('@playwright/test');
chromium
    .launchServer({ port: 3000, host: '0.0.0.0', wsPath: '${SHOT_PATH}', args: ${JSON.stringify(SHOT_ARGS)} })
    .then((server) => console.log(server.wsEndpoint()));`;

/** Снятие образа. Зовётся и на успехе, и на отказе, и на сигнале. */
function stopShotBrowser() {
    spawnSync('docker', ['rm', '-f', SHOT_CONTAINER], { stdio: 'ignore' });
}

/** Отвечает ли порт. Отказ читается как «ещё не поднялся», а не как поломка. */
function answers(port) {
    return new Promise((resolve) => {
        const socket = connect({ port, host: 'localhost' });

        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });
        socket.on('error', () => {
            socket.destroy();
            resolve(false);
        });
    });
}

/** Подъём образа: прежний снимается, новый ждёт ответа на своём порту. */
async function startShotBrowser() {
    stopShotBrowser();

    const run = spawnSync(
        'docker',
        [
            'run',
            '-d',
            '--rm',
            '--name',
            SHOT_CONTAINER,
            '-p',
            `${SHOT_PORT}:3000`,
            ...SHOT_LOCALE,
            '-v',
            `${ROOT}node_modules:/tree/node_modules`,
            '-w',
            '/tree',
            SHOT_IMAGE,
            'node',
            '-e',
            SHOT_SCRIPT,
        ],
        { stdio: ['ignore', 'ignore', 'inherit'] }
    );

    if (run.status !== 0) {
        throw new Error(`образ ${SHOT_IMAGE} не поднялся`);
    }

    const until = Date.now() + WAIT_LIMIT;

    while (Date.now() < until) {
        if (await answers(SHOT_PORT)) {
            return `ws://localhost:${SHOT_PORT}${SHOT_PATH}`;
        }

        await new Promise((resolve) => setTimeout(resolve, WAIT_STEP));
    }

    throw new Error(`браузер образа не ответил за ${WAIT_LIMIT / 1000} секунд`);
}

const command = process.argv.slice(2);

if (command.length === 0) {
    process.stderr.write('shot-browser: нечего запускать — команда съёмки передаётся доводами\n');
    process.exit(1);
}

const endpoint = await startShotBrowser();

process.stdout.write(`браузер образа ${SHOT_IMAGE} поднят на ${endpoint}\n`);

const child = spawn(command[0], command.slice(1), {
    stdio: 'inherit',
    env: { ...process.env, RT_SHOT_BROWSER: endpoint },
});

for (const signal of ['SIGTERM', 'SIGINT']) {
    process.on(signal, () => child.kill(signal));
}

child.on('close', (code) => {
    stopShotBrowser();
    process.exit(code ?? 1);
});

child.on('error', (error) => {
    stopShotBrowser();
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
});
