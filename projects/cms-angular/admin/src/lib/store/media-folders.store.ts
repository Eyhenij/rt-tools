import { DestroyRef, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { catchError, concatMap, EMPTY, map, Observable, of, Subject, switchMap } from 'rxjs';

import { Code } from '@connectrpc/connect';
import { CMS_LABELS, IMediaFolder, TCmsLabelKey, TCmsLabelMap } from '@rt-tools/cms-angular';
import { NotificationBus } from '@rt-tools/ui-kit-v2';

import { MediaFoldersApiService } from '../api/media-folders-api.service';
import { labelNow, refusalCodeOf } from './cms-refusal.function';

/** A folder edit: an empty id creates a new one, an empty parent puts it at the root. */
export interface IMediaFolderChange {
    readonly id: string;
    readonly name: string;
    readonly parentId: string;
}

function folderRefusalOf(error: unknown, otherwise: TCmsLabelKey): TCmsLabelKey {
    return refusalCodeOf(error) === Code.PermissionDenied ? 'foldersNoRight' : otherwise;
}

/**
 * The media library folders. After an edit the list is read again whole: a deleted folder lifts its
 * children to the root, and only the server knows where they are now. A deletion gives the folder id:
 * the screen leaves it.
 */
@Injectable({ providedIn: 'root' })
export class MediaFoldersStore {
    readonly #api: MediaFoldersApiService = inject(MediaFoldersApiService);
    readonly #notifications: NotificationBus = inject(NotificationBus);
    readonly #labels: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #loadSource: Subject<void> = new Subject<void>();
    readonly #changeSource: Subject<Observable<string>> = new Subject<Observable<string>>();
    readonly #removedSource: Subject<string> = new Subject<string>();

    readonly #folders: WritableSignal<readonly IMediaFolder[]> = signal<readonly IMediaFolder[]>([]);
    readonly #loaded: WritableSignal<boolean> = signal<boolean>(false);

    public readonly folders: Signal<readonly IMediaFolder[]> = this.#folders.asReadonly();
    public readonly loaded: Signal<boolean> = this.#loaded.asReadonly();
    /** The id of a deleted folder: its files went to the root, and the screen reads the list again. */
    public readonly removed$: Observable<string> = this.#removedSource.asObservable();

    constructor() {
        this.#loadSource
            .pipe(
                switchMap(() =>
                    this.#api.folders().pipe(
                        catchError((error: unknown) => {
                            this.#notifications.error(labelNow(this.#labels, folderRefusalOf(error, 'foldersLoadFailed')));
                            const none: IMediaFolder[] = [];
                            return of(none);
                        })
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((folders: IMediaFolder[]) => {
                this.#folders.set(folders);
                this.#loaded.set(true);
            });

        this.#changeSource
            .pipe(
                concatMap((change: Observable<string>) => change),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((removedId: string) => {
                this.load();
                if (removedId !== '') {
                    this.#removedSource.next(removedId);
                }
            });
    }

    public load(): void {
        this.#loadSource.next();
    }

    public save(change: IMediaFolderChange): void {
        this.#changeSource.next(
            this.#api.save(change.id, change.parentId, change.name.trim()).pipe(
                map((): string => ''),
                this.#refused('folderSaveFailed')
            )
        );
    }

    public remove(folder: IMediaFolder): void {
        this.#changeSource.next(
            this.#api.remove(folder.id).pipe(
                map((): string => folder.id),
                this.#refused('folderDeleteFailed')
            )
        );
    }

    #refused(otherwise: TCmsLabelKey): (change: Observable<string>) => Observable<string> {
        return (change: Observable<string>): Observable<string> =>
            change.pipe(
                catchError((error: unknown) => {
                    this.#notifications.error(labelNow(this.#labels, folderRefusalOf(error, otherwise)));
                    return EMPTY;
                })
            );
    }
}
