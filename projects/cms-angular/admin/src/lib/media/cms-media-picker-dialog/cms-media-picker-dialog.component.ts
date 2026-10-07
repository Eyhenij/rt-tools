import { ChangeDetectionStrategy, Component, DestroyRef, Signal, WritableSignal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { EMPTY, Observable, Subject, catchError, concatMap, of, switchMap, tap } from 'rxjs';

import { BlockDirective, ElemDirective } from '@rt-tools/core';
import {
    CMS_LABELS,
    CmsLabelPipe,
    IMediaFileList,
    IMediaFileRow,
    IPickedMediaFile,
    MEDIA_ACCEPT,
    MEDIA_ROOT_ID,
    TCmsLabelMap,
    interpolateCmsLabel,
} from '@rt-tools/cms-angular';
import {
    NotificationBus,
    RtButtonDirective,
    RtDialogComponent,
    RtDialogContentComponent,
    RtDialogFooterComponent,
    RtDialogHeaderComponent,
    RtDialogRef,
    RtDialogService,
    RtEmptyStateComponent,
    RtFileInputComponent,
    RtInputComponent,
    RtSpinnerComponent,
} from '@rt-tools/ui-kit-v2';

import { MediaApiService } from '../../api/media-api.service';

const BEM_BLOCK: string = 'rt-cms-media-picker-dialog';

/**
 * How many files the window shows at once. The rest are found by the search: the picker is not the
 * media library, and a page switch in it would be a second list of the same section.
 */
const PAGE_SIZE: number = 48;

/**
 * The image picker: the media library files, the search by name and the upload of a new one. A
 * choice closes the window and gives the file id and its address — nobody types the link by hand.
 * An uploaded file stands first and is chosen by the same button.
 */
@Component({
    selector: 'rt-cms-media-picker-dialog',
    templateUrl: './cms-media-picker-dialog.component.html',
    styleUrl: './cms-media-picker-dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormsModule,

        // rt-tools
        BlockDirective,
        CmsLabelPipe,
        ElemDirective,
        RtButtonDirective,
        RtDialogComponent,
        RtDialogContentComponent,
        RtDialogFooterComponent,
        RtDialogHeaderComponent,
        RtEmptyStateComponent,
        RtFileInputComponent,
        RtInputComponent,
        RtSpinnerComponent,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsMediaPickerDialogComponent {
    readonly #api: MediaApiService = inject(MediaApiService);
    readonly #notifications: NotificationBus = inject(NotificationBus);
    readonly #dialog: RtDialogRef<IPickedMediaFile> = inject<RtDialogRef<IPickedMediaFile>>(RtDialogRef);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #searchSource: Subject<string> = new Subject<string>();
    readonly #uploadSource: Subject<File> = new Subject<File>();

    readonly #files: WritableSignal<readonly IMediaFileRow[]> = signal<readonly IMediaFileRow[]>([]);
    readonly #loading: WritableSignal<boolean> = signal<boolean>(true);
    readonly #uploading: WritableSignal<boolean> = signal<boolean>(false);

    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    protected readonly accept: string = MEDIA_ACCEPT;
    protected readonly files: Signal<readonly IMediaFileRow[]> = this.#files.asReadonly();
    protected readonly loading: Signal<boolean> = this.#loading.asReadonly();
    protected readonly uploading: Signal<boolean> = this.#uploading.asReadonly();
    protected readonly search: WritableSignal<string> = signal<string>('');

    /**
     * The choice field is always empty: what was chosen went to the server, and a second choice of
     * the same file would not count as a change otherwise.
     */
    protected readonly picked: WritableSignal<File[]> = signal<File[]>([]);

    constructor() {
        this.#searchSource
            .pipe(
                tap((): void => {
                    this.#loading.set(true);
                }),
                switchMap((search: string): Observable<IMediaFileList> =>
                    this.#api.files({ pageNumber: 1, pageSize: PAGE_SIZE, search }).pipe(
                        catchError((): Observable<IMediaFileList> => {
                            this.#notifications.error(this.t().mediaLoadFailed);
                            const empty: IMediaFileList = { files: [], total: 0 };

                            return of(empty);
                        })
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((page: IMediaFileList): void => {
                this.#files.set(page.files);
                this.#loading.set(false);
            });

        this.#uploadSource
            .pipe(
                tap((): void => {
                    this.#uploading.set(true);
                }),
                concatMap((file: File): Observable<IMediaFileRow | null> =>
                    // The picker sees all files at once and puts a new one into the media library root
                    this.#api.upload(file, MEDIA_ROOT_ID).pipe(
                        catchError((): Observable<never> => {
                            const labels: TCmsLabelMap = this.t();
                            this.#notifications.error(
                                interpolateCmsLabel(labels.mediaUploadRefused, { name: file.name, reason: labels.mediaFileRefused })
                            );
                            this.#uploading.set(false);

                            return EMPTY;
                        })
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((uploaded: IMediaFileRow | null): void => {
                this.#uploading.set(false);
                if (uploaded !== null) {
                    this.#files.update((files: readonly IMediaFileRow[]): readonly IMediaFileRow[] => [uploaded, ...files]);
                }
            });

        this.#searchSource.next('');
    }

    protected find(search: string): void {
        this.search.set(search);
        this.#searchSource.next(search.trim());
    }

    protected upload(files: File[] | null): void {
        for (const file of files ?? []) {
            this.#uploadSource.next(file);
        }
        this.picked.set([]);
    }

    protected choose(file: IMediaFileRow): void {
        this.#dialog.close({ fileId: file.id, url: file.url, previewUrl: file.previewUrl });
    }

    protected cancel(): void {
        this.#dialog.close();
    }
}

export function openMediaPickerDialog(dialogs: RtDialogService): Observable<IPickedMediaFile | undefined> {
    return dialogs.open<CmsMediaPickerDialogComponent, undefined, IPickedMediaFile>(CmsMediaPickerDialogComponent).afterClosed();
}
