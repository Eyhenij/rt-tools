import { isRight, TRight } from '@rt/message-bus-common';

import { ADMIN_MENU, IAdminMenuItem } from './menu.declaration';

/**
 * Объявление меню: имя права у каждого пункта.
 *
 * Компилятор держит это типом, а спека — на прогоне: право, снятое из набора приёмником, здесь
 * осталось бы строкой, и раздел закрылся бы у всех молча.
 */
describe('объявление меню админки', (): void => {
    it('SC-MB-306 — право каждого пункта стоит в закрытом наборе прав', (): void => {
        // Сначала проверяется, что отбор вообще находит имена: проверка на отсутствие чужого
        // осталась бы зелёной и на поломке самого отбора.
        expect(isRight('postmortems:read')).toBe(true);
        expect(isRight('postmortems:read-all')).toBe(false);

        const rights: readonly TRight[] = ADMIN_MENU.map((item: IAdminMenuItem): TRight => item.right);

        expect(rights.length).toBe(ADMIN_MENU.length);
        expect(rights.filter((right: TRight): boolean => !isRight(right))).toEqual([]);
    });

    it('SC-MB-306 — двух пунктов с одним правом не бывает', (): void => {
        // Одно право на два раздела означало бы, что закрыть один, не закрыв другой, нечем.
        const rights: readonly TRight[] = ADMIN_MENU.map((item: IAdminMenuItem): TRight => item.right);

        expect(new Set(rights).size).toBe(rights.length);
    });
});
