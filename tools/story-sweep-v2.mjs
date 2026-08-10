#!/usr/bin/env node
/**
 * Обход всех историй витрины второго кита: есть ли в кадре хоть что-нибудь.
 *
 * Зелёные спеки, зелёная съёмка эталонов и зелёная сверка таблиц входов вместе на этот вопрос
 * не отвечают. Сравнение с эталоном не различает пустой показ вовсе: у новой истории эталона
 * ещё нет, а первым снятым эталоном закрепляется то, что нарисовалось, — в том числе ничего.
 * Поэтому обход идёт ДО съёмки эталонов, а не после.
 *
 * Пустым показ бывает по двум причинам, и снаружи они неотличимы:
 *
 * 1. **Ошибка отрисовки.** `NG0201` — провайдера нет в инжекторе витрины, `NG0950` — хозяин
 *    компонента не задал обязательный вход. Разметка при этом либо пуста, либо оборвана.
 * 2. **Показывать нечего.** Матрица собрана, а данные ей не заведены: пустой список, пустой
 *    набор колонок, нулевой набор значений оси.
 *
 * Ошибка в консоли важнее площади: площадь бывает ненулевой и у обломка.
 *
 * Обход не заменяет глаза. Он говорит, где смотреть нечего; что показанное показано верно,
 * отвечает только осмотр кадров.
 *
 *   pnpm run test:stories:v2                 # обход поднятой витрины
 *   STORYBOOK_URL=… pnpm run test:stories:v2 # витрина на другом адресе
 */
import { join } from 'node:path';

/** Адрес уже поднятой витрины: обход свою не поднимает — как и прогон снимков рядом. */
const URL = process.env.STORYBOOK_URL ?? 'http://localhost:6007';

/** По этому пути в историях витрины опознаётся, что по адресу именно второй кит. */
const OWN_IMPORT_MARKER = 'projects/ui-kit-v2/';

/**
 * Площадь корня показа, ниже которой кадр считается пустым.
 *
 * Не ноль: обвязка показа рисует рамку и подпись ячейки даже там, где самой ячейке нечего
 * показать, и такой корень занимает десятки пикселей. Сотня квадратных пикселей — это полоска
 * 100×1, меньше которой не рисует ни один компонент кита.
 */
const MIN_AREA = 100;

/**
 * Ошибки самой витрины, к показу отношения не имеющие.
 *
 * `NG04002` приходит в каждую историю без исключения: витрина отдаёт истории по адресу
 * `/iframe.html`, а маршрутизатор ей объявлен пустым набором маршрутов — сопоставлять этот
 * адрес не с чем. Маршрутизатор витрине нужен: без него не поднимается ни один компонент кита
 * со ссылкой. Не отсеяв это, обход отчитывается о всех историях разом и не говорит ничего.
 */
const KNOWN_SHOWCASE_NOISE = [/NG04002: Cannot match any routes\. URL Segment: 'iframe\.html'/];

function fail(message) {
    console.error(`\n  ${message}\n`);
    process.exit(1);
}

/**
 * Драйвер браузера приезжает зависимостью прогонщика снимков, а не манифестом дерева.
 *
 * Строгая раскладка pnpm не кладёт его в корневой `node_modules`, поэтому импорт по имени
 * здесь не находит ничего. Второй путь — общий каталог связей pnpm, куда сложено транзитивное.
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

    return fail('Драйвер браузера не найден ни по имени, ни в каталоге связей pnpm. Поставь зависимости: pnpm install');
}

/**
 * Опознаёт витрину по её указателю историй.
 *
 * Признак — путь исходника: у второго кита каждая история лежит под `projects/ui-kit-v2/`.
 * Заголовки для этого не годятся — `Components/Button` есть у обоих китов, и обход, наведённый
 * на чужую витрину, отчитался бы о чужих историях как о своих.
 */
