import { inject, Injectable } from '@angular/core';

import { map, Observable } from 'rxjs';

import { ContentItem, EContentItemStatus, ListContentItemsResponse, LockContentItemResponse } from '@rt-tools/cms-contract';
import { IContentItem, IContentItemList, IEditedContentItem } from '@rt-tools/cms-angular';

import { IListQuery } from '../list/list-query.model';
import { contentItemOf, contentItemRowOf, contractDraftOf, contractStatusOf } from './cms-contract-mapping.function';
import { ContentItemsApiFacade } from './content-items-api.facade';

/** The page list filter beyond the page and the search. An empty status and language mean "any". */
export interface IContentItemsFilter {
    readonly contentTypeId: string;
    readonly status: EContentItemStatus | null;
    readonly locale: string;
}

/** The lock answer: whether the caller holds it and who does. */
export interface ILockAnswer {
    readonly lockedByCaller: boolean;
    readonly lockedById: string;
}

/** How many pages the search of connections and editor links shows. */
const SEARCH_PAGE_SIZE: number = 20;

/** The pages in the CMS notions. The contract type does not go past this class. */
@Injectable({ providedIn: 'root' })
export class ContentItemsApiService {
    readonly #facade: ContentItemsApiFacade = inject(ContentItemsApiFacade);

    public contentItems(query: IListQuery, filter: IContentItemsFilter): Observable<IContentItemList> {
        return this.#facade
            .listContentItems({
                contentTypeId: filter.contentTypeId,
                page: query.pageNumber,
                pageSize: query.pageSize,
                search: query.search,
                status: contractStatusOf(filter.status),
                locale: filter.locale,
            })
            .pipe(
                map((answer: ListContentItemsResponse) => {
                    const list: IContentItemList = { items: answer.items.map(contentItemRowOf), total: answer.total };
                    return list;
                })
            );
    }

    /** The first page of a type's pages by name — for connections and editor links. */
    public search(contentTypeId: string, search: string): Observable<IContentItemList> {
        return this.contentItems({ search, pageNumber: 1, pageSize: SEARCH_PAGE_SIZE }, { contentTypeId, status: null, locale: '' });
    }

    public contentItem(contentItemId: string): Observable<IContentItem> {
        return this.#facade.getContentItem(contentItemId).pipe(map((answer: { item?: ContentItem }) => contentItemOf(answer.item)));
    }

    public create(contentTypeId: string, draft: IEditedContentItem): Observable<IContentItem> {
        return this.#facade
            .createContentItem(contentTypeId, contractDraftOf(draft))
            .pipe(map((answer: { item?: ContentItem }) => contentItemOf(answer.item)));
    }

    public update(contentItemId: string, draft: IEditedContentItem): Observable<IContentItem> {
        return this.#facade
            .updateContentItem(contentItemId, contractDraftOf(draft))
            .pipe(map((answer: { item?: ContentItem }) => contentItemOf(answer.item)));
    }

    public remove(contentItemId: string): Observable<void> {
        return this.#facade.deleteContentItem(contentItemId).pipe(map((): void => undefined));
    }

    public setFeatured(contentItemId: string, isFeatured: boolean): Observable<void> {
        return this.#facade.setFeatured(contentItemId, isFeatured).pipe(map((): void => undefined));
    }

    public lock(contentItemId: string): Observable<ILockAnswer> {
        return this.#facade.lockContentItem(contentItemId).pipe(
            map((answer: LockContentItemResponse) => {
                const lock: ILockAnswer = { lockedByCaller: answer.lockedByCaller, lockedById: answer.state?.lockedById ?? '' };
                return lock;
            })
        );
    }

    public unlock(contentItemId: string): Observable<void> {
        return this.#facade.unlockContentItem(contentItemId).pipe(map((): void => undefined));
    }
}
