import { EListSortOrder, ISortModel, TListSortOrderType, TNullable } from '@rt-tools/utils';

/**
 * Какой порядок просит нажатие на шапку — как в первом ките: по возрастанию, а после возрастания
 * по убыванию. Снятия порядка нет: после убывания снова возрастание.
 */
export function dataTableNextSortOrder(current: TNullable<ISortModel<string>>): TListSortOrderType {
    return current?.sortDirection?.toLowerCase() === EListSortOrder.ASC ? EListSortOrder.DESC : EListSortOrder.ASC;
}

/** Порядок таблицы сейчас стоит по этой колонке. */
export function dataTableSortActive(sort: TNullable<ISortModel<string>>, current: TNullable<ISortModel<string>>): boolean {
    return !!current?.propertyName && !!sort?.propertyName && current.propertyName === sort.propertyName;
}
