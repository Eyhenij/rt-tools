import { EListQueryParam, IListQuery, IListQueryOutParams, IListQueryParams } from './list-query.model';

/** The first page: a selection that changed its size or search starts from it. */
export const FIRST_PAGE: number = 1;

/** The default page size — the smallest the switch offers. */
export const LIST_PAGE_SIZE: number = 20;

/** The selection a list opens with. */
export const DEFAULT_LIST_QUERY: Readonly<IListQuery> = Object.freeze({
    pageNumber: FIRST_PAGE,
    pageSize: LIST_PAGE_SIZE,
    search: '',
});

/**
 * How long to wait after the last key press before asking the server. Without the delay every
 * letter would go as its own request, and the page whose answer came last would stay shown.
 */
export const SEARCH_DELAY_MS: number = 300;

/** A page number in the address: digits only. */
const DIGITS: RegExp = /^\d+$/;

/**
 * The page number from the address string. A link is edited by hand, and anything may come: a
 * blank, a word, zero. All of it reads as the first page — a refusal in place of the list reads as
 * a breakage.
 */
export function pageNumberOf(raw: string | undefined): number {
    // The whole string is an integer, not its start: parsing by the first digits reads "2.7.1" as page two.
    if (raw === undefined || !DIGITS.test(raw)) {
        return FIRST_PAGE;
    }
    const parsed: number = Number.parseInt(raw, 10);
    return parsed > FIRST_PAGE ? parsed : FIRST_PAGE;
}

/** The selection with the address laid over it: the page and the search come from the link, the size stays. */
export function listQueryFromParams(query: IListQuery, params: IListQueryParams): IListQuery {
    return { ...query, pageNumber: pageNumberOf(params[EListQueryParam.Page]), search: params[EListQueryParam.Search] ?? '' };
}

/** The selection into the address. The first page and an empty search are erased: they are the default. */
export function listQueryToParams(query: IListQuery): IListQueryOutParams {
    return {
        [EListQueryParam.Page]: query.pageNumber === FIRST_PAGE ? null : String(query.pageNumber),
        [EListQueryParam.Search]: query.search === '' ? null : query.search,
    };
}

/** The selection on another page. The size and the search stay. */
export function pagedQuery(query: IListQuery, pageNumber: number): IListQuery {
    return { ...query, pageNumber: pageNumber > FIRST_PAGE ? pageNumber : FIRST_PAGE };
}

/** The selection with a new page size. The page goes back to the first: a bigger size has no former fifth page. */
export function resizedQuery(query: IListQuery, pageSize: number): IListQuery {
    return { ...query, pageSize: pageSize > 0 ? pageSize : DEFAULT_LIST_QUERY.pageSize, pageNumber: FIRST_PAGE };
}

/** The selection with a new search. The page goes back to the first: the search changes the list. */
export function searchedQuery(query: IListQuery, search: string): IListQuery {
    return { ...query, search, pageNumber: FIRST_PAGE };
}
