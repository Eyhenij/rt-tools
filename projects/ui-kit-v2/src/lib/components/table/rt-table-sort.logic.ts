import { rtAriaSortOf, rtNextSort, rtSortDirectionOf, TRtAriaSort } from '@rt-tools/ui-kit-v2/table-core';
import { TListSortOrderType, ISortModel } from '@rt-tools/utils';

import { IRtTable } from './rt-table.model';

/** Значение атрибута `aria-sort` заголовка: направление либо его отсутствие. */
export type TRtTableAriaSort = TRtAriaSort;

/**
 * Следующее состояние сортировки при нажатии на заголовок колонки — по ядру таблиц, круг `clears`:
 * по возрастанию → по убыванию → без сортировки. Третье состояние нужно, чтобы пользователь мог
 * вернуть исходный порядок, не перезагружая список.
 */
export function nextSort(current: ISortModel<string> | null, propertyName: string): ISortModel<string> | null {
    return rtNextSort(current, propertyName, 'clears');
}

/** Направление сортировки по этой колонке либо `null`, когда сортирует другая. */
export function sortDirectionOf(current: ISortModel<string> | null, propertyName: string): TListSortOrderType | null {
    return rtSortDirectionOf(current, propertyName);
}

/** Значение `aria-sort` заголовка: направление читается скринридером с самой колонки. */
export function ariaSortOf(current: ISortModel<string> | null, propertyName: string): TRtTableAriaSort {
    return rtAriaSortOf(current, propertyName);
}

/**
 * Сортируется ли колонка. Колонка, описанная в `columnsConfig`, сортируется только
 * по своему признаку; колонки, которой в конфиге нет, метаданных взять неоткуда —
 * объявлением служит сам заголовок.
 */
export function isColumnSortable(config: ReadonlyArray<IRtTable.ColumnConfig>, key: string): boolean {
    const column: IRtTable.ColumnConfig | undefined = config.find((candidate: IRtTable.ColumnConfig): boolean => candidate.key === key);

    return column === undefined ? true : column.sortable === true;
}
