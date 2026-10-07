import { Signal } from '@angular/core';

/**
 * A list selection: which page is shown, of what size and what is searched. One for all screens:
 * page and search mean the same everywhere, and declared anew in every screen they drift apart.
 */
export interface IListQuery {
    readonly pageNumber: number;
    readonly pageSize: number;
    readonly search: string;
}

/** The address as the selection sees it: parameters come as strings, and what is absent does not come at all. */
export interface IListQueryParams {
    readonly [key: string]: string | undefined;
}

/** The selection into the address. An empty value erases the parameter. */
export interface IListQueryOutParams {
    readonly [key: string]: string | null;
}

/** What a list screen expects from its state and what the list frame expects from the screen. */
export namespace IListPage {
    /** The state as the screen sees it: reading and two actions. */
    export interface Store<T> {
        /** The rows of the open page, not the whole list. */
        rows: Signal<readonly T[]>;
        /** How many records answer the selection: the page switch is drawn by it. */
        total: Signal<number>;
        query: Signal<IListQuery>;
        /** The list is being read: the table shows skeletons. */
        loading: Signal<boolean>;
        /** The server answered the list at least once: an empty table then means "no records". */
        loaded: Signal<boolean>;
        setQuery(query: IListQuery): void;
        load(): void;
    }

    /** The list screen as the frame sees it: the frame calls these methods directly. */
    export interface Host<T = unknown> {
        store: Store<T>;
        reload(): void;
        onPageChange(pageNumber: number): void;
        onPageSizeChange(pageSize: number): void;
        onSearchChange(search: string): void;
    }
}
