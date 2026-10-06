import { APIResponse, expect, Page, Request, test } from '@playwright/test';

import { API_ORIGIN } from '../stand/stand.mjs';
import { signIn } from './support/example';

test.describe('the rights', () => {
    test('SC-AUTH-51 — a part without the right is not shown', async ({ browser }) => {
        const editor: Page = await browser.newPage();
        await signIn(editor, 'editor');
        await expect(editor.getByTestId('records-new')).toBeVisible();
        await editor.getByTestId('records-new-title').locator('input').fill('A record of the editor');
        await editor.getByTestId('records-new-submit').click();
        await expect(editor.getByTestId('records-item').filter({ hasText: 'A record of the editor' })).toBeVisible();
        await editor.close();

        const reader: Page = await browser.newPage();
        await signIn(reader, 'reader');
        await expect(reader.getByTestId('records-list')).toBeVisible();
        await expect(reader.getByTestId('records-new')).toHaveCount(0);
        await reader.close();

        const outsider: Page = await browser.newPage();
        await signIn(outsider, 'outsider');
        await expect(outsider.getByTestId('records-no-access')).toBeVisible();
        await expect(outsider.getByTestId('records-list')).toHaveCount(0);
        await outsider.close();
    });

    test('SC-AUTH-52 — the server refuses a call without the right', async ({ page, request }) => {
        const listed: Promise<Request> = page.waitForRequest((call: Request): boolean => call.url().endsWith('/api/records'));
        await signIn(page, 'reader');
        const authorization: string | undefined = (await listed).headers()['authorization'];
        expect(authorization).toMatch(/^Bearer /);

        const answer: APIResponse = await request.post(`${API_ORIGIN}/api/records`, {
            headers: { authorization: String(authorization) },
            data: { title: 'A record of the reader' },
        });

        expect(answer.status()).toBe(403);
    });
});
