import { describe, expect, it } from 'vitest';

import { chatSendAnswered, chatSentMessage } from './chat-send.logic';
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
});
