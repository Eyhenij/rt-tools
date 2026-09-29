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

/** Номера с `from` по `to` включительно. */
function pagesBetween(from: number, to: number): number[] {
    return Array.from({ length: to - from + 1 }, (_value: unknown, index: number): number => from + index);
}

/**
 * Полоса номеров первого кита — семь мест: до шести страниц видны все, дальше края по три
 * (`1 2 3 … 11 12 13`) или первая, соседи открытой и последняя (`1 … 6 7 8 … 13`); у края разрыв
 * съезжает на одно место за открытой страницей. Одна страница — один номер.
 */
export function pageSlotsOf(page: IPageModel): ReadonlyArray<IRtPagination.PageItem> {
    const lastPage: number = lastPageOf(page);
    const current: number = page.pageNumber;

    if (lastPage <= 6) {
        return pagesBetween(1, lastPage);
    }
    if (current < 3 || current > lastPage - 2) {
        return [...pagesBetween(1, 3), 'gap', ...pagesBetween(lastPage - 2, lastPage)];
    }
    if (current === 3) {
        return [...pagesBetween(1, 4), 'gap', ...pagesBetween(lastPage - 1, lastPage)];
    }
    if (current === 4) {
        return [...pagesBetween(1, 5), 'gap', lastPage];
    }
    if (current <= lastPage - 4) {
        return [1, 'gap', current - 1, current, current + 1, 'gap', lastPage];
    }
    if (current === lastPage - 3) {
        return [1, 'gap', ...pagesBetween(lastPage - 4, lastPage)];
    }

    return [1, 2, 'gap', ...pagesBetween(lastPage - 3, lastPage)];
}
