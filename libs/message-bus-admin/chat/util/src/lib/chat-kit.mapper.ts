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
import { ERtChatMessageStatus, IRtChat } from '@rt-tools/ui-kit-v2';

import { EChatSendState, EChatSide, IChat } from './chat.model';

/** Подписи сторон разговора: их даёт набор подписей экрана. */
export interface IChatSideLabels {
    readonly operator: string;
    readonly visitor: string;
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
