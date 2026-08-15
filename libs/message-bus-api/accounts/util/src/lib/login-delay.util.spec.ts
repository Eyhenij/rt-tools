import { describe, expect, it } from 'vitest';

import { LOGIN_DELAY_BASE_MS, LOGIN_DELAY_MAX_MS, loginDelayMs } from './login-delay.util';

describe('loginDelayMs', () => {
    it('SC-MB-80 — первая неудача отвечает без задержки', () => {
        expect(loginDelayMs(1)).toBe(0);
    });

    it('SC-MB-80 — каждая следующая неудача подряд удлиняет ответ', () => {
        expect(loginDelayMs(2)).toBe(LOGIN_DELAY_BASE_MS);
        expect(loginDelayMs(3)).toBe(LOGIN_DELAY_BASE_MS * 2);
        expect(loginDelayMs(4)).toBe(LOGIN_DELAY_BASE_MS * 4);
    });

    it('SC-MB-80 — задержка упирается в предел и дальше не растёт', () => {
        expect(loginDelayMs(20)).toBe(LOGIN_DELAY_MAX_MS);
        expect(loginDelayMs(200)).toBe(LOGIN_DELAY_MAX_MS);
    });

    it('SC-MB-80 — счёт без единой неудачи задержки не даёт', () => {
        expect(loginDelayMs(0)).toBe(0);
    });
});
