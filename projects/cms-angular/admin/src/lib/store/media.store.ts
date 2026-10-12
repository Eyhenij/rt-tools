import { DestroyRef, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { catchError, concatMap, EMPTY, map, of, Subject, switchMap, tap } from 'rxjs';

import { Code } from '@connectrpc/connect';
import {
    CMS_LABELS,
    IMediaFileList,
    IMediaFileRow,
    interpolateCmsLabel,
    MEDIA_ROOT_ID,
    TCmsLabelKey,
    TCmsLabelMap,
} from '@rt-tools/cms-angular';
import { NotificationBus } from '@rt-tools/ui-kit-v2';

import { MediaApiService } from '../api/media-api.service';
import { DEFAULT_LIST_QUERY, FIRST_PAGE } from '../list/list-query.function';
import { IListPage, IListQuery } from '../list/list-query.model';
import { labelNow, refusalCodeOf } from './cms-refusal.function';

/** A file and the folder it goes into. */
interface IUpload {
    readonly file: File;
    readonly folderId: string;
}

interface IUploaded {
    readonly row: IMediaFileRow;
    readonly folderId: string;
}

/** The refusals whose cause the person knows from their own action: the server named it. */
const MEDIA_REFUSALS: ReadonlyMap<Code, TCmsLabelKey> = new Map<Code, TCmsLabelKey>([
    [Code.PermissionDenied, 'mediaNoRight'],
    [Code.InvalidArgument, 'mediaFileRefused'],
    [Code.FailedPrecondition, 'mediaFileInUse'],
    [Code.NotFound, 'mediaFolderGone'],
]);

/** The label of a media library refusal: a known cause by its code, otherwise what failed. */
export function mediaRefusalOf(error: unknown, otherwise: TCmsLabelKey): TCmsLabelKey {
    const code: Code | null = refusalCodeOf(error);
    return (code === null ? undefined : MEDIA_REFUSALS.get(code)) ?? otherwise;
}

/**
 * A media library page. An upload and a deletion do not read the list again — an uploaded file goes
 * first, a deleted one leaves the set: a re-read would flash emptiness. Files go to the server one
 * by one in the order picked: ten at once would hit the request body limit. The list is open in one
 * folder, and an upload puts the file into it.
 */
@Injectable({ providedIn: 'root' })
export class MediaStore implements IListPage.Store<IMediaFileRow> {
    readonly #api: MediaApiService = inject(MediaApiService);
    readonly #notifications: NotificationBus = inject(NotificationBus);
    readonly #labels: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #loadSource: Subject<void> = new Subject<void>();
    readonly #uploadSource: Subject<IUpload> = new Subject<IUpload>();
    readonly #removeSource: Subject<IMediaFileRow> = new Subject<IMediaFileRow>();

    readonly #files: WritableSignal<readonly IMediaFileRow[]> = signal<readonly IMediaFileRow[]>([]);
    readonly #loading: WritableSignal<boolean> = signal<boolean>(false);
    readonly #loaded: WritableSignal<boolean> = signal<boolean>(false);
    readonly #uploading: WritableSignal<number> = signal<number>(0);
    readonly #total: WritableSignal<number> = signal<number>(0);
    readonly #query: WritableSignal<IListQuery> = signal<IListQuery>(DEFAULT_LIST_QUERY);
    readonly #folderId: WritableSignal<string> = signal<string>(MEDIA_ROOT_ID);

    public readonly rows: Signal<readonly IMediaFileRow[]> = this.#files.asReadonly();
    public readonly query: Signal<IListQuery> = this.#query.asReadonly();
    public readonly loading: Signal<boolean> = this.#loading.asReadonly();
    public readonly loaded: Signal<boolean> = this.#loaded.asReadonly();
    public readonly total: Signal<number> = this.#total.asReadonly();
    /** The open folder; an empty one is the root. */
    public readonly folderId: Signal<string> = this.#folderId.asReadonly();
    /** How many picked files have not reached the server yet: the screen shows waiting while it is not zero. */
    public readonly uploading: Signal<number> = this.#uploading.asReadonly();

    constructor() {
        this.#loadSource
            .pipe(
                tap(() => {
                    this.#loading.set(true);
                }),
                switchMap(() =>
                    this.#api.files(this.#query(), this.#folderId()).pipe(
                        catchError((error: unknown) => {
                            this.#notifications.error(labelNow(this.#labels, mediaRefusalOf(error, 'mediaLoadFailed')));
                            const empty: IMediaFileList = { files: [], total: 0 };
                            return of(empty);
                        })
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((page: IMediaFileList) => {
                this.#files.set(page.files);
                this.#total.set(page.total);
                this.#loading.set(false);
                this.#loaded.set(true);
            });

        this.#uploadSource
            .pipe(
                concatMap((upload: IUpload) =>
                    this.#api.upload(upload.file, upload.folderId).pipe(
                        map((row: IMediaFileRow | null): IUploaded | null => (row === null ? null : { row, folderId: upload.folderId })),
                        catchError((error: unknown) => {
                            const reason: string = labelNow(this.#labels, mediaRefusalOf(error, 'mediaUploadFailed'));
                            this.#notifications.error(
                                interpolateCmsLabel(labelNow(this.#labels, 'mediaUploadRefused'), { name: upload.file.name, reason })
                            );
                            return of(null);
                        })
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((uploaded: IUploaded | null) => {
                this.#uploading.update((pending: number) => pending - 1);
                // The file goes into the list only if its folder is still open.
                if (uploaded !== null && uploaded.folderId === this.#folderId()) {
                    this.#files.update((files: readonly IMediaFileRow[]) => [uploaded.row, ...files]);
                    this.#total.update((total: number) => total + 1);
                }
            });

        this.#removeSource
            .pipe(
                concatMap((row: IMediaFileRow) =>
                    this.#api.remove(row.id).pipe(
                        map((): string => row.id),
                        catchError((error: unknown) => {
                            this.#notifications.error(labelNow(this.#labels, mediaRefusalOf(error, 'mediaDeleteFailed')));
                            return EMPTY;
                        })
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((removedId: string) => {
                this.#files.update((files: readonly IMediaFileRow[]) => files.filter((row: IMediaFileRow) => row.id !== removedId));
                this.#total.update((total: number) => total - 1);
            });
    }

    public load(): void {
        this.#loadSource.next();
    }

    public setQuery(query: IListQuery): void {
        this.#query.set(query);
    }

    /** Opens a folder from the first page: a page number in another folder means nothing. */
    public openFolder(folderId: string): void {
        this.#folderId.set(folderId);
        this.#query.update((query: IListQuery) => ({ ...query, pageNumber: FIRST_PAGE }));
        this.load();
    }

    /** A file goes into the folder open at the minute of picking, even if the person leaves it earlier. */
    public upload(files: readonly File[]): void {
        this.#uploading.update((pending: number) => pending + files.length);
        for (const file of files) {
            this.#uploadSource.next({ file, folderId: this.#folderId() });
        }
    }

    public remove(row: IMediaFileRow): void {
        this.#removeSource.next(row);
    }
}
