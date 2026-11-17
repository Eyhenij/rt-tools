import { APIRequestContext, APIResponse, expect, Locator, Page, Route, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

import { API_ORIGIN, STAND_TREE_TOKEN_FILE, TREES } from '../stand/stand.mjs';
import { columnTexts, openSection, pickTree, pickVersion, qa, rowsOf, SECTION } from './support/admin';
import { expectScreen } from './support/shot';

/**
 * Результат работы в разделе «Качество»: плитки, веха G по дням, «Подряд» и «Окна эпиков».
 *
 * Строки дня и окна засеяны на 12–14 ноября: числа не зависят от дня прогона. Состояния, которых в
 * засеве нет, показаны подменой ответа приёмника, как в спеке раздела.
 */

/** День окна эпика 3227: оно слито и ещё не выпущено. */
const NOVEMBER_13: string = '?from=2026-11-13&to=2026-11-13';

/** Три дня ноября: веха каждого дня и окна обоих деревьев. */
const NOVEMBER: string = '?from=2026-11-12&to=2026-11-14';

/** Период, захвативший выпуск окна 13 ноября. */
const TILL_RELEASE: string = '?from=2026-11-13&to=2026-11-15';

/**
 * День со строкой, на который тест приёма шлёт свои окна. Засев кладёт на него одну строку и ни
 * одного окна, и ни один кадр набора этот день не снимает: окно теста не попадает в эталоны.
 * Без строки за день сводка не рисуется вовсе, и окно было бы не увидеть.
 */
const OCTOBER_5: string = '?from=2026-10-05&to=2026-10-05';

/** День со строкой и без окон: в него не попадает ни засев, ни тест приёма. */
const AUGUST_12: string = '?from=2026-08-12&to=2026-08-12';

/** Август стенда: строки старой редакции без чисел результата. */
const AUGUST: string = '?from=2026-08-01&to=2026-08-31';

const QUALITY_API: string = '**/api/usage/quality?*';

/** Ширины из договорённости: широкий экран, планшет и телефон. */
const WIDTHS: readonly number[] = [1440, 768, 375];

/** Окно эпика 3227, каким его шлёт отправитель; поля заменяются для случая. */
function windowCargo(change: Readonly<Record<string, unknown>>): Record<string, unknown> {
    return {
        schema: '2',
        tree: TREES[0].slug,
        origin: `e2e-${test.info().project.name}`,
        epic: 3227,
        from: '2026-11-13T00:34:01Z',
        to: '2026-11-13T03:04:27Z',
        calls: 187,
        refusals: 35,
        reasks: 3,
        merged: 1,
        released: 0,
        mergedAt: '2026-11-13T05:48:08Z',
        releasedAt: null,
        minutes: 2347,
        stamp: Date.parse('2026-11-16T00:00:00Z'),
        ...change,
    };
}

function sendWindow(request: APIRequestContext, cargo: Record<string, unknown>): Promise<APIResponse> {
    return request.post(`${API_ORIGIN}/api/intake/epic-windows`, {
        headers: { 'x-tree-token': readFileSync(STAND_TREE_TOKEN_FILE, 'utf8').trim() },
        data: cargo,
    });
}

function tile(page: Page, key: string): Locator {
    return qa(page, `quality-tile-${key}`);
}

/** Ни страница, ни её прокручиваемая зона не шире экрана. */
async function expectFits(page: Page, width: number): Promise<void> {
    const widest: number = await page.locator('html').evaluate((root: Element): number => {
        const zone: Element | null = root.querySelector('.admin-page__scroll');

        return Math.max(root.scrollWidth, zone ? zone.scrollWidth + zone.getBoundingClientRect().left : 0);
    });

    expect(widest).toBeLessThanOrEqual(width);
}

/**
 * Окно высотой во всю страницу. Отбор периода на узком экране держит закрытый календарь под
 * нижним краем окна, и кадр целой страницы рисует его поверх плиток. Человек его не видит: под
 * краем окна ничего не показано. Высокое окно уводит его туда же — за конец страницы.
 */
async function growToPage(page: Page, width: number): Promise<void> {
    const height: number = await page.evaluate((): number => document.documentElement.scrollHeight);

    await page.setViewportSize({ width, height });
}

test.describe('раздел «Качество» — результат работы', () => {
    test('SC-MB-438 — «Качество» стоит в верхнем ряду сразу после «Разборов происшествий»', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        const order: string[] = await qa(page, 'header-nav-item').evaluateAll((items: Element[]): string[] =>
            items.map((item: Element): string => item.getAttribute('data-id') ?? '')
        );

        expect(order.indexOf(SECTION.quality.path)).toBe(order.indexOf(SECTION.postmortems.path) + 1);

        await page.locator(`[qa-dataid="header-nav-item"][data-id="${SECTION.quality.path}"] a`).click();
        await expect(page.getByRole('heading', { name: SECTION.quality.title })).toBeVisible();
    });

    test('SC-MB-439, SC-MB-448 — отказы на сто вызовов и слитые задачи складываются по периоду', async ({ page }: { page: Page }) => {
        await openSection(page, 'quality', NOVEMBER);

        // (4 + 35) отказов на (100 + 187) вызовов — 13.59, а не среднее двух дней
        await expect(tile(page, 'refusalsPer100')).toContainText('13.59');
        await expect(tile(page, 'refusalsPer100')).toContainText('39 из 287 вызовов');
        await expect(tile(page, 'tasksMerged')).toContainText('4');
        await expect(tile(page, 'tasksMerged')).toContainText('от взятия 5.0 ч');
        await expect(tile(page, 'interrupts')).toContainText('из 196 слов владельца');
        await expect(tile(page, 'idle')).toContainText('2.4 ч');
    });

    test('SC-MB-440 — числа, которых строки не несут, пишутся «Нет данных», а три прежних остаются', async ({ page }: { page: Page }) => {
        await openSection(page, 'quality', AUGUST);

        await expect(tile(page, 'reasks')).toContainText('Нет данных');
        await expect(tile(page, 'deadEnds')).toContainText('Нет данных');
        await expect(tile(page, 'first-pass')).toContainText('64 %');
        await expect(qa(page, 'quality-milestone')).toHaveCount(0);
    });

    test('SC-MB-449 — без принятых задач «Принято с первого раза» читает «0 из 0»', async ({ page }: { page: Page }) => {
        await openSection(page, 'quality', NOVEMBER_13);

        await expect(tile(page, 'first-pass')).toContainText('0 из 0');
        await expect(tile(page, 'corrections')).toContainText('Нет данных');
    });

    test('SC-MB-441, SC-MB-450 — веха G читается по каждому дню', async ({ page }: { page: Page }) => {
        await openSection(page, 'quality', NOVEMBER);

        const rows: Locator = qa(page, 'quality-milestone-row');

        await expect(rows).toHaveCount(3);
        await expect(rows.nth(0)).toContainText('12.11.2026');
        await expect(rows.nth(0)).toContainText('достигнута');
        await expect(rows.nth(1)).toContainText('не достигнута');
        await expect(rows.nth(1)).toContainText('тупиков 20');
        await expect(rows.nth(2)).toContainText('вызовов нет');
    });

    test('SC-MB-451 — таблица причин держит потери на наблюдениях и даёт отказы записи долей', async ({ page }: { page: Page }) => {
        await openSection(page, 'quality', NOVEMBER);

        expect(await columnTexts(page, 'quality-cell-resource')).toEqual(['grill-gate']);
        expect(await columnTexts(page, 'quality-cell-refusals')).toEqual(['4']);
        // 6 отказов записи на 287 вызовов периода
        expect(await columnTexts(page, 'quality-cell-per100')).toEqual(['2.09']);
        await expect(qa(page, 'quality-pairs-row').first()).toContainText('grill-gate → skill-gate');
        await expect(qa(page, 'quality-pairs-row').first()).toContainText('6');
    });

    test('SC-MB-442 — окно 13 ноября стоит в блоке «Окна эпиков»', async ({ page }: { page: Page }) => {
        await openSection(page, 'quality', NOVEMBER_13);

        const row: Locator = qa(page, 'quality-windows-row').filter({ hasText: 'эпик 3227' });

        await expect(row).toContainText('не выпущен');
        await expect(row).toContainText('отказов 35 из 187 · переспросили 3');
        await expect(row).toContainText('13.11 00:34 — 13.11 03:04');
    });

    test('SC-MB-452 — выпуск более позднего дня не трогает окно прошлого дня', async ({ page }: { page: Page }) => {
        await openSection(page, 'quality', NOVEMBER_13);
        await expect(qa(page, 'quality-windows-row').filter({ hasText: 'эпик 3227' })).toContainText('не выпущен');

        await page.goto(`${SECTION.quality.path}${TILL_RELEASE}`);
        await expect(qa(page, 'quality-windows-row').filter({ hasText: 'эпик 3227' })).toContainText(/эпик 3227\s*выпущен/);
    });

    test('SC-MB-443 — период без окон не рисует блок, а плитки остаются', async ({ page }: { page: Page }) => {
        await openSection(page, 'quality', AUGUST_12);

        await expect(qa(page, 'quality-tiles')).toBeVisible();
        await expect(qa(page, 'quality-windows')).toHaveCount(0);
    });

    test('SC-MB-444 — дерево сужает окна, версия — числа, а окна оставляет', async ({ page }: { page: Page }) => {
        await openSection(page, 'quality', NOVEMBER);
        await expect(qa(page, 'quality-windows-row')).toHaveCount(2);

        await pickTree(page, TREES[1].name);
        await expect(qa(page, 'quality-windows-row')).toHaveCount(1);
        await expect(qa(page, 'quality-windows-row')).toContainText('эпик 3190');
        await expect(qa(page, 'quality-windows-row')).toContainText('открыто');

        await pickTree(page, 'Все проекты');
        await pickVersion(page, '0.36.0');
        await expect(qa(page, 'quality-windows-row')).toHaveCount(2);
        await expect(tile(page, 'tasksMerged')).toContainText('1');
        await expect(tile(page, 'refusalsPer100')).toContainText('Нет данных');
    });

    test('SC-MB-446 — окно, присланное выпущенным, заменяет присланное невыпущенным', async ({
        page,
        request,
    }: {
        page: Page;
        request: APIRequestContext;
    }) => {
        const from: string = '2026-10-05T01:00:00Z';
        const to: string = '2026-10-05T02:00:00Z';

        expect((await sendWindow(request, windowCargo({ from, to, epic: 4001, mergedAt: to }))).status()).toBe(200);
        expect(
            (
                await sendWindow(
                    request,
                    windowCargo({
                        from,
                        to,
                        epic: 4001,
                        mergedAt: to,
                        released: 1,
                        releasedAt: '2026-10-05T12:00:00Z',
                        stamp: Date.parse('2026-11-16T01:00:00Z'),
                    })
                )
            ).status()
        ).toBe(200);

        await openSection(page, 'quality', OCTOBER_5);
        await expect(qa(page, 'quality-windows-row').filter({ hasText: 'эпик 4001' })).toHaveCount(1);
        await expect(qa(page, 'quality-windows-row').filter({ hasText: 'эпик 4001' })).toContainText(/эпик 4001\s*выпущен/);
    });

    test('SC-MB-447 — окно с закрытием раньше открытия отказано и не хранится', async ({ request }: { request: APIRequestContext }) => {
        const answer: APIResponse = await sendWindow(
            request,
            windowCargo({ epic: 4002, from: '2026-10-05T05:00:00Z', to: '2026-10-05T04:00:00Z', mergedAt: '2026-10-05T06:00:00Z' })
        );

        expect(answer.status()).toBe(400);
        expect(await answer.json()).toMatchObject({ code: 'epic-window-field-refused', params: { field: 'to' } });
    });

    for (const width of WIDTHS) {
        test(`SC-MB-442 — на ширине ${width} плитки, веха, «Подряд» и окна не выходят за край`, async ({ page }: { page: Page }) => {
            await page.setViewportSize({ width, height: 900 });

            await openSection(page, 'quality', NOVEMBER);
            await expect(qa(page, 'quality-windows')).toBeVisible();
            await expectFits(page, width);
            await growToPage(page, width);
            // строка полноты считает свежие дни, и её число зависит от дня прогона
            await expectScreen(page, `quality-result-${width}`, { mask: [qa(page, 'quality-completeness')] });

            await page.route(QUALITY_API, async (route: Route): Promise<void> => {
                const answer: APIResponse = await route.fetch();
                const body: Record<string, unknown> = await answer.json();
                const windows: unknown[] = body['epicWindows'] as unknown[];

                await route.fulfill({
                    json: {
                        ...body,
                        pairs: [{ first: 'очень-длинное-имя-проверки-первой', second: 'очень-длинное-имя-проверки-второй', count: 12 }],
                        epicWindows: windows.map((one: unknown): unknown => ({ ...(one as object), calls: 1234567, refusals: 123456 })),
                    },
                });
            });
            await page.goto(`${SECTION.quality.path}${NOVEMBER}`);
            await expect(qa(page, 'quality-pairs-row')).toContainText('очень-длинное-имя-проверки-второй');
            await expectFits(page, width);
            await expect(rowsOf(page, 'quality').or(qa(page, 'table-card')).first()).toBeAttached();
        });
    }
});
