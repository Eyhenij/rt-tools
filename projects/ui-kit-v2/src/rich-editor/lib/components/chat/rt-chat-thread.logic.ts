/** Замеры прокрутки треда: столько, сколько нужно решению о прилипании к низу. */
export interface IRtChatThreadMetrics {
    scrollTop: number;
    scrollHeight: number;
    clientHeight: number;
}

/** Зазор от низа треда, в пределах которого читатель считается стоящим у нижнего края. */
export const RT_CHAT_NEAR_BOTTOM_THRESHOLD_PX: number = 64;

/**
 * Задержки повторных подтягиваний ленты к низу после первой прокрутки. Присланное
 * содержимое дорисовывается несколькими проходами уже после того, как лента встала по
 * промежуточной высоте, и набор тиков покрывает окно, за которое высота устаканивается.
 */
export const RT_CHAT_PIN_RETRY_DELAYS_MS: ReadonlyArray<number> = [50, 150, 300, 500, 800];

/**
 * Серия отложенных подтягиваний ленты к низу: присланное содержимое дорисовывается несколькими
 * проходами, и одной прокрутки мало. Каждый тик берёт тред заново — он бывает пересоздан — и
 * дотягивает ленту, пока читатель стоит у нижнего края.
 */
export function pinToBottomDeferred(thread: () => HTMLElement | undefined, atBottom: () => boolean): void {
    for (const delay of RT_CHAT_PIN_RETRY_DELAYS_MS) {
        setTimeout((): void => {
            const el: HTMLElement | undefined = thread();
            if (el !== undefined && atBottom()) {
                el.scrollTop = el.scrollHeight;
            }
        }, delay);
    }
}

/** Стоит ли читатель у нижнего края треда. */
export function isNearBottom(metrics: IRtChatThreadMetrics): boolean {
    return metrics.scrollHeight - metrics.clientHeight - metrics.scrollTop <= RT_CHAT_NEAR_BOTTOM_THRESHOLD_PX;
}

/**
 * Прилипает ли лента к низу после этой прокрутки.
 *
 * Прилипание снимается только тогда, когда читатель уехал вверх сам. Прокрутка, сделанная
 * самим компонентом, и рост содержимого приходят с тем же или большим положением — на них
 * прилипание лишь подтверждается: иначе позднее событие от собственной прокрутки читалось бы
 * отрывом от низа, и лента переставала бы догонять последнее сообщение.
 */
export function nextAtBottom(previous: boolean, lastScrollTop: number, metrics: IRtChatThreadMetrics): boolean {
    const nearBottom: boolean = isNearBottom(metrics);

    return metrics.scrollTop < lastScrollTop - 1 ? nearBottom : previous || nearBottom;
}
