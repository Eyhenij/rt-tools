import { BrowserContext, expect, Page, test } from '@playwright/test';

import { ACCOUNT, STAND_PASSWORD } from '../stand/stand.mjs';
import { enterOnRealmScreen, expectRealmScreen, openSection, qa, SECTION, signIn } from './support/admin';

/**
 * Вход в админку и адреса разделов.
 *
 * Проверяется то, что видит человек: закрытый адрес уводит его на форму Keycloak, вход возвращает туда,
 * куда он шёл, а раздел переживает перезагрузку страницы. Серверную сторону всего этого держат
 * спеки приёмника — здесь она не повторяется, здесь смотрят на экран.
 */
test.describe('вход и адреса разделов', () => {
    test('SC-MB-44 — прямой адрес раздела без входа ведёт на вход', async ({ page }: { page: Page }) => {
        await page.goto(SECTION.postmortems.path);

        await expectRealmScreen(page);
        await expect(qa(page, SECTION.postmortems.table)).toHaveCount(0);
    });

    test('SC-MB-45 — после входа человек попадает туда, куда шёл', async ({ page }: { page: Page }) => {
        await page.goto(SECTION.summaries.path);
        await signIn(page);

        await expect(page).toHaveURL(new RegExp(`${SECTION.summaries.path}$`));
        await expect(page.getByRole('heading', { name: SECTION.summaries.title })).toBeVisible();
    });

    test('SC-MB-33 — вход в Keycloak открывает админку', async ({ page }: { page: Page }) => {
        await page.goto('/');
        await signIn(page);

        await expect(page).toHaveURL(new RegExp(`${SECTION.postmortems.path}$`));
        await expect(page.getByRole('heading', { name: SECTION.postmortems.title })).toBeVisible();
        await expect(qa(page, SECTION.postmortems.row).first()).toBeVisible();
    });

    test('SC-MB-46 — адрес раздела переживает перезагрузку', async ({ page }: { page: Page }) => {
        await openSection(page, 'proposals');

        await page.reload();

        await expect(page).toHaveURL(new RegExp(`${SECTION.proposals.path}$`));
        await expect(page.getByRole('heading', { name: SECTION.proposals.title })).toBeVisible();
        await expect(qa(page, SECTION.proposals.row).first()).toBeVisible();
    });

    test('SC-MB-37 — просроченный вход перестаёт приниматься', async ({ page, context }: { page: Page; context: BrowserContext }) => {
        await openSection(page, 'postmortems');

        // Вход в Keycloak обрывается со стороны браузера — так же, как он обрывается сроком:
        // перезагруженная админка не находит входа и обязана увести на форму области, а не
        // показать отказ на пустом разделе
        await context.clearCookies();
        await page.reload();

        await expectRealmScreen(page);
        await expect(qa(page, SECTION.postmortems.table)).toHaveCount(0);
    });

    test('SC-MB-34, SC-MB-35 — неверный пароль и незнакомый адрес отбиваются одним и тем же текстом', async ({ page }: { page: Page }) => {
        const refusalOf: (email: string, password: string) => Promise<string> = async (
            email: string,
            password: string
        ): Promise<string> => {
            await page.goto('/');
            await enterOnRealmScreen(page, email, password);
            await expect(qa(page, 'kc-message')).toBeVisible();

            return ((await qa(page, 'kc-message').textContent()) ?? '').trim();
        };

        const wrongPassword: string = await refusalOf(ACCOUNT.email, 'не тот пароль');
        const unknownAddress: string = await refusalOf('nobody@stand.example', STAND_PASSWORD);

        expect(wrongPassword).not.toBe('');
        expect(unknownAddress).toBe(wrongPassword);
        await expectRealmScreen(page);
    });
});
