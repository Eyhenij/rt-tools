import { expect, Locator, Page, test } from '@playwright/test';

import { CHAT } from '../stand/stand.mjs';
import { IBox, openSection, qa } from './support/admin';
import { expectScreen } from './support/shot';

/**
 * Виджет посетителя на странице потребителя.
 *
 * Страницу поднимает сам стенд: сайт чата принимает обращения только с адресов своего списка, и
 * страница, поднятая где-то ещё, получила бы отказ — то есть проверяла бы не то. Ключ площадки
 * приезжает в адресе страницы: площадок у набора три — живая, вне часов и та, чей список адресов
 * эту страницу не знает.
 *
 * Разметка виджета лежит в теневом дереве, и находится она теми же метками `qa-dataid`: браузер
 * их там видит, а стили страницы до них не достают — это и проверяется отдельно.
 */

/** Адрес страницы с виджетом для названной площадки: он же стоит в списке адресов площадки. */
function widgetPage(siteKey: string): string {
    return `/widget-page?site=${encodeURIComponent(siteKey)}`;
}

/** Развернуть виджет: свёрнутый он стоит кнопкой углом страницы. */
async function unfold(page: Page): Promise<void> {
    await qa(page, 'widget-bubble').click();
}

/** Тексты реплик ленты виджета. */
async function feedTexts(page: Page): Promise<string[]> {
    return (await qa(page, 'widget-message').allTextContents()).map((text: string): string => text.trim());
}

/** Набрать реплику и отправить её. */
async function say(page: Page, text: string): Promise<void> {
    await qa(page, 'widget-text').fill(text);
    await qa(page, 'widget-send').click();
}

