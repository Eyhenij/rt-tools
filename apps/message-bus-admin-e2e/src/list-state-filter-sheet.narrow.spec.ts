import { expect, Locator, Page, test } from '@playwright/test';

import { openSection, qa } from './support/admin';

/** Слово состояния, которое выбирается в шторке: то же, что человек читает в отборе. */
const IN_WORK: string = 'В работе';

/**
 * Отбор по состоянию на телефоне.
 *
 * На узком экране список выбора кита открывается нижней шторкой, а не панелью у поля: панель у
 * поля на телефоне закрывает половину экрана и уезжает за его край. Проверяется по засеянному
 * стенду тем же путём, каким идёт человек: нажать отбор, увидеть шторку, выбрать состояние.
 */
test.describe('отбор по состоянию в шторке', () => {
    test('SC-UKV-1608, SC-UKV-1555 — на телефоне список отбора открывается шторкой, и выбор закрывает её', async ({
        page,
    }: {
        page: Page;
    }) => {
        await openSection(page, 'postmortems');

        await qa(page, 'list-state-filter').click();

        // панель шторки: у самого блока шторки своего прямоугольника нет
        const sheet: Locator = page.locator('[qa-dataid="popover-sheet"] [qa-dataid="bottom-sheet-panel"]');

        await expect(sheet).toBeVisible();
        await expect(sheet.getByRole('option', { name: IN_WORK, exact: true })).toBeVisible();

        // шторка встаёт к нижнему краю окна, а не у поля; ждётся, пока она доедет
        const viewport: number = page.viewportSize()?.height ?? 0;

        await expect
            .poll(async (): Promise<number> => {
                const box: { y: number; height: number } = (await sheet.boundingBox()) ?? { y: 0, height: 0 };

                return Math.round(box.y + box.height);
            })
            .toBe(viewport);

        await sheet.getByRole('option', { name: IN_WORK, exact: true }).click();

        await expect(sheet).toBeHidden();
        await expect(qa(page, 'list-state-filter')).toContainText(IN_WORK);
    });
});
