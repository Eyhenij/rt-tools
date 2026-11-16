import { expect, FrameLocator, Locator, Page, test } from '@playwright/test';

import { CHAT, EMBED_PAGE_URL } from '../stand/stand.mjs';

/**
 * Фон строки списка переписок под указателем на экране с мышью.
 *
 * Спека читает и ничего не меняет: разговоры не открываются и не закрываются, поэтому порядок
 * файлов у соседних спек от неё не зависит. Пара к ней на экране с касанием — в
 * `thread-list-hover.narrow.spec.ts`.
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

test.describe('фон строки списка переписок под указателем', () => {
    test('SC-UKV-1309 — с мышью строка под указателем получает фон наведения, соседняя остаётся в покое', async ({
        page,
    }: {
        page: Page;
    }) => {
        await page.goto(PAGE);

        const rows: Locator = inside(page).locator('[qa-dataid="thread-list-row"]');

        await expect(rows).toHaveCount(CHAT.embed.talks.length);

        const resting: string = await backgroundOf(rows.nth(1));

        await rows.first().hover();

        // положительная пара к экрану с касанием: здесь наведение есть, и фон меняется
        await expect.poll((): Promise<string> => backgroundOf(rows.first())).not.toBe(resting);
        expect(await backgroundOf(rows.nth(1))).toBe(resting);
    });
});
