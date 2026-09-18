import { EFilterOperatorType, IFilterModel, TFilterOperatorType } from '@rt-tools/utils';

/** Значение условия в том виде, в каком оно хранится и сверяется. */
export type TRtTableFilterValue = string | number | boolean;

/** Что приходит в ячейку от человека: дата приходит объектом, остальное — уже готовым значением. */
export type TRtTableFilterInput = TRtTableFilterValue | Date | null | undefined;

/**
 * Значение в том виде, в каком оно хранится: дата — строкой.
 *
 * `Date` не равен строке никогда, и без приведения повторный выбор той же даты каждый раз
 * считался бы новым значением — а тогда статья «повтор того же значения не сообщает ничего»
 * не держалась бы именно там, где её проще всего нарушить.
 */
export function filterValueOf(value: TRtTableFilterInput): TRtTableFilterValue {
    return value instanceof Date ? value.toISOString() : (value ?? '');
}

/** Условие по этой колонке из набора либо `null`, когда колонка ничего не отбирает. */
export function filterOf(filters: readonly IFilterModel<string>[], propertyName: string): IFilterModel<string> | null {
    return filters.find((filter: IFilterModel<string>): boolean => filter.propertyName === propertyName) ?? null;
}

/**
 * Набор условий после перемены значения по одной колонке.
 *
 * Пустое значение снимает колонку с отбора, а не уходит пустым условием: условие без значения
 * просит потребителя ответить «подходит всё», и потребитель, прочитавший его буквально, не
 * вернёт ни одной строки.
 *
 * Возвращает прежний набор тем же объектом, когда менять нечего: по этому признаку ячейка и
 * решает, сообщать ли наружу.
 */
export function filtersWithValue(
    filters: readonly IFilterModel<string>[],
    propertyName: string,
    operatorType: TFilterOperatorType,
    value: TRtTableFilterValue
): readonly IFilterModel<string>[] {
    const current: IFilterModel<string> | null = filterOf(filters, propertyName);

    if (value === '') {
        return current === null ? filters : filters.filter((filter: IFilterModel<string>): boolean => filter !== current);
    }

    if (current === null) {
        return [...filters, { propertyName, operatorType, value }];
    }

    if (current.value === value) {
        return filters;
    }

    return filters.map((filter: IFilterModel<string>): IFilterModel<string> => (filter === current ? { ...filter, value } : filter));
}

/**
 * Набор условий после перемены вида сравнения по одной колонке.
 *
 * Пока значения нет, менять вид сравнения не у чего: отбирать нечего, и набор условий не
 * изменился — значит, наружу ничего не уходит.
 */
export function filtersWithOperator(
    filters: readonly IFilterModel<string>[],
    propertyName: string,
    operatorType: TFilterOperatorType
): readonly IFilterModel<string>[] {
    const current: IFilterModel<string> | null = filterOf(filters, propertyName);

    if (current === null || current.operatorType === operatorType) {
        return filters;
    }

    return filters.map((filter: IFilterModel<string>): IFilterModel<string> => (filter === current ? { ...filter, operatorType } : filter));
}

/** Вид сравнения, с которого колонка начинает: свой, первый разрешённый либо равенство. */
export function startOperatorOf(
    allowed: readonly TFilterOperatorType[] | undefined,
    start: TFilterOperatorType | undefined
): TFilterOperatorType {
    if (start !== undefined) {
        return start;
    }

    return allowed !== undefined && allowed.length > 0 ? allowed[0] : EFilterOperatorType.EQUALS;
}
