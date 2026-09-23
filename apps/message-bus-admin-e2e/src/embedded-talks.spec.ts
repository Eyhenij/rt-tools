import { expect, FrameLocator, Locator, Page, Request, test } from '@playwright/test';

import { CHAT, EMBED_PAGE_URL } from '../stand/stand.mjs';
import { expectScreen } from './support/shot';

/**
 * Встраиваемая страница переписок в админке потребителя.
 *
 * Админку потребителя поднимает сам стенд на чужом порту: ради этого работа и затеяна — её адрес и
 * адрес сервиса для браузера разные. Скрипт она берёт у сервиса, а подпись — у своей точки выдачи:
 * тайна площадки лежит на её стороне и в браузер не попадает.
 *
 * Разметка страницы лежит в рамке, и находится она теми же метками `qa-dataid`: рамка открыта, и
 * прогонщик читает её насквозь.
 *
 * Спека идёт после раздела чата по имени файла намеренно: она отвечает и закрывает разговоры на
 * своей площадке, и порядок разговоров у соседних спек от этого не меняется.
 */

/** Адрес админки потребителя со встроенным разделом. */
const PAGE: string = `${EMBED_PAGE_URL}?site=${encodeURIComponent(CHAT.embed.key)}`;

/** Разметка страницы переписок: она лежит в рамке, поставленной тегом. */
function inside(page: Page): FrameLocator {
    return page.frameLocator('rt-chat-talks iframe');
}

/** Метка спеки внутри рамки. */
function qaInside(page: Page, id: string): Locator {
    return inside(page).locator(`[qa-dataid="${id}"]`);
}

/** Строки списка переписок. */
function rows(page: Page): Locator {
    return inside(page).locator('[qa-dataid="thread-list-row"]');
}

/** Тексты реплик открытой ленты. */
async function feedTexts(page: Page): Promise<string[]> {
    return (await inside(page).locator('[qa-dataid="chat-message-text"]').allTextContents()).map((text: string): string => text.trim());
}

/** Открыть админку потребителя и дождаться списка переписок внутри рамки. */
async function openConsumerAdmin(page: Page): Promise<void> {
    await page.goto(PAGE);
    await expect(qaInside(page, 'talks-screen')).toBeVisible();
}

test.describe('встраиваемая страница переписок', () => {
    test('SC-CH-92 — админка потребителя ставит раздел одним скриптом и одним тегом', async ({ page }: { page: Page }) => {
        await openConsumerAdmin(page);

        await expect(rows(page)).toHaveCount(CHAT.embed.talks.length);
        // кнопка самой админки осталась на месте: раздел приехал рамкой и её разметки не тронул
        await expect(page.getByRole('button', { name: 'Кнопка админки' })).toBeVisible();

        await expectScreen(page, 'embedded-talks');
    });

    test('SC-CH-93 — подпись приходит с сервера потребителя, и человека ни о чём не спрашивают', async ({ page }: { page: Page }) => {
        const asked: string[] = [];

        page.on('request', (request: Request): void => {
            if (request.url().includes('/internal/chat-sign')) {
                asked.push(request.url());
            }
        });

        await openConsumerAdmin(page);

        // подпись спрошена у адреса самой админки, а не у сервиса: тайна площадки лежит там
        expect(asked).toHaveLength(1);
        expect(asked[0].startsWith(new URL(PAGE).origin)).toBe(true);
        await expect(rows(page)).toHaveCount(CHAT.embed.talks.length);
    });

    test('SC-CH-89 — человек потребителя открывает разговор и отвечает посетителю', async ({ page }: { page: Page }) => {
        await openConsumerAdmin(page);
        await rows(page).first().click();

        expect(await feedTexts(page)).toEqual([CHAT.embed.talks[1].text]);

        await inside(page).locator('[qa-dataid="chat-composer-input"]').fill('Ответ из админки потребителя');
        await inside(page).locator('[qa-dataid="chat-composer-send"]').click();

        await expect(inside(page).locator('[qa-dataid="chat-message-text"]')).toHaveCount(2);
        expect(await feedTexts(page)).toEqual([CHAT.embed.talks[1].text, 'Ответ из админки потребителя']);
    });

    test('SC-CH-90 — разговор закрывается из встроенного раздела, и строка списка это показывает', async ({ page }: { page: Page }) => {
        await openConsumerAdmin(page);
        await rows(page).first().click();

        // положительная пара: до нажатия разговор живой, и кнопка предлагает его закрыть
        await expect(qaInside(page, 'talks-state')).toHaveText('Закрыть разговор');
        await expect(rows(page).first().locator('[qa-dataid="talks-row-state"]')).toHaveText('Живой');

        await qaInside(page, 'talks-state').click();

        await expect(qaInside(page, 'talks-state')).toHaveText('Открыть снова');
        await expect(rows(page).first().locator('[qa-dataid="talks-row-state"]')).toHaveText('Закрыт');
    });
});
