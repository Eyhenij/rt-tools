import { describe, expect, it } from 'vitest';

import { accessInputOf, ERoleInputFault, keepsRolesRight, roleInputOf } from './role-edit.util';

describe('разбор правок над ролями и доступом', () => {
    it('SC-MB-380 — пустое имя роли отбивается раньше прав, а права не из набора и повторы — словами о праве', () => {
        expect(roleInputOf({ name: '  ', rights: ['nope'] }).fault?.kind).toBe(ERoleInputFault.NameEmpty);
        expect(roleInputOf({ name: 'Чтец', rights: ['nope:read'] }).fault).toEqual({
            kind: ERoleInputFault.RightUnknown,
            said: 'права «nope:read» нет в наборе',
        });
        expect(roleInputOf({ name: 'Чтец', rights: ['usage:read', 'usage:read'] }).fault?.kind).toBe(ERoleInputFault.RightRepeated);
        expect(roleInputOf({ name: 'Чтец', rights: [7] }).fault?.kind).toBe(ERoleInputFault.RightUnknown);
    });

    it('SC-MB-380 — роль отдаёт имя с обрезанными краями и права как есть; без списка прав — пустая роль', () => {
        expect(roleInputOf({ name: ' Чтец ', rights: ['usage:read'] })).toEqual({
            input: { name: 'Чтец', rights: ['usage:read'] },
            fault: null,
        });
        expect(roleInputOf({ name: 'Пустая' })).toEqual({ input: { name: 'Пустая', rights: [] }, fault: null });
    });

    it('SC-MB-380 — доступ: роль пустой строкой читается как «без роли», правка без права или без признака отбивается', () => {
        expect(accessInputOf({ role: '', edits: [] })).toEqual({ input: { role: null, edits: [] }, fault: null });
        expect(accessInputOf({ role: ' watcher ', edits: [{ right: 'usage:read', granted: false }] })).toEqual({
            input: { role: 'watcher', edits: [{ right: 'usage:read', granted: false }] },
            fault: null,
        });
        expect(accessInputOf({ role: null, edits: [{ right: 'usage:read' }] }).fault?.kind).toBe(ERoleInputFault.EditsMalformed);
        expect(accessInputOf({ role: null, edits: [{ right: 'nope', granted: true }] }).fault?.kind).toBe(ERoleInputFault.RightUnknown);
        expect(
            accessInputOf({
                role: null,
                edits: [
                    { right: 'usage:read', granted: true },
                    { right: 'usage:read', granted: false },
                ],
            }).fault?.kind
        ).toBe(ERoleInputFault.RightRepeated);
    });

    it('SC-MB-379 — право на роли остаётся, если его даёт роль или правка, и уходит, если правка его сняла', () => {
        expect(keepsRolesRight(['roles:manage'], [])).toBe(true);
        expect(keepsRolesRight([], [{ right: 'roles:manage', granted: true }])).toBe(true);
        expect(keepsRolesRight(['roles:manage'], [{ right: 'roles:manage', granted: false }])).toBe(false);
        expect(keepsRolesRight(null, [])).toBe(false);
        expect(keepsRolesRight(['usage:read'], [])).toBe(false);
    });
});
