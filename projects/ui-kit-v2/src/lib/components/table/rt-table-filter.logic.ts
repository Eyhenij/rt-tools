import { rtFilterOf, rtFiltersWithOperator, rtFiltersWithValue, TRtFilterEmptyMode, TRtFilterValue } from '@rt-tools/ui-kit-v2/table-core';
import { EFilterOperatorType, IFilterModel, TFilterOperatorType } from '@rt-tools/utils';

import { RT_TABLE_ROW_ACTIONS_COLUMN } from './rt-table-columns.logic';
import { IRtTable } from './rt-table.model';

/** Значение условия в том виде, в каком оно хранится и сверяется. */
export type TRtTableFilterValue = TRtFilterValue;

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

/** Пустым у `rt-table` считается только пустая строка: `0` и `false` — значения условия. */
const RT_TABLE_EMPTY_MODE: TRtFilterEmptyMode = 'empty-string';

/** Условие по этой колонке из набора либо `null`, когда колонка ничего не отбирает. */
export function filterOf(filters: readonly IFilterModel<string>[], propertyName: string): IFilterModel<string> | null {
    return rtFilterOf(filters, propertyName);
}

/**
 * Набор условий после перемены значения по одной колонке — по ядру таблиц в режиме `rt-table`.
 * Возвращает прежний набор тем же объектом, когда менять нечего: по этому признаку ячейка и решает,
 * сообщать ли наружу.
 */
export function filtersWithValue(
    filters: readonly IFilterModel<string>[],
    propertyName: string,
    operatorType: TFilterOperatorType,
    value: TRtTableFilterValue
): readonly IFilterModel<string>[] {
    return rtFiltersWithValue(filters, propertyName, operatorType, value, RT_TABLE_EMPTY_MODE);
}

/**
 * Набор условий после перемены вида сравнения по одной колонке. Значение `rt-table` всегда лежит в
 * условии, так что колонка без условия менять нечего и наружу ничего не уходит.
 */
export function filtersWithOperator(
    filters: readonly IFilterModel<string>[],
    propertyName: string,
    operatorType: TFilterOperatorType
): readonly IFilterModel<string>[] {
    return rtFiltersWithOperator(filters, propertyName, operatorType, '', RT_TABLE_EMPTY_MODE);
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

/**
 * Ячейки строки отбора: по ячейке на каждую показанную колонку, в том же порядке.
 *
 * У колонки без объявленного отбора ячейка пустая, и место своё она держит: убрать её значило бы
 * сдвинуть все следующие ячейки на одну колонку влево — поле города встало бы под шапкой цены.
 * Колонка действий строки приходит сюда тем же путём, последней, и отбора у неё нет никогда; её
 * ячейка помечена, чтобы строка отбора не дала ширины колонке, которая места не занимает.
 */
export function filterCellsOf(
    columns: ReadonlyArray<string>,
    config: ReadonlyArray<IRtTable.ColumnConfig>
): ReadonlyArray<IRtTable.FilterCell> {
    return columns.map((key: string): IRtTable.FilterCell => {
        const column: IRtTable.ColumnConfig | undefined = config.find((item: IRtTable.ColumnConfig): boolean => item.key === key);

        return { key, filter: column?.filter ?? null, actions: key === RT_TABLE_ROW_ACTIONS_COLUMN };
    });
}
