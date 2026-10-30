import { EListSortOrder, ISortModel, TListSortOrderType, TNullable } from '@rt-tools/utils';

/** Значение атрибута `aria-sort` шапки: направление либо его отсутствие. Одно для обеих таблиц. */
export type TRtAriaSort = 'ascending' | 'descending' | 'none';

/**
 * Что просит нажатие на шапку после убывания.
 *
 * `clears` — порядок снимается: по возрастанию → по убыванию → без порядка, так ведёт себя `rt-table`.
 * `repeats` — снова по возрастанию, как в первом ките; так ведёт себя `rt-data-table`.
 */
export type TRtSortCycle = 'clears' | 'repeats';

/** Порядок стоит по этой колонке. */
export function rtIsSortedBy(current: TNullable<ISortModel<string>>, propertyName: TNullable<string>): boolean {
    return !!propertyName && current?.propertyName === propertyName;
}

/** Направление порядка по этой колонке либо `null`, когда порядок стоит по другой или не стоит вовсе. */
export function rtSortDirectionOf(current: TNullable<ISortModel<string>>, propertyName: string): TListSortOrderType | null {
    return current && rtIsSortedBy(current, propertyName) ? current.sortDirection : null;
}

/**
 * Следующий порядок после нажатия на шапку колонки.
 *
 * В круге `repeats` направление считается от порядка таблицы, а не от нажатой колонки: так считал
 * первый кит, и `rt-data-table` повторяет его как есть. Расхождение со спекой разбирает RT-3015.
 */
export function rtNextSort(current: TNullable<ISortModel<string>>, propertyName: string, cycle: TRtSortCycle): ISortModel<string> | null {
    const direction: string | undefined = current?.sortDirection?.toLowerCase();

    if (cycle === 'repeats') {
        return { propertyName, sortDirection: direction === EListSortOrder.ASC ? EListSortOrder.DESC : EListSortOrder.ASC };
    }

    if (!rtIsSortedBy(current, propertyName)) {
        return { propertyName, sortDirection: EListSortOrder.ASC };
    }

    return direction === EListSortOrder.ASC ? { propertyName, sortDirection: EListSortOrder.DESC } : null;
}

/** Значение `aria-sort` шапки: скринридер называет порядок колонки, а не только её имя. */
export function rtAriaSortOf(current: TNullable<ISortModel<string>>, propertyName: string): TRtAriaSort {
    if (!rtIsSortedBy(current, propertyName)) {
        return 'none';
    }

    const direction: string | undefined = current?.sortDirection?.toLowerCase();

    if (direction === EListSortOrder.ASC) {
        return 'ascending';
    }

    return direction === EListSortOrder.DESC ? 'descending' : 'none';
}
