import { EFilterOperatorType, FILTER_OPERATORS, IFilterModel, TFilterOperatorType } from '@rt-tools/utils';

/** Значение отбора в том виде, в каком его отдаёт приложению первый кит. */
export type TRtDataTableFilterValue = string | number | boolean;

/**
 * Значок вида сравнения — имя первого кита; набор кита рисует его по перечню соответствий.
 * «Начинается с» и «заканчивается на» первый кит объявлял, но значка и пункта меню им не давал.
 */
export const DATA_TABLE_FILTER_OPERATOR_GLYPHS: Readonly<Record<TFilterOperatorType, string | null>> = {
    [EFilterOperatorType.EQUALS]: 'drag_handle',
    [EFilterOperatorType.NOT_EQUALS]: 'block',
    [EFilterOperatorType.STARTS_WITH]: null,
    [EFilterOperatorType.ENDS_WITH]: null,
    [EFilterOperatorType.CONTAINS]: 'more_horiz',
    [EFilterOperatorType.GREATER_THAN]: 'chevron_right',
    [EFilterOperatorType.LESS_THAN]: 'chevron_left',
};

/** Пункты меню видов сравнения в порядке первого кита. */
export const DATA_TABLE_FILTER_MENU_OPERATORS: ReadonlyArray<TFilterOperatorType> = [
    EFilterOperatorType.EQUALS,
    EFilterOperatorType.NOT_EQUALS,
    EFilterOperatorType.CONTAINS,
    EFilterOperatorType.GREATER_THAN,
    EFilterOperatorType.LESS_THAN,
];

/** Вид сравнения колонки по умолчанию: незнакомое и пустое значение дают «равно». */
export function dataTableDefaultOperator(operator: TFilterOperatorType | null | undefined): TFilterOperatorType {
    return operator && FILTER_OPERATORS.includes(operator) ? operator : EFilterOperatorType.EQUALS;
}

/** Условие колонки из набора приложения, а без него — пустое условие с видом по умолчанию. */
export function dataTableColumnFilter<KEY extends string>(
    filters: ReadonlyArray<IFilterModel<KEY>>,
    propertyName: KEY,
    defaultOperator: TFilterOperatorType
): IFilterModel<KEY> {
    return (
        filters.find((filter: IFilterModel<KEY>) => filter.propertyName === propertyName) ?? {
            propertyName,
            operatorType: defaultOperator,
            value: '',
        }
    );
}

/**
 * Набор условий после смены значения колонки; `null` — приложению сообщать нечего.
 * Пустое значение снимает условие колонки, значение на колонке без условия добавляет его.
 */
export function dataTableFiltersWithValue<KEY extends string>(
    filters: ReadonlyArray<IFilterModel<KEY>>,
    current: IFilterModel<KEY>,
    value: TRtDataTableFilterValue
): IFilterModel<KEY>[] | null {
    const hasCondition: boolean = filters.some((filter: IFilterModel<KEY>) => filter.propertyName === current.propertyName);

    if (hasCondition) {
        return value
            ? filters.map((filter: IFilterModel<KEY>) => (filter.propertyName === current.propertyName ? { ...filter, value } : filter))
            : filters.filter((filter: IFilterModel<KEY>) => filter.propertyName !== current.propertyName);
    }

    return value ? [...filters, { propertyName: current.propertyName, operatorType: current.operatorType, value }] : null;
}

/** Набор условий после смены вида сравнения; `null` — ни условия, ни значения, спрашивать нечего. */
export function dataTableFiltersWithOperator<KEY extends string>(
    filters: ReadonlyArray<IFilterModel<KEY>>,
    current: IFilterModel<KEY>,
    operatorType: TFilterOperatorType
): IFilterModel<KEY>[] | null {
    const hasCondition: boolean = filters.some((filter: IFilterModel<KEY>) => filter.propertyName === current.propertyName);

    if (hasCondition) {
        return filters.map((filter: IFilterModel<KEY>) =>
            filter.propertyName === current.propertyName ? { ...filter, operatorType } : filter
        );
    }

    return current.value ? [...filters, { operatorType, propertyName: current.propertyName, value: current.value }] : null;
}

/**
 * День поля даты кита (`2025-01-01`) — в момент ISO, как отдавал первый кит: полночь дня по
 * местному времени. Пустая строка остаётся пустой — она снимает условие.
 */
export function dataTableDayToIso(day: string): string {
    const [year, month, date]: number[] = day.split('-').map(Number);
    const complete: boolean = [year, month, date].every((part: number | undefined) => !!part);

    return complete ? new Date(year, month - 1, date).toISOString() : '';
}

/** Обратно: момент условия — в день поля даты по местному времени; нераспознанное даёт пустое. */
export function dataTableIsoToDay(value: unknown): string {
    const moment: Date = new Date(typeof value === 'string' ? value : '');

    if (Number.isNaN(moment.getTime())) {
        return '';
    }

    const month: string = String(moment.getMonth() + 1).padStart(2, '0');
    const date: string = String(moment.getDate()).padStart(2, '0');

    return `${moment.getFullYear()}-${month}-${date}`;
}
