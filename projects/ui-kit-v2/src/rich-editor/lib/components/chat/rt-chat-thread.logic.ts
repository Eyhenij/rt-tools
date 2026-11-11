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

/** Следование ленты за низом: своё сообщение ведёт вниз всегда, чужое — только читателя у края. */
export class RtChatThreadFollow {
    /** Читатель у нижнего края. Плоское поле, не сигнал: эффект рендера не перезапускается на scroll. */
    #atBottom: boolean = true;

    /** Прошлый scrollTop треда — для различения прокрутки вверх и роста контента. */
    #lastScrollTop: number = 0;

    /** One-shot: своё отправленное сообщение всегда прокручивает тред вниз. */
    #forceScroll: boolean = false;

    /** Своё сообщение: следующий рендер ведёт ленту вниз независимо от позиции. */
    public force(): void {
        this.#forceScroll = true;
    }

    /** Признак «читатель у нижнего края» обновляется по прокрутке. */
    public scrolled(el: HTMLElement): void {
        this.#atBottom = nextAtBottom(this.#atBottom, this.#lastScrollTop, el);
        this.#lastScrollTop = el.scrollTop;
    }

    /** После рендера лента идёт к последнему сообщению; ушедшего читать историю входящее не дёргает. */
    public rendered(thread: () => HTMLElement | undefined): void {
        const el: HTMLElement | undefined = thread();
        if (el === undefined) {
            return;
        }
        if (this.#forceScroll || this.#atBottom) {
            el.scrollTop = el.scrollHeight;
            this.#atBottom = true;
            pinToBottomDeferred(thread, (): boolean => this.#atBottom);
        }
        this.#forceScroll = false;
    }
}
