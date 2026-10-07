import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';

import { RateLimitService } from '@rt/message-bus-api/access/feature';
import { IAccountBearingRequest, requestSignedInAs } from '@rt/message-bus-api/access/util';
import { IChatConversationStarted } from '@rt/message-bus-api/chat/api';
import { IChatMessageListRow, IChatVisitorTalkRow } from '@rt/message-bus-api/chat/data-access';
import { EChatTalkState, IPage } from '@rt/message-bus-common';

import { ChatHookSpy } from './chat-hook.double';
import { ChatHookService } from './chat-hook.service';
import { ChatIntakeController } from './chat-intake.controller';
import { ChatReadController } from './chat-read.controller';
import { ChatSubscribersService } from './chat-subscribers.service';
import { ChatTalkService } from './chat-talk.service';
import { ChatPrismaDouble } from './chat.double';

/** Адрес страницы, с которой зовут операции: он же стоит в списке живого сайта. */
const PAGE: string = 'https://shop.example';

/** Минуты обращений: часы машины в спеке не читаются. */
const AT: Date = new Date('2026-09-20T10:00:00.000Z');
const ANSWERED: Date = new Date('2026-09-20T10:30:00.000Z');
const LATER: Date = new Date('2026-09-20T11:00:00.000Z');

/** Обращение, каким его видит операция посетителя: адрес страницы приезжает заголовком. */
function from(): { headers: Record<string, string> } {
    return { headers: { origin: PAGE, 'x-forwarded-for': '203.0.113.7' } };
}

/** Обращение вошедшего оператора с именем его учётной записи. */
function signedIn(name: string): IAccountBearingRequest {
    return requestSignedInAs('account-1', name);
}

