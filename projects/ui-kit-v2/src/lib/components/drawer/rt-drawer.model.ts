export namespace IRtDrawer {
    /** `side` — панель стоит рядом с содержимым и сужает его, `over` — ложится поверх содержимого. */
    export type Mode = 'side' | 'over';

    /** У какого края контейнера стоит панель. */
    export type Position = 'start' | 'end';

    /** Край панели, на котором стоит ручка ширины: тянуть его наружу — значит расширять панель. */
    export type Edge = 'start' | 'end';

    /** `clip` — содержимое обрезано краем панели и прокручивается в ней, `visible` — выходит за край. */
    export type Overflow = 'clip' | 'visible';

    /**
     * Куда панель ставит фокус на открытии. `true` — на саму панель и только поверх содержимого,
     * `false` — никуда, `'first-tabbable'` — на первый элемент обхода, другая строка — на узел по
     * CSS-селектору. Узел не нашёлся — фокус встаёт на панель.
     */
    export type AutoFocus = boolean | string;
}

/** Цель фокуса «сама панель» — пустая строка: селектора короче не бывает. */
export const FOCUS_PANEL: string = '';

/** Строки, которые значат признак, а не селектор: так их пишет атрибут без привязки. */
const FOCUS_FLAGS: ReadonlyMap<string, boolean> = new Map<string, boolean>([
    ['', true],
    ['true', true],
    ['false', false],
]);

/**
 * Куда ставить фокус на открытии: `null` — никуда, {@link FOCUS_PANEL} — на панель,
 * `'first-tabbable'` — на первый элемент обхода, иначе — селектор. Пустой атрибут и строка
 * `'true'` значат `true`, строка `'false'` — `false`.
 */
export function autoFocusTarget(value: IRtDrawer.AutoFocus | null | undefined, over: boolean): string | null {
    if (typeof value === 'string' && !FOCUS_FLAGS.has(value)) {
        return value;
    }
    const flag: boolean = typeof value === 'string' ? FOCUS_FLAGS.get(value) === true : (value ?? true);

    return flag && over ? FOCUS_PANEL : null;
}

/** Ширина в пределах `[min, max]`; если границы перепутаны, верх уступает низу. */
export function clampWidth(width: number, min: number, max: number): number {
    return Math.min(Math.max(width, min), Math.max(min, max));
}
