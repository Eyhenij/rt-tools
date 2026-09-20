import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';

import { RateLimitService } from '@rt/message-bus-api/access/feature';
import { OPERATION_ACCESS } from '@rt/message-bus-api/access/util';
import { ACCOUNT_OF_REQUEST, IAccountBearingRequest } from '@rt/message-bus-api/accounts/util';
import { IChatConversationListRow, IChatMessageListRow } from '@rt/message-bus-api/chat/data-access';
import { CHAT_TEXT_LIMIT } from '@rt/message-bus-api/chat/util';
import { IPage } from '@rt/message-bus-common';

import { ChatIntakeController } from './chat-intake.controller';
import { ChatReadController } from './chat-read.controller';
import { ChatSubscribersService } from './chat-subscribers.service';
import { ChatPrismaDouble, IDoubleConversation, IDoubleMessage } from './chat.double';

/** Минута, от которой считаются все остальные: часы машины в спеке не читаются. */
const AT: Date = new Date('2026-09-20T10:00:00.000Z');

/** Обращение вошедшего: проверка входа кладёт учётную запись в запрос, и спека делает то же. */
function signedIn(accountId: string): IAccountBearingRequest {
    return { [ACCOUNT_OF_REQUEST]: { id: accountId, name: 'оператор', sessionId: 'session-1' } };
}

