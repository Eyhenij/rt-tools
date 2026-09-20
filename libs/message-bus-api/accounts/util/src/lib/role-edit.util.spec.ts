import { describe, expect, it } from 'vitest';

import { ERefusal } from '@rt/message-bus-common';

import { accessInputOf, keepsRolesRight, roleInputOf } from './role-edit.util';

describe('разбор правок над ролями и доступом', () => {
    it('SC-MB-380 — пустое имя роли отбивается раньше прав, а права не из набора и повторы — кодом с именем права', () => {
        expect(roleInputOf({ name: '  ', rights: ['nope'] }).fault?.code).toBe(ERefusal.RoleNameEmpty);
        expect(roleInputOf({ name: 'Чтец', rights: ['nope:read'] }).fault).toEqual({
            code: ERefusal.RightUnknown,
            params: { right: 'nope:read' },
        });
        expect(roleInputOf({ name: 'Чтец', rights: ['usage:read', 'usage:read'] }).fault?.code).toBe(ERefusal.RightRepeated);
        expect(roleInputOf({ name: 'Чтец', rights: [7] }).fault?.code).toBe(ERefusal.RightUnknown);
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
        expect(accessInputOf({ role: null, edits: [{ right: 'usage:read' }] }).fault?.code).toBe(ERefusal.EditMalformed);
        expect(accessInputOf({ role: null, edits: [{ right: 'nope', granted: true }] }).fault?.code).toBe(ERefusal.RightUnknown);
        expect(
            accessInputOf({
                role: null,
                edits: [
                    { right: 'usage:read', granted: true },
                    { right: 'usage:read', granted: false },
                ],
            }).fault?.code
        ).toBe(ERefusal.RightRepeated);
    });

    it('SC-MB-379 — право на роли остаётся, если его даёт роль или правка, и уходит, если правка его сняла', () => {
        expect(keepsRolesRight(['roles:manage'], [])).toBe(true);
        expect(keepsRolesRight([], [{ right: 'roles:manage', granted: true }])).toBe(true);
        expect(keepsRolesRight(['roles:manage'], [{ right: 'roles:manage', granted: false }])).toBe(false);
        expect(keepsRolesRight(null, [])).toBe(false);
        expect(keepsRolesRight(['usage:read'], [])).toBe(false);
    });
});
