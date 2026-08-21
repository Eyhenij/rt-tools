/**
 * Выборка списка груза: страничная выборка и сужение по состоянию записи.
 *
 * Стоит отдельно от страничной выборки, потому что состояние есть не у всякого списка: записи
 * месяца его не несут вовсе, и поле, положенное в общую выборку, обещало бы их списку отбор,
 * которого у него нет.
 *
 * Разбор чистый и отказа не бросает — тем же приёмом, что и страничная выборка рядом: отказ это
 * код ответа, а код знает только принимающая сторона.
 */
import { cargoStateOf, ECargoState } from './cargo-state';
import { IPageAsked, pageAsked, pageFault } from './page';

/** Имя параметра отбора. Названо здесь, чтобы разбор и текст отказа не расходились строкой. */
const STATE_PARAM: string = 'state';

/** Набор целиком: по нему судится пришедшее слово и по нему же собирается текст отказа. */
const CARGO_STATES: readonly ECargoState[] = Object.values(ECargoState);

/** Выборка списка груза, как её разобрал приёмник. */
export interface ICargoPageAsked extends IPageAsked {
    /** Состояние, которым сужен список. Пусто — записи всех состояний. */
    readonly state: ECargoState | null;
}

/**
 * Состояние из параметра, если оно там названо.
 *
 * Пусто здесь означает два случая — параметра нет и параметр пуст, — и оба читаются одинаково:
 * список не сужен. Слово вне набора сюда не доходит, его отбивает отказ.
 */
function stateOf(query: Record<string, unknown>): ECargoState | null {
    const asked: unknown = query[STATE_PARAM];

    if (typeof asked !== 'string' || !asked.trim()) {
        return null;
    }

    return cargoStateOf(asked.trim());
}

/**
 * Что в отборе по состоянию не разобрано. Пусто — параметр можно читать.
 *
 * Слово вне набора отбивается, а не читается как «новое»: молча подставленное значение показало
 * бы человеку не тот список, о котором он просил. Тем же приёмом отбивается чужое поле порядка.
 */
export function cargoStateFault(query: Record<string, unknown>): string | null {
    const asked: unknown = query[STATE_PARAM];

    if (asked === undefined || asked === '') {
        return null;
    }

    const named: boolean = typeof asked === 'string' && CARGO_STATES.some((state: ECargoState): boolean => state === asked.trim());

    return named ? null : `параметр ${STATE_PARAM} ожидается одним из: ${CARGO_STATES.join(', ')}`;
}

/** Что в выборке списка груза не разобрано: страница, порядок, дерево и состояние вместе. */
export function cargoPageFault(query: Record<string, unknown>, sortable: readonly string[]): string | null {
    return pageFault(query, sortable) ?? cargoStateFault(query);
}

/**
 * Выборка списка груза.
 *
 * Зовётся после `cargoPageFault`, но и сама по себе полна: неразобранное заменяется умолчанием,
 * а не роняет разбор.
 */
export function cargoPageAsked(query: Record<string, unknown>, sortable: readonly string[]): ICargoPageAsked {
    return { ...pageAsked(query, sortable), state: stateOf(query) };
}
