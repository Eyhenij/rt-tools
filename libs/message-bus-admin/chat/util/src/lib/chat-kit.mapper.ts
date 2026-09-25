/**
 * Перевод реплики панели в реплику готового чата кита.
 *
 * Кит о домене не знает ничего: ни сторон разговора, ни минуты приёма, ни состояний отправки. Он
 * рисует тред по своей модели, а домен кладёт в неё своё — одним местом. Второй перевод,
 * написанный у места рисования, разошёлся бы с первым молча, и расхождение показалось бы репликой,
 * вставшей в ленту не той стороной.
 *
 * Слово об отправке переводится по смыслу, а не по имени. У панели «ушло» означает реплику,
 * которая ушла и ответа сервиса ещё не получила; у кита тем же словом зовётся записанная сервисом.
 * Перевод по имени показал бы подтверждённой реплику, о которой сервис ещё молчит.
 *
 * Подпись автора приезжает доводом: набор подписей экрана переключается в попапе профиля, и второе
 * чтение того же выбора разошлось бы с первым.
 */
import { ERtChatMessageStatus, IRtChat } from '@rt-tools/ui-kit-v2/rich-editor';

import { EChatSendState, EChatSide, IChat } from './chat.model';

/** Подписи сторон разговора: их даёт набор подписей экрана. */
export interface IChatSideLabels {
    readonly operator: string;
    readonly visitor: string;
}

/** Строка готового списка кита с разговором целиком: шаблон строки рисует его поля. */
export interface IChatKitTalkRow extends IChat.Talk.State {
    readonly hasUnread: boolean;
}

/**
 * Состояние доставки своей реплики.
 *
 * Принятая хранилищем и пришедшая чтением — одно и то же состояние: спрашивать о ней нечего, она
 * уже лежит.
 */
function statusOf(send: EChatSendState): ERtChatMessageStatus {
    switch (send) {
        case EChatSendState.Sent:
            return ERtChatMessageStatus.Sending;
        case EChatSendState.Refused:
            return ERtChatMessageStatus.Failed;
        default:
            return ERtChatMessageStatus.Sent;
    }
}

/**
 * Реплика панели как реплика треда кита.
 *
 * Состояние доставки ставится только своей реплике: посетителю нечего сообщать оператору о
 * доставке, и кит чужой реплике состояния не рисует вовсе.
 */
export function chatKitMessage(message: IChat.Message.State, labels: IChatSideLabels): IRtChat.Message {
    const own: boolean = message.side === EChatSide.Operator;
    const kit: IRtChat.Message = {
        own,
        id: message.id,
        author: own ? labels.operator : labels.visitor,
        text: message.text,
        createdAt: message.takenAt,
    };

    return own ? { ...kit, status: statusOf(message.send) } : kit;
}

/** Лента панели как тред кита: порядок тот же, что дало чтение. */
export function chatKitThread(feed: readonly IChat.Message.State[], labels: IChatSideLabels): IRtChat.Message[] {
    return feed.map((message: IChat.Message.State): IRtChat.Message => chatKitMessage(message, labels));
}

/**
 * Разговор панели как строка готового списка кита.
 *
 * Кит читает у строки только номер и признаки показа: сам разговор доезжает до шаблона строки
 * целиком. Непрочитанных у разговора нет — приёмник их не считает, и признак стоит ложью, а не
 * догадкой по минуте последней реплики.
 */
export function chatKitTalk(talk: IChat.Talk.State): IChatKitTalkRow {
    return { ...talk, hasUnread: false };
}

/** Список переписок как строки кита: порядок тот же, что дало чтение. */
export function chatKitTalks(talks: readonly IChat.Talk.State[]): IChatKitTalkRow[] {
    return talks.map((talk: IChat.Talk.State): IChatKitTalkRow => chatKitTalk(talk));
}
