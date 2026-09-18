import { expect, Locator, Page, test } from '@playwright/test';

import { qa, SECTION, SIGN_IN_PATH, signIn } from './support/admin';
import { expectScreen } from './support/shot';

/**
 * Экран входа: тема, язык и поля.
 *
 * Вход — единственный экран, где человек оказывается до попапа профиля, и выбранное здесь он
 * уносит с собой внутрь: тёмная тема остаётся тёмной, английские подписи кита — английскими.
 * Проверяется это нажатиями, а не вызовом: обещание тут — то, что человек видит.
 */
test.describe('тема и язык на экране входа', () => {
    test('SC-MB-148 — тема переключается на входе и остаётся тёмной после входа', async ({ page }: { page: Page }) => {
        await page.goto(SIGN_IN_PATH);
        await expect(qa(page, 'sign-in-submit')).toBeVisible();

        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

        await qa(page, 'sign-in-theme').locator('button').click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

        await expectScreen(page, 'sign-in-dark');

        await signIn(page);
        await expect(qa(page, SECTION.postmortems.table)).toBeVisible();

        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    });

    test('SC-MB-149 — язык, выбранный на входе, меняет подписи кита, а заголовки остаются русскими', async ({ page }: { page: Page }) => {
        await page.goto(SIGN_IN_PATH);
        await expect(qa(page, 'sign-in-submit')).toBeVisible();

        await qa(page, 'sign-in-language').locator('[qa-dataid="toggle-button-group-option"][data-value="en"]').click();

        await signIn(page);
        await expect(qa(page, SECTION.postmortems.table)).toBeVisible();

        // Подписи кита идут на выбранном языке, а название раздела приходит из словаря админки
        await expect(page.locator('.rt-pagination__per-page-label')).toHaveText(/Per page/);
        await expect(page.getByRole('heading', { name: SECTION.postmortems.title })).toBeVisible();
    });

    test('SC-MB-406 — на английском выборе в карточке входа нет ни одного русского слова', async ({ page }: { page: Page }) => {
        await page.goto(SIGN_IN_PATH);
        await expect(qa(page, 'sign-in-submit')).toBeVisible();

        const card: Locator = page.locator('.login__card');
        const cyrillic: RegExp = /[А-Яа-яЁё]/;

        // Сначала положительная половина: карточка найдена и на русском выборе говорит по-русски.
        // Без неё проба осталась бы зелёной и на переименованном блоке — искать было бы негде.
        expect(cyrillic.test((await card.innerText()) ?? '')).toBe(true);

        await qa(page, 'sign-in-language').locator('[qa-dataid="toggle-button-group-option"][data-value="en"]').click();
        await expect(qa(page, 'sign-in-title')).toHaveText('Admin sign-in');

        expect(cyrillic.test((await card.innerText()) ?? '')).toBe(false);

        // Подсказки внутри полей текстом не читаются — их берём атрибутом
        await expect(qa(page, 'sign-in-name').locator('input')).toHaveAttribute('placeholder', 'The name of a project or of the owner');
        await expect(qa(page, 'sign-in-password').locator('input')).toHaveAttribute('placeholder', 'The password of the account');
    });

    test('SC-MB-151 — поля входа несут значок и подсказку внутри, а не одну подпись сбоку', async ({ page }: { page: Page }) => {
        await page.goto(SIGN_IN_PATH);
        await expect(qa(page, 'sign-in-submit')).toBeVisible();

        await expect(qa(page, 'sign-in-name').locator('.rt-input__icon-left')).toBeVisible();
        await expect(qa(page, 'sign-in-password').locator('.rt-input__icon-left')).toBeVisible();

        await expect(qa(page, 'sign-in-name').locator('input')).toHaveAttribute('placeholder', 'Имя проекта или владельца');
        await expect(qa(page, 'sign-in-password').locator('input')).toHaveAttribute('placeholder', 'Пароль учётной записи');
    });
});
