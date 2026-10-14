export namespace IRtDrawer {
    /** `side` — панель стоит рядом с содержимым и сужает его, `over` — ложится поверх содержимого. */
    export type Mode = 'side' | 'over';

    /** У какого края контейнера стоит панель. */
    export type Position = 'start' | 'end';

    /** Край панели, на котором стоит ручка ширины: тянуть его наружу — значит расширять панель. */
    export type Edge = 'start' | 'end';
}

/** Ширина в пределах `[min, max]`; если границы перепутаны, верх уступает низу. */
export function clampWidth(width: number, min: number, max: number): number {
    return Math.min(Math.max(width, min), Math.max(min, max));
}
