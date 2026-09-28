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

/** Значение `aria-sort` шапки: скринридер называет порядок колонки, а не только её имя. */
export type TRtDataTableAriaSort = 'ascending' | 'descending' | 'none';

/**
 * `aria-sort` сортируемой колонки: порядок по ней, если он стоит по ней, иначе `none`. Колонке
 * без сортировки атрибут не положен вовсе — `null` снимает его.
 */
export function dataTableAriaSort(
    sort: TNullable<ISortModel<string>>,
    current: TNullable<ISortModel<string>>
): TRtDataTableAriaSort | null {
    if (!sort?.propertyName) {
        return null;
    }

    if (!dataTableSortActive(sort, current)) {
        return 'none';
    }

    const direction: string | undefined = current?.sortDirection?.toLowerCase();

    if (direction === EListSortOrder.ASC) {
        return 'ascending';
    }

    return direction === EListSortOrder.DESC ? 'descending' : 'none';
}
