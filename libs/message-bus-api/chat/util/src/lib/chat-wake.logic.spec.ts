import { describe, expect, it } from 'vitest';

import { IChatHours } from './chat-hours.logic';
import { chatWaitedMinutes, chatWakeDue, IChatWakeTalk } from './chat-wake.logic';

/** Часы не названы: площадка о них молчит и отвечает всегда. */
const ALWAYS: IChatHours = { from: 0, to: 0, timeZone: 'Europe/Minsk' };

/** Минута прогона: время приходит доводом, и решение проверяется вызовом, а не ожиданием часа. */
const NOW: Date = new Date('2026-09-21T12:00:00.000Z');

/** Переписка, на которую никто не ответил двадцать минут. */
const WAITING: IChatWakeTalk = {
    answerWithin: 15,
    lastMessageAt: new Date(NOW.getTime() - 20 * 60_000),
    lastSideIsVisitor: true,
    wokeAt: null,
    hours: ALWAYS,
};

describe('будильник переписки', () => {
    it('SC-CH-68 — переписка без ответа дольше условленного времени будит оператора', () => {
        expect(chatWakeDue(WAITING, NOW)).toBe(true);
        expect(chatWaitedMinutes(WAITING, NOW)).toBe(20);
    });

    it('SC-CH-68 — переписка, которая ждёт меньше условленного времени, молчит', () => {
        const fresh: IChatWakeTalk = { ...WAITING, lastMessageAt: new Date(NOW.getTime() - 5 * 60_000) };

        expect(chatWakeDue(fresh, NOW)).toBe(false);
    });

    it('SC-CH-69 — по той же реплике второй раз никто не будится', () => {
        const woken: IChatWakeTalk = { ...WAITING, wokeAt: new Date(NOW.getTime() - 3 * 60_000) };

        expect(chatWakeDue(woken, NOW)).toBe(false);
    });

    it('SC-CH-70 — новая реплика посетителя возвращает будильник переписке', () => {
        const answeredThenAsked: IChatWakeTalk = {
            ...WAITING,
            // оператор ответил и разбудил час назад, а посетитель написал снова двадцать минут назад
            wokeAt: new Date(NOW.getTime() - 60 * 60_000),
        };

        expect(chatWakeDue(answeredThenAsked, NOW)).toBe(true);
    });

    it('SC-CH-66 — переписка, где последнее слово за оператором, никого не будит', () => {
        expect(chatWakeDue({ ...WAITING, lastSideIsVisitor: false }, NOW)).toBe(false);
    });

    it('SC-CH-71 — площадка с условленным временем в ноль будильника не имеет', () => {
        expect(chatWakeDue({ ...WAITING, answerWithin: 0 }, NOW)).toBe(false);
    });

    it('SC-CH-72 — вне часов ответа площадки переписка молчит', () => {
        // часы ответа кончились: в Минске сейчас 15:00, а площадка отвечает с 8 до 12
        const offHours: IChatWakeTalk = { ...WAITING, hours: { from: 8 * 60, to: 12 * 60, timeZone: 'Europe/Minsk' } };

        expect(chatWakeDue(offHours, NOW)).toBe(false);
        // положительная пара: в свои часы та же переписка будит
        expect(chatWakeDue({ ...offHours, hours: { from: 8 * 60, to: 20 * 60, timeZone: 'Europe/Minsk' } }, NOW)).toBe(true);
    });
});
