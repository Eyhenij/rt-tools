import { expect, Request, Response, test } from '@playwright/test';

import { signIn } from './support/example';

/** The token of the example client lives forty seconds; the admin refreshes it thirty before its end. */
const PAST_REFRESH_LINE_MS: number = 12_000;

test.describe('the session', () => {
    test('SC-AUTH-49 — a token near its end is refreshed without a new entry', async ({ page }) => {
        await signIn(page, 'reader');

        await page.waitForTimeout(PAST_REFRESH_LINE_MS);
        const refresh: Promise<Request> = page.waitForRequest(
            (request: Request): boolean =>
                request.url().endsWith('/protocol/openid-connect/token') && (request.postData() ?? '').includes('grant_type=refresh_token')
        );
        const list: Promise<Request> = page.waitForRequest((request: Request): boolean => request.url().endsWith('/api/records'));
        await page.getByTestId('records-reload').click();

        await refresh;
        const answer: Response | null = await (await list).response();
        expect(answer?.status()).toBe(200);
        await expect(page.getByTestId('records-person')).toBeVisible();
        await expect(page.getByTestId('records-refusal')).toHaveCount(0);
    });
});
