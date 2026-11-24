import { expect, Locator, test } from '@playwright/test';

import { expectEntryScreen } from './support/example';

/** A window of a phone width: the kit opens the list of a field as a bottom sheet up to 480. */
const PHONE: { width: number; height: number } = { width: 390, height: 844 };

test.describe('the language list on a phone', () => {
    test.use({ viewport: PHONE });

    test('SC-AUTH-121 — on a phone the language list is a bottom sheet that closes by its close button', async ({ page }) => {
        await page.goto('/');
        await expectEntryScreen(page);

        const address: string = page.url();
        const languages: Locator = page.getByTestId('kc-locales');

        await languages.getByTestId('select-trigger').click();

        // The sheet lies in the overlay, outside the field: its parts are looked for on the page
        const close: Locator = page.getByTestId('bottom-sheet-close');
        const options: Locator = page.getByTestId('select-option');

        await expect(close).toBeVisible();
        await expect(options).toHaveCount(2);
        await expect(page.locator('.rt-select__panel--cards')).toBeVisible();

        await close.click();

        await expect(options.first()).toBeHidden();
        await expect(page.getByTestId('kc-login-form')).toBeVisible();
        expect(page.url()).toBe(address);
    });
});
