import { ChangeDetectionStrategy, Component, DestroyRef, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { Observable, Subject, exhaustMap, filter, map } from 'rxjs';

import {
    CMS_LABELS,
    IMediaFileRow,
    IMediaFolder,
    MEDIA_ACCEPT,
    MEDIA_ROOT_ID,
    TCmsLabelMap,
    folderPathOf,
    foldersIn,
    interpolateCmsLabel,
} from '@rt-tools/cms-angular';
import { RtDialogService, RtFileInputComponent, RtIconButtonComponent } from '@rt-tools/ui-kit-v2';

import { openNameDialog } from '../../dialog/cms-name-dialog/cms-name-dialog.component';
import { BaseListPageDirective } from '../../list/base-list-page.directive';
import { CmsListPageComponent } from '../../list/cms-list-page/cms-list-page.component';
import { provideCmsListPage } from '../../list/list-page.tokens';
import { CmsMediaFoldersComponent } from '../../media/cms-media-folders/cms-media-folders.component';
import { CmsMediaTableComponent } from '../../media/cms-media-table/cms-media-table.component';
import { IMediaFolderChange, MediaFoldersStore } from '../../store/media-folders.store';
import { MediaStore } from '../../store/media.store';

const BEM_BLOCK: string = 'rt-cms-media-page';

/** The folder name question: the window title, the former name and the edit the name builds. */
interface IFolderNameRequest {
    readonly title: string;
    readonly name: string;
    readonly change: (name: string) => IMediaFolderChange;
}

/**
 * The media library. The page, the search line and their place in the address live in the list
 * base. Chosen files go to the server at once, without a second button: the choice is the intent
 * to upload. Above the files are the folders of the open folder and the path from the root; a file
 * is uploaded into the open folder.
 */
@Component({
    selector: 'rt-cms-media-page',
    templateUrl: './cms-media-page.component.html',
    styleUrl: './cms-media-page.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        FormsModule,

        // rt-tools
        RtFileInputComponent,
        RtIconButtonComponent,

        // components
        CmsListPageComponent,
        CmsMediaFoldersComponent,
        CmsMediaTableComponent,
    ],
    providers: [provideCmsListPage(() => CmsMediaPageComponent)],
    host: {
        class: BEM_BLOCK,
    },
})
export class CmsMediaPageComponent extends BaseListPageDirective<IMediaFileRow> {
    readonly #folders: MediaFoldersStore = inject(MediaFoldersStore);
    readonly #dialogs: RtDialogService = inject(RtDialogService);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #nameSource: Subject<IFolderNameRequest> = new Subject<IFolderNameRequest>();

    protected readonly t: Signal<TCmsLabelMap> = inject(CMS_LABELS);
    protected readonly accept: string = MEDIA_ACCEPT;

    /**
     * The choice field is always empty: what was chosen went to the server and has no reason to stay
     * in the field — a second choice of the same files would not count as a change otherwise.
     */
    protected readonly picked: WritableSignal<File[]> = signal<File[]>([]);

    protected readonly buttonLabel: Signal<string> = computed((): string => {
        const uploading: number = this.store.uploading();

        return uploading > 0 ? interpolateCmsLabel(this.t().mediaUploadingCount, { count: uploading }) : this.t().mediaUploadImages;
    });

    /** The path from the root to the open folder and the folders inside it. */
    protected readonly path: Signal<IMediaFolder[]> = computed((): IMediaFolder[] =>
        folderPathOf(this.#folders.folders(), this.store.folderId())
    );
    protected readonly children: Signal<IMediaFolder[]> = computed((): IMediaFolder[] =>
        foldersIn(this.#folders.folders(), this.store.folderId())
    );

    public override readonly store: MediaStore = inject(MediaStore);

    constructor() {
        super();

        this.#nameSource
            .pipe(
                exhaustMap((request: IFolderNameRequest): Observable<IMediaFolderChange> =>
                    openNameDialog(this.#dialogs, { title: request.title, label: this.t().mediaFolderName, name: request.name }).pipe(
                        filter((name: string | undefined): name is string => name !== undefined),
                        map((name: string): IMediaFolderChange => request.change(name))
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((change: IMediaFolderChange): void => {
                this.#folders.save(change);
            });

        // A deleted folder gave its files to the root: if it was open, the root opens, and an open root is reread
        this.#folders.removed$.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((removedId: string): void => {
            if (this.store.folderId() === removedId || this.store.folderId() === MEDIA_ROOT_ID) {
                this.store.openFolder(MEDIA_ROOT_ID);
            }
        });

        this.#folders.load();
    }

    protected openFolder(folderId: string): void {
        this.store.openFolder(folderId);
    }

    protected createFolder(): void {
        const parentId: string = this.store.folderId();
        this.#nameSource.next({
            title: this.t().mediaNewFolder,
            name: '',
            change: (name: string): IMediaFolderChange => ({ name, parentId, id: '' }),
        });
    }

    protected renameFolder(folder: IMediaFolder): void {
        this.#nameSource.next({
            title: this.t().mediaRenameFolder,
            name: folder.name,
            change: (name: string): IMediaFolderChange => ({ name, id: folder.id, parentId: folder.parentId }),
        });
    }

    protected removeFolder(folder: IMediaFolder): void {
        this.#folders.remove(folder);
    }

    protected pick(files: File[] | null): void {
        this.store.upload(files ?? []);
        this.picked.set([]);
    }

    protected remove(row: IMediaFileRow): void {
        this.store.remove(row);
    }
}
