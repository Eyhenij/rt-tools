import { beforeEach, describe, expect, it } from 'vitest';

import { ChatHookService, IChatHookEvent, IChatHookOutcome, IChatHookTarget, TChatHookSend } from './chat-hook.service';
import { ChatPrismaDouble, IDoubleHookCall } from './chat.double';

/** Площадка, готовая принимать вызовы: есть и адрес, и тайна подписи. */
const SITE: IChatHookTarget = {
    id: 'site-1',
    key: 'стенд',
    hookUrl: 'https://приложение.example/chat',
    hookSecret: 'тайна',
};

/** Минута прогона: она же едет в теле вызова. */
const NOW: Date = new Date('2026-09-21T09:00:00.000Z');

/** Событие о реплике посетителя: переписка и поля, которые приём уже знает. */
const REMARK: IChatHookEvent = { conversationId: 'talk-1', fields: { messageId: 'message-1', side: 'visitor' } };

/** Отправка, которая всё принимает. Записывает, что и чем подписано ей отдали. */
function accepting(seen: { url: string; body: string; signature: string }[]): TChatHookSend {
    return async (url: string, body: string, signature: string): Promise<number> => {
        seen.push({ url, body, signature });

        return 200;
    };
}

describe('отправитель вызовов наружу', () => {
    let db: ChatPrismaDouble;
    let hooks: ChatHookService;

    beforeEach((): void => {
        db = new ChatPrismaDouble();
        hooks = new ChatHookService(db.asPrisma());
    });

    it('SC-CH-62 — событие уходит по адресу площадки и несёт ключ, переписку и минуту', async () => {
        const seen: { url: string; body: string; signature: string }[] = [];
        const outcome: IChatHookOutcome = await hooks.say(SITE, 'remark', REMARK, NOW, accepting(seen), 0);

        expect(outcome).toEqual({ delivered: true, attempts: 1, status: 200, fault: '' });
        expect(seen).toHaveLength(1);
        expect(seen[0].url).toBe(SITE.hookUrl);
        expect(JSON.parse(seen[0].body)).toEqual({
            kind: 'remark',
            site: 'стенд',
            conversationId: 'talk-1',
            at: NOW.toISOString(),
            messageId: 'message-1',
            side: 'visitor',
        });
    });

    it('SC-CH-63 — площадка без адреса не зовётся вовсе', async () => {
        const seen: { url: string; body: string; signature: string }[] = [];
        const outcome: IChatHookOutcome = await hooks.say({ ...SITE, hookUrl: '' }, 'remark', REMARK, NOW, accepting(seen), 0);

        expect(outcome.delivered).toBe(false);
        expect(seen).toHaveLength(0);
        // записи отправки тоже нет: звать некуда, и говорить об исходе нечего
        expect(db.hookCalls).toHaveLength(0);
    });

    it('SC-CH-63 — площадка с адресом, но без тайны не зовётся: подписать вызов нечем', async () => {
        const seen: { url: string; body: string; signature: string }[] = [];

        await hooks.say({ ...SITE, hookSecret: '' }, 'remark', REMARK, NOW, accepting(seen), 0);

        expect(seen).toHaveLength(0);
    });

    it('SC-CH-64 — вызов подписан тайной площадки', async () => {
        const seen: { url: string; body: string; signature: string }[] = [];

        await hooks.say(SITE, 'remark', REMARK, NOW, accepting(seen), 0);

        const mine: string = seen[0].signature;

        seen.length = 0;
        await hooks.say({ ...SITE, hookSecret: 'другая тайна' }, 'remark', REMARK, NOW, accepting(seen), 0);

        expect(mine).toMatch(/^[0-9a-f]{64}$/);
        expect(seen[0].signature).not.toBe(mine);
    });

    it('SC-CH-73 — отбитый вызов повторяется до предела, и запись называет исход', async () => {
        let asked: number = 0;
        const refusing: TChatHookSend = async (): Promise<number> => {
            asked += 1;

            return 503;
        };
        const outcome: IChatHookOutcome = await hooks.say(SITE, 'remark', REMARK, NOW, refusing, 0);

        expect(asked).toBe(3);
        expect(outcome).toEqual({ delivered: false, attempts: 3, status: 503, fault: '' });

        const call: IDoubleHookCall = db.hookCalls[0];

        expect(call.attempts).toBe(3);
        expect(call.lastStatus).toBe(503);
        expect(call.deliveredAt).toBeNull();
    });

    it('SC-CH-73 — молчание сети записано причиной словами, а не кодом ответа', async () => {
        const silent: TChatHookSend = async (): Promise<number> => {
            throw new Error('узел не отвечает');
        };
        const outcome: IChatHookOutcome = await hooks.say(SITE, 'remark', REMARK, NOW, silent, 0);

        expect(outcome.delivered).toBe(false);
        expect(outcome.status).toBeNull();
        expect(db.hookCalls[0].lastFault).toBe('узел не отвечает');
    });

    it('SC-CH-73 — вызов, принятый со второй попытки, записан принятым', async () => {
        let asked: number = 0;
        const flaky: TChatHookSend = async (): Promise<number> => {
            asked += 1;

            return asked === 1 ? 500 : 204;
        };
        const outcome: IChatHookOutcome = await hooks.say(SITE, 'closing', REMARK, NOW, flaky, 0);

        expect(outcome).toEqual({ delivered: true, attempts: 2, status: 204, fault: '' });
        expect(db.hookCalls[0].deliveredAt).not.toBeNull();
    });
});
