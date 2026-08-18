import { expect, Locator, Page, test } from '@playwright/test';

import { openSection, pageQa, qa, SECTION } from './support/admin';
import { expectScreen } from './support/shot';

/**
 * Настройка столбцов: убранный столбец переживает уход в другой раздел и возвращение.
 *
 * Панель настройки везёт кит, а помнит выбор он же — по признаку таблицы. Признак у каждого
 * раздела свой, и это здесь и проверяется: убранное в одном разделе не касается соседнего.
 */

/** Строка настройки одного столбца: у неё стоит ключ столбца и кнопка «показывать или нет». */
function settingsRow(page: Page, key: string): Locator {
    return page.locator(`[qa-dataid="table-settings-row"][data-key="${key}"]`);
}

/** Убрать столбец и сохранить выбор. */
async function hideColumn(page: Page, key: string): Promise<void> {
    const columns: Locator = pageQa(page, 'postmortems', 'columns');

    await columns.click();
    await expect(qa(page, 'table-settings-list')).toBeVisible();

    await expectScreen(page, 'columns-panel');

    await settingsRow(page, key).locator('[qa-dataid="table-settings-toggle"]').click();
    await qa(page, 'table-settings-save').click();

    await expect(qa(page, 'table-settings-list')).toHaveCount(0);
}

test.describe('настройка столбцов', () => {
    test('SC-MB-67 — выбор столбцов переживает возвращение в раздел', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        await expect(qa(page, 'postmortems-cell-updated').first()).toBeVisible();

        await hideColumn(page, 'updatedAt');

        await expect(qa(page, 'postmortems-cell-updated')).toHaveCount(0);
        await expect(qa(page, 'postmortems-cell-file').first()).toBeVisible();

        // уход в соседний раздел: у него свой признак таблицы, и убранное здесь его не касается
        await page.goto(SECTION.proposals.path);
        await expect(qa(page, SECTION.proposals.table)).toBeVisible();
        await expect(qa(page, 'proposals-cell-arrived').first()).toBeVisible();

        await page.goto(SECTION.postmortems.path);
        await expect(qa(page, SECTION.postmortems.table)).toBeVisible();

        await expect(qa(page, 'postmortems-cell-updated')).toHaveCount(0);
        await expect(qa(page, 'postmortems-cell-file').first()).toBeVisible();

        // и обратно: столбец возвращается тем же путём, каким был убран
        const columns: Locator = pageQa(page, 'postmortems', 'columns');

        await columns.click();
        await settingsRow(page, 'updatedAt').locator('[qa-dataid="table-settings-toggle"]').click();
        await qa(page, 'table-settings-save').click();

        await expect(qa(page, 'postmortems-cell-updated').first()).toBeVisible();
    });
});
