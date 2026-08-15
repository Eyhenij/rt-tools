import { describe, expect, it } from 'vitest';

import {
    DEFAULT_SESSION_TTL_MS,
    issueSessionToken,
    sessionAlive,
    sessionExpiry,
    sessionTokenHash,
    sessionTtlMs,
} from './session-token.util';

/** Момент, от которого считается срок входа. Час стоит в прошлом: часы машины не читаются. */
const AT: Date = new Date('2026-08-15T12:00:00Z');

describe('issueSessionToken', () => {
    it('SC-MB-33 — два входа подряд получают разные значения', () => {
        expect(issueSessionToken()).not.toBe(issueSessionToken());
    });
});

describe('sessionTokenHash', () => {
    it('SC-MB-56 — хеш одного значения один и тот же, а по нему само значение не читается', () => {
        const token: string = issueSessionToken();

        expect(sessionTokenHash(token)).toBe(sessionTokenHash(token));
        expect(sessionTokenHash(token)).not.toContain(token);
    });

    it('SC-MB-56 — разные значения дают разные хеши', () => {
        expect(sessionTokenHash('одно')).not.toBe(sessionTokenHash('другое'));
    });
});

describe('sessionTtlMs', () => {
    it('SC-MB-37 — названный настройкой срок берётся как названо', () => {
        expect(sessionTtlMs('60000')).toBe(60000);
    });

    it('SC-MB-37 — незаданный, нечисловой и неположительный срок читаются как умолчание', () => {
        expect(sessionTtlMs(undefined)).toBe(DEFAULT_SESSION_TTL_MS);
        expect(sessionTtlMs('полдня')).toBe(DEFAULT_SESSION_TTL_MS);
        expect(sessionTtlMs('0')).toBe(DEFAULT_SESSION_TTL_MS);
        expect(sessionTtlMs('-1')).toBe(DEFAULT_SESSION_TTL_MS);
    });
});

describe('sessionExpiry', () => {
    it('SC-MB-37 — вход истекает через свой срок после заведения', () => {
        expect(sessionExpiry(AT, 60000).getTime()).toBe(AT.getTime() + 60000);
    });
});

describe('sessionAlive', () => {
    it('SC-MB-37 — вход в своём сроке и не оборванный жив', () => {
        expect(sessionAlive({ expiresAt: new Date(AT.getTime() + 1000), revokedAt: null }, AT)).toBe(true);
    });

    it('SC-MB-37 — просроченный вход мёртв', () => {
        expect(sessionAlive({ expiresAt: new Date(AT.getTime() - 1000), revokedAt: null }, AT)).toBe(false);
    });

    it('SC-MB-38 — оборванный вход мёртв, хотя срок его не вышел', () => {
        expect(sessionAlive({ expiresAt: new Date(AT.getTime() + 1000), revokedAt: new Date(AT.getTime() - 1) }, AT)).toBe(false);
    });
});
