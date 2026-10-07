import { Injectable, inject } from '@angular/core';

import { type Observable, from } from 'rxjs';

import { CmsService as CmsContract, type DeleteTagResponse, type ListTagsResponse, type SaveTagResponse } from '@rt-tools/cms-contract';
import { type Client, createClient } from '@connectrpc/connect';
import { CMS_TRANSPORT } from '@rt-tools/cms-angular';

/** The way out to the tags contract. The facade knows only the contract and gives the answer as is. */
@Injectable({ providedIn: 'root' })
export class TagsApiFacade {
    readonly #client: Client<typeof CmsContract> = createClient(CmsContract, inject(CMS_TRANSPORT));

    public listTags(): Observable<ListTagsResponse> {
        return from(this.#client.listTags({}));
    }

    /** An empty id creates a new tag. The screen cannot turn tags off, so a saved tag is on. */
    public saveTag(id: string, name: string, parentTagId: string): Observable<SaveTagResponse> {
        return from(this.#client.saveTag({ id, name, parentTagId, isEnabled: true }));
    }

    public deleteTag(tagId: string): Observable<DeleteTagResponse> {
        return from(this.#client.deleteTag({ tagId }));
    }
}
