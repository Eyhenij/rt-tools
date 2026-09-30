import { expect, Locator, Page, test } from '@playwright/test';

import { ACCOUNT, CHAT } from '../stand/stand.mjs';
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
        // вернувшийся посетитель попадает в список и открывает обращение из него
        await qa(page, 'widget-talk').first().click();

        await expect(qa(page, 'widget-message')).toHaveCount(1);
        expect(await feedTexts(page)).toEqual(['Реплика до перезагрузки']);
    });

    test('SC-CH-107, SC-CH-108, SC-CH-109 — список обращений, новое обращение и стрелка назад', async ({
        page,
        context,
    }): Promise<void> => {
        await page.goto(widgetPage(CHAT.widget.key));
        await unfold(page);
        await say(page, 'Первое обращение');
        await expect(qa(page, 'widget-message')).toHaveCount(1);

        await qa(page, 'widget-back').click();

        await expect(qa(page, 'widget-title')).toHaveText('Ваши обращения');
        await expect(qa(page, 'widget-talk')).toHaveCount(1);

        await qa(page, 'widget-new-talk').click();

        // новое обращение начинается с приветствия, а не с ленты прошлого
        await expect(qa(page, 'widget-greeting')).toBeVisible();
        await expect(qa(page, 'widget-message')).toHaveCount(0);

        await say(page, 'Второе обращение');
        await expect(qa(page, 'widget-message')).toHaveCount(1);
        expect(await feedTexts(page)).toEqual(['Второе обращение']);

        const panel: Page = await context.newPage();

        await openSection(panel, 'chat');
        await qa(panel, 'chat-talk').filter({ hasText: 'Первое обращение' }).first().click();
        await qa(panel, 'workspace-details-action').filter({ hasText: 'Закрыть разговор' }).click();
        await expect(qa(panel, 'workspace-details-action')).toHaveText('Открыть снова');
        await panel.close();

        await page.reload();
        await unfold(page);

        await expect(qa(page, 'widget-talk')).toHaveCount(2);
        await expect(qa(page, 'widget-talk').first()).toContainText('Второе обращение');
        await expect(qa(page, 'widget-talk').last()).toContainText('Первое обращение');
        // закрытым помечено только первое: положительная пара — метка вообще находится
        await expect(qa(page, 'widget-talk').last().locator('[qa-dataid="widget-talk-closed"]')).toHaveText('Закрыто');
        await expect(qa(page, 'widget-talk').first().locator('[qa-dataid="widget-talk-closed"]')).toHaveCount(0);
        await expect(qa(page, 'widget-new-talk')).toContainText('Новое обращение');

        await qa(page, 'widget-talk').last().click();
        await expect(qa(page, 'widget-message')).toHaveCount(1);
        expect(await feedTexts(page)).toEqual(['Первое обращение']);
    });

    test('SC-CH-107, SC-CH-110 — вернувшийся посетитель видит свои обращения с метками', async ({ page }: { page: Page }) => {
        const visitor: typeof CHAT.returning = CHAT.returning;

        // признак кладётся до загрузки страницы: так его находит вернувшийся посетитель
        await page.addInitScript(([key, token]: [string, string]): void => localStorage.setItem(key, token), [
            `rt-chat:${CHAT.widgetClosed.key}`,
            visitor.token,
        ] as [string, string]);
        await page.goto(widgetPage(CHAT.widgetClosed.key));
        await unfold(page);

        await expect(qa(page, 'widget-talk')).toHaveCount(visitor.talks.length);
        await expect(qa(page, 'widget-talk').nth(0)).toContainText(visitor.talks[0].author);
        await expect(qa(page, 'widget-talk').nth(0).locator('[qa-dataid="widget-talk-unread"]')).toHaveCount(1);
        await expect(qa(page, 'widget-talk').nth(1).locator('[qa-dataid="widget-talk-closed"]')).toHaveText('Закрыто');
        await expect(qa(page, 'widget-talk').nth(2)).toContainText('Поддержка');
        await expect(qa(page, 'widget-talk').nth(2).locator('[qa-dataid="widget-talk-unread"]')).toHaveCount(0);

        await expectScreen(page, 'widget-talks');

        // обращение с названным ответом: в шапке инициалы, имя и строка роли
        await qa(page, 'widget-talk').nth(0).click();
        await expect(qa(page, 'widget-title')).toHaveText(visitor.talks[0].author);
        await expect(qa(page, 'widget-message')).toHaveCount(2);

        // часы площадки вне часов засев считает от своей минуты: плашка с ними плывёт по существу, а шириной
        // она во всю ленту и соседей не двигает
        await expectScreen(page, 'widget-talk-named', { mask: [page.locator('rt-chat-widget .note')] });
    });

    test('SC-CH-110, SC-CH-111 — ответ ставит точку в списке, шапка называет сотрудника', async ({ page, context }): Promise<void> => {
        await page.goto(widgetPage(CHAT.widget.key));
        await unfold(page);
        await say(page, 'Вопрос про заезд');
        await expect(qa(page, 'widget-message')).toHaveCount(1);

        // пока названного ответа нет — общий значок, «Поддержка» и часы
        await expect(qa(page, 'widget-title')).toHaveText('Поддержка');
        await expect(qa(page, 'widget-role')).toContainText('Отвечаем сейчас');

        await qa(page, 'widget-back').click();
        await expect(qa(page, 'widget-talk')).toHaveCount(1);
        await expect(qa(page, 'widget-talk-unread')).toHaveCount(0);

        const panel: Page = await context.newPage();

        await openSection(panel, 'chat');
        await qa(panel, 'chat-talk').filter({ hasText: 'Вопрос про заезд' }).first().click();
        await qa(panel, 'message-composer-input').fill('Можно заехать с 13:00');
        await qa(panel, 'message-composer-send').click();
        await expect(qa(panel, 'chat-message-text').last()).toHaveText('Можно заехать с 13:00');
        await panel.close();

        await expect(qa(page, 'widget-talk-unread')).toHaveCount(1);
        await expect(qa(page, 'widget-talk')).toContainText(ACCOUNT.name);

        await qa(page, 'widget-talk').click();

        await expect(qa(page, 'widget-title')).toHaveText(ACCOUNT.name);
        await expect(qa(page, 'widget-role')).toHaveText('Служба поддержки');
        await expect(qa(page, 'widget-avatar')).toHaveText(ACCOUNT.name.charAt(0).toUpperCase());
        await expect(qa(page, 'widget-remark-side').last()).toHaveText(ACCOUNT.name.split(' ')[0]);

        await qa(page, 'widget-back').click();

        // открытое обращение прочитано: строка на месте, а точки больше нет
        await expect(qa(page, 'widget-talk')).toHaveCount(1);
        await expect(qa(page, 'widget-talk-unread')).toHaveCount(0);
    });

    test('SC-CH-99 — свёрнутый виджет — круглая кнопка, открытый — окно 380 px под синей шапкой', async ({ page }: { page: Page }) => {
        await page.goto(widgetPage(CHAT.widget.key));

        const bubble: Locator = qa(page, 'widget-bubble');
        const round: IBox | null = await bubble.boundingBox();

        expect(round?.width).toBe(56);
        expect(round?.height).toBe(56);
        await expect(bubble).toHaveCSS('border-radius', '50%');
        await expect(bubble.locator('svg')).toBeVisible();

        await unfold(page);

        const panel: IBox | null = await qa(page, 'widget-panel').boundingBox();

        expect(panel?.width).toBe(380);
        await expect(page.locator('rt-chat-widget .head')).toHaveCSS('background-color', 'rgb(21, 93, 252)');
        await expect(qa(page, 'widget-close')).toBeVisible();
    });

    test('SC-CH-102 — поле рисует кольцо в фокусе', async ({ page }: { page: Page }) => {
        await page.goto(widgetPage(CHAT.widget.key));
        await unfold(page);

        const field: Locator = qa(page, 'widget-field');

        // положительная пара: без фокуса кольца нет, и только фокус его рисует
        await expect(field).toHaveCSS('box-shadow', 'none');

        await qa(page, 'widget-text').focus();

        await expect(field).toHaveCSS('border-top-color', 'rgb(21, 93, 252)');
        await expect(field).toHaveCSS('box-shadow', 'rgba(21, 93, 252, 0.24) 0px 0px 0px 3px');
    });

    test('SC-CH-53, SC-CH-100 — ответ оператора приходит в открытый виджет без перезагрузки', async ({ page, context }): Promise<void> => {
        await page.goto(widgetPage(CHAT.widget.key));
        await unfold(page);
        await say(page, 'Вопрос оператору');
        await expect(qa(page, 'widget-message')).toHaveCount(1);

        const panel: Page = await context.newPage();

        await openSection(panel, 'chat');
        await qa(panel, 'chat-talk').first().click();
        await qa(panel, 'message-composer-input').fill('Отвечаю посетителю');
        await qa(panel, 'message-composer-send').click();
        await expect(qa(panel, 'chat-message-text').last()).toHaveText('Отвечаю посетителю');
        await panel.close();

        await expect(qa(page, 'widget-message').last()).toHaveText('Отвечаю посетителю');

        // реплика посетителя стоит у правого края ленты, ответ поддержки — у левого
        const feed: IBox | null = await qa(page, 'widget-feed').boundingBox();
        const own: IBox | null = await qa(page, 'widget-remark').first().boundingBox();
        const answer: IBox | null = await qa(page, 'widget-remark').last().boundingBox();

        expect((own?.x ?? 0) + (own?.width ?? 0)).toBeCloseTo((feed?.x ?? 0) + (feed?.width ?? 0) - 16, 0);
        expect(answer?.x ?? 0).toBeCloseTo((feed?.x ?? 0) + 16, 0);
        await expect(qa(page, 'widget-remark').last()).toContainText(/\d{2}:\d{2}/);
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

    test('SC-CH-58, SC-CH-101 — вне часов ответа реплика всё равно принята, и виджет говорит о часах', async ({ page }: { page: Page }) => {
        await page.goto(widgetPage(CHAT.widgetClosed.key));
        await unfold(page);

        // до первой реплики часы стоят в карточке приветствия
        await expect(page.locator('rt-chat-widget .greeting [qa-dataid="widget-hours"]')).toContainText('Ответим в рабочие часы');

        await say(page, 'Пишу ночью');

        await expect(qa(page, 'widget-message')).toHaveCount(1);
        // после неё — заметкой над лентой
        await expect(page.locator('rt-chat-widget .note[qa-dataid="widget-hours"]')).toContainText('Ответим в рабочие часы');
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
        await expect(qa(page, 'widget-field')).toHaveCSS('border-style', 'solid');
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
