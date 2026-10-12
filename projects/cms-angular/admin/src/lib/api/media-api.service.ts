import { inject, Injectable } from '@angular/core';

import { defer, from, map, Observable, switchMap } from 'rxjs';

import { timestampDate } from '@bufbuild/protobuf/wkt';
import { Client, createClient } from '@connectrpc/connect';
import { CmsMediaService, DeleteFileResponse, ListFilesResponse, MediaFile, UploadFileResponse } from '@rt-tools/cms-contract';
import { CMS_TRANSPORT, IMediaFileList, IMediaFileRow, previewUrlOf } from '@rt-tools/cms-angular';

import { IListQuery } from '../list/list-query.model';

const KILOBYTE: number = 1024;

/** The way out to the media library contract. The facade knows only the contract and gives the answer as is. */
@Injectable({ providedIn: 'root' })
export class MediaApiFacade {
    readonly #client: Client<typeof CmsMediaService> = createClient(CmsMediaService, inject(CMS_TRANSPORT));

    /** A zero size means the server default. No folder means files of all folders, an empty one the root. */
    public listFiles(page: number, pageSize: number, search: string, folderId?: string): Observable<ListFilesResponse> {
        return from(this.#client.listFiles({ page, pageSize, search, folderId }));
    }

    public uploadFile(name: string, content: Uint8Array, folderId: string): Observable<UploadFileResponse> {
        return from(this.#client.uploadFile({ name, content, folderId }));
    }

    public deleteFile(fileId: string): Observable<DeleteFileResponse> {
        return from(this.#client.deleteFile({ fileId }));
    }
}

/** The contract is translated into the media library notions in one place. */
export function mediaFileRowOf(file: MediaFile): IMediaFileRow {
    const row: IMediaFileRow = {
        id: file.id,
        name: file.name,
        width: file.width,
        height: file.height,
        sizeKb: Math.ceil(Number(file.size) / KILOBYTE),
        url: file.url,
        previewUrl: previewUrlOf(file.url, file.copies),
        createdAt: file.createdAt === undefined ? null : timestampDate(file.createdAt),
    };
    return row;
}

/** The media library in its own notions. The contract type does not go past this class. */
@Injectable({ providedIn: 'root' })
export class MediaApiService {
    readonly #facade: MediaApiFacade = inject(MediaApiFacade);

    /** No folder means files of all folders: so the image picking window sees them. */
    public files(query: IListQuery, folderId?: string): Observable<IMediaFileList> {
        return this.#facade.listFiles(query.pageNumber, query.pageSize, query.search, folderId).pipe(
            map((answer: ListFilesResponse) => {
                const list: IMediaFileList = { files: answer.files.map(mediaFileRowOf), total: answer.total };
                return list;
            })
        );
    }

    /**
     * The bytes are read from the picked file here: the contract takes them inside the call, and the
     * screen does not know its shape. The upload answers with the record itself. The reading is
     * deferred: a file that cannot be read refuses its own upload instead of breaking the queue.
     */
    public upload(file: File, folderId: string): Observable<IMediaFileRow | null> {
        return defer(() => file.arrayBuffer()).pipe(
            switchMap((buffer: ArrayBuffer) => this.#facade.uploadFile(file.name, new Uint8Array(buffer), folderId)),
            map((answer: UploadFileResponse) => (answer.file === undefined ? null : mediaFileRowOf(answer.file)))
        );
    }

    public remove(fileId: string): Observable<void> {
        return this.#facade.deleteFile(fileId).pipe(map((): void => undefined));
    }
}
