import { expect, Locator, Page, test } from '@playwright/test';

import { IBox, openSection, pageQa, qa, rowsOf } from './support/admin';
import { expectScreen } from './support/shot';

/** Прямоугольник узла; узла нет на экране — тест падает здесь, а не сравнивает нули. */
async function boxOf(locator: Locator): Promise<IBox> {
    const box: IBox | null = await locator.boundingBox();
    if (box === null) {
        throw new Error('узла нет на экране');
    }

    return box;
}

/**
 * Узкий экран: запись показана карточкой таблицы кита, а не обрезанной строкой.
 *
 * Прогон идёт браузером в размере телефона — тем же chromium: карточка вместо строки это
 * обещание раскладки, и второй браузер о нём не говорит ничего.
 */
test.describe('список на узком экране', () => {
    test('SC-MB-77 — строка списка на узком экране показана карточкой', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        await expect(qa(page, 'table-cards')).toBeVisible();
        await expect(qa(page, 'table-card').first()).toBeVisible();

        // строк таблицы на узком экране нет вовсе: карточка их заменяет, а не дополняет
        await expect(rowsOf(page, 'postmortems').first()).toBeHidden();

        // у карточки подписаны поля — то, чего у обрезанной строки не бывает
        const labels: string[] = await qa(page, 'table-card-label').allTextContents();

        expect(labels).toContain('Файл');
        expect(labels).toContain('Приехал');

        // и карточка помещается в ширину окна: обрезанной строкой это выглядело бы иначе
        const card: { width: number } = (await qa(page, 'table-card').first().boundingBox()) ?? { width: 0 };
        const viewport: number = page.viewportSize()?.width ?? 0;

        expect(card.width).toBeGreaterThan(0);
        expect(card.width).toBeLessThanOrEqual(viewport);

        await expectScreen(page, 'list-narrow-cards');
    });

    test('SC-MB-457 — кнопки полосы на узком экране стоят рядом у правого края', async ({ page }: { page: Page }) => {
        await openSection(page, 'postmortems');

        const refresh: IBox = await boxOf(pageQa(page, 'postmortems', 'refresh'));
        const columns: IBox = await boxOf(pageQa(page, 'postmortems', 'columns'));
        // Полоса целиком, а не её правая часть: та сама шириной по кнопкам и прижатия не покажет
        const bar: IBox = await boxOf(page.locator('rt-toolbar .rt-toolbar__bars').first());
        const viewport: number = page.viewportSize()?.width ?? 0;

        // «Обновить» перед «Колонками», в одной строке
        expect(refresh.x).toBeLessThan(columns.x);
        expect(Math.round(refresh.y)).toBe(Math.round(columns.y));

        // ряд прижат к правому краю полосы, а не к левому, и не выходит за окно
        const barRight: number = bar.x + bar.width;
        const rowRight: number = columns.x + columns.width;

        expect(rowRight).toBeLessThanOrEqual(barRight + 0.5);
        expect(barRight - rowRight).toBeLessThan(refresh.width);
        expect(refresh.x - bar.x).toBeGreaterThan(bar.width / 2);
        expect(rowRight).toBeLessThanOrEqual(viewport);
    });
});
