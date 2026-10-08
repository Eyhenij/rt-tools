import { Injectable, inject } from '@angular/core';

import { type Observable, from } from 'rxjs';

import {
    CmsService as CmsContract,
    type ContentItemStatus,
    type CreateContentItemResponse,
    type DeleteContentItemResponse,
    type GetContentItemResponse,
    type ListContentItemsResponse,
    type LockContentItemResponse,
    type SetContentItemFeaturedResponse,
    type UnlockContentItemResponse,
    type UpdateContentItemResponse,
} from '@rt-tools/cms-contract';
import { type Client, createClient } from '@connectrpc/connect';
import { CMS_TRANSPORT } from '@rt-tools/cms-angular';

import type { TContractDraft } from './cms-contract-mapping.function';

/** The page list filter: type, page, search, status and language. A zero status and an empty language mean "any". */
export interface IItemsRequest {
    readonly contentTypeId: string;
    readonly page: number;
    readonly pageSize: number;
    readonly search: string;
    readonly status: ContentItemStatus;
    readonly locale: string;
}

/** The way out to the pages contract. The facade knows only the contract and gives the answer as is. */
@Injectable({ providedIn: 'root' })
export class ContentItemsApiFacade {
    readonly #client: Client<typeof CmsContract> = createClient(CmsContract, inject(CMS_TRANSPORT));

    public listContentItems(request: IItemsRequest): Observable<ListContentItemsResponse> {
        return from(this.#client.listContentItems({ ...request }));
    }

    public getContentItem(contentItemId: string): Observable<GetContentItemResponse> {
        return from(this.#client.getContentItem({ contentItemId }));
    }

    public createContentItem(contentTypeId: string, draft: TContractDraft): Observable<CreateContentItemResponse> {
        return from(this.#client.createContentItem({ contentTypeId, draft }));
    }

    public updateContentItem(contentItemId: string, draft: TContractDraft): Observable<UpdateContentItemResponse> {
        return from(this.#client.updateContentItem({ contentItemId, draft }));
    }

    public deleteContentItem(contentItemId: string): Observable<DeleteContentItemResponse> {
        return from(this.#client.deleteContentItem({ contentItemId }));
    }

    public setFeatured(contentItemId: string, isFeatured: boolean): Observable<SetContentItemFeaturedResponse> {
        return from(this.#client.setContentItemFeatured({ contentItemId, isFeatured }));
    }

    public lockContentItem(contentItemId: string): Observable<LockContentItemResponse> {
        return from(this.#client.lockContentItem({ contentItemId }));
    }

    public unlockContentItem(contentItemId: string): Observable<UnlockContentItemResponse> {
        return from(this.#client.unlockContentItem({ contentItemId }));
    }
}
