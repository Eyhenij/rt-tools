import { DestroyRef, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { catchError, EMPTY, exhaustMap, Subject, switchMap, tap } from 'rxjs';

import { CMS_LABELS, IContentTypeRow, TCmsLabelMap } from '@rt-tools/cms-angular';
import { NotificationBus } from '@rt-tools/ui-kit-v2';

import { ContentTypesApiService } from '../api/content-types-api.service';
import { cmsRefusalOf, labelNow } from './cms-refusal.function';
import { ContentTypesStore } from './content-types.store';

/** The settings of one content type. A screen store: every opening of the settings has its own. */
@Injectable()
export class ContentTypeSettingsStore {
    readonly #api: ContentTypesApiService = inject(ContentTypesApiService);
    readonly #types: ContentTypesStore = inject(ContentTypesStore);
    readonly #notifications: NotificationBus = inject(NotificationBus);
    readonly #labels: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #openSource: Subject<string> = new Subject<string>();
    readonly #saveSource: Subject<IContentTypeRow> = new Subject<IContentTypeRow>();

    readonly #type: WritableSignal<IContentTypeRow | null> = signal<IContentTypeRow | null>(null);
    readonly #loading: WritableSignal<boolean> = signal<boolean>(false);
    readonly #saving: WritableSignal<boolean> = signal<boolean>(false);

    public readonly type: Signal<IContentTypeRow | null> = this.#type.asReadonly();
    public readonly loading: Signal<boolean> = this.#loading.asReadonly();
    public readonly saving: Signal<boolean> = this.#saving.asReadonly();

    constructor() {
        this.#openSource
            .pipe(
                tap(() => {
                    this.#loading.set(true);
                }),
                switchMap((typeId: string) =>
                    this.#api.contentType(typeId).pipe(
                        catchError((error: unknown) => {
                            this.#notifications.error(labelNow(this.#labels, cmsRefusalOf(error, 'typeLoadFailed')));
                            this.#loading.set(false);
                            return EMPTY;
                        })
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((type: IContentTypeRow) => {
                this.#type.set(type);
                this.#loading.set(false);
            });

        this.#saveSource
            .pipe(
                tap(() => {
                    this.#saving.set(true);
                }),
                exhaustMap((type: IContentTypeRow) =>
                    this.#api.save(type).pipe(
                        catchError((error: unknown) => {
                            this.#notifications.error(labelNow(this.#labels, cmsRefusalOf(error, 'typeSaveFailed')));
                            this.#saving.set(false);
                            return EMPTY;
                        })
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((saved: IContentTypeRow) => {
                this.#type.set(saved);
                this.#types.replace(saved);
                this.#saving.set(false);
                this.#notifications.success(labelNow(this.#labels, 'typeSaved'));
            });
    }

    public open(typeId: string): void {
        this.#openSource.next(typeId);
    }

    public save(type: IContentTypeRow): void {
        this.#saveSource.next(type);
    }
}
