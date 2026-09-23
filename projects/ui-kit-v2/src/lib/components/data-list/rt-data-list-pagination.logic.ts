import { IPageModel } from '@rt-tools/utils';

/** Разрыв в ряду номеров страниц. */
export const DATA_LIST_PAGE_DIVIDER: string = '...';

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

/** Полоса страниц не нужна вовсе, пока все записи помещаются на самую маленькую страницу. */
export function dataListPaginationShown(page: IPageModel): boolean {
    return page.totalCount > DATA_LIST_PAGE_SIZES[0];
}

/**
 * Ряд номеров страниц первого кита: до шести страниц показаны все, дальше — первые, последние и
 * соседи нынешней, а между ними разрывы.
 */
export function dataListPageNumbers(page: IPageModel): Array<number | string> {
    const current: number = page.pageNumber;
    const total: number = dataListPageCount(page.totalCount, page.pageSize);
    const all: number[] = Array.from({ length: total }, (_value: unknown, index: number) => index + 1);
    const divider: string = DATA_LIST_PAGE_DIVIDER;

    if (total <= 6) {
        return all;
    }

    if (current < 3 || current > total - 2) {
        return [...all.slice(0, 3), divider, ...all.slice(total - 3, total)];
    }

    if (current === 3) {
        return [...all.slice(0, 4), divider, ...all.slice(total - 2, total)];
    }

    if (current === 4) {
        return [...all.slice(0, 5), divider, ...all.slice(total - 1, total)];
    }

    if (current <= total - 4) {
        return [...all.slice(0, 1), divider, current - 1, current, current + 1, divider, ...all.slice(total - 1, total)];
    }

    if (current === total - 3) {
        return [...all.slice(0, 1), divider, ...all.slice(total - 5, total)];
    }

    return [...all.slice(0, 2), divider, ...all.slice(total - 4, total)];
}

/** На эту страницу есть куда идти: назад — пока есть предыдущая, вперёд — пока есть следующая. */
export function dataListPageReachable(page: IPageModel, pageNumber: number): boolean {
    if (!page.hasNext && page.pageNumber <= pageNumber) {
        return false;
    }

    return !(!page.hasPrev && page.pageNumber >= pageNumber);
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
