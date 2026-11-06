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

/** Сколько реплик заполняет ленту в низком окне: дальше она прокручивается. */
const FEED_FILLERS: number = 8;

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

        // Лента приезжает после нажатия по сети: снимок её текстов сразу после нажатия на медленной
        // машине пуст, поэтому реплика ждётся проверкой, которая повторяет себя сама.
        await expect(inside(page).locator('[qa-dataid="chat-message-text"]')).toHaveText([CHAT.embed.talks[1].text]);

        await inside(page).locator('[qa-dataid="message-composer-input"]').fill('Ответ из админки потребителя');
        await inside(page).locator('[qa-dataid="message-composer-send"]').click();

        await expect(inside(page).locator('[qa-dataid="chat-message-text"]')).toHaveCount(2);
        expect(await feedTexts(page)).toEqual([CHAT.embed.talks[1].text, 'Ответ из админки потребителя']);
    });

    test('SC-CH-90 — разговор закрывается из встроенного раздела, и строка списка это показывает', async ({ page }: { page: Page }) => {
        await openConsumerAdmin(page);
        await rows(page).first().click();

        // положительная пара: до нажатия разговор живой, и действие предлагает его закрыть
        await expect(qaInside(page, 'workspace-details-action')).toHaveText('Закрыть разговор');
        await expect(rows(page).first().locator('[qa-dataid="chat-talk-state-mark"]')).toHaveText('Живой');

        await qaInside(page, 'workspace-details-action').click();

        await expect(qaInside(page, 'workspace-details-action')).toHaveText('Открыть снова');
        await expect(rows(page).first().locator('[qa-dataid="chat-talk-state-mark"]')).toHaveText('Закрытый');
    });

    test('SC-CH-98 — страница разложена тем же рабочим столом, что и панель оператора', async ({ page }: { page: Page }) => {
        await openConsumerAdmin(page);
        await rows(page).first().click();

        // три колонки стола внутри рамки: список, лента, свойства разговора
        await expect(qaInside(page, 'talks-feed')).toBeVisible();
        await expect(qaInside(page, 'talks-details')).toBeVisible();

        const details: string = (await qaInside(page, 'talks-details').textContent()) ?? '';

        expect(details).toContain('Площадка');
        expect(details).toContain('Состояние');

        // ширины колонок стол помнит своим ключом, и ручки между колонками — разделители
        await expect(inside(page).locator('[role="separator"]')).toHaveCount(2);
    });

    test('SC-CH-117 — своя реплика ведёт ленту вниз, даже если человек ушёл читать историю', async ({ page }: { page: Page }) => {
        // низкое окно: лента перерастает свою колонку за несколько реплик
        await page.setViewportSize({ width: 1280, height: 480 });
        await openConsumerAdmin(page);
        await rows(page).last().click();

        const remarks: Locator = inside(page).locator('[qa-dataid="chat-message-text"]');
        const thread: Locator = qaInside(page, 'chat-thread');

        await expect(remarks.first()).toBeVisible();

        const before: number = await remarks.count();

        const reply: (text: string, total: number) => Promise<void> = async (text: string, total: number): Promise<void> => {
            await qaInside(page, 'message-composer-input').fill(text);
            await qaInside(page, 'message-composer-send').click();
            await expect(remarks).toHaveCount(total);
        };

        for (let sent: number = 1; sent <= FEED_FILLERS; sent += 1) {
            await reply(`Реплика ${sent}`, before + sent);
        }

        // положительная пара: лента длиннее окна, и уехать от низа есть куда
        const gapOf: () => Promise<number> = (): Promise<number> =>
            thread.evaluate((node: Element): number => node.scrollHeight - node.clientHeight - node.scrollTop);

        // Подтягивание к низу после реплики может опередить событие прокрутки и вернуть ленту вниз.
        // Зазор читается в следующем кадре, после этого события: если он есть, уход вверх засчитан.
        const gapAfterScrollUp: () => Promise<number> = (): Promise<number> =>
            thread.evaluate(async (node: Element): Promise<number> => {
                node.scrollTop = 0;
                await new Promise<number>((resolve: FrameRequestCallback): number => requestAnimationFrame(resolve));

                return node.scrollHeight - node.clientHeight - node.scrollTop;
            });

        await expect.poll(gapAfterScrollUp).toBeGreaterThan(0);

        await reply('Реплика из истории', before + FEED_FILLERS + 1);

        await expect.poll(gapOf).toBeLessThanOrEqual(1);
        await expect(remarks.last()).toBeInViewport();
    });
});
