/**
 * Перевод чата из ответа приёмника в то, чем пользуется экран.
 *
 * Маппер свой на каждую форму: строка списка и сообщение ленты читаются разными операциями и
 * общих полей не имеют. Слово стороны и слово состояния приезжают строками, и чужое слово здесь
 * же становится значением набора — набор закрыт, и экран показывает значение, а не пришедшую
 * строку.
 */
import { BaseMapper } from '@rt-tools/utils';

import { EChatTalkState } from '@rt/message-bus-common';

import { EChatSendState, EChatSide, IChat } from './chat.model';

/** Набор состояний целиком: по нему судится приехавшее слово. */
const STATES: readonly EChatTalkState[] = Object.values(EChatTalkState);

/** Набор сторон целиком. */
const SIDES: readonly EChatSide[] = Object.values(EChatSide);

/**
 * Состояние разговора из слова контракта. Слово вне набора — живой разговор: закрытым его делает
 * оператор, и непрочитанное слово скрывало бы разговор, которого никто не закрывал.
 */
export function chatTalkStateOf(raw: string): EChatTalkState {
    return STATES.find((state: EChatTalkState): boolean => state === raw) ?? EChatTalkState.Live;
}

/**
 * Сторона реплики из слова контракта. Слово вне набора — посетитель: ответ оператора пишет сама
 * панель, и неизвестное слово приходит со стороны, которой отвечают.
 */
export function chatSideOf(raw: string): EChatSide {
    return SIDES.find((side: EChatSide): boolean => side === raw) ?? EChatSide.Visitor;
}

/** Строка списка переписок. */
export class ChatTalkMapper extends BaseMapper<IChat.Talk.State> {
    public override mapFrom(data: IChat.Talk.Api): IChat.Talk.State {
        return {
            id: this.typeCast.getAsString(data.id),
            siteId: this.typeCast.getAsString(data.siteId),
            state: chatTalkStateOf(this.typeCast.getAsString(data.state)),
            lastMessageAt: this.typeCast.getAsString(data.lastMessageAt),
            lastMessage: this.typeCast.getAsString(data.lastMessage),
            lastMessageSide: chatSideOf(this.typeCast.getAsString(data.lastMessageSide)),
        };
    }
}

/** Сообщение ленты. Пришедшее из хранилища принято: спрашивать о нём нечего, оно уже лежит. */
export class ChatMessageMapper extends BaseMapper<IChat.Message.State> {
    public override mapFrom(data: IChat.Message.Api): IChat.Message.State {
        return {
            id: this.typeCast.getAsString(data.id),
            side: chatSideOf(this.typeCast.getAsString(data.side)),
            text: this.typeCast.getAsString(data.text),
            takenAt: this.typeCast.getAsString(data.takenAt),
            send: EChatSendState.Taken,
        };
    }
}
