import { DestroyRef, Directive, OnInit, Signal, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { IPageModel } from '@rt-tools/utils';

import { SEARCH_DELAY_MS, listQueryFromParams, listQueryToParams, pagedQuery, resizedQuery, searchedQuery } from './list-query.function';
import { IListPage, IListQuery, IListQueryOutParams } from './list-query.model';

/**
 * The common base of a list screen: the selection from the address and into it, the page, its size
 * and the search line.
 *
 * A section screen declares one thing — its state. Everything else is here and the same for every
 * list: kept in the screens, it was rewritten by each new list and drifted apart without a signal.
 *
 * The markup comes from `rt-cms-list-page`: it finds the screen by {@link CMS_LIST_PAGE_HOST} and
 * calls the methods declared here.
 */
@Directive()
export abstract class BaseListPageDirective<T> implements IListPage.Host<T>, OnInit {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #router: Router = inject(Router);
    readonly #route: ActivatedRoute = inject(ActivatedRoute);

    /** Key presses in the search line: the server is asked about the last typed line, not about every letter. */
    readonly #searchSource: Subject<string> = new Subject<string>();

    protected readonly rows: Signal<readonly T[]> = computed((): readonly T[] => this.store.rows());

    protected readonly loading: Signal<boolean> = computed((): boolean => this.store.loading());

    /** The search line in the field: it changes with each letter, the selection once per delay. */
    protected readonly search: Signal<string> = computed((): string => this.store.query().search);

    /** A search is on: an empty table then means "nothing found", not "no records". */
    protected readonly filtered: Signal<boolean> = computed((): boolean => this.store.query().search !== '');

    /**
     * Whether the list is really empty. Before the first server answer emptiness means "not asked
     * yet", and showing "no records" by it would claim what was not checked.
     */
    protected readonly listEmpty: Signal<boolean> = computed((): boolean => this.store.loaded() && this.store.rows().length === 0);

    /** The page for the switch: the screen keeps the number and the size, the count comes with the answer. */
    public readonly pageModel: Signal<IPageModel> = computed((): IPageModel => {
        const query: IListQuery = this.store.query();
        const model: IPageModel = { pageNumber: query.pageNumber, pageSize: query.pageSize, totalCount: this.store.total() };

        return model;
    });

    public abstract readonly store: IListPage.Store<T>;

    public ngOnInit(): void {
        this.#searchSource
            .pipe(debounceTime(SEARCH_DELAY_MS), distinctUntilChanged(), takeUntilDestroyed(this.#destroyRef))
            .subscribe((search: string): void => {
                this.applyQuery(searchedQuery(this.store.query(), search));
            });

        // A link to the list opens the same view it was: the same page and the same search
        this.store.setQuery(listQueryFromParams(this.store.query(), this.#route.snapshot.queryParams));
        this.store.load();
    }

    public reload(): void {
        this.store.load();
    }

    public onPageChange(pageNumber: number): void {
        this.applyQuery(pagedQuery(this.store.query(), pageNumber));
    }

    /** The page size stays with the person and does not go into the address: a link is shared for the record, not for a habit. */
    public onPageSizeChange(pageSize: number): void {
        this.store.setQuery(resizedQuery(this.store.query(), pageSize));
        this.store.load();
    }

    public onSearchChange(search: string): void {
        this.#searchSource.next(search);
    }

    /** Resets the search: pressed from the empty table, it asks the server at once, without the delay. */
    public resetSearch(): void {
        this.applyQuery(searchedQuery(this.store.query(), ''));
    }

    /**
     * The selection goes into the address by replacing the history entry. Otherwise every page
     * choice would leave a trace, and "back" from an open record would return to the previous page
     * of the list instead of the list itself.
     */
    protected applyQuery(query: IListQuery): void {
        this.store.setQuery(query);

        const params: IListQueryOutParams = listQueryToParams(query);
        void this.#router.navigate([], {
            relativeTo: this.#route,
            queryParams: params,
            queryParamsHandling: 'merge',
            replaceUrl: true,
        });

        this.store.load();
    }
}
