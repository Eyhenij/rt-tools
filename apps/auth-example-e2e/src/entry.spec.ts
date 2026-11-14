import { expect, test } from '@playwright/test';

import { lateCookieProbe, PEOPLE, STAND_PASSWORD } from '../stand/stand.mjs';
import { enterOnRealmScreen, expectEntryScreen, signIn } from './support/example';

/** The address typed into the entry form by the counters scenario; no person of the stand has it. */
const TYPED_ADDRESS: string = 'nobody-typed@rt.localhost';

test.describe('the entry', () => {
    test('SC-AUTH-47 — a person enters through Keycloak and sees the records', async ({ page }) => {
        await signIn(page, 'reader');

        await expect(page.getByTestId('records-person')).toHaveText(`${PEOPLE.reader.firstName} ${PEOPLE.reader.lastName}`);
        await expect(page.getByTestId('records-empty').or(page.getByTestId('records-list'))).toBeVisible();
    });

    test('SC-AUTH-100 — the return from the entry form does not wait for the cookie probe of Keycloak', async ({ page }) => {
        const probe: Awaited<ReturnType<typeof lateCookieProbe>> = await lateCookieProbe(page);
        await page.goto('/');
        await expectEntryScreen(page);
        probe.arm();
        await enterOnRealmScreen(page, PEOPLE.reader.email, STAND_PASSWORD);

        await expect(page.getByTestId('records-person')).toBeVisible();
        expect(probe.calls()).toBe(0);
    });

    test('SC-AUTH-108, SC-AUTH-115 — a stand without numbers loads no counter, and the typed values stay out of the markup', async ({
        page,
    }) => {
        const counters: string[] = [];
        page.on('request', (request: { url(): string }): void => {
            if (/googletagmanager\.com|google-analytics\.com|mc\.yandex\.ru/.test(request.url())) {
                counters.push(request.url());
            }
        });
        await page.goto('/');
        await expectEntryScreen(page);
        // The positive half: the theme declares the property and Keycloak hands it to the page
        // empty — the stand sets no number, so the absence below is not a lost wiring.
        const properties: unknown = await page.evaluate((): unknown => Reflect.get(Reflect.get(window, 'kcContext') ?? {}, 'properties'));
        expect(properties).toMatchObject({ COUNTERS_BY_REALM: '' });
        // An address the realm does not hold: a wrong password for a person of the stand would count
        // towards the brute force lock of the realm and lock their next entries.
        await page.getByTestId('kc-username').locator('input').fill(TYPED_ADDRESS);
        await page.getByTestId('kc-password').locator('input').fill('typed-secret-1!');
        const markup: string = await page.getByTestId('kc-login-form').evaluate((form: Element): string => form.outerHTML);

        expect(markup).toContain('name="username"');
        expect(markup).not.toContain(TYPED_ADDRESS);
        expect(markup).not.toContain('typed-secret-1!');
        await page.getByTestId('kc-login-submit').click();
        // The refusal message is drawn by the page Keycloak answers the form with, so the second page
        // has loaded before the requests are counted.
        await expect(page.getByTestId('kc-message')).toBeVisible();
        expect(counters).toEqual([]);
    });

    test('SC-AUTH-117 — the entry page lets the Metrika frame in and keeps the other security headers', async ({ page }) => {
        const entryPage: Promise<{ headers(): Record<string, string> }> = page.waitForResponse(
            // The first answer of the entry address is a redirect without the security headers; the
            // page itself comes with status 200.
            (response: { url(): string; status(): number; request(): { resourceType(): string } }): boolean =>
                response.request().resourceType() === 'document' &&
                response.status() === 200 &&
                response.url().includes('/realms/rt/protocol/openid-connect/auth')
        );
        await page.goto('/');
        await expectEntryScreen(page);
        const headers: Record<string, string> = (await entryPage).headers();
        const frameSources: string[] =
            (headers['content-security-policy'] ?? '')
                .split(';')
                .map((directive: string): string => directive.trim())
                .find((directive: string): boolean => directive.startsWith('frame-src '))
                ?.split(/\s+/)
                .slice(1) ?? [];

        expect(frameSources).toEqual(["'self'", 'https://mc.yandex.ru']);
        expect(headers['content-security-policy']).toContain("frame-ancestors 'self'");
        expect(headers['x-frame-options']).toBe('SAMEORIGIN');
        expect(headers['x-content-type-options']).toBe('nosniff');
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
