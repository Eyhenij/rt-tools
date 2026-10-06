import { expect, Locator, test } from '@playwright/test';

import { expectEntryScreen, signIn } from './support/example';

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

test.describe('the layout of the entry screen', () => {
    test('SC-AUTH-55 — an error under a field does not move the form', async ({ page }) => {
        await page.goto('/');
        await expectEntryScreen(page);
        const before: { y: number } = await boxOf(page.getByTestId('kc-login-submit'));

        await page.getByTestId('kc-username').locator('input').fill('reader@example.test');
        await page.getByTestId('kc-login-submit').click();
        await expect(page.getByTestId('kc-password').locator('xpath=ancestor::rt-field').getByTestId('field-error')).toBeVisible();

        const after: { y: number } = await boxOf(page.getByTestId('kc-login-submit'));
        expect(Math.abs(after.y - before.y)).toBeLessThan(1);
    });

    test('SC-AUTH-58 — the entry card has an outline and a shadow', async ({ page }) => {
        await page.goto('/');
        await expectEntryScreen(page);

        const edge: { border: number; shadow: string } = await page.getByTestId('kc-card').evaluate((card: Element) => {
            const style: CSSStyleDeclaration = getComputedStyle(card);
            return { border: parseFloat(style.borderTopWidth), shadow: style.boxShadow };
        });
        expect(edge.border).toBeGreaterThan(0);
        expect(edge.shadow).not.toBe('none');
    });

    test('SC-AUTH-62 — the entry card is glass over a moving field', async ({ page }) => {
        await page.goto('/');
        await expectEntryScreen(page);

        const scene: { blur: string; alpha: number; gradient: string; canvas: number; under: boolean } = await page
            .getByTestId('kc-card')
            .evaluate((card: Element) => {
                const style: CSSStyleDeclaration = getComputedStyle(card);
                const viewport: Element | null = card.parentElement;
                const canvas: HTMLCanvasElement | null = viewport?.querySelector('rt-dot-field canvas') ?? null;
                const alpha: RegExpMatchArray | null = style.backgroundColor.match(/[\d.]+(?=\)$)/);
                const field: Element | null = canvas?.parentElement?.closest('rt-dot-field') ?? null;
                return {
                    blur: style.backdropFilter,
                    alpha: style.backgroundColor.startsWith('rgba') || style.backgroundColor.includes('/') ? Number(alpha?.[0] ?? 1) : 1,
                    gradient: viewport ? getComputedStyle(viewport).backgroundImage : '',
                    canvas: canvas ? canvas.width * canvas.height : 0,
                    under: field ? Number(getComputedStyle(field).zIndex) < Number(style.zIndex) : false,
                };
            });
        expect(scene.blur).toContain('blur');
        expect(scene.alpha).toBeLessThan(1);
        expect(scene.gradient).toContain('radial-gradient');
        expect(scene.canvas).toBeGreaterThan(0);
        expect(scene.under).toBe(true);
    });
});
