import { expect, Page, test } from '@playwright/test';

import { PEOPLE, SECTIONS } from '../stand/stand.mjs';
import { qa, signIn } from './support/admin';

/**
 * Экран того, кому не открыт ни один раздел.
 *
 * Входит запись без роли, заведённая ровно для этого: третьей записью без роли входить нельзя —
 * список людей обещает про неё «Не входили».
 *
 * Прежде на месте этого экрана была белая страница: состояние жило только зоной содержимого
 * оболочки, а прямая ссылка в закрытый раздел кончалась отменённым переходом — оболочка не
 * создавалась вовсе, и говорить человеку было нечему.
 */
test.describe('вошедший без единого права', () => {
    /** Пустое состояние экрана: по нему видно, что человеку сказали. */
    function screen(page: Page): ReturnType<typeof qa> {
        return qa(page, 'container-no-sections');
    }

    test('SC-MB-395, SC-MB-302 — после входа без прав человек попадает на экран со своим адресом', async ({ page }: { page: Page }) => {
        await page.goto('/');
        await signIn(page, PEOPLE.entrant);

        await expect(page).toHaveURL(/\/no-sections$/);
        await expect(screen(page)).toBeVisible();
        await expect(screen(page)).toContainText('Доступа ни к одному разделу нет');
        await expect(screen(page)).toContainText('Права выдаёт владелец приёмника');

        // Имя и выход даёт шапка оболочки: экран стоит внутри неё, а не вместо неё
        await expect(qa(page, 'header-user-menu')).toBeVisible();
        await expect(page.locator('[qa-dataid="header-nav-item"]')).toHaveCount(0);
    });

    test('SC-MB-396 — экран переживает перезагрузку своего адреса', async ({ page }: { page: Page }) => {
        await page.goto('/');
        await signIn(page, PEOPLE.entrant);
        await expect(screen(page)).toBeVisible();

        await page.reload();

        await expect(page).toHaveURL(/\/no-sections$/);
        await expect(screen(page)).toContainText('Доступа ни к одному разделу нет');
    });

    test('SC-MB-397 — прямая ссылка в закрытый раздел приводит на экран, а не на пустую страницу', async ({ page }: { page: Page }) => {
        await page.goto(SECTIONS.postmortems);
        await signIn(page, PEOPLE.entrant);

        await expect(page).toHaveURL(/\/no-sections$/);
        await expect(screen(page)).toBeVisible();
    });

    test('SC-MB-400 — выход с экрана уводит на вход', async ({ page }: { page: Page }) => {
        await page.goto('/');
        await signIn(page, PEOPLE.entrant);
        await expect(screen(page)).toBeVisible();

        await qa(page, 'header-user-menu').click();
        await expect(qa(page, 'profile-name')).toHaveText(PEOPLE.entrant.name);
        await qa(page, 'profile-sign-out').click();

        await expect(page).toHaveURL(/\/sign-in$/);
        await expect(qa(page, 'sign-in-submit')).toBeVisible();
    });
});