async function ownStories() {
    let index;

    try {
        const response = await fetch(`${URL}/index.json`);
        if (!response.ok) {
            fail(`По адресу ${URL} витрина не отдала указатель историй (${response.status}). Подними её: pnpm run storybook:ui-kit-v2`);
        }
        index = await response.json();
    } catch (error) {
        fail(`По адресу ${URL} никто не отвечает (${error.message}). Подними витрину: pnpm run storybook:ui-kit-v2`);
    }

    const entries = Object.values(index.entries ?? {}).filter((entry) => entry.type === 'story');
    if (entries.length === 0) {
        fail(`По адресу ${URL} витрина без единой истории — обходить нечего.`);
    }

    const own = entries.filter((entry) => (entry.importPath ?? '').includes(OWN_IMPORT_MARKER));
    if (own.length === 0) {
        const sample = entries[0]?.importPath ?? '—';
        fail(`По адресу ${URL} отвечает не витрина второго кита: истории приходят из «${sample}», а ожидались из «${OWN_IMPORT_MARKER}».`);
    }

    return own;
}

/**
 * Площадь того, что история нарисовала.
 *
 * Корень показа — хост обвязки, он же область кадра снимка. Истории, рисующей себя мимо
 * обвязки, замеряется корень самой витрины: такая история и кадром берётся целиком.
 *
 * Нулевая высота корня ещё не значит пустого показа. Тост, нижний лист и всё, что компонент
 * прибивает к окну сам, стоят вне потока — корень над таким содержимым схлопывается в полоску
 * высотой ноль. Панель CDK Overlay и вовсе рисуется в контейнере на `body`. Поэтому при пустом
 * корне мерится самый крупный нарисованный узел внутри показа и внутри контейнера перекрытий:
 * пустому показу мерить нечего вовсе — там нет ни одного узла с площадью.
 */
const measureShownArea = () => {
    const area = (node) => {
        const box = node.getBoundingClientRect();

        return Math.round(box.width * box.height);
    };

    const root = document.querySelector('[data-story-root]') ?? document.querySelector('#storybook-root');

    if (root === null) {
        return 0;
    }

    const shown = area(root);

    if (shown > 0) {
        return shown;
    }

    const drawn = [...root.querySelectorAll('*'), ...document.querySelectorAll('.cdk-overlay-container *')];

    return drawn.reduce((largest, node) => Math.max(largest, area(node)), 0);
};

const chromium = await loadChromium();
const stories = await ownStories();

console.log(`Витрина второго кита на ${URL}: историй ${stories.length}. Обход начат.`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
// Слушатели вешаются один раз на страницу, а коробка чистится перед каждой историей: подписка
// на каждую историю копит слушателей, и к концу обхода одна ошибка приходит сотней строк.
const remember = (text) => {
    if (!KNOWN_SHOWCASE_NOISE.some((pattern) => pattern.test(text))) {
        errors.push(text);
    }
};

page.on('console', (message) => (message.type() === 'error' ? remember(message.text()) : undefined));
page.on('pageerror', (error) => remember(error.message));

const broken = [];

for (const story of stories) {
    errors.length = 0;

    await page.goto(`${URL}/iframe.html?id=${story.id}&viewMode=story`, { waitUntil: 'networkidle' });
    // Ошибка приходит в консоль позже готовности страницы: без этой паузы `NG0950` достаётся
    // не той истории, на которой случился, а следующей.
    await page.waitForTimeout(150);

    const area = await page.evaluate(measureShownArea);

    if (area < MIN_AREA || errors.length > 0) {
        broken.push({ id: story.id, area, error: errors[0] });
    }
}

await browser.close();

if (broken.length === 0) {
    console.log(`Пустых показов и ошибок отрисовки нет: ${stories.length} историй.`);
    process.exit(0);
}

const lines = broken.map(({ id, area, error }) => `${id} — площадь ${area}${error === undefined ? '' : `, ${error.split('\n')[0]}`}`);

fail(
    `Историй с пустым показом или ошибкой отрисовки: ${broken.length} из ${stories.length}.\n    ${lines.join('\n    ')}\n\n` +
        `  Пока это не разобрано, эталоны снимать нельзя: съёмка закрепит пустоту, и прогон станет вечно зелёным.`
);
