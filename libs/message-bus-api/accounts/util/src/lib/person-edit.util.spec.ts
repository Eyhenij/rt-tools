import { describe, expect, it } from 'vitest';

import { EPersonInputFault, newPersonOf, passwordOf, PERSON_EDIT_SAID } from './person-edit.util';

describe('разбор правок над учётной записью', () => {
    it('SC-MB-363 — пустой пароль отбивается словами о пароле, а не пустотой', () => {
        expect(passwordOf({ password: '' }).fault).toBe(EPersonInputFault.PasswordEmpty);
        expect(passwordOf({}).fault).toBe(EPersonInputFault.PasswordEmpty);
        expect(passwordOf(null).fault).toBe(EPersonInputFault.PasswordEmpty);
        expect(PERSON_EDIT_SAID[EPersonInputFault.PasswordEmpty]).toContain('пароль');
    });

    it('SC-MB-363 — пароль берётся как есть: пробел по краю — часть пароля', () => {
        expect(passwordOf({ password: ' тайна ' })).toEqual({ password: ' тайна ', fault: null });
    });

    it('SC-MB-361 — заведение отдаёт имя с обрезанными краями и пароль без правок', () => {
        expect(newPersonOf({ name: '  Ольга ', password: 'тайна' })).toEqual({ input: { name: 'Ольга', password: 'тайна' }, fault: null });
    });

    it('SC-MB-361 — пустое имя отбивается раньше пустого пароля', () => {
        expect(newPersonOf({ name: '   ', password: '' }).fault).toBe(EPersonInputFault.NameEmpty);
        expect(newPersonOf({ name: 'Ольга', password: '' }).fault).toBe(EPersonInputFault.PasswordEmpty);
        expect(newPersonOf({ name: 42, password: 'тайна' }).fault).toBe(EPersonInputFault.NameEmpty);
    });
});
