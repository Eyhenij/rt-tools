import {
    DEFAULT_LIST_QUERY,
    FIRST_PAGE,
    LIST_PAGE_SIZE,
    listQueryFromParams,
    listQueryToParams,
    pagedQuery,
    resizedQuery,
    searchedQuery,
} from './list-query.function';
import { EListQueryParam, IListQuery, IListQueryOutParams } from './list-query.model';

const SECOND_PAGE: number = 2;
const BIG_PAGE: number = 50;

const OPENED: IListQuery = { pageNumber: SECOND_PAGE, pageSize: LIST_PAGE_SIZE, search: 'pine' };

describe('the list selection from the address', () => {
    it('SC-CMS-56 — the page number and the search are read, and an empty address gives the first page', () => {
        expect(listQueryFromParams(DEFAULT_LIST_QUERY, { [EListQueryParam.Page]: '2', [EListQueryParam.Search]: 'pine' })).toEqual(OPENED);
        expect(listQueryFromParams(OPENED, {})).toEqual({ ...OPENED, pageNumber: FIRST_PAGE, search: '' });
        expect(listQueryFromParams({ ...DEFAULT_LIST_QUERY, pageSize: BIG_PAGE }, { [EListQueryParam.Page]: '3' }).pageSize).toBe(BIG_PAGE);
    });

    it.each(['', '0', '-4', 'second', '2.7.1'])('SC-CMS-56 — a page number not understood, "%s", reads as the first', (raw: string) => {
        expect(listQueryFromParams(DEFAULT_LIST_QUERY, { [EListQueryParam.Page]: raw }).pageNumber).toBe(FIRST_PAGE);
    });

    it('SC-CMS-56 — the first page and an empty search are erased from the address, and the rest reads back the same', () => {
        expect(listQueryToParams(DEFAULT_LIST_QUERY)).toEqual({ [EListQueryParam.Page]: null, [EListQueryParam.Search]: null });

        const params: IListQueryOutParams = listQueryToParams(OPENED);
        expect(params).toEqual({ [EListQueryParam.Page]: '2', [EListQueryParam.Search]: 'pine' });
        expect(
            listQueryFromParams(DEFAULT_LIST_QUERY, {
                [EListQueryParam.Page]: params[EListQueryParam.Page] ?? undefined,
                [EListQueryParam.Search]: params[EListQueryParam.Search] ?? undefined,
            })
        ).toEqual(OPENED);
    });
});

describe('a change of the selection', () => {
    it('SC-CMS-57 — a page change keeps the size and the search, and a page below the first reads as the first', () => {
        expect(pagedQuery(OPENED, 5)).toEqual({ ...OPENED, pageNumber: 5 });
        expect(pagedQuery(OPENED, 0).pageNumber).toBe(FIRST_PAGE);
    });

    it('SC-CMS-57 — a new size or search goes back to the first page', () => {
        expect(resizedQuery(OPENED, BIG_PAGE)).toEqual({ ...OPENED, pageSize: BIG_PAGE, pageNumber: FIRST_PAGE });
        expect(resizedQuery(OPENED, 0).pageSize).toBe(LIST_PAGE_SIZE);
        expect(searchedQuery(OPENED, 'oak')).toEqual({ ...OPENED, search: 'oak', pageNumber: FIRST_PAGE });
        expect(searchedQuery(OPENED, '')).toEqual({ ...OPENED, search: '', pageNumber: FIRST_PAGE });
    });
});
