import { NotFoundException } from '@nestjs/common';
import { Subscription } from 'rxjs';
import { beforeEach, describe, expect, it } from 'vitest';

import { RateLimitService } from '@rt/message-bus-api/access/feature';
import { ACCOUNT_OF_REQUEST, IAccountBearingRequest } from '@rt/message-bus-api/accounts/util';
import { IChatConversationStarted } from '@rt/message-bus-api/chat/api';
import { IChatMessageListRow } from '@rt/message-bus-api/chat/data-access';
import { IPage } from '@rt/message-bus-common';

import { ChatIntakeController } from './chat-intake.controller';
import { ChatReadController } from './chat-read.controller';
import { ChatSubscribersService, IChatFrame } from './chat-subscribers.service';
import { ChatPrismaDouble } from './chat.double';

/** Адрес страницы, с которой зовут операции: он же стоит в списке живого сайта. */
const PAGE: string = 'https://shop.example';

/** Адрес страницы соседского сайта. */
const OTHER_PAGE: string = 'https://other.example';

/** Минута обращения: часы машины в спеке не читаются. */
const AT: Date = new Date('2026-09-20T10:00:00.000Z');

/** Обращение посетителя: адрес страницы приезжает заголовком. */
function from(origin: string = PAGE): { headers: Record<string, string> } {
    return { headers: { origin, 'x-forwarded-for': '203.0.113.7' } };
}

/** Обращение вошедшего: проверка входа кладёт учётную запись в запрос, и спека делает то же. */
function signedIn(accountId: string): IAccountBearingRequest {
    return { [ACCOUNT_OF_REQUEST]: { id: accountId, name: 'оператор', sessionId: 'session-1' } };
}

/** Открытый поток и всё, что в него пришло. */
interface IWatched {
    readonly frames: IChatFrame[];
    readonly open: Subscription;
}

