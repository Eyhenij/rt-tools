import { expect, Page, test } from '@playwright/test';

import { ENROLLED_SLUG, INVITES } from '../stand/stand.mjs';
import { columnTexts, openSection, pageQa, qa, rowsOf, SECTION } from './support/admin';

/**
 * Раздел приглашений: то, что владелец видит и делает, проверяется нажатиями.
 *
 * Приглашение — то, чем дерево заводит себя само, и разница между его состояниями видна только
 * на экране: код приглашения не показывается никогда, а отзыв доступен одному ждущему. Юнит
 * экрана проверяет ту же логику вызовом, но между верным решением и тем, что человек его видит,
 * лежит вся отрисовка — здесь она и проверяется.
 *
 * Стенд засевает по одному приглашению на каждое состояние: ждущее, погашенное, отозванное и
 * просроченное.
 */
test.describe('раздел приглашений', () => {
    test('SC-MB-128 — список называет имя, состояние и сроки, а кода приглашения на экране нет', async ({ page }: { page: Page }) => {
        await openSection(page, 'invites');

        await expect(page.getByRole('heading', { name: SECTION.invites.title })).toBeVisible();
        await expect(rowsOf(page, 'invites')).toHaveCount(4);
        await expect(pageQa(page, 'invites', 'columns')).toBeVisible();

        const names: string[] = await columnTexts(page, 'invites-cell-name');
        const states: string[] = await columnTexts(page, 'invites-cell-state');

        expect(new Set(names)).toEqual(new Set(Object.values(INVITES)));
        expect(new Set(states)).toEqual(new Set(['Ждёт', 'Погашено', 'Отозвано', 'Просрочено']));

        // Сроки показаны днём и минутами в поясе смотрящего, а не строкой ответа приёмника
        for (const issued of await columnTexts(page, 'invites-cell-issued')) {
            expect(issued).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/);
        }

        // Отбора по дереву у раздела нет: приглашение ждёт дерева, которого ещё нет
        await expect(qa(page, 'list-tree-filter')).toHaveCount(0);
    });

    test('SC-MB-134 — раздел без своего отбора левого слота тулбара не занимает', async ({ page }: { page: Page }) => {
        await openSection(page, 'invites');

        // сперва положительное: тулбар раздела найден, и правая его часть на месте
        await expect(pageQa(page, 'invites', 'refresh')).toBeVisible();
        // и только потом отрицательное: пустой половины тулбара на экране нет вовсе
        await expect(page.locator('[qa-dataid="toolbar-bar"][data-slot="left"]')).toHaveCount(0);
    });

    test('SC-MB-128 — погашенное приглашение остаётся в списке и называет заведённое им дерево', async ({ page }: { page: Page }) => {
        await openSection(page, 'invites');

        const row: ReturnType<Page['locator']> = page.locator(`[qa-dataid="${SECTION.invites.row}"]`).filter({ hasText: INVITES.redeemed });

        await expect(row.locator('[qa-dataid="invites-cell-state"]')).toHaveText('Погашено');
        await expect(row.locator('[qa-dataid="invites-cell-tree"]')).toHaveText(ENROLLED_SLUG);
    });

    test('SC-MB-120 — отзыв доступен ждущему приглашению и никакому другому', async ({ page }: { page: Page }) => {
        await openSection(page, 'invites');

        const waiting: ReturnType<Page['locator']> = page
            .locator(`[qa-dataid="${SECTION.invites.row}"]`)
            .filter({ hasText: INVITES.waiting });
        const revoked: ReturnType<Page['locator']> = page
            .locator(`[qa-dataid="${SECTION.invites.row}"]`)
            .filter({ hasText: INVITES.revoked });

        // Ячейка действий показывается по наведению на строку — тем же движением, каким её
        // открывает человек
        await waiting.hover();

        await expect(waiting.locator('[qa-dataid="menu-trigger"]')).toBeVisible();
        await expect(revoked.locator('[qa-dataid="menu-trigger"]')).toHaveCount(0);
    });

    test('SC-MB-120, SC-MB-153 — отзыв спрашивает согласия, снимает приглашение из ждущих и говорит об этом одним тостом', async ({
        page,
    }: {
        page: Page;
    }) => {
        await openSection(page, 'invites');

        const waiting: ReturnType<Page['locator']> = page
            .locator(`[qa-dataid="${SECTION.invites.row}"]`)
            .filter({ hasText: INVITES.waiting });

        await waiting.hover();
        await waiting.locator('[qa-dataid="menu-trigger"] button').click();
        await qa(page, 'invites-revoke').click();

        // Вопрос называет дерево и последствие, а не спрашивает «вы уверены»
        await expect(qa(page, 'menu-confirm-message')).toContainText(INVITES.waiting);

        await qa(page, 'menu-confirm-cancel').click();

        // Отменённый отзыв ничего не меняет, а меню под закрытой модалкой остаётся открытым —
        // так его оставляет сам кит, чтобы пункт пережил решение человека
        await expect(waiting.locator('[qa-dataid="invites-cell-state"]')).toHaveText('Ждёт');

        await qa(page, 'invites-revoke').click();
        await qa(page, 'menu-confirm-accept').click();

        await expect(waiting.locator('[qa-dataid="invites-cell-state"]')).toHaveText('Отозвано');
        await expect(waiting.locator('[qa-dataid="menu-trigger"]')).toHaveCount(0);

        // Стопка тостов на странице одна — та, что рисует каркас, — и тост об исходе в ней один:
        // вторая стопка показывала бы тот же тост второй раз и в другом углу экрана
        await expect(page.locator('rt-toaster')).toHaveCount(1);
        await expect(qa(page, 'toast')).toHaveCount(1);
        await expect(qa(page, 'toast-message')).toContainText('отозвано');
    });
});
