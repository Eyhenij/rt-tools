/**
 * Кому из подписанных достаётся событие и как часто идёт сердцебиение.
 *
 * Решение чистое и проверяется вызовом: у потока две двери — виджет закрыт признаком посетителя,
 * панель входом человека, — и ответ «дошло или нет» один на обе. Вторая такая же проверка внутри
 * службы подписчиков разошлась бы с этой молча: обе остались бы зелёными, а чужое событие дошло
 * бы до экрана.
 */

/** Откуда событие: переписка, в которой появилась реплика, и сайт этой переписки. */
export interface IChatEventAddress {
    readonly conversationId: string;
    readonly siteId: string;
}

/** Чем закрыта подписка: переписка посетителя или набор сайтов оператора. */
export interface IChatSubscription {
    /** Переписка посетителя. Пусто — подписка не его, а оператора. */
    readonly conversationId: string | null;
    /** Сайты оператора. Пусто — он не оператор чата, и событий ему не приходит вовсе. */
    readonly siteIds: readonly string[];
}

/**
 * Через сколько миллисекунд идёт сердцебиение, пока событий нет.
 *
 * Полминуты: столько держат открытым простаивающее соединение проксировщики по умолчанию, и
 * закрытое ими соединение экран прочитал бы как кончившийся разговор.
 */
export const CHAT_BEAT_MS: number = 30_000;

/** Доходит ли событие до подписки. Подписка посетителя видит свою переписку, оператор — свои сайты. */
export function eventReaches(subscription: IChatSubscription, address: IChatEventAddress): boolean {
    if (subscription.conversationId) {
        return subscription.conversationId === address.conversationId;
    }

    return subscription.siteIds.includes(address.siteId);
}
