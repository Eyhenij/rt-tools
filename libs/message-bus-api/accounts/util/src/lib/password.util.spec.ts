import { describe, expect, it } from 'vitest';

import { burnAbsentAccountTime, passwordHash, passwordMatches } from './password.util';

const PASSWORD: string = 'тайный-пароль';

describe('passwordHash', () => {
    it('SC-MB-42 — в хеше нет самого пароля', () => {
        const stored: string = passwordHash(PASSWORD);

        // Сначала — что хеш вообще собран, и только потом, что пароля в нём нет
        expect(stored.length).toBeGreaterThan(0);
        expect(stored).not.toContain(PASSWORD);
    });

    it('SC-MB-42 — два хеша одного пароля разные: соль своя у каждой записи', () => {
        expect(passwordHash(PASSWORD)).not.toBe(passwordHash(PASSWORD));
    });
});

describe('passwordMatches', () => {
    it('SC-MB-33 — годный пароль сходится со своим хешем', () => {
        expect(passwordMatches(PASSWORD, passwordHash(PASSWORD))).toBe(true);
    });

    it('SC-MB-34 — негодный пароль со своим хешем не сходится', () => {
        expect(passwordMatches('не-тот-пароль', passwordHash(PASSWORD))).toBe(false);
    });

    it('SC-MB-59 — пароль, сменённый на другой, прежним хешем не проверяется', () => {
        const stored: string = passwordHash('новый-пароль');

        expect(passwordMatches(PASSWORD, stored)).toBe(false);
        expect(passwordMatches('новый-пароль', stored)).toBe(true);
    });

    it('SC-MB-34 — испорченная строка хранилища читается как «не сошлось», а не роняет сверку', () => {
        expect(passwordMatches(PASSWORD, '')).toBe(false);
        expect(passwordMatches(PASSWORD, 'только-одно-поле')).toBe(false);
    });
});

describe('burnAbsentAccountTime', () => {
    it('SC-MB-35 — сверка с заглушкой отвечает «не сошлось» на любой пароль', () => {
        expect(burnAbsentAccountTime(PASSWORD)).toBe(false);
        expect(burnAbsentAccountTime('что угодно')).toBe(false);
    });
});
