import { expect, Locator, Page, test } from '@playwright/test';

import { CHAT } from '../stand/stand.mjs';

import { IBox, qa } from './support/admin';
import { expectScreen } from './support/shot';

/**
 * Виджет посетителя на узком экране.
 *
 * Прогон идёт браузером в размере телефона: развёрнутый виджет занимает экран целиком, и увидеть
 * это можно только в той ширине, где раскладка включается. На широком экране тот же виджет стоит
 * окном в углу — это проверяет соседний набор, `chat-widget.spec.ts`.
 *
 * Размеры сверяются с размером окна, а не с записанными числами: размер окна называет прогон, и
 * число, написанное здесь вторым местом, разошлось бы с ним молча.
 */
test.describe('виджет посетителя на узком экране', () => {
    test('SC-CH-59 — на узком экране виджет занимает экран целиком, поле стоит под лентой', async ({ page }: { page: Page }) => {
        await page.goto(`/widget-page?site=${encodeURIComponent(CHAT.widget.key)}`);

        await qa(page, 'widget-bubble').click();

        const panel: Locator = qa(page, 'widget-panel');

        await expect(panel).toBeVisible();

        const screen: { width: number; height: number } | null = page.viewportSize();
        const box: IBox | null = await panel.boundingBox();

        expect(screen).not.toBeNull();
        expect(box).not.toBeNull();
        expect({ x: box?.x, y: box?.y, width: box?.width, height: box?.height }).toEqual({
            x: 0,
            y: 0,
            width: screen?.width,
            height: screen?.height,
        });

        const feed: IBox | null = await qa(page, 'widget-feed').boundingBox();
        const field: IBox | null = await qa(page, 'widget-text').boundingBox();

        expect(feed).not.toBeNull();
        expect(field).not.toBeNull();
        // поле набора стоит под лентой, а не рядом с ней: лента кончается выше, чем поле начинается
        expect((feed?.y ?? 0) + (feed?.height ?? 0)).toBeLessThanOrEqual(field?.y ?? 0);

        await expectScreen(page, 'widget-narrow');
    });
});
