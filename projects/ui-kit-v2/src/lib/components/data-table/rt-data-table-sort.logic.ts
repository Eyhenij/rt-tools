import { rtAriaSortOf, rtIsSortedBy, rtNextSort, TRtAriaSort } from '@rt-tools/ui-kit-v2/table-core';
import { EListSortOrder, ISortModel, TListSortOrderType, TNullable } from '@rt-tools/utils';

/**
 * Какой порядок просит нажатие на шапку — как в первом ките, круг `repeats` ядра таблиц: по
 * возрастанию, а после возрастания по убыванию. Снятия порядка нет: после убывания снова возрастание.
 */
export function dataTableNextSortOrder(current: TNullable<ISortModel<string>>): TListSortOrderType {
    return rtNextSort(current, current?.propertyName ?? '', 'repeats')?.sortDirection ?? EListSortOrder.ASC;
}

/** Порядок таблицы сейчас стоит по этой колонке. */
export function dataTableSortActive(sort: TNullable<ISortModel<string>>, current: TNullable<ISortModel<string>>): boolean {
    return rtIsSortedBy(current, sort?.propertyName);
}

/** Значение `aria-sort` шапки: скринридер называет порядок колонки, а не только её имя. */
export type TRtDataTableAriaSort = TRtAriaSort;

/**
 * `aria-sort` сортируемой колонки: порядок по ней, если он стоит по ней, иначе `none`. Колонке
 * без сортировки атрибут не положен вовсе — `null` снимает его.
 */
export function dataTableAriaSort(
    sort: TNullable<ISortModel<string>>,
    current: TNullable<ISortModel<string>>
): TRtDataTableAriaSort | null {
    return sort?.propertyName ? rtAriaSortOf(current, sort.propertyName) : null;
}
