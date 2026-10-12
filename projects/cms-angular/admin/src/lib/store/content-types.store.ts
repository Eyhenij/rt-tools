import { DestroyRef, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { catchError, of, Subject, switchMap, tap } from 'rxjs';

import { CMS_LABELS, IContentTypeRow, TCmsLabelMap } from '@rt-tools/cms-angular';
import { NotificationBus } from '@rt-tools/ui-kit-v2';

import { ContentTypesApiService } from '../api/content-types-api.service';
import { cmsRefusalOf, labelNow } from './cms-refusal.function';

/** The content type list. There are few types, and the server gives them all at once, without pages. */
@Injectable({ providedIn: 'root' })
export class ContentTypesStore {
    readonly #api: ContentTypesApiService = inject(ContentTypesApiService);
    readonly #notifications: NotificationBus = inject(NotificationBus);
    readonly #labels: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #loadSource: Subject<void> = new Subject<void>();

    readonly #types: WritableSignal<readonly IContentTypeRow[]> = signal<readonly IContentTypeRow[]>([]);
    readonly #loading: WritableSignal<boolean> = signal<boolean>(false);
    readonly #loaded: WritableSignal<boolean> = signal<boolean>(false);

    public readonly types: Signal<readonly IContentTypeRow[]> = this.#types.asReadonly();
    public readonly loading: Signal<boolean> = this.#loading.asReadonly();
    public readonly loaded: Signal<boolean> = this.#loaded.asReadonly();

    constructor() {
        this.#loadSource
            .pipe(
                tap(() => {
                    this.#loading.set(true);
                }),
                switchMap(() =>
                    this.#api.contentTypes().pipe(
                        catchError((error: unknown) => {
                            this.#notifications.error(labelNow(this.#labels, cmsRefusalOf(error, 'typesLoadFailed')));
                            const none: IContentTypeRow[] = [];
                            return of(none);
                        })
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((types: IContentTypeRow[]) => {
                this.#types.set(types);
                this.#loading.set(false);
                this.#loaded.set(true);
            });
    }

    public load(): void {
        this.#loadSource.next();
    }

    /** A saved type replaces the former one in the list: the screen headers read the name from here. */
    public replace(type: IContentTypeRow): void {
        this.#types.update((types: readonly IContentTypeRow[]) => types.map((row: IContentTypeRow) => (row.id === type.id ? type : row)));
    }
}
