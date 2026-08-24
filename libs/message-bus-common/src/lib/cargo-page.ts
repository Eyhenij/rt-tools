/**
 * Выборка списка груза: страничная выборка и сужение по состоянию записи и версии выпуска.
 *
 * Стоит отдельно от страничной выборки, потому что ни состояния, ни версии нет у всякого списка:
 * записи месяца не несут их вовсе, и поле, положенное в общую выборку, обещало бы их списку
 * отбор, которого у него нет.
 *
 * Разбор чистый и отказа не бросает — тем же приёмом, что и страничная выборка рядом: отказ это
 * код ответа, а код знает только принимающая сторона.
 */
import { cargoStateOf, ECargoState } from './cargo-state';
import { IPageAsked, pageAsked, pageFault } from './page';

/** Имя параметра отбора по состоянию. Названо здесь, чтобы разбор и текст отказа не расходились строкой. */
const STATE_PARAM: string = 'state';

/** Имя параметра отбора по версии выпуска. */
const VERSION_PARAM: string = 'version';

/**
 * Слово, которым запрашивают записи без версии.
 *
 * Пустой параметр для этого не годится: он означает снятый отбор, и отличить «все версии» от
 * «те, у кого версии нет» стало бы нечем. Слово выбрано таким, каким версия не бывает: числовая
 * версия начинается цифрой, а дерево, версионирующее по-своему, шлёт своё слово целиком.
 */
export const CARGO_VERSION_NONE: string = 'none';

/** Предел длины версии в параметре. Тот же, что у самой версии: длиннее её не бывает. */
const VERSION_LIMIT: number = 64;

/** Набор целиком: по нему судится пришедшее слово и по нему же собирается текст отказа. */
const CARGO_STATES: readonly ECargoState[] = Object.values(ECargoState);

/** Выборка списка груза, как её разобрал приёмник. */
export interface ICargoPageAsked extends IPageAsked {
    /** Состояние, которым сужен список. Пусто — записи всех состояний. */
    readonly state: ECargoState | null;
    /** Версия выпуска, которой сужен список. Пусто — записи всех версий. */
    readonly version: string | null;
    /** Сужен ли список до записей без версии. Со значением версии вместе не приходит. */
    readonly withoutVersion: boolean;
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

/**
 * Что в отборе по версии не разобрано. Пусто — параметр можно читать.
 *
 * Версия, которой в записях нет, отказом не отбивается: набор версий открыт — их называет дерево
 * при выпуске, и вчерашняя версия могла уехать вместе с вычищенными записями. Такой запрос
 * отвечает пустым списком. Отбивается только то, что версией быть не может вовсе: не строка и
 * строка длиннее предела.
 */
export function cargoVersionFault(query: Record<string, unknown>): string | null {
    const asked: unknown = query[VERSION_PARAM];

    if (asked === undefined || asked === '') {
        return null;
    }

    if (typeof asked !== 'string') {
        return `параметр ${VERSION_PARAM} ожидается строкой`;
    }

    return asked.trim().length > VERSION_LIMIT ? `параметр ${VERSION_PARAM} длиннее ${VERSION_LIMIT} знаков` : null;
}

/** Что в выборке списка груза не разобрано: страница, порядок, дерево, состояние и версия вместе. */
export function cargoPageFault(query: Record<string, unknown>, sortable: readonly string[]): string | null {
    return pageFault(query, sortable) ?? cargoStateFault(query) ?? cargoVersionFault(query);
}

/**
 * Версия из параметра, если она там названа.
 *
 * Слово «без версии» сюда не доходит: оно не значение отбора, а отдельный признак, и читается
 * рядом.
 */
function versionOf(query: Record<string, unknown>): string | null {
    const asked: unknown = query[VERSION_PARAM];

    if (typeof asked !== 'string' || !asked.trim() || asked.trim() === CARGO_VERSION_NONE) {
        return null;
    }

    return asked.trim();
}

/**
 * Выборка списка груза.
 *
 * Зовётся после `cargoPageFault`, но и сама по себе полна: неразобранное заменяется умолчанием,
 * а не роняет разбор.
 */
export function cargoPageAsked(query: Record<string, unknown>, sortable: readonly string[]): ICargoPageAsked {
    const asked: unknown = query[VERSION_PARAM];

    return {
        ...pageAsked(query, sortable),
        state: stateOf(query),
        version: versionOf(query),
        withoutVersion: typeof asked === 'string' && asked.trim() === CARGO_VERSION_NONE,
    };
}
