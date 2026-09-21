import { APIRequestContext, APIResponse, expect, Page, test } from '@playwright/test';

import { ADMIN_ORIGIN, CHAT, FOREIGN_PAGE_ORIGIN } from '../stand/stand.mjs';
import { qa } from './support/admin';

/**
 * Страница чужого адреса разговаривает с сервисом.
 *
 * Страница поднята своим портом, и для браузера её адрес и адрес сервиса — разные: без позволения
 * он не доносит до неё ни одного ответа. Позволение даёт приёмник по списку адресов площадки, и
 * адрес этой страницы стоит в списке только у площадки виджета.
 *
 * Набор идёт файлами по имени, и этот стоит после спеки раздела чата намеренно: он заводит
 * переписку на площадке, за которую отвечает оператор набора, а раздел считает засеянные.
 *
 * Заголовки позволения читаются обращением прогонщика, а не браузера: браузер отвергнутый ответ не
 * показывает вовсе, и по его молчанию причину не назвать.
 */

/** Заголовок позволения в ответе сервиса. Пусто — позволения нет, и браузер ответ не донесёт. */
function permission(answer: APIResponse): string {
    return answer.headers()['access-control-allow-origin'] ?? '';
}

/** Открытая операция чата, которую зовёт виджет первой: чем живёт площадка и что она говорит. */
function siteUrl(key: string): string {
    return `${ADMIN_ORIGIN}/api/chat/site?site=${encodeURIComponent(key)}`;
}

test.describe('чат с чужого адреса', () => {
    test('SC-CH-74, SC-CH-77 — адрес из списка площадки получает позволение, и названо в нём его имя', async ({
        request,
    }: {
        request: APIRequestContext;
    }) => {
        const answer: APIResponse = await request.get(siteUrl(CHAT.widget.key), { headers: { origin: FOREIGN_PAGE_ORIGIN } });

        expect(answer.status()).toBe(200);
        expect(permission(answer)).toBe(FOREIGN_PAGE_ORIGIN);
    });

    test('SC-CH-75 — адрес, которого нет ни в одном списке, позволения не получает', async ({
        request,
    }: {
        request: APIRequestContext;
    }) => {
        const answer: APIResponse = await request.get(siteUrl(CHAT.widget.key), { headers: { origin: 'https://nobody.example' } });

        // Позволения нет, и сама операция такой адрес тоже не принимает: список у них один. Пара
        // к этому отсутствию — проба выше: тот же адрес операции с адресом из списка отвечает
        // и позволением, и грузом.
        expect(permission(answer)).toBe('');
        expect(answer.status()).toBe(403);
    });

    test('SC-CH-76 — предварительный запрос браузера отвечается тем же списком', async ({ request }: { request: APIRequestContext }) => {
        const asked: APIResponse = await request.fetch(siteUrl(CHAT.widget.key), {
            method: 'OPTIONS',
            headers: { origin: FOREIGN_PAGE_ORIGIN, 'access-control-request-method': 'POST' },
        });

        expect(asked.status()).toBe(204);
        expect(permission(asked)).toBe(FOREIGN_PAGE_ORIGIN);
        expect(asked.headers()['access-control-allow-methods'] ?? '').toContain('POST');

        const refused: APIResponse = await request.fetch(siteUrl(CHAT.widget.key), {
            method: 'OPTIONS',
            headers: { origin: 'https://nobody.example', 'access-control-request-method': 'POST' },
        });

        expect(refused.status()).toBe(204);
        expect(permission(refused)).toBe('');
    });

    test('SC-CH-79 — посетитель чужой страницы пишет реплику, и она встаёт в ленту', async ({ page }: { page: Page }) => {
        await page.goto(`${FOREIGN_PAGE_ORIGIN}/?site=${encodeURIComponent(CHAT.widget.key)}`);

        await qa(page, 'widget-bubble').click();

        // приветствие приехало обращением через имена: без позволения браузер его не донёс бы
        await expect(qa(page, 'widget-greeting')).toHaveText(CHAT.widget.greeting);

        await qa(page, 'widget-text').fill('Пишу с чужой страницы');
        await qa(page, 'widget-send').click();

        await expect(qa(page, 'widget-message')).toHaveCount(1);
        await expect(qa(page, 'widget-message')).toHaveText('Пишу с чужой страницы');
    });
});
