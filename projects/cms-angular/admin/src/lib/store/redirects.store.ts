import { DestroyRef, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { catchError, concatMap, EMPTY, map, Observable, of, Subject, switchMap, tap } from 'rxjs';

import { Code } from '@connectrpc/connect';
import { ERedirectType } from '@rt-tools/cms-contract';
import { CMS_LABELS, IRedirectList, IRedirectListRow, TCmsLabelKey, TCmsLabelMap } from '@rt-tools/cms-angular';
import { NotificationBus } from '@rt-tools/ui-kit-v2';

import { RedirectsApiService } from '../api/redirects-api.service';
import { DEFAULT_LIST_QUERY } from '../list/list-query.function';
import { IListPage, IListQuery } from '../list/list-query.model';
import { cmsRefusalOf, labelNow, refusalCodeOf } from './cms-refusal.function';

/** A redirect edit: an empty id creates a new one. */
export interface IRedirectChange {
    readonly id: string;
    readonly from: string;
    readonly to: string;
    readonly type: ERedirectType;
}

/** The refusal of a save for the side panel: the panel stays open and names it. */
export function redirectRefusalOf(error: unknown): TCmsLabelKey {
    return refusalCodeOf(error) === Code.AlreadyExists ? 'redirectTaken' : cmsRefusalOf(error, 'redirectSaveFailed');
}

/** The redirect list page. A save gives its stream to the panel: the panel shows the refusal itself. */
@Injectable({ providedIn: 'root' })
export class RedirectsStore implements IListPage.Store<IRedirectListRow> {
    readonly #api: RedirectsApiService = inject(RedirectsApiService);
    readonly #notifications: NotificationBus = inject(NotificationBus);
    readonly #labels: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #loadSource: Subject<void> = new Subject<void>();
    readonly #removeSource: Subject<IRedirectListRow> = new Subject<IRedirectListRow>();

    readonly #redirects: WritableSignal<readonly IRedirectListRow[]> = signal<readonly IRedirectListRow[]>([]);
    readonly #loading: WritableSignal<boolean> = signal<boolean>(false);
    readonly #loaded: WritableSignal<boolean> = signal<boolean>(false);
    readonly #total: WritableSignal<number> = signal<number>(0);
    readonly #query: WritableSignal<IListQuery> = signal<IListQuery>(DEFAULT_LIST_QUERY);

    public readonly rows: Signal<readonly IRedirectListRow[]> = this.#redirects.asReadonly();
    public readonly query: Signal<IListQuery> = this.#query.asReadonly();
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
                    this.#api.redirects(this.#query()).pipe(
                        catchError((error: unknown) => {
                            this.#notifications.error(labelNow(this.#labels, cmsRefusalOf(error, 'redirectsLoadFailed')));
                            const empty: IRedirectList = { redirects: [], total: 0 };
                            return of(empty);
                        })
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((page: IRedirectList) => {
                this.#redirects.set(page.redirects);
                this.#total.set(page.total);
                this.#loading.set(false);
                this.#loaded.set(true);
            });

        this.#removeSource
            .pipe(
                concatMap((row: IRedirectListRow) =>
                    this.#api.remove(row.id).pipe(
                        map((): string => row.id),
                        catchError((error: unknown) => {
                            this.#notifications.error(labelNow(this.#labels, cmsRefusalOf(error, 'redirectDeleteFailed')));
                            return EMPTY;
                        })
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((removedId: string) => {
                this.#redirects.update((rows: readonly IRedirectListRow[]) => rows.filter((row: IRedirectListRow) => row.id !== removedId));
                this.#total.update((total: number) => total - 1);
            });
    }

    public load(): void {
        this.#loadSource.next();
    }

    public setQuery(query: IListQuery): void {
        this.#query.set(query);
    }

    public remove(row: IRedirectListRow): void {
        this.#removeSource.next(row);
    }

    /** A save is the stream of the edit panel: it waits for the answer and decides itself whether to close. */
    public save(change: IRedirectChange): Observable<IRedirectListRow> {
        // A saved redirect may stand at another place in the list: the list is read again whole.
        return this.#api.save(change.id, change.from.trim(), change.to.trim(), change.type).pipe(
            tap(() => {
                this.load();
            })
        );
    }
}
