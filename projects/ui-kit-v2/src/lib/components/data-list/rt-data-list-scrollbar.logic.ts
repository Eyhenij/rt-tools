/**
 * Стандартные свойства полосы прокрутки таблицы по выбору человека. Пусто — таблица берёт тихую
 * полосу основы кита.
 *
 * Основа кита ставит `scrollbar-width` и `scrollbar-color` всем узлам, а Chrome при заданном
 * стандартном свойстве не читает `::-webkit-scrollbar` вовсе: нулевой размер оттуда полосу не
 * прятал. Обе скрытые полосы прячет `scrollbar-width: none` в любом браузере. Одну из двух
 * стандартные свойства не прячут — они про обе оси сразу, поэтому тогда они сбрасываются в `auto`,
 * и размер каждой оси задаёт `::-webkit-scrollbar`.
 */
export interface IRtDataListScrollbarStandard {
    readonly width: string | null;
    readonly color: string | null;
}

export function dataListScrollbarStandard(isVerticalShown: boolean, isHorizontalShown: boolean): IRtDataListScrollbarStandard {
    if (isVerticalShown && isHorizontalShown) {
        return { width: null, color: null };
    }

    if (!isVerticalShown && !isHorizontalShown) {
        return { width: 'none', color: null };
    }

    return { width: 'auto', color: 'auto' };
}
