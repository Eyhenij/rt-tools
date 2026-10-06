import { expect, Page } from '@playwright/test';

import { KEYCLOAK_ORIGIN, PEOPLE, STAND_PASSWORD } from '../../stand/stand.mjs';

/** A person of the stand, by the role the specs give them. */
export type TPersonName = keyof typeof PEOPLE;

/** The entry screen of the realm: the admin sent the person to Keycloak. */
export async function expectEntryScreen(page: Page): Promise<void> {
    await expect(page).toHaveURL((url: URL): boolean => url.origin === KEYCLOAK_ORIGIN);
    await expect(page.getByTestId('kc-login-form')).toBeVisible();
}

/** Fills the entry form of the realm and sends it. */
export async function enterOnRealmScreen(page: Page, email: string, password: string): Promise<void> {
    await expectEntryScreen(page);
    await page.getByTestId('kc-username').locator('input').fill(email);
    await page.getByTestId('kc-password').locator('input').fill(password);
    await page.getByTestId('kc-login-submit').click();
}

/** Opens the admin as the person: the admin sends them to Keycloak, and Keycloak returns them. */
export async function signIn(page: Page, name: TPersonName): Promise<void> {
    await page.goto('/');
    await enterOnRealmScreen(page, PEOPLE[name].email, STAND_PASSWORD);
    await expect(page.getByTestId('records-person')).toBeVisible();
}
