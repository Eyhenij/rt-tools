/**
 * Отправленная реплика на экране: как она появляется до ответа сервиса и что с ней делает ответ.
 *
 * Решение чистое и проверяется вызовом. Оператор отвечает нескольким разговорам подряд, и поле,
 * которое ждёт сервис, читается как потерянная реплика: реплика встаёт в ленту сразу, а ответ
 * сервиса её подтверждает или помечает отбитой. Отбитую из ленты не убирают — иначе набранный
 * текст пропадает, и отправить его заново неоткуда.
 */
import { EChatSendState, EChatSide, IChat } from './chat.model';

/** Реплика, которую экран показывает до ответа сервиса. Признак свой, временный: его выдаёт экран. */
export function chatSentMessage(id: string, text: string, at: string): IChat.Message.State {
    return { id, text, takenAt: at, side: EChatSide.Operator, send: EChatSendState.Sent };
}

/**
 * Лента после ответа сервиса о реплике.
 *
 * Принятая заменяет отправленную целиком: признак и минуту называет сервис, и оставленные свои
 * разошлись бы с хранилищем при первой же перезагрузке. Отбитая остаётся на месте с пометкой.
 */
export function chatSendAnswered(
    feed: readonly IChat.Message.State[],
    sentId: string,
    taken: IChat.Message.State | null
): IChat.Message.State[] {
    return feed.map((message: IChat.Message.State): IChat.Message.State => {
        if (message.id !== sentId) {
            return message;
        }

        return taken ?? { ...message, send: EChatSendState.Refused };
    });
}
