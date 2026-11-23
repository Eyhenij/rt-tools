import { expect, Locator, Page, test } from '@playwright/test';

import { expectEntryScreen } from './support/example';

/**
 * The language choice of the entry page and the width service of the kit.
 *
 * The choice is a kit select: its panel asks the width service whether the window is a phone and
 * opens in the bottom sheet there, next to the field elsewhere. The page of the realm is the one
 * screen of this suite that draws a kit select, so the width service is walked here.
 */

/** The panel of the choice opened in the bottom sheet. */
function sheetOf(page: Page): Locator {
    return page.locator('[qa-dataid="popover-sheet"] [qa-dataid="bottom-sheet-panel"]');
}

/** Opens the entry page of the realm and the language choice on it. */
async function openLocales(page: Page): Promise<void> {
    await page.goto('/');
    await expectEntryScreen(page);
    await page.getByTestId('kc-locales').getByTestId('select-trigger').click();
}

test.describe('the language choice of the entry page', () => {
    test('SC-UKV-1608 — on a phone the panel opens in the bottom sheet', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await openLocales(page);

        await expect(sheetOf(page)).toBeVisible();
        await expect(sheetOf(page).getByTestId('select-option').first()).toBeVisible();
    });

    test('SC-UKV-1610 — wider than a phone the panel opens next to the trigger', async ({ page }) => {
        await openLocales(page);

        await expect(page.getByTestId('select-option').first()).toBeVisible();
        await expect(page.locator('[qa-dataid="popover-sheet"]')).toHaveCount(0);
    });
});
