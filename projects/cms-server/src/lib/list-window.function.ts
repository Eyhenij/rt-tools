import { Code, ConnectError, type HandlerContext } from '@connectrpc/connect';
import type { ICaller } from '@rt-tools/auth-contract';
import { CONNECT_CALLER } from '@rt-tools/auth-server';

/** The rows of one list page. */
export interface IListWindow {
    readonly skip: number;
    readonly take: number;
}

export const DEFAULT_PAGE_SIZE: number = 20;

/** A page is never larger than this: a list asked for a million rows would hold the storage. */
export const MAX_PAGE_SIZE: number = 100;

/** The rows of a list page; a missing or wrong page number and size fall back to the first page of the default size. */
export function listWindow(page: number, pageSize: number): IListWindow {
    const size: number = pageSize > 0 ? Math.min(Math.trunc(pageSize), MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
    const number: number = page > 0 ? Math.trunc(page) : 1;

    return { skip: (number - 1) * size, take: size };
}

/** A search string; a blank one means no search. */
export function searchTerm(search: string): string | null {
    const trimmed: string = search.trim();

    return trimmed === '' ? null : trimmed;
}

/**
 * The caller the auth interceptor accepted. A call that reached an admin method without one is
 * refused: the access map was not applied to this service.
 */
export function signedCallerOf(context: HandlerContext): ICaller {
    const caller: ICaller | null = context.values.get(CONNECT_CALLER);
    if (caller === null) {
        throw new ConnectError('unauthenticated', Code.Unauthenticated);
    }
    return caller;
}
