import { expect, Locator, Page, test } from '@playwright/test';

import { openSection, qa, rowsOf, SECTION } from './support/admin';

/**
 * Вид страницы списка: достижимость записей и переключателя страниц.
 *
 * Проверяется здесь, а не спекой компонента: обещание говорит о человеке и о том, что он видит,
 * а между версткой страницы и увиденным лежит каркас приложения — тот самый, из-за которого
 * записи и пропадали. Спека компонента поднимает страницу без каркаса и этого не застаёт.
 *
 * Раздел взят тот, у которого груза больше страницы: у остальных записи помещаются в окно
 * целиком, и прокрутке там нечего показывать.
 */

/** Размер страницы по умолчанию: тот же, что признаёт разбор адреса. */
const PAGE_SIZE: number = 20;

/** Попадает ли узел в окно целиком. Единица допуска — округление дробной высоты строки. */
async function inViewport(node: Locator): Promise<boolean> {
    return node.evaluate((element: Element): boolean => {
        const box: DOMRect = element.getBoundingClientRect();

        return box.top >= 0 && box.bottom <= window.innerHeight + 1;
    });
}

test.describe('вид страницы списка', () => {
    test('SC-MB-163 — записей больше, чем помещается в окно, и все они достижимы', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        await expect(rowsOf(page, 'postmortems')).toHaveCount(PAGE_SIZE);

        // Страница обязана быть длиннее окна: иначе проверка ниже пройдёт и на обрезанном
        // списке — последняя строка попадёт в кадр просто потому, что остальных нет.
        const scrollable: boolean = await page.evaluate(
            (): boolean => document.documentElement.scrollHeight > document.documentElement.clientHeight
        );

        expect(scrollable).toBe(true);

        const last: Locator = rowsOf(page, 'postmortems').nth(PAGE_SIZE - 1);

        await last.scrollIntoViewIfNeeded();

        await expect(last).toBeVisible();
        expect(await inViewport(last)).toBe(true);
    });

    test('SC-MB-164 — переключатель страниц достижим при длинном списке', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        await expect(rowsOf(page, 'postmortems')).toHaveCount(PAGE_SIZE);

        const pagination: Locator = qa(page, `${SECTION.postmortems.prefix}-pagination`).or(page.locator('rt-pagination')).first();

        await pagination.scrollIntoViewIfNeeded();

        await expect(pagination).toBeVisible();
        expect(await inViewport(pagination)).toBe(true);
    });
});
