import { expect, test } from '@playwright/test';

import { signIn } from './support/example';

/**
 * The narrow shadow step of the service sign.
 *
 * The kit draws the sign of a conversation row with a narrower shadow on a narrow screen, and the
 * step it takes the value from is declared in the kit's token set. The suite checks that the step
 * reaches the page of an application built on the kit, with a blur narrower than the small step.
 */
test.describe('the service sign shadow step', () => {
    test('SC-UKV-1311 — the narrow shadow step of the sign is declared on the page and is narrower than the small one', async ({
        page,
    }) => {
        await signIn(page, 'reader');

        const blurs: { row: number; small: number } = await page.evaluate(() => {
            const style: CSSStyleDeclaration = getComputedStyle(document.documentElement);
            const blurOf: (name: string) => number = (name: string): number => {
                const match: RegExpMatchArray | null = style.getPropertyValue(name).match(/^\s*0\s+0\s+(\d+)px/);

                return match ? Number(match[1]) : 0;
            };

            return { row: blurOf('--rt-shadow-service-logo-row'), small: blurOf('--rt-shadow-service-logo-sm') };
        });

        // positive pair: the small step is declared too, so a zero below is not a lost token set
        expect(blurs.small).toBeGreaterThan(0);
        expect(blurs.row).toBeGreaterThan(0);
        expect(blurs.row).toBeLessThan(blurs.small);
    });
});
