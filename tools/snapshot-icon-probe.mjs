#!/usr/bin/env node
/**
 * Проба обвязки снимков второй витрины: дожидается ли она нарисованных значков перед съёмкой.
 *
 * Зачем она есть. Значки едут по сети по одному — файл на каждое имя, которое попросила
 * разметка, — и до прихода символа `<use href="#…">` не рисует ничего. Кадр выходит без значков
 * и с поехавшей раскладкой ряда, а прогон при этом зелёный: эталон, закреплённый таким кадром,
 * дальше сходится сам с собой. Волновая пересъёмка закрепила так четыре кадра, и нашла это
 * повторная сверка, а не прогон.
 *
 * Как она судит. Файлы значков придерживаются на подходе, и одна и та же история снимается
 * дважды: раз без ожидания значков, раз с ним. Кадры обязаны разойтись — это и значит, что ожидание
 * работает. Совпали — либо ожидание снято, либо на выбранной истории не осталось значков, и оба
 * случая одинаково плохи.
 *
 * История выбрана та, которой прежнее ожидание не видело вовсе: составная кнопка рисует шеврон
 * директивой кнопки, голым `<svg>` без хоста `rt-icon`, — а ожидание ходило по хостам и выходило
 * успехом на первой же строке. Проба поэтому и проверяет отдельно, что хостов на ней ноль:
 * история, обзаведшаяся хостом, судила бы уже не тот промах.
 *
 * Каждый кадр снимается в своей свежей странице, а не два подряд в одной: файлы придерживаются
 * на подходе, и второй кадр в той же странице пришёл бы уже по приехавшим символам.
 *
 * Витрину проба не поднимает: она идёт по уже поднятой, адрес берётся из STORYBOOK_URL.
 *
 *   STORYBOOK_URL=http://localhost:6007 node tools/snapshot-icon-probe.mjs
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** История, которой прежнее ожидание не видело: ноль хостов значка и семь нарисованных значков. */
const STORY = 'molecules-forms-splitbutton--states';

/** Тот же размер кадра, что у обвязки, — его объявляет `src/showcase/story-snapshot.ts`. */
const VIEWPORT = { width: 1280, height: 720 };

/** Та же пауза после глушения движения, что у обвязки. */
const SETTLE_MS = 150;

/**
 * На сколько придерживаются файлы значков.
 *
 * Проба судит не скорость сети, а порядок: кадр без ожидания обязан уйти раньше символов. Задержка
 * поэтому берётся заведомо больше подготовки кадра и не зависит от загрузки машины — на занятой
 * подготовка только длиннее, а порядок тот же.
 */
const SPRITE_HOLD_MS = 2_000;

/** Сколько пар снимать, прежде чем назвать совпадение отказом. */
const MAX_PAIRS = 3;

/** Поздняя граница ожидания значков в самой пробе — предел, а не мерило. */
const ICONS_TIMEOUT_MS = 30_000;

const URL = process.env.STORYBOOK_URL ?? 'http://localhost:6007';

/** Модуль ожидания, который проба судит: вызов обязан стоять в нём, а не только работать. */
const WAIT_MODULE = 'projects/ui-kit-v2/.storybook/snapshot-wait.ts';

/** Обвязка съёмки: она обязана звать ожидание до кадра. */
const RUNNER = 'projects/ui-kit-v2/.storybook/test-runner.ts';

/** Признак корня показа — тот же, по которому обвязка судит вставший показ. */
const ROOT_SELECTOR = '[data-story-root]';

const digest = (buffer) => createHash('sha1').update(buffer).digest('hex').slice(0, 12);

/**
 * Драйвер браузера приезжает зависимостью прогонщика снимков, а не манифестом дерева.
 *
 * Строгая раскладка pnpm не кладёт его в корневой `node_modules`, поэтому импорт по имени здесь
 * не находит ничего. Второй путь — общий каталог связей pnpm, куда сложено транзитивное. Приём
 * повторён из пробы отрисовки первой витрины: общего модуля у проверок дерева нет.
 */
async function loadChromium() {
    const candidates = ['playwright', join(process.cwd(), 'node_modules/.pnpm/node_modules/playwright/index.mjs')];

    for (const candidate of candidates) {
        try {
            return (await import(candidate)).chromium;
        } catch {
            // Следующий путь.
        }
    }

    console.error('\n  Драйвер браузера не найден ни по имени, ни в каталоге связей pnpm. Поставь зависимости: pnpm install\n');
    process.exit(1);
}

/**
 * Снимает из исходника пояснения, оставляя один код.
 *
 * Иначе вызов, закомментированный одной косой чертой, читается как живой: строка
 * `// await drawnIcons(page, …)` содержит искомые слова целиком, и поиск по тексту её находит.
 */
function codeOnly(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .split('\n')
        .map((line) => line.replace(/\/\/.*$/, ''))
        .join('\n');
}

/**
 * Судит саму обвязку: ждёт ли она значки и по тому ли признаку их ищет.
 *
 * Замер в браузере говорит, что приём лечит промах, но молчит о том, применён ли он: снятый из
 * обвязки, он оставил бы пробу зелёной. Порядок вызовов читается текстом — способа спросить
 * обвязку изнутри нет, она исполняется прогонщиком витрины.
 */
