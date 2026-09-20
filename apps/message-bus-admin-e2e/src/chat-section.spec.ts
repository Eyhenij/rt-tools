import { expect, Locator, Page, test } from '@playwright/test';

import { CHAT, PEOPLE, SECTIONS } from '../stand/stand.mjs';
import { openSection, qa, SECTION, signIn } from './support/admin';
import { expectScreen } from './support/shot';

/**
 * Раздел чата: список переписок своих сайтов, лента выбранного разговора и ответ посетителю.
 *
 * Раздел закрыт правом, а что видно внутри — решает запись оператора чата: набор входит записью,
 * которая отвечает за первый сайт стенда и не отвечает за соседский. Наблюдатель права на чат не
 * имеет вовсе, и им проверяется закрытый адрес.
 *
 * Отправленная реплика проверяется на экране, а не ответом сервиса: обещано именно то, что она
 * видна до ответа, и ответом сервиса это не отличить от обычной ленты.
 */

/** Строки списка переписок. */
function talks(page: Page): Locator {
    return qa(page, 'chat-talk');
}

/** Тексты сообщений открытой ленты. */
async function feedTexts(page: Page): Promise<string[]> {
    return (await qa(page, 'chat-message-text').allTextContents()).map((text: string): string => text.trim());
}

/** Выбрать значение отбора по его подписи. */
async function pick(page: Page, filter: string, name: string): Promise<void> {
    await qa(page, filter).click();
    await page.getByRole('option', { name, exact: true }).click();
}

test.describe('раздел чата', () => {
    test('SC-CH-36, SC-CH-38 — оператор видит раздел и в нём разговоры своих сайтов', async ({ page }: { page: Page }) => {
        await openSection(page, 'chat');

        await expect(page.getByRole('link', { name: SECTION.chat.title })).toBeVisible();
        await expect(talks(page)).toHaveCount(CHAT.talks.length);

        const shown: string[] = await qa(page, 'chat-talk').allTextContents();

        // положительная пара к утверждению об отсутствии: свои разговоры на экране есть
        expect(shown.join(' ')).toContain(CHAT.talks[0].text);
        expect(shown.join(' ')).not.toContain(CHAT.foreignTalk);

        await talks(page).first().click();
        await expect(qa(page, 'chat-message-text').first()).toBeVisible();
        await expectScreen(page, 'chat-section');
    });

    test('SC-CH-37 — без единого права раздела чата нет в шапке, и адрес его не открывается', async ({ page }: { page: Page }) => {
        await page.goto(SECTIONS.chat);
        await signIn(page, PEOPLE.entrant);

        // положительная пара к утверждению об отсутствии: вход состоялся, экран показан
        await expect(qa(page, 'container-no-sections')).toBeVisible();
        await expect(page.getByRole('link', { name: SECTION.chat.title })).toHaveCount(0);
        await expect(qa(page, 'chat-talks')).toHaveCount(0);
    });

    test('SC-CH-40 — выбранный разговор показывает ленту обеих сторон, старые первыми', async ({ page }: { page: Page }) => {
        await openSection(page, 'chat');

        await talks(page).first().click();

        await expect(qa(page, 'chat-message-text').first()).toBeVisible();

        const shown: string[] = await feedTexts(page);
        const sides: string[] = await qa(page, 'chat-message-side').allTextContents();

        // свежий разговор стоит первым: у третьего разговора стенда время позже остальных
        expect(shown[0]).toBe(CHAT.talks[2].text);
        expect(sides[0]).toBe('Посетитель');
    });

    test('SC-CH-41 — отправленная реплика видна в ленте до ответа сервиса', async ({ page }: { page: Page }) => {
        await openSection(page, 'chat');

        await talks(page).first().click();
        await expect(qa(page, 'chat-message-text').first()).toBeVisible();

        // ответ сервиса придерживается: спека проверяет именно то, что реплика видна раньше него
        await page.route('**/api/chat/conversations/*/messages', async (route): Promise<void> => {
            await new Promise((done): void => {
                setTimeout(done, 1500);
            });

            await route.continue();
        });

        await qa(page, 'chat-answer').locator('input').fill('Ответ набора');
        await qa(page, 'chat-answer-send').click();

        await expect(qa(page, 'chat-message-text').last()).toHaveText('Ответ набора');
        await expect(qa(page, 'chat-message-text').last()).toHaveAttribute('data-send', 'sent');
    });

    test('SC-CH-39, SC-CH-45 — отбор по сайту и состоянию, закрытый разговор уходит из живых', async ({ page }: { page: Page }) => {
        await openSection(page, 'chat');

        await pick(page, 'chat-site-filter', CHAT.own.id);

        await expect(talks(page)).toHaveCount(CHAT.talks.length);

        await pick(page, 'chat-state-filter', 'Живой');

        await expect(talks(page)).toHaveCount(CHAT.talks.filter((talk): boolean => !talk.closed).length);

        await talks(page).first().click();
        await qa(page, 'chat-talk-state').click();

        await expect(talks(page)).toHaveCount(CHAT.talks.filter((talk): boolean => !talk.closed).length - 1);

        await pick(page, 'chat-state-filter', 'Закрытый');

        // положительная пара к уходу из живых: закрытый разговор виден по своему отбору
        await expect(talks(page)).toHaveCount(2);
    });

    test('SC-CH-44 — вошедший с правом, но не оператор чата, видит пустой список, а не отказ', async ({ page }: { page: Page }) => {
        await page.goto(SECTIONS.chat);
        await signIn(page, PEOPLE.watcher);

        // положительная пара к пустоте: раздел открылся, и пустота названа словами
        await expect(qa(page, 'chat-talks')).toBeVisible();
        await expect(qa(page, 'chat-talks-empty')).toBeVisible();
        await expect(qa(page, 'chat-talk')).toHaveCount(0);
    });
});
