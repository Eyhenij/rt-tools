import { IFilterModel, TFilterOperatorType } from '@rt-tools/utils';

/** Значение условия в том виде, в каком оно хранится и сверяется. Одно для обеих таблиц. */
export type TRtFilterValue = string | number | boolean;

/**
 * Какие значения поля снимают условие колонки.
 *
 * `empty-string` — только пустая строка; `0` и `false` остаются значениями, так ведёт себя `rt-table`.
 * `falsy` — любое ложное значение, как в первом ките; так ведёт себя `rt-data-table`.
 */
export type TRtFilterEmptyMode = 'empty-string' | 'falsy';

/** Снимает ли это значение условие колонки при режиме таблицы. */
export function rtIsEmptyFilterValue(value: unknown, mode: TRtFilterEmptyMode): boolean {
    return mode === 'falsy' ? !value : value === '';
}

/** Условие по этой колонке из набора либо `null`, когда колонка ничего не отбирает. */
export function rtFilterOf<KEY extends string>(filters: ReadonlyArray<IFilterModel<KEY>>, propertyName: KEY): IFilterModel<KEY> | null {
    return filters.find((filter: IFilterModel<KEY>): boolean => filter.propertyName === propertyName) ?? null;
}

/**
 * Набор условий после перемены значения по одной колонке.
 *
 * Пустое по режиму значение снимает колонку с отбора, а не уходит пустым условием: условие без
 * значения просит потребителя ответить «подходит всё», и потребитель, прочитавший его буквально, не
 * вернёт ни одной строки.
 *
 * Возвращает прежний набор тем же объектом, когда менять нечего: по этому признаку таблица и решает,
 * сообщать ли наружу.
 */
export function rtFiltersWithValue<KEY extends string>(
    filters: ReadonlyArray<IFilterModel<KEY>>,
    propertyName: KEY,
    operatorType: TFilterOperatorType,
    value: TRtFilterValue,
    mode: TRtFilterEmptyMode
): ReadonlyArray<IFilterModel<KEY>> {
    const current: IFilterModel<KEY> | null = rtFilterOf(filters, propertyName);

    if (rtIsEmptyFilterValue(value, mode)) {
        return current === null ? filters : filters.filter((filter: IFilterModel<KEY>): boolean => filter !== current);
    }

    if (current === null) {
        return [...filters, { propertyName, operatorType, value }];
    }

    if (current.value === value) {
        return filters;
    }

    return filters.map((filter: IFilterModel<KEY>): IFilterModel<KEY> => (filter === current ? { ...filter, value } : filter));
}

/**
 * Набор условий после перемены вида сравнения по одной колонке.
 *
 * Колонка с условием меняет в нём вид сравнения. Колонка без условия, но с набранным значением,
 * получает условие; без значения отбирать нечего, и набор не меняется — наружу ничего не уходит.
 */
export function rtFiltersWithOperator<KEY extends string>(
    filters: ReadonlyArray<IFilterModel<KEY>>,
    propertyName: KEY,
    operatorType: TFilterOperatorType,
    value: IFilterModel<KEY>['value'],
    mode: TRtFilterEmptyMode
): ReadonlyArray<IFilterModel<KEY>> {
    const current: IFilterModel<KEY> | null = rtFilterOf(filters, propertyName);

    if (current === null) {
        return rtIsEmptyFilterValue(value, mode) ? filters : [...filters, { propertyName, operatorType, value }];
    }

    if (current.operatorType === operatorType) {
        return filters;
    }

    return filters.map((filter: IFilterModel<KEY>): IFilterModel<KEY> => (filter === current ? { ...filter, operatorType } : filter));
}
