import { DestroyRef, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { catchError, concatMap, EMPTY, map, of, Subject, switchMap, tap } from 'rxjs';

import { CMS_LABELS, IContentItemList, IContentItemListRow, TCmsLabelMap } from '@rt-tools/cms-angular';
import { NotificationBus } from '@rt-tools/ui-kit-v2';

import { ContentItemsApiService, IContentItemsFilter } from '../api/content-items-api.service';
import { DEFAULT_LIST_QUERY } from '../list/list-query.function';
import { IListPage, IListQuery } from '../list/list-query.model';
import { cmsRefusalOf, labelNow } from './cms-refusal.function';

const NO_FILTER: IContentItemsFilter = { contentTypeId: '', status: null, locale: '' };

/**
 * The page list of one type. A screen store, not a root one: the type is set by the screen address,
 * and two open lists of different types do not share rows.
 */
@Injectable()
export class ContentItemsStore implements IListPage.Store<IContentItemListRow> {
    readonly #api: ContentItemsApiService = inject(ContentItemsApiService);
    readonly #notifications: NotificationBus = inject(NotificationBus);
    readonly #labels: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #loadSource: Subject<void> = new Subject<void>();
    readonly #removeSource: Subject<IContentItemListRow> = new Subject<IContentItemListRow>();
    readonly #featuredSource: Subject<IContentItemListRow> = new Subject<IContentItemListRow>();

    readonly #items: WritableSignal<readonly IContentItemListRow[]> = signal<readonly IContentItemListRow[]>([]);
    readonly #loading: WritableSignal<boolean> = signal<boolean>(false);
    readonly #loaded: WritableSignal<boolean> = signal<boolean>(false);
    readonly #total: WritableSignal<number> = signal<number>(0);
    readonly #query: WritableSignal<IListQuery> = signal<IListQuery>(DEFAULT_LIST_QUERY);
    readonly #filter: WritableSignal<IContentItemsFilter> = signal<IContentItemsFilter>(NO_FILTER);

    public readonly rows: Signal<readonly IContentItemListRow[]> = this.#items.asReadonly();
    public readonly query: Signal<IListQuery> = this.#query.asReadonly();
    public readonly filter: Signal<IContentItemsFilter> = this.#filter.asReadonly();
    public readonly loading: Signal<boolean> = this.#loading.asReadonly();
    public readonly loaded: Signal<boolean> = this.#loaded.asReadonly();
    public readonly total: Signal<number> = this.#total.asReadonly();

    constructor() {
        this.#loadSource
            .pipe(
                tap(() => {
                    this.#loading.set(true);
                }),
                switchMap(() =>
                    this.#api.contentItems(this.#query(), this.#filter()).pipe(
                        catchError((error: unknown) => {
                            this.#notifications.error(labelNow(this.#labels, cmsRefusalOf(error, 'itemsLoadFailed')));
                            const empty: IContentItemList = { items: [], total: 0 };
                            return of(empty);
                        })
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((page: IContentItemList) => {
                this.#items.set(page.items);
                this.#total.set(page.total);
                this.#loading.set(false);
                this.#loaded.set(true);
            });

        this.#removeSource
            .pipe(
                concatMap((row: IContentItemListRow) =>
                    this.#api.remove(row.id).pipe(
                        map((): string => row.id),
                        catchError((error: unknown) => {
                            this.#notifications.error(labelNow(this.#labels, cmsRefusalOf(error, 'itemDeleteFailed')));
                            return EMPTY;
                        })
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((removedId: string) => {
                this.#items.update((items: readonly IContentItemListRow[]) =>
                    items.filter((row: IContentItemListRow) => row.id !== removedId)
                );
                this.#total.update((total: number) => total - 1);
            });

        this.#featuredSource
            .pipe(
                concatMap((row: IContentItemListRow) =>
                    this.#api.setFeatured(row.id, !row.isFeatured).pipe(
                        map((): IContentItemListRow => ({ ...row, isFeatured: !row.isFeatured })),
                        catchError((error: unknown) => {
                            this.#notifications.error(labelNow(this.#labels, cmsRefusalOf(error, 'itemFeaturedFailed')));
                            return EMPTY;
                        })
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((changed: IContentItemListRow) => {
                this.#items.update((items: readonly IContentItemListRow[]) =>
                    items.map((row: IContentItemListRow) => (row.id === changed.id ? changed : row))
                );
            });
    }

    public load(): void {
        this.#loadSource.next();
    }

    public setQuery(query: IListQuery): void {
        this.#query.set(query);
    }

    /** The screen sets the filter with the selection: the type from the address, the status and language from the fields above the list. */
    public setFilter(filter: IContentItemsFilter): void {
        this.#filter.set(filter);
    }

    public remove(row: IContentItemListRow): void {
        this.#removeSource.next(row);
    }

    public toggleFeatured(row: IContentItemListRow): void {
        this.#featuredSource.next(row);
    }
}
