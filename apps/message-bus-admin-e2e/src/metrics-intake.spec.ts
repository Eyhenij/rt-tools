import { APIRequestContext, APIResponse, expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

import { API_ORIGIN, STAND_TREE_TOKEN_FILE, TREES } from '../stand/stand.mjs';

/**
 * Строка дня через настоящую операцию и настоящую базу стенда.
 *
 * Читать записанное пока нечем: раздел «Качество» приходит отдельной задачей. Поэтому запись
 * проверяется штампом: отказ более старой строке возможен, только если новая легла.
 */

interface IDayLine {
    readonly stamp: number;
    readonly metrics: Readonly<Record<string, unknown>>;
}

function send(request: APIRequestContext, origin: string, line: IDayLine): Promise<APIResponse> {
    return request.post(`${API_ORIGIN}/api/intake/metrics`, {
        headers: { 'x-tree-token': readFileSync(STAND_TREE_TOKEN_FILE, 'utf8').trim() },
        data: { schema: '2', tree: TREES[0].slug, origin, day: '2026-11-07', version: '0.35.0', ...line },
    });
}

test.describe('строка дня', () => {
    test('SC-AK-1284 — две отправки одного дня принимаются и итог не меняют', async ({ request }) => {
        const origin: string = `same-${test.info().project.name}`;
        const line: IDayLine = { stamp: 200, metrics: { sessions: 3, 'guardRefusals:git-guard-push': 2 } };

        expect((await send(request, origin, line)).status()).toBe(200);
        expect((await send(request, origin, line)).status()).toBe(200);
        expect(await (await send(request, origin, line)).json()).toEqual({ tree: TREES[0].slug, day: '2026-11-07' });
    });

    test('SC-AK-1303 — более старая строка получает код и запись не меняет', async ({ request }) => {
        const origin: string = `older-${test.info().project.name}`;

        await send(request, origin, { stamp: 300, metrics: { sessions: 5 } });

        const older: APIResponse = await send(request, origin, { stamp: 100, metrics: { sessions: 1 } });

        expect(older.status()).toBe(409);
        expect((await older.json()).code).toBe('metrics-stale');
        expect((await send(request, origin, { stamp: 300, metrics: { sessions: 5 } })).status()).toBe(200);
    });

    test('SC-AK-1280 — чужой ключ получает код и строка не ложится', async ({ request }) => {
        const answer: APIResponse = await send(request, `foreign-${test.info().project.name}`, {
            stamp: 100,
            metrics: { taskTitle: 1 },
        });

        expect(answer.status()).toBe(400);
        expect((await answer.json()).code).toBe('metrics-field-refused');
    });
});
