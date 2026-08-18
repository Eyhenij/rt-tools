import { expect, Page, test } from '@playwright/test';

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

        await expect(items).toHaveCount(4);

        await expectScreen(page, 'shell-narrow-nav');

        await items.filter({ hasText: SECTION.proposals.title }).click();

        await expect(page).toHaveURL(new RegExp(`${SECTION.proposals.path}$`));
        await expect(qa(page, SECTION.proposals.table)).toBeVisible();
    });
});
