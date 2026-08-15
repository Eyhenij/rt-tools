import { describe, expect, it } from 'vitest';

import { LOGIN_ATTEMPT_TTL_MS } from '@rt/message-bus-api/accounts/util';

import { LoginAttemptsService } from './login-attempts.service';

/** Момент, от которого отсчитываются попытки. Час стоит в прошлом: часы машины не читаются. */
const AT: Date = new Date('2026-08-15T12:00:00Z');

/** Момент, отстоящий от `AT` на столько-то миллисекунд. */
function later(ms: number): Date {
    return new Date(AT.getTime() + ms);
}

describe('LoginAttemptsService', () => {
    it('SC-MB-80 — неудачи по одному имени считаются подряд', () => {
        const attempts: LoginAttemptsService = new LoginAttemptsService();

        expect(attempts.failed('владелец', AT)).toBe(1);
        expect(attempts.failed('владелец', later(1000))).toBe(2);
        expect(attempts.failed('владелец', later(2000))).toBe(3);
    });

    it('SC-MB-80 — счёт у каждого имени свой', () => {
        const attempts: LoginAttemptsService = new LoginAttemptsService();

        attempts.failed('владелец', AT);
        attempts.failed('владелец', later(1000));

        expect(attempts.failed('другой', later(2000))).toBe(1);
    });

    it('SC-MB-80 — удачный вход стирает счёт', () => {
        const attempts: LoginAttemptsService = new LoginAttemptsService();

        attempts.failed('владелец', AT);
        attempts.failed('владелец', later(1000));
        attempts.passed('владелец');

        expect(attempts.counted('владелец', later(2000))).toBe(0);
        expect(attempts.failed('владелец', later(3000))).toBe(1);
    });

    it('SC-MB-80 — неудача, пережившая свой срок, счёта не удлиняет', () => {
        const attempts: LoginAttemptsService = new LoginAttemptsService();

        attempts.failed('владелец', AT);

        expect(attempts.counted('владелец', later(LOGIN_ATTEMPT_TTL_MS + 1))).toBe(0);
        expect(attempts.failed('владелец', later(LOGIN_ATTEMPT_TTL_MS + 2))).toBe(1);
    });

    it('SC-MB-80 — имена, о которых давно не спрашивали, забываются', () => {
        const attempts: LoginAttemptsService = new LoginAttemptsService();

        attempts.failed('выдуманное-имя', AT);
        // Сначала — что счёт вообще завёлся, и только потом, что он выброшен по сроку
        expect(attempts.counted('выдуманное-имя', later(1000))).toBe(1);

        attempts.failed('владелец', later(LOGIN_ATTEMPT_TTL_MS + 1));

        expect(attempts.counted('выдуманное-имя', later(LOGIN_ATTEMPT_TTL_MS + 1))).toBe(0);
    });

    it('SC-MB-80 — незнакомое имя счёта не имеет', () => {
        expect(new LoginAttemptsService().counted('никто', AT)).toBe(0);
    });
});
