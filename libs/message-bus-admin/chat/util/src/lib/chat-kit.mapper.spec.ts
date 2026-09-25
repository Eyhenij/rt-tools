import { EChatTalkState } from '@rt/message-bus-common';
import { ERtChatMessageStatus, IRtChat } from '@rt-tools/ui-kit-v2/rich-editor';

import { chatKitMessage, chatKitTalk, chatKitTalks, chatKitThread, IChatKitTalkRow, IChatSideLabels } from './chat-kit.mapper';
import { EChatSendState, EChatSide, IChat } from './chat.model';

/** Подписи сторон: на экране их даёт набор подписей, здесь — довод пробы. */
const LABELS: IChatSideLabels = { operator: 'Оператор', visitor: 'Посетитель' };

/** Разговор панели: остальные поля пробам безразличны. */
function talk(id: string): IChat.Talk.State {
    return {
        id,
        siteId: 'site-1',
        state: EChatTalkState.Live,
        lastMessageAt: '2026-09-21T10:00:00.000Z',
        lastMessage: 'Здравствуйте',
        lastMessageSide: EChatSide.Visitor,
    };
}

/** Реплика панели: сторона и состояние отправки задаются каждой пробой. */
function message(side: EChatSide, send: EChatSendState = EChatSendState.Taken): IChat.Message.State {
    return { id: 'message-1', side, send, text: 'Здравствуйте', takenAt: '2026-09-21T10:00:00.000Z' };
}

describe('перевод реплики панели в реплику кита', () => {
    it('SC-CH-80 — реплика оператора своя, реплика посетителя чужая', () => {
        const own: IRtChat.Message = chatKitMessage(message(EChatSide.Operator), LABELS);
        const foreign: IRtChat.Message = chatKitMessage(message(EChatSide.Visitor), LABELS);

        expect(own.own).toBe(true);
        expect(own.author).toBe('Оператор');
        expect(foreign.own).toBe(false);
        expect(foreign.author).toBe('Посетитель');
    });

    it('SC-CH-80 — признак, текст и минута приёма переезжают как есть', () => {
        const given: IRtChat.Message = chatKitMessage(message(EChatSide.Operator), LABELS);

        expect(given.id).toBe('message-1');
        expect(given.text).toBe('Здравствуйте');
        expect(given.createdAt).toBe('2026-09-21T10:00:00.000Z');
    });

    it('SC-CH-81 — ушедшая без ответа сервиса считается уходящей, а не записанной', () => {
        const given: IRtChat.Message = chatKitMessage(message(EChatSide.Operator, EChatSendState.Sent), LABELS);

        expect(given.status).toBe(ERtChatMessageStatus.Sending);
    });

    it('SC-CH-82 — отбитая считается отбитой, принятая — записанной', () => {
        const refused: IRtChat.Message = chatKitMessage(message(EChatSide.Operator, EChatSendState.Refused), LABELS);
        const taken: IRtChat.Message = chatKitMessage(message(EChatSide.Operator, EChatSendState.Taken), LABELS);

        expect(refused.status).toBe(ERtChatMessageStatus.Failed);
        expect(taken.status).toBe(ERtChatMessageStatus.Sent);
    });

    it('чужой реплике состояния доставки не ставится вовсе', () => {
        const foreign: IRtChat.Message = chatKitMessage(message(EChatSide.Visitor, EChatSendState.Sent), LABELS);

        // положительная пара к отсутствию: подпись и текст на месте, и дело именно в состоянии
        expect(foreign.author).toBe('Посетитель');
        expect(foreign.status).toBeUndefined();
    });

    it('SC-CH-80 — порядок ленты переводом не меняется', () => {
        const feed: IChat.Message.State[] = [
            { ...message(EChatSide.Visitor), id: 'первая' },
            { ...message(EChatSide.Operator), id: 'вторая' },
        ];

        expect(chatKitThread(feed, LABELS).map((one: IRtChat.Message): string => String(one.id))).toEqual(['первая', 'вторая']);
    });
});

describe('перевод разговора панели в строку готового списка', () => {
    it('разговор доезжает до строки целиком: шаблон строки рисует его поля', () => {
        const row: IChatKitTalkRow = chatKitTalk(talk('talk-1'));

        expect(row.id).toBe('talk-1');
        expect(row.siteId).toBe('site-1');
        expect(row.lastMessage).toBe('Здравствуйте');
        expect(row.lastMessageSide).toBe(EChatSide.Visitor);
    });

    it('непрочитанных у разговора нет: приёмник их не считает', () => {
        // положительная пара к лжи признака: сам разговор на месте, и дело именно в непрочитанных
        expect(chatKitTalk(talk('talk-1')).id).toBe('talk-1');
        expect(chatKitTalk(talk('talk-1')).hasUnread).toBe(false);
    });

    it('порядок списка переводом не меняется', () => {
        const rows: IChatKitTalkRow[] = chatKitTalks([talk('первый'), talk('второй')]);

        expect(rows.map((row: IChatKitTalkRow): string => String(row.id))).toEqual(['первый', 'второй']);
    });
});
