import { expect, Page, test } from '@playwright/test';

import { ACCOUNT, SECTIONS } from '../stand/stand.mjs';

import { openSection, qa, SECTION } from './support/admin';
import { expectScreen } from './support/shot';

/**
 * Верхний ряд на узком экране: те же разделы приходят кнопкой.
 *
 * Прогон идёт браузером в размере телефона: узкая раскладка ряда — обещание кита, и проверить
 * его можно только в той ширине, где она включается.
 */
test.describe('разделы на узком экране', () => {
    test('SC-MB-144 — на узком экране те же разделы открываются кнопкой', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        // Инлайн-ряд на узкой ширине спрятан целиком: кит прячет зону ряда, а не список внутри неё
        await expect(page.locator('.rt-page-header__nav')).toBeHidden();

        await qa(page, 'header-nav-burger').click();

        const items: ReturnType<Page['locator']> = qa(page, 'header-nav-mobile-item');

        // Разделы те же, что в широком ряду: их число берётся из объявления адресов, а не пишется
        // числом — раздел, заведённый веткой, иначе оставил бы спеку зелёной и не показанным
        await expect(items).toHaveCount(Object.keys(SECTIONS).length);

        await expectScreen(page, 'shell-narrow-nav');

        await items.filter({ hasText: SECTION.proposals.title }).click();

        await expect(page).toHaveURL(new RegExp(`${SECTION.proposals.path}$`));
        await expect(qa(page, SECTION.proposals.table)).toBeVisible();
    });

    test('SC-MB-457 — список разделов на узком экране закрывается своей кнопкой закрытия', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        const burger: ReturnType<Page['locator']> = qa(page, 'header-nav-burger');

        await burger.click();

        const items: ReturnType<Page['locator']> = qa(page, 'header-nav-mobile-item');

        await expect(items.first()).toBeVisible();

        // Кнопку закрытия рисует шторка кита: список разделов её не заказывал и получил вместе с шапкой
        await qa(page, 'bottom-sheet-close').click();

        await expect(items.first()).toBeHidden();
        await expect(page).toHaveURL(new RegExp(`${SECTION.postmortems.path}$`));
        await expect(burger).toBeFocused();
    });

    test('SC-MB-433 — на узком экране профиль показан одним значком, а кнопка названа именем', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        const profile: ReturnType<Page['locator']> = qa(page, 'header-user-menu');

        // Кнопка на месте и названа именем вошедшего — иначе отсутствие имени ниже прошло бы и на
        // пустой шапке
        await expect(profile).toBeVisible();
        await expect(profile).toHaveAttribute('aria-label', ACCOUNT.name);

        // Виден значок пользователя, а имя спрятано: кит прячет его до 768 включительно
        await expect(profile.locator('.rt-page-header__user-icon')).toBeVisible();
        await expect(qa(page, 'header-user-name')).toBeHidden();

        // Касание, как на телефоне: клик мышью сначала наводит указатель, попап открывается
        // наведением, и его подложка перекрывает кнопку раньше самого нажатия
        await profile.tap();
        await expect(qa(page, 'profile-menu')).toBeVisible();
        await expect(page).toHaveURL(new RegExp(`${SECTION.postmortems.path}$`));
    });
});
