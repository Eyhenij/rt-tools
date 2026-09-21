/**
 * Годен ли текст реплики к приёму.
 *
 * Пустая реплика разговора не несёт, а слишком длинная приезжает не от человека. Решение —
 * чистой функцией: предел приходит доводом, и спека проверяет его вызовом, а не набором тысяч
 * знаков в настоящем приёме.
 */
import { CHAT_TEXT_LIMIT } from './chat-limits';

/** Чем текст реплики не годится. */
export enum EChatTextFault {
    /** Текста нет вовсе или в нём одни пробелы. */
    Empty = 'empty',
    /** Знаков больше предела. */
    TooLong = 'tooLong',
}

/** Что не так с текстом реплики. Пусто — текст годен. */
export function chatTextFault(text: string, limit: number = CHAT_TEXT_LIMIT): EChatTextFault | null {
    const said: string = text.trim();

    if (!said) {
        return EChatTextFault.Empty;
    }

    return said.length > limit ? EChatTextFault.TooLong : null;
}
