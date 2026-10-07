import { DestroyRef, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { catchError, concatMap, EMPTY, Observable, of, Subject, switchMap, tap } from 'rxjs';

import { CMS_LABELS, ITagNode, TCmsLabelKey, TCmsLabelMap } from '@rt-tools/cms-angular';
import { NotificationBus } from '@rt-tools/ui-kit-v2';

import { TagsApiService } from '../api/tags-api.service';
import { cmsRefusalOf, labelNow } from './cms-refusal.function';

/** A tag edit: an empty id creates a new tag, an empty parent puts the tag at the root. */
export interface ITagChange {
    readonly id: string;
    readonly name: string;
    readonly parentId: string;
}

/** The tag tree. After an edit the tree is read again whole: the tag may have moved in it. */
@Injectable({ providedIn: 'root' })
export class TagsStore {
    readonly #api: TagsApiService = inject(TagsApiService);
    readonly #notifications: NotificationBus = inject(NotificationBus);
    readonly #labels: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #loadSource: Subject<void> = new Subject<void>();
    readonly #changeSource: Subject<Observable<void>> = new Subject<Observable<void>>();

    readonly #tags: WritableSignal<readonly ITagNode[]> = signal<readonly ITagNode[]>([]);
    readonly #loading: WritableSignal<boolean> = signal<boolean>(false);
    readonly #loaded: WritableSignal<boolean> = signal<boolean>(false);

    public readonly tags: Signal<readonly ITagNode[]> = this.#tags.asReadonly();
    public readonly loading: Signal<boolean> = this.#loading.asReadonly();
    public readonly loaded: Signal<boolean> = this.#loaded.asReadonly();

    constructor() {
        this.#loadSource
            .pipe(
                tap(() => {
                    this.#loading.set(true);
                }),
                switchMap(() =>
                    this.#api.tags().pipe(
                        catchError((error: unknown) => {
                            this.#notifications.error(labelNow(this.#labels, cmsRefusalOf(error, 'tagsLoadFailed')));
                            const none: ITagNode[] = [];
                            return of(none);
                        })
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((tags: ITagNode[]) => {
                this.#tags.set(tags);
                this.#loading.set(false);
                this.#loaded.set(true);
            });

        this.#changeSource
            .pipe(
                concatMap((change: Observable<void>) => change),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe(() => {
                this.load();
            });
    }

    public load(): void {
        this.#loadSource.next();
    }

    public save(change: ITagChange): void {
        this.#changeSource.next(this.#api.save(change.id, change.name.trim(), change.parentId).pipe(this.#refused('tagSaveFailed')));
    }

    public remove(tag: ITagNode): void {
        this.#changeSource.next(this.#api.remove(tag.id).pipe(this.#refused('tagDeleteFailed')));
    }

    #refused(otherwise: TCmsLabelKey): (change: Observable<void>) => Observable<void> {
        return (change: Observable<void>): Observable<void> =>
            change.pipe(
                catchError((error: unknown) => {
                    this.#notifications.error(labelNow(this.#labels, cmsRefusalOf(error, otherwise)));
                    return EMPTY;
                })
            );
    }
}
