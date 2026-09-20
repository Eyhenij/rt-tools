/**
 * Чат: то, чем приёмник отвечает панели оператора и потоком событий.
 *
 * Лежит в общей либе, потому что форму читают обе стороны: приёмник её собирает, панель по ней
 * рисует список и ленту. Копия у каждой из сторон разошлась бы с другой молча — обе остались бы
 * зелёными, а на экране не хватало бы поля.
 *
 * Минуты здесь строками: по проводу они и приезжают строками, а разбор их в дату — дело той
 * стороны, которая показывает.
 */

/** Сторона разговора: кто написал реплику. */
export const CHAT_SIDE_VISITOR: string = 'visitor';

/** Сторона оператора: ею помечен ответ человека. */
export const CHAT_SIDE_OPERATOR: string = 'operator';

/**
 * Состояние разговора закрытым набором: живой или закрытый.
 *
 * Набор объявлен здесь же, где форма строки: его называет приёмник и по нему отбирает список
 * панель. Свой набор у каждой из сторон разошёлся бы с другим молча — обе остались бы зелёными,
 * а отбор не нашёл бы ни одного разговора.
 */
export enum EChatTalkState {
    Live = 'live',
    Closed = 'closed',
}

/** Адрес операций чтения и отправки: страница переписок, лента, ответ, состояние. */
export const CHAT_PATH: string = '/api/chat/conversations';

/** Хвост адреса ленты одного разговора и отправки ответа в него. */
export const CHAT_MESSAGES_SEGMENT: string = 'messages';

/** Хвост адреса смены состояния разговора. */
export const CHAT_STATE_SEGMENT: string = 'state';

/** Адрес потока событий оператора. */
export const CHAT_STREAM_PATH: string = '/api/chat/conversations/stream';

/** Строка списка переписок: то, что панель показывает одной строкой. */
export interface IChatTalkRow {
    readonly id: string;
    readonly siteId: string;
    /** Состояние разговора: живой или закрытый. */
    readonly state: string;
    /** Минута последней реплики — ею же упорядочен список. */
    readonly lastMessageAt: string;
    /** Последняя реплика разговора: без неё панель спрашивала бы по строке на каждую переписку. */
    readonly lastMessage: string;
    readonly lastMessageSide: string;
}

/** Сообщение ленты одного разговора. */
export interface IChatMessageRow {
    readonly id: string;
    readonly side: string;
    readonly text: string;
    readonly takenAt: string;
}

/** Событие потока: пришедшая реплика целиком. */
export interface IChatMessageEventRow {
    readonly conversationId: string;
    readonly messageId: string;
    readonly side: string;
    readonly text: string;
    readonly takenAt: string;
}
