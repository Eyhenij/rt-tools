import { APIResponse, expect, Page, test } from '@playwright/test';

import { ACCOUNT, PEOPLE, SECTIONS } from '../stand/stand.mjs';
import { qa, SECTION, signIn } from './support/admin';

/** Адрес экрана первой записи. Тот же, что объявляет маршрут домена входа. */
const SETUP_PATH: string = '/setup';

/**
 * Первая запись узла — на стенде с записями.
 *
 * Стенд после засева всегда держит записи, и открытый первый запуск ему не показать: экран на
 * пустом узле проверяется вызовом, спекой экрана. Здесь то, что видит человек на узле с записями:
 * адрес первой записи ведёт на вход, а прямой запрос мимо экрана отбивается закрытым запуском.
 */
test.describe('первая запись на узле с записями', () => {
    test('SC-MB-392 — адрес первой записи показывает вход, а прямой запрос отбивается', async ({ page }: { page: Page }) => {
        await page.goto(SETUP_PATH);

        await expect(qa(page, 'sign-in-submit')).toBeVisible();
        await expect(page).toHaveURL(/\/sign-in$/);
        await expect(qa(page, 'setup-submit')).toHaveCount(0);

        const answer: APIResponse = await page.request.post('/api/setup', { data: { name: 'Кто-то', password: 'тайный' } });

        expect(answer.status()).toBe(409);
        expect((await answer.json()).message).toContain('уже заведена');
    });

    test('SC-MB-394 — засеянные операциями записи впускают: и первая, и заведённая разделом людей', async ({ page }: { page: Page }) => {
        await page.goto(SECTIONS.people);
        await signIn(page, ACCOUNT);
        await expect(qa(page, SECTION.people.table)).toBeVisible();

        await expect(page.locator(`[qa-dataid="${SECTION.people.row}"]`).filter({ hasText: PEOPLE.roleless.name })).toHaveCount(1);
    });
});
