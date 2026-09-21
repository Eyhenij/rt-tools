import { APIRequestContext, APIResponse, expect, Locator, Page, test } from '@playwright/test';

import { API_ORIGIN, CHAT, PEOPLE, SECTIONS } from '../stand/stand.mjs';
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
 *
 * Приход реплики посетителя в открытую ленту идёт тем же приёмом, каким её кладёт виджет: запись
 * мимо приёма события подписчикам не рассылает и отвечала бы на другой вопрос.
 */

/** Реплики посетителя, приходящие в открытую ленту: первая заводит разговор, вторая идёт потоком. */
const ARRIVED_FIRST: string = 'Пишу из набора';
const ARRIVED_NEXT: string = 'И вторая реплика следом';

/** Признаки заведённой переписки посетителя. */
interface ITalkSigns {
    readonly conversation: string;
    readonly visitor: string;
}

/** Завести переписку посетителя приёмом и вернуть её признаки. */
async function startTalk(request: APIRequestContext): Promise<ITalkSigns> {
    const started: APIResponse = await request.post(`${API_ORIGIN}/api/chat/conversations`, {
        headers: { origin: CHAT.own.origin },
        data: { site: CHAT.own.key },
    });

    expect(started.ok()).toBe(true);

    const body: { conversationId: string; visitorToken: string } = await started.json();

    return { conversation: body.conversationId, visitor: body.visitorToken };
}

/** Положить реплику посетителя приёмом — так же, как её кладёт виджет. */
async function visitorSays(request: APIRequestContext, talk: ITalkSigns, text: string): Promise<void> {
    const taken: APIResponse = await request.post(`${API_ORIGIN}/api/chat/messages`, {
        headers: { origin: CHAT.own.origin },
        data: { site: CHAT.own.key, visitor: talk.visitor, conversation: talk.conversation, text },
    });

    expect(taken.ok()).toBe(true);
}

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
        const sides: string[] = await qa(page, 'chat-message-author').allTextContents();

        // свежий разговор стоит первым: у третьего разговора стенда время позже остальных
        expect(shown[0]).toBe(CHAT.talks[2].text);
        expect(sides[0]).toBe('Посетитель');
    });

    test('SC-CH-41, SC-CH-81 — отправленная реплика видна в ленте до ответа сервиса, и стоит уходящей', async ({
        page,
    }: {
        page: Page;
    }) => {
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

        await qa(page, 'chat-composer-input').fill('Ответ набора');
        await qa(page, 'chat-composer-send').click();

        await expect(qa(page, 'chat-message-text').last()).toHaveText('Ответ набора');
        await expect(qa(page, 'chat-message-status').last()).toHaveAttribute('data-status', 'sending');
    });

    test('SC-CH-80 — лента и поле ответа раздела нарисованы готовым чатом кита', async ({ page }: { page: Page }) => {
        await openSection(page, 'chat');

        await talks(page).first().click();

        await expect(qa(page, 'chat-thread')).toBeVisible();
        await expect(qa(page, 'chat-composer-input')).toBeVisible();

        // положительная пара к отсутствию: реплики в ленте есть, и нарисованы они метками кита
        await expect(qa(page, 'chat-message').first()).toBeVisible();
        await expect(qa(page, 'chat-message-side')).toHaveCount(0);
    });

    test('SC-CH-82 — отбитая реплика уходит заново из ленты, и второй рядом не встаёт', async ({ page }: { page: Page }) => {
        await openSection(page, 'chat');

        await talks(page).first().click();
        await expect(qa(page, 'chat-message-text').first()).toBeVisible();

        const before: number = await qa(page, 'chat-message').count();
        let refuse: boolean = true;

        // первая отправка отбита сетью, вторая доходит: обещан уход той же реплики
        await page.route('**/api/chat/conversations/*/messages', async (route): Promise<void> => {
            if (refuse) {
                refuse = false;

                await route.abort();

                return;
            }

            await route.continue();
        });

        await qa(page, 'chat-composer-input').fill('Реплика со второго захода');
        await qa(page, 'chat-composer-send').click();

        await expect(qa(page, 'chat-message-status').last()).toHaveAttribute('data-status', 'failed');
        await expect(qa(page, 'chat-message')).toHaveCount(before + 1);

        await qa(page, 'chat-message-retry').click();

        await expect(qa(page, 'chat-message-status').last()).toHaveAttribute('data-status', 'sent');
        await expect(qa(page, 'chat-message')).toHaveCount(before + 1);
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

    test('SC-CH-43 — реплика посетителя приходит в открытую ленту без перезагрузки страницы', async ({
        page,
        request,
    }: {
        page: Page;
        request: APIRequestContext;
    }) => {
        const talk: ITalkSigns = await startTalk(request);

        await visitorSays(request, talk, ARRIVED_FIRST);
        await openSection(page, 'chat');

        // самый свежий разговор стоит первым: его реплика принята только что
        await talks(page).first().click();
        await expect(qa(page, 'chat-message-text').first()).toHaveText(ARRIVED_FIRST);

        await visitorSays(request, talk, ARRIVED_NEXT);

        await expect(qa(page, 'chat-message-text').last()).toHaveText(ARRIVED_NEXT);
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
