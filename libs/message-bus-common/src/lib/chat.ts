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

/** Адрес обмена подписи потребителя на признак встраиваемой страницы. */
export const CHAT_EMBEDDED_ENTRY_PATH: string = '/api/chat/embedded/entry';

/** Адрес операций встраиваемой страницы: список переписок, лента, ответ, состояние. */
export const CHAT_EMBEDDED_PATH: string = '/api/chat/embedded/conversations';

/**
 * Ответ на обмен подписи: чем встраиваемой странице зваться дальше и до какой минуты.
 *
 * Лежит в общем слое, а не рядом с операцией: его читают обе стороны обмена, и вторая копия полей
 * разошлась бы с первой молча.
 */
export interface IChatEntryOpened {
    /** Признак страницы: его страница шлёт с каждой операцией. */
    readonly sign: string;
    /** Минута, после которой признак не принимается: страница берёт новый, не спрашивая человека. */
    readonly expiresAt: string;
}

/**
 * Признак тега с ключом площадки: им её называют оба встраиваемых файла.
 *
 * Виджет посетителя и скрипт раздела переписок читают один и тот же тег чужой страницы. Вторая
 * копия имени разошлась бы с первой молча: тег остался бы прежним, а читать его перестали бы.
 */
export const CHAT_TAG_SITE_ATTRIBUTE: string = 'site';

/** Признак тега с адресом сервиса: площадка вправе держать его на своём поддомене. */
export const CHAT_TAG_SERVICE_ATTRIBUTE: string = 'service';

/**
 * Слово сообщения с подписью: по нему страница отличает своё сообщение от чужого.
 *
 * Лежит в общем слое, а не в одном из двух приложений: скрипт установки стоит в чужой админке,
 * страница — в рамке на ней, и оба читают одно слово. Вторая копия разошлась бы с первой молча, а
 * увиделось бы это пустым разделом у потребителя.
 */
export const CHAT_PAGE_SIGNATURE_KIND: string = 'rt-chat-signature';

/** Слово просьбы: им страница просит у встроившего свежую подпись. */
export const CHAT_PAGE_SIGNATURE_ASKED: string = 'rt-chat-signature-asked';

/** Подпись потребителя: ключ площадки, минута и сам знак. */
export interface IChatPageSignature {
    readonly site: string;
    readonly at: number;
    readonly signature: string;
}

/** Адрес потока событий оператора. */
export const CHAT_STREAM_PATH: string = '/api/chat/conversations/stream';

/**
 * Площадка, какой её видит виджет: чем поздороваться и отвечает ли оператор сейчас.
 *
 * Ответ про «сейчас» считает сервис: часы названы в поясе площадки, а часы браузера посетителя
 * показывают его собственный пояс и о чужом ничего не знают.
 */
export interface IChatSiteLookRow {
    /** Приветствие площадки. Пусто — виджет открывается сразу полем набора. */
    readonly greeting: string;
    /** Отвечает ли оператор в эту минуту. */
    readonly answering: boolean;
    /** Часы ответа минутами суток: ими виджет говорит, когда придёт ответ. Равные — не названы. */
    readonly answerFrom: number;
    readonly answerTo: number;
}

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