test.describe('виджет посетителя', () => {
    test('SC-CH-49, SC-CH-50 — виджет встаёт на странице и здоровается словами площадки', async ({ page }: { page: Page }) => {
        await page.goto(widgetPage(CHAT.widget.key));

        await expect(qa(page, 'widget-bubble')).toBeVisible();

        await unfold(page);

        await expect(qa(page, 'widget-greeting')).toHaveText(CHAT.widget.greeting);
        await expect(qa(page, 'widget-hours')).toContainText('Отвечаем сейчас');
        await expect(qa(page, 'widget-message')).toHaveCount(0);

        // виджет стоит окном в углу чужой страницы: кадр берёт и страницу, и его
        await expectScreen(page, 'widget-page');
    });

    test('SC-CH-51, SC-CH-55 — первая реплика заводит переписку, пустая не уходит', async ({ page }: { page: Page }) => {
        await page.goto(widgetPage(CHAT.widget.key));
        await unfold(page);

        await say(page, '   ');

        // положительная пара к отсутствию: поле на месте, и следующая реплика уходит
        await expect(qa(page, 'widget-text')).toBeVisible();
        await expect(qa(page, 'widget-message')).toHaveCount(0);

        await say(page, 'Здравствуйте, это первая реплика');

        await expect(qa(page, 'widget-message')).toHaveCount(1);
        expect(await feedTexts(page)).toEqual(['Здравствуйте, это первая реплика']);

        const kept: string | null = await page.evaluate((): string | null => localStorage.getItem('rt-chat:stand-chat-widget'));

        expect(kept).toBeTruthy();
    });

    test('SC-CH-52 — вернувшийся посетитель попадает в свою переписку', async ({ page }: { page: Page }) => {
        await page.goto(widgetPage(CHAT.widget.key));
        await unfold(page);
        await say(page, 'Реплика до перезагрузки');
        await expect(qa(page, 'widget-message')).toHaveCount(1);

        await page.reload();
        await unfold(page);

        expect(await feedTexts(page)).toEqual(['Реплика до перезагрузки']);
    });

    test('SC-CH-53 — ответ оператора приходит в открытый виджет без перезагрузки', async ({ page, context }): Promise<void> => {
        await page.goto(widgetPage(CHAT.widget.key));
        await unfold(page);
        await say(page, 'Вопрос оператору');
        await expect(qa(page, 'widget-message')).toHaveCount(1);

        const panel: Page = await context.newPage();

        await openSection(panel, 'chat');
        await qa(panel, 'chat-talk').first().click();
        await qa(panel, 'chat-answer').locator('input').fill('Отвечаю посетителю');
        await qa(panel, 'chat-answer-send').click();
        await expect(qa(panel, 'chat-message-text').last()).toHaveText('Отвечаю посетителю');
        await panel.close();

        await expect(qa(page, 'widget-message').last()).toHaveText('Отвечаю посетителю');
    });

    test('SC-CH-54 — реплика длиннее предела отбита, и предел назван сервисом', async ({ page }: { page: Page }) => {
        await page.goto(widgetPage(CHAT.widget.key));
        await unfold(page);

        await say(page, 'я'.repeat(5000));

        await expect(qa(page, 'widget-fault')).toContainText('Реплика длиннее');
        // предел приезжает в ответе отказа, а не написан в виджете заново
        await expect(qa(page, 'widget-fault')).toContainText('4000');
    });

    test('SC-CH-56 — страницу вне списка адресов площадки чат не обслуживает', async ({ page }: { page: Page }) => {
        await page.goto(widgetPage(CHAT.own.key));
        await unfold(page);

        await expect(qa(page, 'widget-unavailable')).toBeVisible();
        await expect(qa(page, 'widget-text')).toHaveCount(0);
    });

    test('SC-CH-57 — неизвестный ключ площадки отвечает теми же словами', async ({ page }: { page: Page }) => {
        await page.goto(widgetPage('ключа-такого-нет'));
        await unfold(page);

        await expect(qa(page, 'widget-unavailable')).toBeVisible();
        await expect(qa(page, 'widget-text')).toHaveCount(0);
    });

    test('SC-CH-58 — вне часов ответа реплика всё равно принята, и виджет говорит о часах', async ({ page }: { page: Page }) => {
        await page.goto(widgetPage(CHAT.widgetClosed.key));
        await unfold(page);

        await expect(qa(page, 'widget-hours')).toContainText('Ответим в рабочие часы');

        await say(page, 'Пишу ночью');

        await expect(qa(page, 'widget-message')).toHaveCount(1);
    });

    test('SC-CH-60 — стили страницы до виджета не достают', async ({ page }: { page: Page }) => {
        await page.goto(widgetPage(CHAT.widget.key));
        await unfold(page);

        const field: Locator = qa(page, 'widget-text');
        const measured: { widget: string; page: string } = {
            widget: await field.evaluate((node: Element): string => getComputedStyle(node).fontSize),
            page: await page.locator('body > button').evaluate((node: Element): string => getComputedStyle(node).fontSize),
        };

        // страница красит свои поля крупно и рамкой: до виджета это не доходит
        expect(measured.page).toBe('28px');
        expect(measured.widget).toBe('14px');
        await expect(field).toHaveCSS('border-style', 'solid');
    });

    test('SC-CH-61 — длинная реплика остаётся внутри ширины виджета', async ({ page }: { page: Page }) => {
        await page.goto(widgetPage(CHAT.widget.key));
        await unfold(page);

        // одно слово без пробелов: перенести его можно только по буквам, и короткое значение это не показывает
        await say(page, 'я'.repeat(300));

        await expect(qa(page, 'widget-message')).toHaveCount(1);

        const panel: IBox | null = await qa(page, 'widget-panel').boundingBox();
        const message: IBox | null = await qa(page, 'widget-message').boundingBox();

        expect(panel).not.toBeNull();
        expect(message).not.toBeNull();
        // реплика перенесена по ширине ленты: её правый край не заходит за край виджета
        expect((message?.x ?? 0) + (message?.width ?? 0)).toBeLessThanOrEqual((panel?.x ?? 0) + (panel?.width ?? 0));
        expect(message?.x ?? 0).toBeGreaterThanOrEqual(panel?.x ?? 0);
    });
});
