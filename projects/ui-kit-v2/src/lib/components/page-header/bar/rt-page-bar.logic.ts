/** Ширина шапки, с которой отборы и действия уходят в кнопки, как на телефоне. */
const NARROW_WIDTH: number = 768;
/** Отступы шапки от краёв страницы: по 20 с каждой стороны. */
const INLINE_PADDING: number = 40;
const GAP: number = 12;
const FILTER_ONE_ROW: number = 170;
const FILTER_TWO_ROWS: number = 150;
const SEARCH_MIN: number = 400;
const MORE_WIDTH: number = 185;

export namespace IRtPageBarFit {
    export type Mode = 'one' | 'two' | 'narrow';

    export interface Input {
        /** Ширина самой шапки: на странице, суженной ассистентом, она меньше окна. */
        readonly width: number;
        readonly titleWidth: number;
        readonly actionsWidth: number;
        readonly filterCount: number;
        readonly hasSearch: boolean;
    }

    export interface Result {
        readonly mode: Mode;
        /** Сколько отборов стоит в ряду; остальные лежат под кнопкой «Ещё отборы». */
        readonly rowFilters: number;
    }
}

/** Ширина панели действий: кнопки по 32 с промежутком 8. */
export function actionsWidthOf(count: number): number {
    return count > 0 ? count * 40 - 8 : 0;
}

function filtersInSecondRow(content: number, count: number, hasSearch: boolean): number {
    const room: number = content - (hasSearch ? SEARCH_MIN + GAP : 0);
    const fitting: number = Math.floor((room + GAP) / (FILTER_TWO_ROWS + GAP));
    if (fitting >= count) {
        return count;
    }
    return Math.max(0, Math.floor((room - MORE_WIDTH) / (FILTER_TWO_ROWS + GAP)));
}

/**
 * Сколько строк нужно шапке и сколько отборов в них встаёт. Третьей строки нет: что не встало во
 * вторую, уходит под кнопку. Ширина без замера (скрытая шапка) оставляет одну строку.
 */
export function pageBarFit(input: IRtPageBarFit.Input): IRtPageBarFit.Result {
    if (input.width <= 0) {
        return { mode: 'one', rowFilters: input.filterCount };
    }
    if (input.width <= NARROW_WIDTH) {
        return { mode: 'narrow', rowFilters: 0 };
    }
    const content: number = input.width - INLINE_PADDING;
    const oneRow: number =
        input.titleWidth +
        (input.hasSearch ? GAP + SEARCH_MIN : 0) +
        input.filterCount * (GAP + FILTER_ONE_ROW) +
        (input.actionsWidth > 0 ? GAP + input.actionsWidth : 0);
    if (oneRow <= content) {
        return { mode: 'one', rowFilters: input.filterCount };
    }
    return { mode: 'two', rowFilters: filtersInSecondRow(content, input.filterCount, input.hasSearch) };
}
