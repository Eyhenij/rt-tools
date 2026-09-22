import { BadRequestException, ForbiddenException, HttpException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';

import { RateLimitService } from '@rt/message-bus-api/access/feature';
import { IChatConversationStarted, IChatMessageTaken } from '@rt/message-bus-api/chat/api';
import { IChatMessageListRow } from '@rt/message-bus-api/chat/data-access';
import { CHAT_RATE_LIMIT, CHAT_TEXT_LIMIT } from '@rt/message-bus-api/chat/util';
import { IChatSiteLookRow, IPage } from '@rt/message-bus-common';

import { ChatHookSpy } from './chat-hook.double';
import { ChatHookService } from './chat-hook.service';
import { ChatIntakeController } from './chat-intake.controller';
import { ChatSubscribersService } from './chat-subscribers.service';
import { ChatPrismaDouble, IDoubleMessage } from './chat.double';

/** Адрес страницы, с которой зовут операции: он же стоит в списке живого сайта. */
const PAGE: string = 'https://shop.example';

/** Обращение, каким его видит операция: адрес страницы приезжает заголовком. */
function from(origin: string = PAGE): { headers: Record<string, string> } {
    return { headers: { origin, 'x-forwarded-for': '203.0.113.7' } };
}

/** Минута обращения: часы машины в спеке не читаются. */
const AT: Date = new Date('2026-09-20T10:00:00.000Z');

describe('ChatIntakeController', () => {
    let store: ChatPrismaDouble;
    let controller: ChatIntakeController;

    beforeEach((): void => {
        store = new ChatPrismaDouble();
        store.sites.push({ id: 'site-1', spaceId: 'space-1', key: 'live-key', origins: [PAGE], enabled: true });
        store.sites.push({ id: 'site-2', spaceId: 'space-1', key: 'off-key', origins: [PAGE], enabled: false });
        store.sites.push({ id: 'site-3', spaceId: 'space-1', key: 'empty-origins', origins: [], enabled: true });
        store.sites.push({
            id: 'site-4',
            spaceId: 'space-1',
            key: 'hours-key',
            origins: [PAGE],
            enabled: true,
            greeting: 'Здравствуйте! Чем помочь?',
            answerFrom: 9 * 60,
            answerTo: 18 * 60,
            timeZone: 'UTC',
        });
        controller = new ChatIntakeController(
            store.asPrisma(),
            new RateLimitService(),
            new ChatSubscribersService(),
            new ChatHookService(store.asPrisma())
        );
    });

    it('SC-CH-1 — заведение переписки по ключу сайта выдаёт признак посетителя', async (): Promise<void> => {
        const started: IChatConversationStarted = await controller.start({ site: 'live-key' }, from(), AT);

        expect(started.conversationId).toBeTruthy();
        expect(started.visitorToken).toBeTruthy();
        expect(store.conversations).toHaveLength(1);
        expect(store.visitors[0].token).toBe(started.visitorToken);
    });

    it('SC-CH-2 — второе заведение с тем же признаком возвращает живую переписку', async (): Promise<void> => {
        const first: IChatConversationStarted = await controller.start({ site: 'live-key' }, from(), AT);
        const second: IChatConversationStarted = await controller.start({ site: 'live-key', visitor: first.visitorToken }, from(), AT);

        expect(second.conversationId).toBe(first.conversationId);
        expect(second.visitorToken).toBe(first.visitorToken);
        expect(store.conversations).toHaveLength(1);
    });

    it('SC-CH-3 — ключ, которого нет ни у одного сайта, отбивается', async (): Promise<void> => {
        await expect(controller.start({ site: 'no-such-key' }, from(), AT)).rejects.toThrow(UnauthorizedException);
        expect(store.conversations).toHaveLength(0);
    });

    it('SC-CH-4 — выключенный сайт отвечает как неизвестный', async (): Promise<void> => {
        await expect(controller.start({ site: 'off-key' }, from(), AT)).rejects.toThrow(UnauthorizedException);
        expect(store.conversations).toHaveLength(0);
    });

    it('SC-CH-5 — адрес страницы вне списка сайта отбивается', async (): Promise<void> => {
        await expect(controller.start({ site: 'live-key' }, from('https://foreign.example'), AT)).rejects.toThrow(ForbiddenException);
        expect(store.conversations).toHaveLength(0);
    });

    it('SC-CH-6 — сайт с пустым списком адресов отказывает любому обращению', async (): Promise<void> => {
        await expect(controller.start({ site: 'empty-origins' }, from(), AT)).rejects.toThrow(ForbiddenException);
    });

    it('обращение без ключа сайта отбивается до всего прочего', async (): Promise<void> => {
        await expect(controller.start({}, from(), AT)).rejects.toThrow(BadRequestException);
    });

    it('SC-CH-7 — реплика ложится в переписку посетителя и двигает её свежесть', async (): Promise<void> => {
        const started: IChatConversationStarted = await controller.start({ site: 'live-key' }, from(), AT);
        const later: Date = new Date(AT.getTime() + 5_000);
        const taken: IChatMessageTaken = await controller.take(
            { site: 'live-key', visitor: started.visitorToken, conversation: started.conversationId, text: 'здравствуйте' },
            from(),
            later
        );

        expect(store.messages).toHaveLength(1);
        expect(store.messages[0].side).toBe('visitor');
        expect(store.messages[0].text).toBe('здравствуйте');
        expect(taken.takenAt).toBe(later.toISOString());
        expect(store.conversations[0].lastMessageAt).toEqual(later);
    });

    it('SC-CH-8 — чужой признак посетителя до переписки не доходит', async (): Promise<void> => {
        const first: IChatConversationStarted = await controller.start({ site: 'live-key' }, from(), AT);
        const second: IChatConversationStarted = await controller.start({ site: 'live-key' }, from(), AT);

        await expect(
            controller.take(
                { site: 'live-key', visitor: second.visitorToken, conversation: first.conversationId, text: 'чужое' },
                from(),
                AT
            )
        ).rejects.toThrow(NotFoundException);
        expect(store.messages).toHaveLength(0);
    });

    it('SC-CH-9 — реплика без текста не принимается', async (): Promise<void> => {
        const started: IChatConversationStarted = await controller.start({ site: 'live-key' }, from(), AT);

        await expect(
            controller.take(
                { site: 'live-key', visitor: started.visitorToken, conversation: started.conversationId, text: '   ' },
                from(),
                AT
            )
        ).rejects.toThrow(BadRequestException);
        expect(store.messages).toHaveLength(0);
    });

    it('SC-CH-10 — текст длиннее предела отбивается, и предел назван в ответе', async (): Promise<void> => {
        const started: IChatConversationStarted = await controller.start({ site: 'live-key' }, from(), AT);
        const long: string = 'а'.repeat(CHAT_TEXT_LIMIT + 1);
        const refusal: HttpException = await controller
            .take({ site: 'live-key', visitor: started.visitorToken, conversation: started.conversationId, text: long }, from(), AT)
            .then((): HttpException => new HttpException('принято', 200))
            .catch((error: HttpException): HttpException => error);

        expect(refusal).toBeInstanceOf(BadRequestException);
        expect(JSON.stringify(refusal.getResponse())).toContain(String(CHAT_TEXT_LIMIT));
    });

    it('SC-CH-11 — поток реплик с одного посетителя держит предел частоты', async (): Promise<void> => {
        const started: IChatConversationStarted = await controller.start({ site: 'live-key' }, from(), AT);
        const say: (text: string) => Promise<IChatMessageTaken> = async (text: string): Promise<IChatMessageTaken> =>
            controller.take({ site: 'live-key', visitor: started.visitorToken, conversation: started.conversationId, text }, from(), AT);

        for (let sent: number = 0; sent < CHAT_RATE_LIMIT; sent += 1) {
            await say(`реплика ${sent}`);
        }
        expect(store.messages).toHaveLength(CHAT_RATE_LIMIT);

        const refusal: HttpException = await say('лишняя')
            .then((): HttpException => new HttpException('принято', 200))
            .catch((error: HttpException): HttpException => error);

        expect(refusal.getStatus()).toBe(429);
        expect(store.messages).toHaveLength(CHAT_RATE_LIMIT);
    });

    it('SC-CH-50 — площадка отдаёт приветствие и говорит, отвечает ли оператор сейчас', async (): Promise<void> => {
        const inHours: IChatSiteLookRow = await controller.look({ site: 'hours-key' }, from(), AT);
        const atNight: IChatSiteLookRow = await controller.look({ site: 'hours-key' }, from(), new Date('2026-09-20T02:00:00.000Z'));

        expect(inHours.greeting).toBe('Здравствуйте! Чем помочь?');
        expect(inHours.answering).toBe(true);
        expect(inHours.answerFrom).toBe(9 * 60);
        expect(atNight.answering).toBe(false);
    });

    it('SC-CH-57 — площадка по неизвестному и выключенному ключу отвечает одинаково', async (): Promise<void> => {
        await expect(controller.look({ site: 'no-such-key' }, from(), AT)).rejects.toThrow(UnauthorizedException);
        await expect(controller.look({ site: 'off-key' }, from(), AT)).rejects.toThrow(UnauthorizedException);
    });

    it('SC-CH-52 — вернувшийся посетитель читает свою переписку, старые реплики первыми', async (): Promise<void> => {
        const started: IChatConversationStarted = await controller.start({ site: 'live-key' }, from(), AT);
        const body: (text: string) => Record<string, string> = (text: string): Record<string, string> => ({
            site: 'live-key',
            visitor: started.visitorToken,
            conversation: started.conversationId,
            text,
        });

        await controller.take(body('первая'), from(), new Date(AT.getTime() + 1_000));
        await controller.take(body('вторая'), from(), new Date(AT.getTime() + 2_000));

        const mine: IPage<IChatMessageListRow> = await controller.mine(
            { site: 'live-key', visitor: started.visitorToken, conversation: started.conversationId },
            from()
        );

        expect(mine.rows.map((row: IChatMessageListRow): string => row.text)).toEqual(['первая', 'вторая']);
        expect(mine.total).toBe(2);
    });

    it('SC-CH-52 — чужой признак посетителя до чужой переписки не доходит', async (): Promise<void> => {
        const started: IChatConversationStarted = await controller.start({ site: 'live-key' }, from(), AT);

        await expect(
            controller.mine({ site: 'live-key', visitor: 'чужой-признак', conversation: started.conversationId }, from())
        ).rejects.toThrow(NotFoundException);
    });

    it('SC-CH-12 — порядок сообщений задаёт минута приёма, а не часы отправителя', async (): Promise<void> => {
        const started: IChatConversationStarted = await controller.start({ site: 'live-key' }, from(), AT);
        const first: Date = new Date(AT.getTime() + 1_000);
        const second: Date = new Date(AT.getTime() + 2_000);
        const body: (text: string) => Record<string, string> = (text: string): Record<string, string> => ({
            site: 'live-key',
            visitor: started.visitorToken,
            conversation: started.conversationId,
            text,
            // часы отправителя: сервис их не читает вовсе
            sentAt: new Date(AT.getTime() - 60_000).toISOString(),
        });

        await controller.take(body('первая'), from(), first);
        await controller.take(body('вторая'), from(), second);

        const order: Date[] = store.messages.map((message: IDoubleMessage): Date => message.takenAt);

        expect(order).toEqual([first, second]);
    });
    it('SC-CH-62 — принятая реплика уходит вызовом наружу', async (): Promise<void> => {
        const hooks: ChatHookSpy = new ChatHookSpy();
        const intake: ChatIntakeController = new ChatIntakeController(
            store.asPrisma(),
            new RateLimitService(),
            new ChatSubscribersService(),
            hooks
        );
        const talk: IChatConversationStarted = await intake.start({ site: 'live-key' }, from(), AT);

        await intake.take(
            { site: 'live-key', visitor: talk.visitorToken, conversation: talk.conversationId, text: 'Здравствуйте' },
            from(),
            AT
        );
        await new Promise<void>((done: () => void): void => {
            setTimeout(done, 0);
        });

        expect(hooks.said).toEqual([{ kind: 'remark', site: 'live-key', conversationId: talk.conversationId }]);
    });

    it('SC-CH-67 — зависшая отправка наружу ответ посетителю не держит', async (): Promise<void> => {
        const hooks: ChatHookSpy = new ChatHookSpy();
        const intake: ChatIntakeController = new ChatIntakeController(
            store.asPrisma(),
            new RateLimitService(),
            new ChatSubscribersService(),
            hooks
        );
        const talk: IChatConversationStarted = await intake.start({ site: 'live-key' }, from(), AT);

        hooks.hang();

        const taken: IChatMessageTaken = await intake.take(
            { site: 'live-key', visitor: talk.visitorToken, conversation: talk.conversationId, text: 'Пишу, пока узел молчит' },
            from(),
            AT
        );

        // ответ посетителю пришёл, хотя отправка наружу не кончилась ничем
        expect(taken.messageId).toBeTruthy();
        expect(hooks.said).toHaveLength(1);
    });
});