describe('обращения посетителя', () => {
    let store: ChatPrismaDouble;
    let intake: ChatIntakeController;
    let reads: ChatReadController;
    let talks: ChatTalkService;

    beforeEach((): void => {
        store = new ChatPrismaDouble();
        store.sites.push({ id: 'site-1', spaceId: 'space-1', key: 'live-key', origins: [PAGE], enabled: true });
        store.operatorSites.push({ personId: 'account-1', siteId: 'site-1' });

        const subscribers: ChatSubscribersService = new ChatSubscribersService();

        talks = new ChatTalkService(store.asPrisma(), subscribers, new ChatHookSpy());
        intake = new ChatIntakeController(store.asPrisma(), new RateLimitService(), subscribers, new ChatHookService(store.asPrisma()));
        reads = new ChatReadController(store.asPrisma(), subscribers, talks);
    });

    it('SC-CH-103 — отметка нового обращения заводит вторую переписку того же посетителя', async (): Promise<void> => {
        const first: IChatConversationStarted = await intake.start({ site: 'live-key' }, from(), AT);
        const fresh: IChatConversationStarted = await intake.start(
            { site: 'live-key', visitor: first.visitorToken, fresh: true },
            from(),
            LATER
        );

        expect(fresh.conversationId).not.toBe(first.conversationId);
        expect(fresh.visitorToken).toBe(first.visitorToken);
        expect(store.visitors).toHaveLength(1);
        expect(store.conversations.map((talk: { visitorId: string }): string => talk.visitorId)).toEqual([
            store.visitors[0].id,
            store.visitors[0].id,
        ]);
    });

    it('SC-CH-104 — посетитель читает список своих обращений, свежие первыми', async (): Promise<void> => {
        const first: IChatConversationStarted = await intake.start({ site: 'live-key' }, from(), AT);

        await intake.take(
            { site: 'live-key', visitor: first.visitorToken, conversation: first.conversationId, text: 'первый вопрос' },
            from(),
            AT
        );
        await reads.answer(first.conversationId, { text: 'отвечаю' }, signedIn('Анна Смирнова'), ANSWERED);
        await talks.state(['site-1'], first.conversationId, EChatTalkState.Closed);

        const fresh: IChatConversationStarted = await intake.start(
            { site: 'live-key', visitor: first.visitorToken, fresh: true },
            from(),
            LATER
        );

        await intake.take(
            { site: 'live-key', visitor: first.visitorToken, conversation: fresh.conversationId, text: 'второй вопрос' },
            from(),
            LATER
        );

        const listed: IChatVisitorTalkRow[] = await intake.talks({ site: 'live-key', visitor: first.visitorToken }, from());

        expect(listed.map((row: IChatVisitorTalkRow): string => row.id)).toEqual([fresh.conversationId, first.conversationId]);
        expect(listed[0]).toMatchObject({ lastMessage: 'второй вопрос', lastMessageSide: 'visitor', state: 'live', operatorName: '' });
        expect(listed[1]).toMatchObject({
            lastMessage: 'отвечаю',
            lastMessageSide: 'operator',
            state: 'closed',
            operatorName: 'Анна Смирнова',
        });
    });

    it('SC-CH-105 — чужой признак списка не читает', async (): Promise<void> => {
        await intake.start({ site: 'live-key' }, from(), AT);

        await expect(intake.talks({ site: 'live-key', visitor: 'никому-не-выдан' }, from())).rejects.toThrow(NotFoundException);
        await expect(intake.talks({ site: 'live-key' }, from())).rejects.toThrow(NotFoundException);
    });

    it('SC-CH-106 — ответ из панели несёт имя учётной записи, ответ без неё — никакого', async (): Promise<void> => {
        const started: IChatConversationStarted = await intake.start({ site: 'live-key' }, from(), AT);

        await reads.answer(started.conversationId, { text: 'из панели' }, signedIn('Анна Смирнова'), AT);
        // встраиваемая страница отвечает без учётной записи: зовёт ту же службу без имени
        await talks.answer(['site-1'], started.conversationId, 'со встраиваемой страницы', LATER);

        const page: IPage<IChatMessageListRow> = await intake.mine(
            { site: 'live-key', visitor: started.visitorToken, conversation: started.conversationId },
            from()
        );

        expect(page.rows.map((row: IChatMessageListRow): [string, string] => [row.text, row.authorName])).toEqual([
            ['из панели', 'Анна Смирнова'],
            ['со встраиваемой страницы', ''],
        ]);
        expect(page.rows.every((row: IChatMessageListRow): boolean => !JSON.stringify(row).includes('account-1'))).toBe(true);
    });

    it('SC-CH-115 — список называет минуту закрытия, а открытая снова переписка её теряет', async (): Promise<void> => {
        const started: IChatConversationStarted = await intake.start({ site: 'live-key' }, from(), AT);
        const asked: { site: string; visitor: string } = { site: 'live-key', visitor: started.visitorToken };

        await intake.take({ ...asked, conversation: started.conversationId, text: 'вопрос' }, from(), AT);
        await talks.state(['site-1'], started.conversationId, EChatTalkState.Closed, ANSWERED);

        const closed: IChatVisitorTalkRow[] = await intake.talks(asked, from());

        expect(closed[0]).toMatchObject({ id: started.conversationId, state: 'closed', closedAt: ANSWERED });

        await intake.take({ ...asked, conversation: started.conversationId, text: 'ещё вопрос' }, from(), LATER);

        const reopened: IChatVisitorTalkRow[] = await intake.talks(asked, from());

        expect(reopened[0]).toMatchObject({ id: started.conversationId, state: 'live', closedAt: null });
    });

    it('SC-CH-52 — названное обращение читается и после того, как у посетителя появилось новое', async (): Promise<void> => {
        const first: IChatConversationStarted = await intake.start({ site: 'live-key' }, from(), AT);

        await intake.take(
            { site: 'live-key', visitor: first.visitorToken, conversation: first.conversationId, text: 'старое' },
            from(),
            AT
        );
        await intake.start({ site: 'live-key', visitor: first.visitorToken, fresh: true }, from(), LATER);

        const page: IPage<IChatMessageListRow> = await intake.mine(
            { site: 'live-key', visitor: first.visitorToken, conversation: first.conversationId },
            from()
        );

        expect(page.rows.map((row: IChatMessageListRow): string => row.text)).toEqual(['старое']);
    });
});
