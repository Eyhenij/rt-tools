import { expect, test } from '@playwright/test';

import { PEOPLE } from '../stand/stand.mjs';
import { enterOnRealmScreen, expectEntryScreen, signIn } from './support/example';

test.describe('the entry', () => {
    test('SC-AUTH-47 — a person enters through Keycloak and sees the records', async ({ page }) => {
        await signIn(page, 'reader');

        await expect(page.getByTestId('records-person')).toHaveText(`${PEOPLE.reader.firstName} ${PEOPLE.reader.lastName}`);
        await expect(page.getByTestId('records-empty').or(page.getByTestId('records-list'))).toBeVisible();
    });

    test('SC-AUTH-48 — a wrong password keeps the person on the entry screen', async ({ page }) => {
        await page.goto('/');
        await enterOnRealmScreen(page, PEOPLE.reader.email, 'not-the-password');

        await expectEntryScreen(page);
        await expect(page.getByTestId('kc-message')).toBeVisible();
        await expect(page.getByTestId('records-person')).toHaveCount(0);
    });

    test('SC-AUTH-50 — sign out ends the session in Keycloak', async ({ page }) => {
        await signIn(page, 'reader');

        await page.getByTestId('records-sign-out').click();
        await expectEntryScreen(page);
        await page.goto('/');

        await expectEntryScreen(page);
    });
});
