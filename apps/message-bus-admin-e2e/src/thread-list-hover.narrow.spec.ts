import { expect, FrameLocator, Locator, Page, test } from '@playwright/test';

import { CHAT, EMBED_PAGE_URL } from '../stand/stand.mjs';

/**
 * Фон строки списка переписок на экране с касанием.
 *
 * Прогон идёт устройством с касанием: у него нет наведения, и правило фона наведения молчать
 * обязано. Указатель браузер всё равно ставит на строку, и без запроса наведения строка осталась
 * бы серой после касания, как выбранная. Пара к ней на экране с мышью — в
 * `thread-list-hover.spec.ts`.
 */

/** Адрес админки потребителя со встроенным разделом. */
const PAGE: string = `${EMBED_PAGE_URL}?site=${encodeURIComponent(CHAT.embed.key)}`;

/** Разметка страницы переписок: она лежит в рамке, поставленной тегом. */
function inside(page: Page): FrameLocator {
    return page.frameLocator('rt-chat-talks iframe');
}

/** Фон строки, каким его считает браузер. */
function backgroundOf(row: Locator): Promise<string> {
    return row.evaluate((node: Element): string => getComputedStyle(node).backgroundColor);
}

test.describe('фон строки списка переписок на экране с касанием', () => {
    test('SC-UKV-1308 — на экране без наведения строка под указателем остаётся в покое', async ({ page }: { page: Page }) => {
        await page.goto(PAGE);

        const rows: Locator = inside(page).locator('[qa-dataid="thread-list-row"]');

        await expect(rows).toHaveCount(CHAT.embed.talks.length);

        // устройство без наведения: иначе спека проверяла бы не то, что обещает
        expect(
            await inside(page)
                .locator('body')
                .evaluate((): boolean => window.matchMedia('(hover: hover)').matches)
        ).toBe(false);

        const resting: string = await backgroundOf(rows.nth(1));

        await rows.first().hover();

        expect(await backgroundOf(rows.first())).toBe(resting);
    });
});
