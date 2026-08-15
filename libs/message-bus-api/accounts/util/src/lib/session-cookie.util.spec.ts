import { describe, expect, it } from 'vitest';

import { sessionCookieOf } from './session-cookie.util';
import { SESSION_COOKIE } from './session-token.util';

describe('sessionCookieOf', () => {
    it('SC-MB-56 — вход достаётся из заголовка среди чужих кук', () => {
        expect(sessionCookieOf(`other=1; ${SESSION_COOKIE}=значение-входа; third=2`)).toBe('значение-входа');
    });

    it('SC-MB-56 — заголовка без куки входа хватает, чтобы сказать, что её нет', () => {
        expect(sessionCookieOf('other=1; third=2')).toBe('');
        expect(sessionCookieOf(undefined)).toBe('');
    });

    it('SC-MB-56 — заголовок, повторённый дважды, кукой не считается', () => {
        expect(sessionCookieOf([`${SESSION_COOKIE}=первое`, `${SESSION_COOKIE}=второе`])).toBe('');
    });

    it('SC-MB-56 — значение с закодированными знаками читается как есть', () => {
        expect(sessionCookieOf(`${SESSION_COOKIE}=%D0%B2%D1%85%D0%BE%D0%B4`)).toBe('вход');
    });

    it('SC-MB-56 — обрывок заголовка без знака равенства куки не заводит', () => {
        expect(sessionCookieOf('обрывок')).toBe('');
    });
});
