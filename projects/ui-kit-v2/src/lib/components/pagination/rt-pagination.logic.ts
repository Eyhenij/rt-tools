import { IPageModel } from '@rt-tools/utils';

import { IRtPagination } from './rt-pagination.model';

/** Сколько всего страниц. Пустой список — одна страница, листать нечего. */
export function lastPageOf(page: IPageModel): number {
    if (page.pageSize <= 0) {
        return 1;
    }

    return Math.max(1, Math.ceil(page.totalCount / page.pageSize));
}

/** Номер первой записи открытой страницы. */
export function rangeFromOf(page: IPageModel): number {
    return (page.pageNumber - 1) * page.pageSize + 1;
}

/** Номер последней записи открытой страницы — на последней странице она короче. */
export function rangeToOf(page: IPageModel): number {
    return Math.min(page.pageNumber * page.pageSize, page.totalCount);
}

/**
 * Полоса номеров страниц с разрывами «…»: первая, последняя и соседи открытой.
 * Пуста при единственной странице — показывать нечего.
 */
export function pageItemsOf(page: IPageModel, neighbours: number): ReadonlyArray<IRtPagination.PageItem> {
    const lastPage: number = lastPageOf(page);
    if (lastPage <= 1) {
        return [];
    }

    const items: IRtPagination.PageItem[] = [];
    let previous: number = 0;
    for (let candidate: number = 1; candidate <= lastPage; candidate++) {
        const isEdge: boolean = candidate === 1 || candidate === lastPage;
        const isNeighbour: boolean = candidate >= page.pageNumber - neighbours && candidate <= page.pageNumber + neighbours;
        if (!isEdge && !isNeighbour) {
            continue;
        }
        if (previous && candidate - previous > 1) {
            items.push('gap');
        }
        items.push(candidate);
        previous = candidate;
    }

    return items;
}
