import { describe, expect, it } from 'vitest';

import { EChatTalkState } from '@rt/message-bus-common';

import { ChatMessageMapper, chatSideOf, ChatTalkMapper, chatTalkStateOf } from './chat.mapper';
import { EChatSendState, EChatSide, IChat } from './chat.model';

describe('перевод чата в то, чем пользуется экран', () => {
    it('строка списка переписок переводится целиком', () => {
        const row: IChat.Talk.State = new ChatTalkMapper().mapFrom({
            id: 'talk-1',
            siteId: 'site-1',
            state: 'closed',
            lastMessageAt: '2026-09-20T10:00:00.000Z',
            lastMessage: 'здравствуйте',
            lastMessageSide: 'visitor',
        });

        expect(row).toEqual({
            id: 'talk-1',
            siteId: 'site-1',
            state: EChatTalkState.Closed,
            lastMessageAt: '2026-09-20T10:00:00.000Z',
            lastMessage: 'здравствуйте',
            lastMessageSide: EChatSide.Visitor,
        });
    });

    it('сообщение ленты приходит принятым: оно уже лежит в хранилище', () => {
        const message: IChat.Message.State = new ChatMessageMapper().mapFrom({
            id: 'message-1',
            side: 'operator',
            text: 'слушаю вас',
            takenAt: '2026-09-20T10:01:00.000Z',
        });

        expect(message.send).toBe(EChatSendState.Taken);
        expect(message.side).toBe(EChatSide.Operator);
    });

    it('слово вне набора читается живым разговором и стороной посетителя', () => {
        expect(chatTalkStateOf('заморожен')).toBe(EChatTalkState.Live);
        expect(chatSideOf('робот')).toBe(EChatSide.Visitor);
        // положительная пара: слова набора читаются собой
        expect(chatTalkStateOf('closed')).toBe(EChatTalkState.Closed);
        expect(chatSideOf('operator')).toBe(EChatSide.Operator);
    });
});
