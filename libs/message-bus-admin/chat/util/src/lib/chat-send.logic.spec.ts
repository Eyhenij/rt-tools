import { describe, expect, it } from 'vitest';

import { chatArrived, chatResending, chatSendAnswered, chatSentMessage } from './chat-send.logic';
import { EChatSendState, EChatSide, IChat } from './chat.model';

/** Минута, от которой считаются все остальные: часы машины в спеке не читаются. */
const AT: string = '2026-09-20T10:00:00.000Z';

describe('отправленная реплика на экране', () => {
    it('SC-CH-41 — отправленная реплика встаёт в ленту до ответа сервиса', () => {
        const sent: IChat.Message.State = chatSentMessage('свой-1', 'слушаю вас', AT);

        expect(sent).toEqual({ id: 'свой-1', text: 'слушаю вас', takenAt: AT, side: EChatSide.Operator, send: EChatSendState.Sent });
    });

    it('принятая реплика заменяет отправленную целиком', () => {
        const feed: IChat.Message.State[] = [chatSentMessage('свой-1', 'слушаю вас', AT)];
        const taken: IChat.Message.State = {
            id: 'message-1',
            side: EChatSide.Operator,
            text: 'слушаю вас',
            takenAt: '2026-09-20T10:00:01.000Z',
            send: EChatSendState.Taken,
        };

        expect(chatSendAnswered(feed, 'свой-1', taken)).toEqual([taken]);
    });

    it('SC-CH-42 — отбитая реплика остаётся в ленте с пометкой, и текст не теряется', () => {
        const feed: IChat.Message.State[] = [chatSentMessage('свой-1', 'слушаю вас', AT)];
        const after: IChat.Message.State[] = chatSendAnswered(feed, 'свой-1', null);

        expect(after).toHaveLength(1);
        expect(after[0].send).toBe(EChatSendState.Refused);
        expect(after[0].text).toBe('слушаю вас');
    });

    it('чужая реплика ленты ответом не трогается', () => {
        const feed: IChat.Message.State[] = [chatSentMessage('свой-1', 'первая', AT), chatSentMessage('свой-2', 'вторая', AT)];
        const after: IChat.Message.State[] = chatSendAnswered(feed, 'свой-1', null);

        expect(after[1].send).toBe(EChatSendState.Sent);
    });

    it('SC-CH-82 — отбитая уходит заново своим же признаком, второй рядом не заводится', () => {
        const refused: IChat.Message.State[] = chatSendAnswered([chatSentMessage('свой-1', 'слушаю вас', AT)], 'свой-1', null);
        const again: IChat.Message.State[] = chatResending(refused, 'свой-1');

        expect(again).toHaveLength(1);
        expect(again[0].id).toBe('свой-1');
        expect(again[0].send).toBe(EChatSendState.Sent);
    });

    it('соседняя реплика повтором не трогается', () => {
        const feed: IChat.Message.State[] = [chatSentMessage('свой-1', 'первая', AT), chatSentMessage('свой-2', 'вторая', AT)];

        expect(chatResending(feed, 'свой-1')[1].text).toBe('вторая');
    });

    it('SC-CH-82 — своя реплика, пришедшая потоком, вторым разом в ленту не встаёт', () => {
        const taken: IChat.Message.State = {
            id: 'message-1',
            side: EChatSide.Operator,
            text: 'слушаю вас',
            takenAt: AT,
            send: EChatSendState.Taken,
        };

        expect(chatArrived([taken], taken)).toEqual([taken]);
    });

    it('чужая реплика потока встаёт в конец ленты', () => {
        const stands: IChat.Message.State = {
            id: 'message-1',
            side: EChatSide.Operator,
            text: 'слушаю вас',
            takenAt: AT,
            send: EChatSendState.Taken,
        };
        const came: IChat.Message.State = { ...stands, id: 'message-2', side: EChatSide.Visitor, text: 'спасибо' };

        expect(chatArrived([stands], came)).toEqual([stands, came]);
    });

    it('SC-CH-82 — принятая, уже принесённая потоком, своей временной рядом не удваивается', () => {
        const taken: IChat.Message.State = {
            id: 'message-1',
            side: EChatSide.Operator,
            text: 'слушаю вас',
            takenAt: AT,
            send: EChatSendState.Taken,
        };
        const feed: IChat.Message.State[] = [chatSentMessage('свой-1', 'слушаю вас', AT), taken];

        expect(chatSendAnswered(feed, 'свой-1', taken)).toEqual([taken]);
    });
});
