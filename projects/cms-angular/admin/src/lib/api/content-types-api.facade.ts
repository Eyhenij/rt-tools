import { Injectable, inject } from '@angular/core';

import { type Observable, from } from 'rxjs';

import {
    CmsService as CmsContract,
    type GetContentTypeResponse,
    type ListContentTypesResponse,
    type UpdateContentTypeResponse,
} from '@rt-tools/cms-contract';
import { type Client, createClient } from '@connectrpc/connect';
import { CMS_TRANSPORT } from '@rt-tools/cms-angular';

/** The way out to the content types contract. The facade knows only the contract and gives the answer as is. */
@Injectable({ providedIn: 'root' })
export class ContentTypesApiFacade {
    readonly #client: Client<typeof CmsContract> = createClient(CmsContract, inject(CMS_TRANSPORT));

    public listContentTypes(): Observable<ListContentTypesResponse> {
        return from(this.#client.listContentTypes({}));
    }

    public getContentType(contentTypeId: string): Observable<GetContentTypeResponse> {
        return from(this.#client.getContentType({ contentTypeId }));
    }

    public updateContentType(
        contentTypeId: string,
        name: string,
        description: string,
        settings: string
    ): Observable<UpdateContentTypeResponse> {
        return from(this.#client.updateContentType({ contentTypeId, name, description, settings }));
    }
}
