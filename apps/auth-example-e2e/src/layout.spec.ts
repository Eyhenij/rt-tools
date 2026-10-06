import { expect, Locator, test } from '@playwright/test';

import { signIn } from './support/example';

/** A title longer than any line of the column, without a space to break at. */
const LONG_TITLE: string = `record-${'x'.repeat(140)}`;

/** The rectangle of an element on the page. */
async function boxOf(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
    const box: { x: number; y: number; width: number; height: number } | null = await locator.boundingBox();
    expect(box).not.toBeNull();
    return box ?? { x: 0, y: 0, width: 0, height: 0 };
}

test.describe('the layout of the records screen', () => {
    test('a long title wraps inside the column, and the header and the form keep their lines centred', async ({ page }) => {
        await signIn(page, 'editor');
        await page.getByTestId('records-new-title').locator('input').fill(LONG_TITLE);
        await page.getByTestId('records-new-submit').click();
        const item: Locator = page.getByTestId('records-item').filter({ hasText: LONG_TITLE });
        await expect(item).toBeVisible();

        const widths: { document: number; window: number } = await page.evaluate(() => ({
            document: document.documentElement.scrollWidth,
            window: window.innerWidth,
        }));
        expect(widths.document).toBeLessThanOrEqual(widths.window);
        expect((await boxOf(item)).height).toBeGreaterThan(30);

        const person: { y: number; height: number } = await boxOf(page.getByTestId('records-person'));
        const signOut: { y: number; height: number } = await boxOf(page.getByTestId('records-sign-out'));
        expect(Math.abs(person.y + person.height / 2 - (signOut.y + signOut.height / 2))).toBeLessThan(4);

        const field: { y: number; height: number } = await boxOf(page.getByTestId('records-new-title'));
        const add: { y: number; height: number } = await boxOf(page.getByTestId('records-new-submit'));
        expect(Math.abs(field.y + field.height / 2 - (add.y + add.height / 2))).toBeLessThan(2);
    });
});
