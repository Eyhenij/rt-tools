#!/usr/bin/env node
/**
 * Проба обвязки снимков первой витрины: ждёт ли она отрисованный кадр перед съёмкой.
 *
 * Зачем она есть. Кадр, снятый до первой отрисовки после глушения движения, устойчиво
 * отличается от эталона — надписи растеризованы иначе при той же геометрии. Расхождение это
 * выпадало примерно раз на полсотни прогонов, и снимками его не поймать: пятьдесят восемь
 * прогонов подряд дали один красный, а двадцать зелёных подряд выпадают и на непочиненной
 * обвязке. Значит откат правки прогон снимков не заметит, и стеречь его надо прямо.
 *
 * Как она судит. Одна и та же история снимается дважды одной и той же подготовкой: раз без
 * ожидания отрисовки, раз с ним. Кадры обязаны разойтись — это и значит, что ожидание работает.
 * Совпали — либо ожидание снято, либо снимать стало нечего, и оба случая одинаково плохи.
 *
 * Каждый кадр снимается в своей свежей странице, а не два подряд в одной: сама съёмка вызывает
 * отрисовку, и второй кадр в той же странице совпал бы с первым всегда — проба судила бы себя, а
 * не обвязку.
 *
 * Судит она не по одной паре. Кадр без ожидания иногда успевает отрисоваться сам — тем же
 * случаем, который проба и ловит, только с другой стороны: раз на полсотни пар она совпадала на
 * целом дереве и отбивала пуш, которому нечего было предъявить. Пары поэтому снимаются подряд,
 * пока не разойдутся, и отказ приходит, только когда совпали все.
 *
 * Витрину проба не поднимает: она идёт по уже поднятой, адрес берётся из STORYBOOK_URL.
 *
 *   STORYBOOK_URL=http://localhost:6006 node tools/snapshot-paint-probe.mjs
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** История, на которой ловилось расхождение: матрица кнопки — самая плотная надписями. */
const STORY = 'components-button--matrix';

/** Тот же размер кадра, что у обвязки: от него считается высота страницы. */
const VIEWPORT = { width: 1280, height: 720 };

/** Те же семейства значков, которых ждёт обвязка. */
const ICON_FONTS = ['Material Icons', 'Material Icons Outlined'];

/** Та же пауза после глушения движения, что у обвязки. */
const SETTLE_MS = 150;

/**
 * Сколько пар снимать, прежде чем назвать совпадение отказом.
 *
 * Одна пара совпадает примерно раз на полсотни: пятьдесят восемь прогонов подряд дали одно
 * совпадение. Совпадения независимы — каждая пара снимается в своих свежих страницах, — поэтому
 * три пары дают один ложный отказ на сто с лишним тысяч прогонов, а стоят они три секунды на
 * пару и только тогда, когда предыдущая совпала.
 */
const MAX_PAIRS = 3;

const URL = process.env.STORYBOOK_URL ?? 'http://localhost:6006';

/** Обвязка, которую проба судит: ожидание обязано стоять в ней, а не только работать в браузере. */
const RUNNER = 'projects/ui-kit/.storybook/test-runner.ts';

const digest = (buffer) => createHash('sha1').update(buffer).digest('hex').slice(0, 12);

