import { describe, expect, it } from 'vitest';

import { hasRight, isRight, rightsOf, TRight } from './rights';

/**
 * Сложение прав: набор роли и точечные правки поверх него.
 *
 * Проверяется вызовом, а не подъёмом проверки доступа: решение здесь одно, и оно чистое —
 * проверка остаётся обёрткой, которая читает хранилище и зовёт это.
 */

const READ: TRight = 'postmortems:read';
const MANAGE: TRight = 'postmortems:manage';

describe('права человека', (): void => {
    it('SC-MB-290 — право, о котором роль молчит, считается не данным', (): void => {
        const rights: ReadonlySet<TRight> = rightsOf([READ], []);

        expect(hasRight(rights, READ)).toBe(true);
        expect(hasRight(rights, MANAGE)).toBe(false);
    });

    it('SC-MB-291 — точечная правка даёт право, которого у роли нет', (): void => {
        const rights: ReadonlySet<TRight> = rightsOf([READ], [{ right: MANAGE, granted: true }]);

        expect(hasRight(rights, MANAGE)).toBe(true);
    });

    it('SC-MB-292 — точечная правка снимает право, которое роль даёт', (): void => {
        const rights: ReadonlySet<TRight> = rightsOf([READ, MANAGE], [{ right: MANAGE, granted: false }]);

        expect(hasRight(rights, MANAGE)).toBe(false);
        expect(hasRight(rights, READ)).toBe(true);
    });

    it('SC-MB-293 — у записи без роли прав нет ни одного', (): void => {
        const rights: ReadonlySet<TRight> = rightsOf(null, []);

        expect(rights.size).toBe(0);
    });

    it('SC-MB-293 — точечная правка даёт право и записи без роли', (): void => {
        // Роли нет, а право выдано лично: это законное состояние, а не обход роли.
        const rights: ReadonlySet<TRight> = rightsOf(null, [{ right: READ, granted: true }]);

        expect(hasRight(rights, READ)).toBe(true);
    });

    it('SC-MB-297 — имя не из набора правом не считается ни в роли, ни в правке', (): void => {
        // Сначала проверяется, что искомое вообще находится: набор без своих имён был бы пуст
        // всегда, и проверка на отсутствие оставалась бы зелёной на любой поломке отбора.
        expect(isRight(READ)).toBe(true);
        expect(isRight('postmortems:read-all')).toBe(false);

        const fromRole: ReadonlySet<TRight> = rightsOf([READ, 'postmortems:read-all'], []);
        const fromEdit: ReadonlySet<TRight> = rightsOf([READ], [{ right: 'postmortems:read-all', granted: true }]);

        expect([...fromRole]).toEqual([READ]);
        expect([...fromEdit]).toEqual([READ]);
    });

    it('SC-MB-297 — снятие права, которого нет в наборе, ничего не снимает', (): void => {
        const rights: ReadonlySet<TRight> = rightsOf([READ], [{ right: 'postmortems', granted: false }]);

        expect(hasRight(rights, READ)).toBe(true);
    });
});
