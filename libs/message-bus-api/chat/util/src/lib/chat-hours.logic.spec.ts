import { describe, expect, it } from 'vitest';

import { chatAnswersAt, chatHoursNamed, chatMinuteOfDay, IChatHours } from './chat-hours.logic';

/** Часы площадки по московскому поясу: с девяти до восемнадцати. */
const MOSCOW_DAY: IChatHours = { from: 9 * 60, to: 18 * 60, timeZone: 'Europe/Moscow' };

describe('часы ответа площадки', () => {
    it('SC-CH-58 — внутри часов сервис отвечает, вне их — нет', () => {
        // 2026-09-21 09:00 в Москве — это 06:00 по всемирному времени
        expect(chatAnswersAt(MOSCOW_DAY, new Date('2026-09-21T06:00:00.000Z'))).toBe(true);
        expect(chatAnswersAt(MOSCOW_DAY, new Date('2026-09-21T14:59:00.000Z'))).toBe(true);
        expect(chatAnswersAt(MOSCOW_DAY, new Date('2026-09-21T15:00:00.000Z'))).toBe(false);
        expect(chatAnswersAt(MOSCOW_DAY, new Date('2026-09-21T02:00:00.000Z'))).toBe(false);
    });

    it('SC-CH-58 — неназванные часы отвечают всегда', () => {
        const silent: IChatHours = { from: 0, to: 0, timeZone: '' };

        expect(chatHoursNamed(silent)).toBe(false);
        expect(chatHoursNamed(MOSCOW_DAY)).toBe(true);
        expect(chatAnswersAt(silent, new Date('2026-09-21T02:00:00.000Z'))).toBe(true);
    });

    it('SC-CH-58 — отрезок через полночь считается двумя частями суток', () => {
        const night: IChatHours = { from: 22 * 60, to: 6 * 60, timeZone: 'UTC' };

        expect(chatAnswersAt(night, new Date('2026-09-21T23:00:00.000Z'))).toBe(true);
        expect(chatAnswersAt(night, new Date('2026-09-21T03:00:00.000Z'))).toBe(true);
        expect(chatAnswersAt(night, new Date('2026-09-21T12:00:00.000Z'))).toBe(false);
    });

    it('SC-CH-58 — незнакомый пояс считается поясом узла, а не отказом', () => {
        const at: Date = new Date('2026-09-21T06:00:00.000Z');

        expect(chatMinuteOfDay(at, 'Europe/Moscow')).toBe(9 * 60);
        expect(chatMinuteOfDay(at, 'Луна/Море_Спокойствия')).toBe(at.getHours() * 60 + at.getMinutes());
    });
});
