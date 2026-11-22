import { expect, test } from '@playwright/test';

import { signIn } from './support/example';

/**
 * The window threshold of the kit on a page without a page container.
 *
 * The example draws no page container, so the kit's styles take the window as the place. They used
 * to tell such a page by `html:not(:has(.rt-container))`, and every edit of the page then restyled
 * the whole document. Now the container marks the root with a class, and the styles ask the class.
 */
test.describe('the window threshold without a page container', () => {
    test('SC-UKV-1635 — the root carries no place class, and no style rule asks :has() of the container', async ({ page }) => {
        await signIn(page, 'editor');
        await expect(page.getByTestId('records-new-title')).toBeVisible();

        const found: { rules: number; hasRules: number; marked: boolean } = await page.evaluate(() => {
            const texts: string[] = [];
            for (const sheet of Array.from(document.styleSheets)) {
                for (const rule of Array.from(sheet.cssRules)) {
                    texts.push(rule.cssText);
                }
            }

            return {
                rules: texts.length,
                hasRules: texts.filter((text: string): boolean => text.includes(':has(.rt-container')).length,
                marked: document.documentElement.classList.contains('rt-has-place'),
            };
        });

        // the styles were read at all: an empty list would make the next line green on nothing
        expect(found.rules).toBeGreaterThan(0);
        expect(found.hasRules).toBe(0);
        expect(found.marked).toBe(false);
    });
});
