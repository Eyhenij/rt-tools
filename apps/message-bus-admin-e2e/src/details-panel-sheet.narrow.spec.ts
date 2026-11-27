import { expect, Locator, Page, test } from '@playwright/test';

import { openSection, qa } from './support/admin';

/**
 * Панель записи на телефоне — шторка во всю высоту.
 *
 * До 480 точек правая панель рамки кита поднимается снизу нижней шторкой во всю высоту, а не
 * выезжает сбоку. Проверяется по засеянному стенду тем же путём, каким идёт человек: нажать
 * карточку записи, увидеть шторку с «×», закрыть её «×» и вернуться к списку.
 */
test.describe('панель записи шторкой на телефоне', () => {
    test('SC-UKV-1804, SC-UKV-1816 — панель записи поднимается шторкой во всю высоту, «×» её закрывает', async ({
        page,
    }: {
        page: Page;
    }) => {
        await openSection(page, 'postmortems');

        await qa(page, 'table-card').first().click();

        const panel: Locator = page.locator('rt-aside [qa-dataid="bottom-sheet-panel"]');
        const close: Locator = panel.locator('[qa-dataid="aside-sheet-close"]');

        await expect(panel).toBeVisible();
        await expect(close).toBeVisible();
        await expect(qa(page, 'postmortem-details-header').locator('[qa-dataid="aside-title"]')).not.toHaveText('');

        // шторка встаёт к нижнему краю окна во всю его ширину и почти во всю высоту — над ней
        // остаётся только полоса; ждётся, пока она доедет
        const viewport: { width: number; height: number } = page.viewportSize() ?? { width: 0, height: 0 };

        await expect
            .poll(async (): Promise<number> => {
                const box: { y: number; height: number } = (await panel.boundingBox()) ?? { y: 0, height: 0 };

                return Math.round(box.y + box.height);
            })
            .toBe(viewport.height);

        const box: { x: number; width: number; height: number } = (await panel.boundingBox()) ?? {
            x: 0,
            width: 0,
            height: 0,
        };

        expect(Math.round(box.x)).toBe(0);
        expect(Math.round(box.width)).toBe(viewport.width);
        expect(box.height).toBeGreaterThan(viewport.height * 0.9);

        await close.click();

        await expect(panel).toHaveCount(0);
        await expect(page).toHaveURL(/\/postmortems$/);
    });
});
