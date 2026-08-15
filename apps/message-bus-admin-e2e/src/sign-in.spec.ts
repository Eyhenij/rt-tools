import { BrowserContext, expect, Page, test } from '@playwright/test';

import { ACCOUNT } from '../stand/stand.mjs';
import { openSection, qa, SECTION, SIGN_IN_PATH, signIn } from './support/admin';

/**
 * Вход в админку и адреса разделов.
 *
 * Проверяется то, что видит человек: закрытый адрес уводит его на вход, вход возвращает туда,
 * куда он шёл, а раздел переживает перезагрузку страницы. Серверную сторону всего этого держат
 * спеки приёмника — здесь она не повторяется, здесь смотрят на экран.
 */
test.describe('вход и адреса разделов', () => {
    test('SC-MB-44 — прямой адрес раздела без входа ведёт на вход', async ({ page }: { page: Page }) => {
        await page.goto(SECTION.postmortems.path);

        await expect(page).toHaveURL(new RegExp(`${SIGN_IN_PATH}\\b`));
        await expect(qa(page, 'sign-in-submit')).toBeVisible();
        await expect(qa(page, SECTION.postmortems.table)).toHaveCount(0);
    });

    test('SC-MB-45 — после входа человек попадает туда, куда шёл', async ({ page }: { page: Page }) => {
        await page.goto(SECTION.summaries.path);
        await signIn(page);

        await expect(page).toHaveURL(new RegExp(`${SECTION.summaries.path}$`));
        await expect(page.getByRole('heading', { name: SECTION.summaries.title })).toBeVisible();
    });

    test('SC-MB-33 — вход по годной паре открывает админку', async ({ page }: { page: Page }) => {
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

        // Вход обрывается со стороны браузера — так же, как он обрывается сроком: приёмник
        // видит запрос без входа, а человек обязан увидеть экран входа, а не отказ на пустом
        // разделе
        await context.clearCookies();
        await page.reload();

        await expect(page).toHaveURL(new RegExp(`${SIGN_IN_PATH}\\b`));
        await expect(qa(page, 'sign-in-submit')).toBeVisible();
    });

    test('SC-MB-34, SC-MB-35 — неверная пара и незнакомое имя отбиваются одним и тем же текстом', async ({ page }: { page: Page }) => {
        const refusalOf: (name: string, password: string) => Promise<string> = async (name: string, password: string): Promise<string> => {
            await page.goto(SIGN_IN_PATH);
            await qa(page, 'sign-in-name').locator('input').fill(name);
            await qa(page, 'sign-in-password').locator('input').fill(password);
            await qa(page, 'sign-in-submit').click();
            await expect(qa(page, 'sign-in-fault')).toBeVisible();

            return ((await qa(page, 'sign-in-fault').textContent()) ?? '').trim();
        };

        const wrongPassword: string = await refusalOf(ACCOUNT.name, 'не тот пароль');
        const unknownName: string = await refusalOf('Такой записи нет', ACCOUNT.password);

        expect(wrongPassword).not.toBe('');
        expect(unknownName).toBe(wrongPassword);
        await expect(page).toHaveURL(new RegExp(`${SIGN_IN_PATH}\\b`));
    });
});