function harnessWaitsForIcons() {
    const wait = codeOnly(readFileSync(join(process.cwd(), WAIT_MODULE), 'utf8'));
    const runner = codeOnly(readFileSync(join(process.cwd(), RUNNER), 'utf8'));

    if (!wait.includes('await drawnIcons(page')) {
        return `в модуле ожидания «${WAIT_MODULE}» нет вызова ожидания значков`;
    }

    // Перебор по хостам `rt-icon` — тот самый промах: страницу, где значки рисует директива
    // кнопки, он не видит вовсе и выпускает съёмку первой же строкой.
    if (!wait.includes('RT_ICON_SYMBOL_ID_PREFIX')) {
        return `ожидание в «${WAIT_MODULE}» ищет значок не по ссылке в набор — страница без хостов «rt-icon» снова пройдёт мимо него`;
    }

    const called = runner.indexOf('await quiet(page');
    const shot = runner.indexOf('await shoot(page');

    if (called < 0 || shot < 0) {
        return `в обвязке «${RUNNER}» не нашлось пары «ожидание — съёмка»: проба больше не знает, что судить`;
    }

    if (called > shot) {
        return `в обвязке «${RUNNER}» ожидание стоит после съёмки, то есть не делает ничего`;
    }

    return null;
}

const misplaced = harnessWaitsForIcons();

if (misplaced !== null) {
    console.error(
        `\n  Проба значков: ${misplaced}.\n` +
            `  Кадр, снятый до прихода набора, выходит без значков и с поехавшей раскладкой ряда, а прогон\n` +
            `  при этом зелёный: закреплённый таким кадром эталон дальше сходится сам с собой.\n`
    );
    process.exit(1);
}

const chromium = await loadChromium();
const browser = await chromium.launch();

try {
    /** Подготовка страницы — та же, что делает обвязка, но без ожидания значков. */
    const prepare = async (page) => {
        await page.goto(`${URL}/iframe.html?id=${STORY}&viewMode=story`, { waitUntil: 'load' });
        await page.waitForSelector(ROOT_SELECTOR, { timeout: ICONS_TIMEOUT_MS });
        await page.addStyleTag({
            content:
                '*,*::before,*::after{animation-duration:0s !important;animation-delay:0s !important;transition-duration:0s !important;transition-delay:0s !important;caret-color:transparent !important;}',
        });
        await page.evaluate(() => document.getAnimations().forEach((animation) => animation.finish()));
        await page.mouse.move(0, 0);
        await page.waitForTimeout(SETTLE_MS);
    };

    /** Ожидание нарисованных значков — то же, что в обвязке. */
    const drawn = async (page) => {
        await page.waitForFunction(
            () =>
                Array.from(document.querySelectorAll('use[href^="#rt-icon-"]')).some((use) => {
                    const box = use.getBoundingClientRect();
                    return box.width > 0 && box.height > 0;
                }),
            undefined,
            { timeout: ICONS_TIMEOUT_MS }
        );
    };

    const shoot = async (wait) => {
        const context = await browser.newContext({ viewport: { ...VIEWPORT } });
        const page = await context.newPage();

        // Набор придерживается на подходе: без задержки он приезжает раньше подготовки кадра, и
        // проба судила бы скорость машины вместо порядка вызовов.
        await context.route('**/icons/*.svg', async (route) => {
            await new Promise((resolve) => setTimeout(resolve, SPRITE_HOLD_MS));
            await route.continue();
        });

        await prepare(page);

        if (wait) {
            await drawn(page);
        }

        const seen = await page.evaluate(() => ({
            hosts: document.querySelectorAll('rt-icon').length,
            uses: document.querySelectorAll('use[href^="#rt-icon-"]').length,
        }));
        const image = await page.locator(ROOT_SELECTOR).first().screenshot();
        await context.close();

        return { digest: digest(image), ...seen };
    };

    let diverged = null;
    let taken = 0;
    let sample = null;

    while (taken < MAX_PAIRS && diverged === null) {
        const early = await shoot(false);
        const late = await shoot(true);

        taken += 1;
        sample = late;

        if (late.hosts > 0) {
            console.error(
                `\n  Проба значков: история «${STORY}» обзавелась ${late.hosts} хостами «rt-icon».\n` +
                    `  Промах, который проба стережёт, был именно в странице без хостов: выбери другую историю,\n` +
                    `  где значок рисует директива кнопки, — иначе проба судит не тот случай.\n`
            );
            process.exit(1);
        }

        if (late.uses === 0) {
            console.error(
                `\n  Проба значков: на истории «${STORY}» не осталось значков вовсе — судить нечего.\n` +
                    `  Выбери историю, которая рисует значок ссылкой в набор.\n`
            );
            process.exit(1);
        }

        if (early.digest !== late.digest) {
            diverged = { pair: taken, early: early.digest, late: late.digest, uses: late.uses };
        }
    }

    if (diverged === null) {
        console.error(
            `\n  Проба значков: снято пар ${taken}, и в каждой кадр до ожидания совпал с кадром после — все ${sample.digest}.\n` +
                `  Это значит, что ожидание значков больше ничего не меняет: либо оно снято из модуля\n` +
                `  «${WAIT_MODULE}», либо набор приезжает раньше, чем его успевают придержать.\n`
        );
        process.exit(1);
    }

    console.log(
        `Проба значков: пар снято ${taken}, разошлась ${diverged.pair}-я — кадр до ожидания ${diverged.early}, после — ${diverged.late}. ` +
            `Значков на странице ${diverged.uses}, хостов «rt-icon» ноль. Ожидание работает.`
    );
} finally {
    await browser.close();
}
