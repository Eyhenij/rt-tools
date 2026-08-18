import { expect, Page, test } from '@playwright/test';

import { openSection, qa, rowsOf } from './support/admin';
import { expectScreen } from './support/shot';

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
});
