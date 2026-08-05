import { LIST_SORT_ORDER_ENUM, ListSortOrderType, ISortModel } from '@rt-tools/utils';

import { IRtTable } from './rt-table.model';

/** Значение атрибута `aria-sort` заголовка: направление либо его отсутствие. */
export type IRtTableAriaSort = 'ascending' | 'descending' | 'none';

/**
 * Следующее состояние сортировки при нажатии на заголовок колонки.
 *
 * Порядок кругов: по возрастанию → по убыванию → без сортировки. Третье состояние
 * нужно, чтобы пользователь мог вернуть исходный порядок, не перезагружая список.
 */
export function nextSort(current: ISortModel<string> | null, propertyName: string): ISortModel<string> | null {
    if (current === null || current.propertyName !== propertyName) {
        return { propertyName, sortDirection: LIST_SORT_ORDER_ENUM.ASC };
    }
    if (current.sortDirection === LIST_SORT_ORDER_ENUM.ASC) {
        return { propertyName, sortDirection: LIST_SORT_ORDER_ENUM.DESC };
    }

    return null;
}

/** Направление сортировки по этой колонке либо `null`, когда сортирует другая. */
export function sortDirectionOf(current: ISortModel<string> | null, propertyName: string): ListSortOrderType | null {
    return current !== null && current.propertyName === propertyName ? current.sortDirection : null;
}

/** Значение `aria-sort` заголовка: направление читается скринридером с самой колонки. */
export function ariaSortOf(current: ISortModel<string> | null, propertyName: string): IRtTableAriaSort {
    const direction: ListSortOrderType | null = sortDirectionOf(current, propertyName);
    if (direction === null) {
        return 'none';
    }

    return direction === LIST_SORT_ORDER_ENUM.ASC ? 'ascending' : 'descending';
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
