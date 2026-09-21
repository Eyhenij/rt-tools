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

/**
 * Лента, когда отбитую реплику отправляют заново.
 *
 * Реплика остаётся на своём месте и своим признаком: второй такой же рядом означал бы, что
 * посетителю написали дважды, а написали один раз. Ответ сервиса заменит её принятой — тем же
 * путём, каким заменяет впервые отправленную.
 */
export function chatResending(feed: readonly IChat.Message.State[], id: string): IChat.Message.State[] {
    return feed.map((message: IChat.Message.State): IChat.Message.State =>
        message.id === id ? { ...message, send: EChatSendState.Sent } : message
    );
}

/**
 * Минута реплики словами языка экрана.
 *
 * Строка по проводу приезжает всемирным временем, а человек читает местное: показанная как есть,
 * она называет другой час тому, кто сидит не в поясе сервиса. Язык приезжает доводом, а не
 * читается здесь: набор подписей экрана переключается в попапе профиля, и второе чтение того же
 * выбора разошлось бы с первым.
 */
export function chatMomentText(iso: string, locale: string): string {
    const at: Date = new Date(iso);

    return Number.isNaN(at.getTime()) ? '' : at.toLocaleString(locale);
}
