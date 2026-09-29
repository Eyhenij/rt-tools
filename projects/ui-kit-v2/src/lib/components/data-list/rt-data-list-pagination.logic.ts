import { IPageModel } from '@rt-tools/utils';

/** Размеры страницы, которые предлагает первый кит. */
export const DATA_LIST_PAGE_SIZES: ReadonlyArray<number> = [10, 20, 40, 50];

/** Страниц всего при этом размере страницы. */
export function dataListPageCount(totalCount: number, pageSize: number): number {
    return pageSize > 0 ? Math.ceil(totalCount / pageSize) : 0;
}

/**
 * Предлагаемые размеры страницы: размер годится, пока его половина не больше числа записей.
 * Нынешний размер предлагается всегда — иначе список показывал бы размер, которого нет в списке.
 */
export function dataListPageSizes(page: IPageModel): number[] {
    return DATA_LIST_PAGE_SIZES.filter((size: number) => size / 2 <= page.totalCount || size === page.pageSize);
}

/**
 * Новая страница при смене размера: человек остаётся на том же расстоянии от конца списка —
 * приём первого кита.
 */
export function dataListPageAfterSizeChange(page: IPageModel, pageSize: number): Partial<IPageModel> {
    const nextTotal: number = dataListPageCount(page.totalCount, pageSize);
    const previousTotal: number = dataListPageCount(page.totalCount, page.pageSize);
    const correction: number = Math.floor(((previousTotal - page.pageNumber) * page.pageSize) / pageSize);

    return { pageNumber: nextTotal - correction, pageSize };
}
