import { describe, expect, it } from 'vitest';

import { accountNameKey, accountNameOk } from './account-name.util';

describe('accountNameKey', () => {
    it('SC-MB-60 — имя, названное в другом регистре, приводится к тому же виду', () => {
        expect(accountNameKey('Admin')).toBe(accountNameKey('admin'));
        expect(accountNameKey('ВЛАДЕЛЕЦ')).toBe(accountNameKey('владелец'));
    });

    it('SC-MB-60 — края имени обрезаются', () => {
        expect(accountNameKey('  Владелец  ')).toBe('владелец');
    });

    it('SC-MB-60 — разные имена к одному виду не сходятся', () => {
        expect(accountNameKey('владелец')).not.toBe(accountNameKey('владелица'));
    });
});

describe('accountNameOk', () => {
    it('SC-MB-42 — названное имя годится в учётную запись', () => {
        expect(accountNameOk('Владелец')).toBe(true);
    });

    it('SC-MB-42 — пустое имя и имя из одних пробелов в запись не годятся', () => {
        expect(accountNameOk('')).toBe(false);
        expect(accountNameOk('   ')).toBe(false);
    });
});
