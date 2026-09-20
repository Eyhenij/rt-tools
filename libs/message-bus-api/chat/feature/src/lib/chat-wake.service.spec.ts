import { beforeEach, describe, expect, it } from 'vitest';

import { ChatHookService, TChatHookSend } from './chat-hook.service';
import { ChatWakeService } from './chat-wake.service';
import { ChatPrismaDouble, IDoubleHookCall } from './chat.double';

/** Минута обхода: время приходит доводом, и спека проверяет решение вызовом. */
const NOW: Date = new Date('2026-09-21T12:00:00.000Z');

/** Отправка, которая всё принимает: сети в спеке нет. */
const ACCEPTING: TChatHookSend = async (): Promise<number> => 200;

/** Сколько миллисекунд в минуте: ими считается возраст реплики стенда спеки. */
const MINUTE: number = 60_000;

describe('будильник переписок', () => {
    let db: ChatPrismaDouble;
    let wake: ChatWakeService;

    /** Площадка, разговор и реплика в нём: возраст реплики и сторона задаются каждой пробой. */
    function talkOf(minutesAgo: number, side: string, answerWithin: number = 15, hours: Partial<Record<string, number>> = {}): void {
        db.sites.push({
            id: 'site-1',
            spaceId: 'space-1',
            key: 'стенд',
            origins: ['https://shop.example'],
            enabled: true,
            hookUrl: 'https://приложение.example/chat',
            hookSecret: 'тайна',
            answerWithin,
            answerFrom: hours['from'] ?? 0,
            answerTo: hours['to'] ?? 0,
            timeZone: 'Europe/Minsk',
        });
        db.conversations.push({
            id: 'talk-1',
            siteId: 'site-1',
            visitorId: 'visitor-1',
            lastMessageAt: new Date(NOW.getTime() - minutesAgo * MINUTE),
            state: 'live',
            wokeAt: null,
        });
        db.messages.push({
            id: 'message-1',
            conversationId: 'talk-1',
            side,
            text: 'Вопрос без ответа',
            takenAt: new Date(NOW.getTime() - minutesAgo * MINUTE),
        });
    }

    beforeEach((): void => {
        db = new ChatPrismaDouble();
        wake = new ChatWakeService(db.asPrisma(), new ChatHookService(db.asPrisma()));
    });

    it('SC-CH-68 — переписка без ответа дольше условленного времени будит оператора', async () => {
        talkOf(20, 'visitor');

        expect(await wake.sweep(NOW, ACCEPTING, 0)).toBe(1);

        const call: IDoubleHookCall = db.hookCalls[0];

        expect(call.kind).toBe('unanswered');
        expect(call.conversationId).toBe('talk-1');
        expect(JSON.parse(call.body).waitedMinutes).toBe(20);
        expect(db.conversations[0].wokeAt).toEqual(NOW);
    });

    it('SC-CH-68 — переписка, которая ждёт меньше условленного времени, никого не будит', async () => {
        talkOf(5, 'visitor');

        expect(await wake.sweep(NOW, ACCEPTING, 0)).toBe(0);
        expect(db.hookCalls).toHaveLength(0);
    });

    it('SC-CH-69 — второй обход по той же переписке вызова не шлёт', async () => {
        talkOf(20, 'visitor');

        expect(await wake.sweep(NOW, ACCEPTING, 0)).toBe(1);
        expect(await wake.sweep(new Date(NOW.getTime() + MINUTE), ACCEPTING, 0)).toBe(0);
        expect(db.hookCalls).toHaveLength(1);
    });

    it('SC-CH-70 — новая реплика посетителя возвращает будильник переписке', async () => {
        talkOf(20, 'visitor');
        await wake.sweep(NOW, ACCEPTING, 0);

        // посетитель написал снова, и разговор опять стоит без ответа
        const later: Date = new Date(NOW.getTime() + 30 * MINUTE);

        db.conversations[0].lastMessageAt = new Date(later.getTime() - 20 * MINUTE);

        expect(await wake.sweep(later, ACCEPTING, 0)).toBe(1);
        expect(db.hookCalls).toHaveLength(2);
    });

    it('SC-CH-66 — переписка, где последнее слово за оператором, никого не будит', async () => {
        talkOf(20, 'operator');

        expect(await wake.sweep(NOW, ACCEPTING, 0)).toBe(0);
    });

    it('SC-CH-71 — площадка с условленным временем в ноль будильника не имеет', async () => {
        talkOf(120, 'visitor', 0);

        expect(await wake.sweep(NOW, ACCEPTING, 0)).toBe(0);
    });

    it('SC-CH-72 — вне часов ответа площадки будильник молчит', async () => {
        // в Минске сейчас 15:00, а площадка отвечает с 8 до 12
        talkOf(20, 'visitor', 15, { from: 8 * 60, to: 12 * 60 });

        expect(await wake.sweep(NOW, ACCEPTING, 0)).toBe(0);

        // положительная пара: в свои часы та же переписка будит
        db.sites[0] = { ...db.sites[0], answerTo: 20 * 60 };

        expect(await wake.sweep(NOW, ACCEPTING, 0)).toBe(1);
    });
});