describe('ChatReadController', () => {
    let store: ChatPrismaDouble;
    let reads: ChatReadController;

    /** Переписка с последней репликой в названную минуту. */
    function talk(id: string, siteId: string, at: Date, text: string, state: string = 'live'): void {
        store.conversations.push({ id, siteId, visitorId: `visitor-of-${id}`, lastMessageAt: at, state });
        store.messages.push({ id: `message-of-${id}`, conversationId: id, side: 'visitor', text, takenAt: at });
    }

    beforeEach((): void => {
        store = new ChatPrismaDouble();
        store.sites.push({ id: 'site-1', spaceId: 'space-1', key: 'live-key', origins: ['https://shop.example'], enabled: true });
        store.sites.push({ id: 'site-2', spaceId: 'space-2', key: 'other-key', origins: ['https://other.example'], enabled: true });
        store.operatorSites.push({ accountId: 'account-1', siteId: 'site-1' });
        reads = new ChatReadController(store.asPrisma(), new ChatSubscribersService());
    });

    it('SC-CH-15 — оператор видит переписки своих сайтов и не видит соседских', async (): Promise<void> => {
        talk('own', 'site-1', AT, 'своя');
        talk('foreign', 'site-2', AT, 'чужая');

        const page: IPage<IChatConversationListRow> = await reads.page({}, signedIn('account-1'));

        expect(page.rows.map((row: IChatConversationListRow): string => row.id)).toEqual(['own']);
        expect(page.total).toBe(1);
    });

    it('SC-CH-16 — все три операции оператора объявлены закрытыми входом человека', () => {
        const declared: (string | undefined)[] = [reads.page, reads.messages, reads.state].map((operation: unknown): string | undefined =>
            Reflect.getMetadata(OPERATION_ACCESS, operation as object)
        );

        expect(declared).toEqual(['session', 'session', 'session']);
        // положительная пара к утверждению об отсутствии: метка читается вообще
        expect(declared.filter((kind: string | undefined): boolean => kind !== undefined)).toHaveLength(3);
    });

    it('SC-CH-17 — вошедший, который не оператор чата, получает пустую страницу', async (): Promise<void> => {
        talk('own', 'site-1', AT, 'своя');

        const page: IPage<IChatConversationListRow> = await reads.page({}, signedIn('account-stranger'));

        expect(page.rows).toHaveLength(0);
        expect(page.total).toBe(0);
    });

    it('SC-CH-18 — чужой сайт в отборе даёт пустую страницу, а не отказ', async (): Promise<void> => {
        talk('own', 'site-1', AT, 'своя');
        talk('foreign', 'site-2', AT, 'чужая');

        const page: IPage<IChatConversationListRow> = await reads.page({ site: 'site-2' }, signedIn('account-1'));

        expect(page.rows).toHaveLength(0);
        expect(page.total).toBe(0);
    });

    it('SC-CH-19 — список стоит по свежести, свежие первыми', async (): Promise<void> => {
        talk('old', 'site-1', new Date(AT.getTime() - 60_000), 'старая');
        talk('fresh', 'site-1', new Date(AT.getTime() + 60_000), 'свежая');
        talk('middle', 'site-1', AT, 'средняя');

        const page: IPage<IChatConversationListRow> = await reads.page({}, signedIn('account-1'));

        expect(page.rows.map((row: IChatConversationListRow): string => row.id)).toEqual(['fresh', 'middle', 'old']);
    });

    it('SC-CH-20 — список читается страницами', async (): Promise<void> => {
        for (let made: number = 0; made < 5; made += 1) {
            talk(`talk-${made}`, 'site-1', new Date(AT.getTime() + made * 1_000), `реплика ${made}`);
        }

        const first: IPage<IChatConversationListRow> = await reads.page({ page: '1', size: '2' }, signedIn('account-1'));
        const second: IPage<IChatConversationListRow> = await reads.page({ page: '2', size: '2' }, signedIn('account-1'));

        expect(first.rows.map((row: IChatConversationListRow): string => row.id)).toEqual(['talk-4', 'talk-3']);
        expect(second.rows.map((row: IChatConversationListRow): string => row.id)).toEqual(['talk-2', 'talk-1']);
        expect(first.total).toBe(5);
    });

    it('SC-CH-21 — строка списка несёт последнюю реплику', async (): Promise<void> => {
        talk('own', 'site-1', AT, 'первая');
        store.messages.push({
            id: 'message-second',
            conversationId: 'own',
            side: 'visitor',
            text: 'вторая',
            takenAt: new Date(AT.getTime() + 1_000),
        });

        const page: IPage<IChatConversationListRow> = await reads.page({}, signedIn('account-1'));

        expect(page.rows[0].lastMessage).toBe('вторая');
        expect(page.rows[0].lastMessageSide).toBe('visitor');
    });

    it('SC-CH-22 — сообщения переписки читаются страницами, старые первыми', async (): Promise<void> => {
        talk('own', 'site-1', AT, 'первая');
        for (let made: number = 1; made < 4; made += 1) {
            store.messages.push({
                id: `message-${made}`,
                conversationId: 'own',
                side: 'visitor',
                text: `реплика ${made}`,
                takenAt: new Date(AT.getTime() + made * 1_000),
            });
        }

        const page: IPage<IChatMessageListRow> = await reads.messages('own', { size: '2' }, signedIn('account-1'));

        expect(page.rows.map((row: IChatMessageListRow): string => row.text)).toEqual(['первая', 'реплика 1']);
        expect(page.total).toBe(4);
    });

    it('SC-CH-23 — сообщения чужой переписки не отдаются', async (): Promise<void> => {
        talk('foreign', 'site-2', AT, 'чужая');

        await expect(reads.messages('foreign', {}, signedIn('account-1'))).rejects.toThrow(NotFoundException);
    });

    it('SC-CH-24 — оператор закрывает переписку', async (): Promise<void> => {
        talk('own', 'site-1', AT, 'своя');

        await reads.state('own', { state: 'closed' }, signedIn('account-1'));

        const live: IPage<IChatConversationListRow> = await reads.page({ state: 'live' }, signedIn('account-1'));

        expect(store.conversations[0].state).toBe('closed');
        expect(live.rows).toHaveLength(0);
    });

    it('SC-CH-25 — состояние вне набора отбивается, и переписка не меняется', async (): Promise<void> => {
        talk('own', 'site-1', AT, 'своя');

        await expect(reads.state('own', { state: 'зачёркнута' }, signedIn('account-1'))).rejects.toThrow(BadRequestException);
        expect(store.conversations[0].state).toBe('live');
    });

    it('SC-CH-27 — состояние чужой переписки не меняется', async (): Promise<void> => {
        talk('foreign', 'site-2', AT, 'чужая');

        await expect(reads.state('foreign', { state: 'closed' }, signedIn('account-1'))).rejects.toThrow(NotFoundException);
        expect(store.conversations[0].state).toBe('live');
    });

    it('SC-CH-26 — реплика посетителя открывает закрытую переписку снова', async (): Promise<void> => {
        const intake: ChatIntakeController = new ChatIntakeController(
            store.asPrisma(),
            new RateLimitService(),
            new ChatSubscribersService()
        );
        const started: { conversationId: string; visitorToken: string } = await intake.start(
            { site: 'live-key' },
            { headers: { origin: 'https://shop.example' } },
            AT
        );

        await reads.state(started.conversationId, { state: 'closed' }, signedIn('account-1'));
        expect(store.conversations[0].state).toBe('closed');

        await intake.take(
            {
                site: 'live-key',
                visitor: started.visitorToken,
                conversation: started.conversationId,
                text: 'я вернулся',
            },
            { headers: { origin: 'https://shop.example' } },
            new Date(AT.getTime() + 10_000)
        );

        const live: IPage<IChatConversationListRow> = await reads.page({ state: 'live' }, signedIn('account-1'));
        const stored: IDoubleConversation = store.conversations[0];

        expect(stored.state).toBe('live');
        expect(live.rows.map((row: IChatConversationListRow): string => row.id)).toEqual([stored.id]);
    });

    it('SC-CH-46 — ответ оператора пишется стороной оператора', async (): Promise<void> => {
        talk('own', 'site-1', AT, 'здравствуйте');

        const written: IChatMessageListRow = await reads.answer('own', { text: 'слушаю вас' }, signedIn('account-1'), AT);

        expect(written.side).toBe('operator');
        expect(written.text).toBe('слушаю вас');
        expect(written.takenAt).toEqual(AT);
        expect(store.messages.map((row: IDoubleMessage): string => row.side)).toEqual(['visitor', 'operator']);
    });

    it('SC-CH-47 — ответ в чужую переписку отбит, и ничего не записано', async (): Promise<void> => {
        talk('foreign', 'site-2', AT, 'чужая');

        await expect(reads.answer('foreign', { text: 'слушаю вас' }, signedIn('account-1'), AT)).rejects.toThrow(NotFoundException);

        // положительная пара к утверждению об отсутствии: реплика посетителя в хранилище лежит
        expect(store.messages).toHaveLength(1);
        expect(store.messages.every((row: IDoubleMessage): boolean => row.side === 'visitor')).toBe(true);
    });

    it('пустой ответ и ответ длиннее предела не принимаются', async (): Promise<void> => {
        talk('own', 'site-1', AT, 'здравствуйте');

        await expect(reads.answer('own', { text: '   ' }, signedIn('account-1'), AT)).rejects.toThrow(BadRequestException);
        await expect(reads.answer('own', { text: 'я'.repeat(CHAT_TEXT_LIMIT + 1) }, signedIn('account-1'), AT)).rejects.toThrow(
            BadRequestException
        );
        expect(store.messages).toHaveLength(1);
    });
});
