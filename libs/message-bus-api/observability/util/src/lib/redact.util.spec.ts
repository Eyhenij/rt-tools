import { describe, expect, it } from 'vitest';

import { describeError, IErrorDetails } from './describe-error.util';
import { redact, REDACTED } from './redact.util';

describe('redact', () => {
    it('SC-MB-103 — пароль и токен вырезаются целиком', () => {
        const fields: Record<string, unknown> = redact({ treeSlug: 'own-tree', password: 'секрет', treeToken: 'abc123' });

        expect(fields['password']).toBe(REDACTED);
        expect(fields['treeToken']).toBe(REDACTED);
        expect(fields['treeSlug']).toBe('own-tree');
    });

    it('SC-MB-103 — секрет вырезается и во вложенном объекте', () => {
        const fields: Record<string, unknown> = redact({ request: { headers: { authorization: 'Bearer abc' } } });

        expect(fields).toEqual({ request: { headers: { authorization: REDACTED } } });
    });

    it('SC-MB-103 — текст человека заменяется длиной, а не значением', () => {
        const fields: Record<string, unknown> = redact({ comment: 'жалоба на двенадцать слов' });

        expect(fields['comment']).toBe('<25 симв.>');
    });

    it('SC-MB-104 — текст ошибки внутри разобранной причины остаётся целиком', () => {
        const details: IErrorDetails = describeError(new Error('column "city" does not exist'));

        const fields: Record<string, unknown> = redact({ error: { ...details } });

        expect((fields['error'] as Record<string, unknown>)['message']).toBe('column "city" does not exist');
    });

    it('SC-MB-104 — текст ошибки остаётся и на втором уровне причины', () => {
        const inner: Error = new Error('42703: column "city" does not exist');
        const details: IErrorDetails = describeError(new Error('запрос не выполнен', { cause: inner }));

        const fields: Record<string, unknown> = redact({ error: { ...details, cause: { ...details.cause } } });
        const cause: Record<string, unknown> = (fields['error'] as Record<string, unknown>)['cause'] as Record<string, unknown>;

        expect(cause['message']).toBe('42703: column "city" does not exist');
    });

    it('SC-MB-103 — секрет внутри ветки ошибки всё равно вырезается', () => {
        const fields: Record<string, unknown> = redact({ error: { message: 'отказ входа', password: 'секрет' } });

        expect((fields['error'] as Record<string, unknown>)['password']).toBe(REDACTED);
    });

    it('SC-MB-103 — длинная строка режется по пределу и говорит, сколько срезано', () => {
        const fields: Record<string, unknown> = redact({ payload: 'я'.repeat(2500) });

        expect(fields['payload']).toBe(`${'я'.repeat(2000)}…(+500)`);
    });

    it('SC-MB-103 — длинный список режется по пределу', () => {
        const fields: Record<string, unknown> = redact({ trees: Array.from({ length: 70 }, (_: unknown, index: number) => index) });

        expect(fields['trees']).toHaveLength(51);
        expect((fields['trees'] as unknown[])[50]).toBe('…(+20)');
    });

    it('SC-MB-103 — обход останавливается на пределе глубины', () => {
        let nested: Record<string, unknown> = { bottom: 'дно' };
        for (let level: number = 0; level < 8; level += 1) {
            nested = { nested };
        }

        let cursor: Record<string, unknown> = redact(nested);
        let depth: number = 0;
        while (cursor['nested']) {
            cursor = cursor['nested'] as Record<string, unknown>;
            depth += 1;
        }

        expect(cursor).toEqual({ '…': 'глубже предела' });
        expect(depth).toBe(6);
    });
});
