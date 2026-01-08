import { PageModel } from '@rt-tools/utils';

export const DEFAULT_PAGE_SIZE: number = 20;

export const DEFAULT_PAGE_MODEL: Readonly<PageModel> = Object.freeze({
    pageNumber: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalCount: 0,

    hasNext: false,
    hasPrev: false,
});