/**
 * Драйвер браузера приезжает зависимостью прогонщика снимков, а не манифестом дерева.
 *
 * Строгая раскладка pnpm не кладёт его в корневой `node_modules`, поэтому импорт по имени здесь
 * не находит ничего. Второй путь — общий каталог связей pnpm, куда сложено транзитивное. Приём
 * повторён из обхода историй: общего модуля у проверок дерева нет.
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

/** Подготовка страницы ровно та же, что делает обвязка до съёмки. */
async function prepare(page) {
    await page.goto(`${URL}/iframe.html?id=${STORY}&viewMode=story`, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle');
    await page.evaluate(async (families) => {
        for (const family of families) {
            await document.fonts.load(`1rem "${family}"`);
        }
    }, ICON_FONTS);
    await page.waitForFunction(() => document.querySelector('.rtui-icon--loading') === null, undefined, { timeout: 10_000 });
    await page.addStyleTag({
        content:
            '*,*::before,*::after{animation-duration:0s !important;animation-delay:0s !important;transition-duration:0s !important;transition-delay:0s !important;caret-color:transparent !important;}',
    });
    await page.evaluate(() => document.getAnimations().forEach((animation) => animation.finish()));
    await page.mouse.move(0, 0);
    await page.waitForTimeout(SETTLE_MS);
}

/** Ожидание отрисованного кадра — то же, что в обвязке: второй вызов стоит уже за кадром. */
async function painted(page) {
    await page.evaluate(
        () =>
            new Promise((resolve) => {
                requestAnimationFrame(() => requestAnimationFrame(() => resolve(true)));
            })
    );
}

/**
 * Снимает из исходника пояснения, оставляя один код.
 *
 * Иначе вызов, закомментированный одной косой чертой, читается как живой: строка
 * `// await painted(page, …)` содержит искомые слова целиком, и поиск по тексту её находит.
 * Так и вышло — ожидание, снятое из обвязки комментарием, пробу не покраснило вовсе, а это ровно
 * тот откат, ради которого она стоит.
 */
function codeOnly(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .split('\n')
        .map((line) => line.replace(/\/\/.*$/, ''))
        .join('\n');
}

/**
 * Судит саму обвязку: зовёт ли она ожидание отрисовки перед съёмкой.
 *
 * Замер в браузере говорит, что приём лечит расхождение, но молчит о том, применён ли он: снятый
 * из обвязки, он оставил бы пробу зелёной. Порядок вызовов читается текстом — способа спросить
 * обвязку изнутри нет, она исполняется прогонщиком витрины.
 */
function runnerWaitsForPaint() {
    const source = codeOnly(readFileSync(join(process.cwd(), RUNNER), 'utf8'));
    const wait = source.indexOf('await painted(page');
    const shot = source.indexOf('await stableShot(page)');

    if (wait < 0) {
        return `в обвязке «${RUNNER}» нет вызова ожидания отрисовки`;
    }

    if (shot < 0) {
        return `в обвязке «${RUNNER}» не нашлось съёмки кадра — проба больше не знает, что судить`;
    }

    if (wait > shot) {
        return `в обвязке «${RUNNER}» ожидание отрисовки стоит после съёмки, то есть не делает ничего`;
    }

    return null;
}

const misplaced = runnerWaitsForPaint();

if (misplaced !== null) {
    console.error(
        `\n  Проба отрисовки: ${misplaced}.\n` +
            `  Кадр, снятый до первой отрисовки, устойчиво расходится с эталоном — 1141 пиксель по надписям, —\n` +
            `  а выпадает это раз на полсотни прогонов: снимками откат не поймать.\n`
    );
    process.exit(1);
}

const chromium = await loadChromium();
const browser = await chromium.launch();

try {
    const shoot = async (wait) => {
        const context = await browser.newContext({ viewport: { ...VIEWPORT } });
        const page = await context.newPage();
        await prepare(page);

        if (wait) {
            await painted(page);
        }

        const image = await page.screenshot({ fullPage: true });
        await context.close();

        return digest(image);
    };

    let diverged = null;
    let taken = 0;
    let sample = null;

    while (taken < MAX_PAIRS && diverged === null) {
        const early = await shoot(false);
        const late = await shoot(true);

        taken += 1;
        sample = early;

        if (early !== late) {
            diverged = { pair: taken, early, late };
        }
    }

    if (diverged === null) {
        console.error(
            `\n  Проба отрисовки: снято пар ${taken}, и в каждой кадр до ожидания совпал с кадром после — все ${sample}.\n` +
                `  Это значит, что ожидание отрисованного кадра больше ничего не меняет: либо оно снято из\n` +
                `  обвязки «projects/ui-kit/.storybook/test-runner.ts», либо история «${STORY}» перестала\n` +
                `  показывать надписи. Одиночное совпадение отказом не считается — оно выпадает раз на\n` +
                `  полсотни пар; совпавшие подряд ${taken} говорят о самой обвязке.\n`
        );
        process.exit(1);
    }

    console.log(
        `Проба отрисовки: пар снято ${taken}, разошлась ${diverged.pair}-я — кадр до ожидания ${diverged.early}, после — ${diverged.late}. Ожидание работает.`
    );
} finally {
    await browser.close();
}
