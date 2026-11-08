import { expect, Page, test } from '@playwright/test';

import { openSection, qa, rowsOf } from './support/admin';

/** Узкий экран: таблица причин складывается в карточки, как в разделе «Использование». */
test.describe('раздел «Качество» на узком экране', () => {
    test('SC-AK-1327 — причины показаны карточками с подписанными полями', async ({ page }: { page: Page }) => {
        await openSection(page, 'quality', '?from=2026-08-01&to=2026-08-31');

        await expect(qa(page, 'table-cards')).toBeVisible();
        await expect(qa(page, 'table-card')).toHaveCount(3);
        await expect(rowsOf(page, 'quality').first()).toBeHidden();

        const labels: string[] = await qa(page, 'table-card-label').allTextContents();

        expect(labels).toContain('Потери');
        expect(labels).toContain('Пустые запуски');

        const card: { width: number } = (await qa(page, 'table-card').first().boundingBox()) ?? { width: 0 };
        const viewport: number = page.viewportSize()?.width ?? 0;

        expect(card.width).toBeGreaterThan(0);
        expect(card.width).toBeLessThanOrEqual(viewport);
    });
});
