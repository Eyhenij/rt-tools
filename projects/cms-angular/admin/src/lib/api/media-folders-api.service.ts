import { inject, Injectable } from '@angular/core';

import { from, map, Observable } from 'rxjs';

import { Client, createClient } from '@connectrpc/connect';
import {
    CmsService,
    DeleteMediaFolderResponse,
    ListMediaFoldersResponse,
    MediaFolder,
    SaveMediaFolderResponse,
} from '@rt-tools/cms-contract';
import { CMS_TRANSPORT, IMediaFolder } from '@rt-tools/cms-angular';

/**
 * The way out to the media folders contract. The CMS service serves the folders, while the notion
 * belongs to the media library: files lie in folders, and its screen walks them.
 */
@Injectable({ providedIn: 'root' })
export class MediaFoldersApiFacade {
    readonly #client: Client<typeof CmsService> = createClient(CmsService, inject(CMS_TRANSPORT));

    public listMediaFolders(): Observable<ListMediaFoldersResponse> {
        return from(this.#client.listMediaFolders({}));
    }

    /** An empty id creates a new folder, an empty parent puts it at the root. */
    public saveMediaFolder(id: string, parentId: string, name: string): Observable<SaveMediaFolderResponse> {
        return from(this.#client.saveMediaFolder({ id, parentId, name }));
    }

    public deleteMediaFolder(folderId: string): Observable<DeleteMediaFolderResponse> {
        return from(this.#client.deleteMediaFolder({ folderId }));
    }
}

function folderOf(folder: MediaFolder): IMediaFolder {
    const result: IMediaFolder = { id: folder.id, name: folder.name, parentId: folder.parentId };
    return result;
}

/** The media folders in the media library notions. The contract type does not go past this class. */
@Injectable({ providedIn: 'root' })
export class MediaFoldersApiService {
    readonly #facade: MediaFoldersApiFacade = inject(MediaFoldersApiFacade);

    public folders(): Observable<IMediaFolder[]> {
        return this.#facade.listMediaFolders().pipe(map((answer: ListMediaFoldersResponse) => answer.folders.map(folderOf)));
    }

    public save(id: string, parentId: string, name: string): Observable<void> {
        return this.#facade.saveMediaFolder(id, parentId, name).pipe(map((): void => undefined));
    }

    public remove(folderId: string): Observable<void> {
        return this.#facade.deleteMediaFolder(folderId).pipe(map((): void => undefined));
    }
}
