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
