import { APIRequestContext, expect, Locator, Page, test } from '@playwright/test';
import { createHmac } from 'node:crypto';

import { ADMIN_ORIGIN, CHAT } from '../stand/stand.mjs';

import { openSection, qa } from './support/admin';

/**
 * Что сервис говорит приложению площадки.
 *
 * Приложение поднимает сама раздача стенда: чужой узел в наборе проверял бы сеть между машинами,
 * а не дерево. Вызовы копятся у неё списком, и набор читает его обычным чтением.
 *
 * Подпись сверяется так же, как её сверяло бы настоящее приложение: тайна площадки известна
 * засеву, и вызов, подписанный чем-то другим, тем и отличается.
 *
 * Набор идёт файлами по имени, и этот стоит после спеки раздела чата намеренно: он заводит
 * разговоры на площадке оператора набора, а та спека считает засеянные. Встав раньше, он менял
 * бы её счёт — и падала бы она, а не он.
 */

/** Один вызов, как его принял стенд. */
interface IHookCall {
    readonly body: string;
    readonly signature: string;
}

/** Тело вызова разобранным: род события, площадка и переписка. */
interface IHookBody {
    readonly kind: string;
    readonly site: string;
    readonly conversationId: string;
}

/** Что приложению площадки уже сказали. */
async function saidCalls(request: APIRequestContext): Promise<IHookCall[]> {
    // адрес назван целиком: прогон идёт на машине, а адрес страниц набора — имя образа
    const answer: Awaited<ReturnType<APIRequestContext['get']>> = await request.get(`${ADMIN_ORIGIN}${CHAT.hook.path}`);

    return answer.json() as Promise<IHookCall[]>;
}

/** Дождаться вызова названного рода: он уходит вслед за ответом, а не вместе с ним. */
async function waitCall(request: APIRequestContext, kind: string): Promise<IHookCall> {
    let found: IHookCall | undefined;

    await expect
        .poll(
            async (): Promise<boolean> => {
                const calls: IHookCall[] = await saidCalls(request);

                found = calls.find((call: IHookCall): boolean => (JSON.parse(call.body) as IHookBody).kind === kind);

                return Boolean(found);
            },
            { timeout: 10_000 }
        )
        .toBe(true);

    return found as IHookCall;
}

test.describe('вызовы наружу', () => {
    test('SC-CH-62, SC-CH-64 — принятая реплика уходит в приложение площадки подписанным вызовом', async ({ page, request }) => {
        await page.goto(`/widget-page?site=${encodeURIComponent(CHAT.widget.key)}`);
        await qa(page, 'widget-bubble').click();
        await qa(page, 'widget-text').fill('Реплика, о которой узнает приложение');
        await qa(page, 'widget-send').click();
        await expect(qa(page, 'widget-message')).toHaveCount(1);

        const call: IHookCall = await waitCall(request, 'remark');
        const body: IHookBody = JSON.parse(call.body) as IHookBody;

        expect(body.site).toBe(CHAT.widget.key);
        expect(body.conversationId).toBeTruthy();
        // подпись считается тайной площадки по телу целиком — так её сверяет и приложение
        expect(call.signature).toBe(createHmac('sha256', CHAT.hook.secret).update(call.body).digest('hex'));
    });

    test('SC-CH-65 — закрытие переписки оператором уходит в приложение площадки', async ({ page, request }) => {
        await page.goto(`/widget-page?site=${encodeURIComponent(CHAT.widget.key)}`);
        await qa(page, 'widget-bubble').click();
        await qa(page, 'widget-text').fill('Разговор, который закроют');
        await qa(page, 'widget-send').click();
        await expect(qa(page, 'widget-message')).toHaveCount(1);

        const panel: Page = await page.context().newPage();

        await openSection(panel, 'chat');
        await qa(panel, 'chat-talk').first().click();
        // действие подробностей закрывает живой разговор и после закрытия зовёт открыть его снова
        const action: Locator = qa(panel, 'workspace-details-action');

        await expect(action).toHaveText('Закрыть разговор');
        await action.click();
        await expect(action).toHaveText('Открыть снова');
        await panel.close();

        const body: IHookBody = JSON.parse((await waitCall(request, 'closing')).body) as IHookBody;

        expect(body.site).toBe(CHAT.widget.key);
        expect(body.conversationId).toBeTruthy();
    });
});
