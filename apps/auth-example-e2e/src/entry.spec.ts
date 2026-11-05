import { expect, Route, test } from '@playwright/test';

import { PEOPLE, STAND_PASSWORD } from '../stand/stand.mjs';
import { enterOnRealmScreen, expectEntryScreen, signIn } from './support/example';

test.describe('the entry', () => {
    test('SC-AUTH-47 — a person enters through Keycloak and sees the records', async ({ page }) => {
        await signIn(page, 'reader');

        await expect(page.getByTestId('records-person')).toHaveText(`${PEOPLE.reader.firstName} ${PEOPLE.reader.lastName}`);
        await expect(page.getByTestId('records-empty').or(page.getByTestId('records-list'))).toBeVisible();
    });

    test('SC-AUTH-97 — the return from the entry form does not wait for the cookie probe of Keycloak', async ({ page }) => {
        let returned: boolean = false;
        let probesAfterReturn: number = 0;
        // A probe that answers late on the return would cut the exchange of the code by the limit.
        await page.route('**/3p-cookies/step1.html', async (route: Route): Promise<void> => {
            if (returned) {
                probesAfterReturn += 1;
                await new Promise<void>((resolve: () => void): void => void setTimeout(resolve, 6_000));
            }
            await route.continue();
        });
        await page.goto('/');
        await expectEntryScreen(page);
        returned = true;
        await enterOnRealmScreen(page, PEOPLE.reader.email, STAND_PASSWORD);

        await expect(page.getByTestId('records-person')).toBeVisible({ timeout: 4_000 });
        expect(probesAfterReturn).toBe(0);
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