describe('поток событий чата', () => {
    let store: ChatPrismaDouble;
    let subscribers: ChatSubscribersService;
    let intake: ChatIntakeController;
    let reads: ChatReadController;

    /** Завести переписку на названном сайте и вернуть выданные признаки. */
    async function talk(key: string, origin: string): Promise<IChatConversationStarted> {
        return intake.start({ site: key }, from(origin), AT);
    }

    /** Подписаться на поток посетителя. */
    async function watchVisitor(key: string, started: IChatConversationStarted, origin: string = PAGE): Promise<IWatched> {
        const frames: IChatFrame[] = [];
        const open: Subscription = (await intake.stream({ site: key, visitor: started.visitorToken }, from(origin))).subscribe(
            (frame: IChatFrame): void => {
                frames.push(frame);
            }
        );

        return { frames, open };
    }

    /** Подписаться на поток оператора. */
    async function watchOperator(accountId: string): Promise<IWatched> {
        const frames: IChatFrame[] = [];
        const open: Subscription = (await reads.stream(signedIn(accountId))).subscribe((frame: IChatFrame): void => {
            frames.push(frame);
        });

        return { frames, open };
    }

    beforeEach((): void => {
        store = new ChatPrismaDouble();
        store.sites.push({ id: 'site-1', spaceId: 'space-1', key: 'live-key', origins: [PAGE], enabled: true });
        store.sites.push({ id: 'site-2', spaceId: 'space-1', key: 'other-key', origins: [OTHER_PAGE], enabled: true });
        store.operatorSites.push({ accountId: 'account-1', siteId: 'site-1' });
        subscribers = new ChatSubscribersService();
        intake = new ChatIntakeController(store.asPrisma(), new RateLimitService(), subscribers);
        reads = new ChatReadController(store.asPrisma(), subscribers);
    });

    it('SC-CH-28 — реплика посетителя доходит до потока его переписки', async (): Promise<void> => {
        const started: IChatConversationStarted = await talk('live-key', PAGE);
        const watched: IWatched = await watchVisitor('live-key', started);

        await intake.take(
            { site: 'live-key', visitor: started.visitorToken, conversation: started.conversationId, text: 'здравствуйте' },
            from(),
            AT
        );

        expect(watched.frames).toHaveLength(1);
        expect(watched.frames[0].data).toEqual({
            conversationId: started.conversationId,
            messageId: store.messages[0].id,
            side: 'visitor',
            text: 'здравствуйте',
            takenAt: AT.toISOString(),
        });

        watched.open.unsubscribe();
    });

    it('SC-CH-29 — чужая переписка до потока посетителя не доходит', async (): Promise<void> => {
        const own: IChatConversationStarted = await talk('live-key', PAGE);
        const foreign: IChatConversationStarted = await talk('live-key', PAGE);
        const watched: IWatched = await watchVisitor('live-key', own);

        await intake.take(
            { site: 'live-key', visitor: foreign.visitorToken, conversation: foreign.conversationId, text: 'чужая' },
            from(),
            AT
        );

        // положительная пара к утверждению об отсутствии: реплика принята и в хранилище лежит
        expect(store.messages).toHaveLength(1);
        expect(watched.frames).toEqual([]);

        watched.open.unsubscribe();
    });

    it('SC-CH-30 — поток по никому не выданному признаку отвечает отказом', async (): Promise<void> => {
        await expect(intake.stream({ site: 'live-key', visitor: 'никому-не-выдан' }, from())).rejects.toBeInstanceOf(NotFoundException);
        await expect(intake.stream({ site: 'live-key' }, from())).rejects.toBeInstanceOf(NotFoundException);
    });

    it('SC-CH-31 — поток оператора несёт события его сайтов', async (): Promise<void> => {
        const own: IChatConversationStarted = await talk('live-key', PAGE);
        const foreign: IChatConversationStarted = await talk('other-key', OTHER_PAGE);
        const watched: IWatched = await watchOperator('account-1');

        await intake.take({ site: 'live-key', visitor: own.visitorToken, conversation: own.conversationId, text: 'своя' }, from(), AT);
        await intake.take(
            { site: 'other-key', visitor: foreign.visitorToken, conversation: foreign.conversationId, text: 'соседская' },
            from(OTHER_PAGE),
            AT
        );

        expect(watched.frames).toHaveLength(1);
        expect(watched.frames.map((frame: IChatFrame): unknown => (frame.data as { text: string }).text)).toEqual(['своя']);

        watched.open.unsubscribe();
    });

    it('SC-CH-32 — вошедший, который не оператор чата, получает открытый поток без событий', async (): Promise<void> => {
        const started: IChatConversationStarted = await talk('live-key', PAGE);
        const watched: IWatched = await watchOperator('account-2');

        await intake.take(
            { site: 'live-key', visitor: started.visitorToken, conversation: started.conversationId, text: 'реплика' },
            from(),
            AT
        );

        // положительная пара к утверждению об отсутствии: поток открыт, а не отбит отказом
        expect(watched.open.closed).toBe(false);
        expect(watched.frames).toEqual([]);

        watched.open.unsubscribe();
    });

    it('SC-CH-35 — пропущенное добирается по минуте последней реплики экрана', async (): Promise<void> => {
        const started: IChatConversationStarted = await talk('live-key', PAGE);
        const later: Date = new Date(AT.getTime() + 60_000);

        await intake.take(
            { site: 'live-key', visitor: started.visitorToken, conversation: started.conversationId, text: 'до' },
            from(),
            AT
        );
        await intake.take(
            { site: 'live-key', visitor: started.visitorToken, conversation: started.conversationId, text: 'после' },
            from(),
            later
        );

        const missed: IPage<IChatMessageListRow> = await reads.messages(
            started.conversationId,
            { since: AT.toISOString() },
            signedIn('account-1')
        );
        const whole: IPage<IChatMessageListRow> = await reads.messages(started.conversationId, {}, signedIn('account-1'));

        expect(missed.rows.map((row: IChatMessageListRow): string => row.text)).toEqual(['после']);
        expect(missed.total).toBe(1);
        // положительная пара к утверждению об отсутствии: без минуты видны обе реплики
        expect(whole.rows.map((row: IChatMessageListRow): string => row.text)).toEqual(['до', 'после']);
    });
    it('SC-CH-48 — ответ оператора доходит до потока посетителя', async (): Promise<void> => {
        const started: IChatConversationStarted = await talk('live-key', PAGE);

        await intake.take(
            { site: 'live-key', visitor: started.visitorToken, conversation: started.conversationId, text: 'вопрос' },
            from(),
            AT
        );

        const watched: IWatched = await watchVisitor('live-key', started);

        await reads.answer(started.conversationId, { text: 'слушаю вас' }, signedIn('account-1'), AT);

        expect(watched.frames).toHaveLength(1);
        expect(watched.frames[0].data).toMatchObject({ side: 'operator', text: 'слушаю вас', conversationId: started.conversationId });

        watched.open.unsubscribe();
    });
});
