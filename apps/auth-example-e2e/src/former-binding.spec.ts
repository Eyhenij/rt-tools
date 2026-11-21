import { expect, Locator, test } from '@playwright/test';

import { signIn } from './support/example';

/** A mark of this run: the stand keeps records between runs, and a search by it finds only this run's. */
const RUN: string = `former-binding-${Date.now()}`;

/** Titles no other test of the suite adds. */
const TITLES: readonly string[] = [`${RUN} first`, `${RUN} second`];

test.describe('a field of the set on the former binding', () => {
    test('SC-UKV-1600 — the title field takes typing and the reset of the form twice in a row', async ({ page }) => {
        await signIn(page, 'editor');
        const field: Locator = page.getByTestId('records-new-title').locator('input');

        for (const title of TITLES) {
            await field.fill(title);
            await page.getByTestId('records-new-submit').click();

            await expect(page.getByTestId('records-item').filter({ hasText: title })).toBeVisible();
            await expect(field).toHaveValue('');
        }

        await expect(page.getByTestId('records-item').filter({ hasText: RUN })).toHaveCount(TITLES.length);
    });
});
