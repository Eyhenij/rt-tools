import { describe, expect, it } from 'vitest';

import { hasRight, isRight, TRight } from './rights';

/**
 * Права человека: набор ролей клиента из его токена.
 *
 * Проверяется вызовом: решение чистое, и проверка доступа остаётся обёрткой, которая читает
 * токен и зовёт это.
 */

const READ: TRight = 'postmortems:read';
const MANAGE: TRight = 'postmortems:manage';

describe('права человека', (): void => {
    it('SC-MB-290 — право, о котором токен молчит, считается не данным', (): void => {
        const rights: ReadonlySet<TRight> = new Set<TRight>([READ]);

        expect(hasRight(rights, READ)).toBe(true);
        expect(hasRight(rights, MANAGE)).toBe(false);
    });

    it('имя не из набора правом не считается', (): void => {
        // Сначала проверяется, что искомое вообще находится: набор без своих имён был бы пуст
        // всегда, и проверка на отсутствие оставалась бы зелёной на любой поломке отбора.
        expect(isRight(READ)).toBe(true);
        expect(isRight('postmortems:read-all')).toBe(false);
    });
});
