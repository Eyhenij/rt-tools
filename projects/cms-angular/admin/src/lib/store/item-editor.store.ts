import { computed, DestroyRef, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { catchError, EMPTY, exhaustMap, forkJoin, map, mergeMap, Observable, of, Subject, switchMap, tap } from 'rxjs';

import { Code } from '@connectrpc/connect';
import { CMS_LABELS, IContentItem, IContentTypeRow, IEditedContentItem, TCmsLabelMap } from '@rt-tools/cms-angular';
import { NotificationBus } from '@rt-tools/ui-kit-v2';

import { ContentItemsApiService, ILockAnswer } from '../api/content-items-api.service';
import { ContentTypesApiService } from '../api/content-types-api.service';
import { cmsRefusalOf, labelNow, refusalCodeOf } from './cms-refusal.function';

/** What the edit screen opens: the type from the address and the page id; an empty id is a new page. */
export interface IItemEditorTarget {
    readonly contentTypeId: string;
    readonly itemId: string;
}

/** The answer to an opening: the type, the page and the lock. A new page has neither a page nor a lock. */
interface IOpened {
    readonly type: IContentTypeRow;
    readonly item: IContentItem | null;
    readonly lock: ILockAnswer | null;
}

/** A save of the draft: the page the screen edits and the form draft. */
interface ISaveRequest {
    readonly item: IContentItem | null;
    readonly contentTypeId: string;
    readonly draft: IEditedContentItem;
}

interface ISaved {
    readonly item: IContentItem;
    readonly lock: ILockAnswer | null;
}

/**
 * The state of the page edit screen: the type, the page, the lock and the save. A screen store:
 * every opening of the edit has its own. An opened page is locked at once, and the lock is lifted on leaving.
 */
@Injectable()
export class ItemEditorStore {
    readonly #items: ContentItemsApiService = inject(ContentItemsApiService);
    readonly #types: ContentTypesApiService = inject(ContentTypesApiService);
    readonly #notifications: NotificationBus = inject(NotificationBus);
    readonly #labels: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #openSource: Subject<IItemEditorTarget> = new Subject<IItemEditorTarget>();
    readonly #saveSource: Subject<ISaveRequest> = new Subject<ISaveRequest>();
    readonly #savedSource: Subject<IContentItem> = new Subject<IContentItem>();
    readonly #releaseSource: Subject<string> = new Subject<string>();
    readonly #outcomeSource: Subject<boolean> = new Subject<boolean>();

    readonly #type: WritableSignal<IContentTypeRow | null> = signal<IContentTypeRow | null>(null);
    readonly #item: WritableSignal<IContentItem | null> = signal<IContentItem | null>(null);
    readonly #lock: WritableSignal<ILockAnswer | null> = signal<ILockAnswer | null>(null);
    readonly #loading: WritableSignal<boolean> = signal<boolean>(false);
    readonly #failed: WritableSignal<boolean> = signal<boolean>(false);
    readonly #saving: WritableSignal<boolean> = signal<boolean>(false);

    public readonly type: Signal<IContentTypeRow | null> = this.#type.asReadonly();
    public readonly item: Signal<IContentItem | null> = this.#item.asReadonly();
    public readonly loading: Signal<boolean> = this.#loading.asReadonly();
    public readonly failed: Signal<boolean> = this.#failed.asReadonly();
    public readonly saving: Signal<boolean> = this.#saving.asReadonly();
    /** Another person holds the page: the lock was asked, and the server answered it is not ours. */
    public readonly lockedByOther: Signal<boolean> = computed(() => this.#lock()?.lockedByCaller === false);
    /** A saved page — a stream for the screen: a new one moves it to the page's address. */
    public readonly saved$: Observable<IContentItem> = this.#savedSource.asObservable();
    /** The outcome of every save: the "save and leave" answer leaves only after a successful one. */
    public readonly saveOutcome$: Observable<boolean> = this.#outcomeSource.asObservable();

    constructor() {
        // The release is declared first: leaving the screen lifts the lock before the subscriptions die.
        this.#destroyRef.onDestroy(() => {
            this.release();
        });
        this.#releaseSource
            .pipe(
                mergeMap((itemId: string) => this.#items.unlock(itemId).pipe(catchError(() => EMPTY))),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe();

        this.#openSource
            .pipe(
                tap(() => {
                    this.#loading.set(true);
                    this.#failed.set(false);
                }),
                switchMap((target: IItemEditorTarget) =>
                    this.#opened(target).pipe(
                        catchError((error: unknown) => {
                            this.#notifications.error(labelNow(this.#labels, cmsRefusalOf(error, 'itemLoadFailed')));
                            this.#failed.set(true);
                            this.#loading.set(false);
                            return EMPTY;
                        })
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((opened: IOpened) => {
                this.#type.set(opened.type);
                this.#item.set(opened.item);
                this.#lock.set(opened.lock);
                this.#loading.set(false);
            });

        this.#saveSource
            .pipe(
                tap(() => {
                    this.#saving.set(true);
                }),
                exhaustMap((request: ISaveRequest) =>
                    this.#saved(request).pipe(
                        catchError((error: unknown) => {
                            const locked: boolean = refusalCodeOf(error) === Code.FailedPrecondition;
                            this.#notifications.error(
                                labelNow(this.#labels, locked ? 'itemLocked' : cmsRefusalOf(error, 'itemSaveFailed'))
                            );
                            this.#saving.set(false);
                            this.#outcomeSource.next(false);
                            return EMPTY;
                        })
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((saved: ISaved) => {
                this.#item.set(saved.item);
                if (saved.lock !== null) {
                    this.#lock.set(saved.lock);
                }
                this.#saving.set(false);
                this.#notifications.success(labelNow(this.#labels, 'itemSaved'));
                this.#savedSource.next(saved.item);
                this.#outcomeSource.next(true);
            });
    }

    public open(target: IItemEditorTarget): void {
        this.#openSource.next(target);
    }

    public save(draft: IEditedContentItem): void {
        const type: IContentTypeRow | null = this.#type();
        if (type !== null) {
            this.#saveSource.next({ draft, item: this.#item(), contentTypeId: type.id });
        }
    }

    /**
     * Lifts the own lock. Called on leaving the screen and on closing the tab; the answer is not
     * awaited — the screen is already leaving, and there is nobody to show a refusal to.
     */
    public release(): void {
        const item: IContentItem | null = this.#item();
        if (item !== null && this.#lock()?.lockedByCaller === true) {
            this.#lock.set(null);
            this.#releaseSource.next(item.id);
        }
    }

    #opened(target: IItemEditorTarget): Observable<IOpened> {
        const type$: Observable<IContentTypeRow> = this.#types.contentType(target.contentTypeId);
        if (target.itemId === '') {
            return type$.pipe(map((type: IContentTypeRow): IOpened => ({ type, item: null, lock: null })));
        }
        return forkJoin({ type: type$, item: this.#items.contentItem(target.itemId), lock: this.#items.lock(target.itemId) });
    }

    /** A new page is locked after its first save the same way as an opened one. */
    #saved(request: ISaveRequest): Observable<ISaved> {
        if (request.item !== null) {
            return this.#items.update(request.item.id, request.draft).pipe(map((item: IContentItem): ISaved => ({ item, lock: null })));
        }
        return this.#items
            .create(request.contentTypeId, request.draft)
            .pipe(switchMap((item: IContentItem) => forkJoin({ item: of(item), lock: this.#items.lock(item.id) })));
    }
}
