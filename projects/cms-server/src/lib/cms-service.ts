import { Code, ConnectError, type HandlerContext, type ServiceImpl } from '@connectrpc/connect';
import type { ICaller } from '@rt-tools/auth-contract';
import {
    CmsService,
    type ContentItem,
    type CreateContentItemRequest,
    type DeleteContentItemRequest,
    type GetContentItemRequest,
    type GetContentTypeRequest,
    type ListContentItemsRequest,
    type LockContentItemRequest,
    type SetContentItemFeaturedRequest,
    type UnlockContentItemRequest,
    type UpdateContentItemRequest,
    type UpdateContentTypeRequest,
} from '@rt-tools/cms-contract';

import { cmsDictionaryHandlers } from './cms-dictionary.handlers';
import {
    contractContentTypeOf,
    contractItemOf,
    contractSummaryOf,
    found,
    itemDraftOf,
    settingsOf,
    statusFromContract,
} from './cms-contract.function';
import type { IContentItemDraft, IContentItemPage, IContentItemRecord, IContentTypeRecord } from './cms-records.model';
import type { ICmsServerOptions, ICmsSources } from './cms-sources.model';
import { ELockHolder, lockHolderOf } from './content-item-rules.function';
import { IListWindow, listWindow, searchTerm, signedCallerOf } from './list-window.function';

const SLUG_TAKEN: string = 'a page of this locale with this address already exists';

/** A page for the edit form: whole, with its preview token. */
async function adminItemOf(sources: ICmsSources, item: IContentItemRecord): Promise<{ item: ContentItem }> {
    return { item: await contractItemOf(item, sources.mediaFileOf, true) };
}

/**
 * The admin service of the CMS over the storage port. Every method needs the caller the auth
 * interceptor accepted; which right opens the service is named by the application in the access
 * map, not here.
 */
export function cmsServiceImpl(options: ICmsServerOptions): ServiceImpl<typeof CmsService> {
    const sources: ICmsSources = options.sources;
    const typeOf: (contentTypeId: string) => Promise<IContentTypeRecord> = async (contentTypeId: string): Promise<IContentTypeRecord> =>
        found(await sources.contentTypeOf(contentTypeId), 'content type');
    const storedItemOf: (contentItemId: string) => Promise<IContentItemRecord> = async (
        contentItemId: string
    ): Promise<IContentItemRecord> => found(await sources.itemOf(contentItemId), 'page');

    const service: ServiceImpl<typeof CmsService> = {
        /** Every content type: there are few, and the admin menu is built from all of them at once. */
        listContentTypes: async (_request: unknown, context: HandlerContext) => {
            signedCallerOf(context);
            const records: IContentTypeRecord[] = await sources.contentTypes();
            return { contentTypes: records.map(contractContentTypeOf) };
        },

        getContentType: async (request: GetContentTypeRequest, context: HandlerContext) => {
            signedCallerOf(context);
            return { contentType: contractContentTypeOf(await typeOf(request.contentTypeId)) };
        },

        /** The name, the description and the form settings; broken settings are refused, not emptied. */
        updateContentType: async (request: UpdateContentTypeRequest, context: HandlerContext) => {
            const caller: ICaller = signedCallerOf(context);
            await typeOf(request.contentTypeId);
            const record: IContentTypeRecord = await sources.updateContentType(
                request.contentTypeId,
                { name: request.name, description: request.description, settings: settingsOf(request.settings) },
                caller.subject
            );
            return { contentType: contractContentTypeOf(record) };
        },

        /** A page of the pages of a type, filtered by state, locale and a search by name and address. */
        listContentItems: async (request: ListContentItemsRequest, context: HandlerContext) => {
            signedCallerOf(context);
            const window: IListWindow = listWindow(request.page, request.pageSize);
            const page: IContentItemPage = await sources.itemPageOf(
                {
                    contentTypeId: request.contentTypeId,
                    search: searchTerm(request.search),
                    status: statusFromContract(request.status),
                    locale: request.locale === '' ? null : request.locale,
                },
                window.skip,
                window.take
            );
            return { items: page.items.map(contractSummaryOf), total: page.total };
        },

        getContentItem: async (request: GetContentItemRequest, context: HandlerContext) => {
            signedCallerOf(context);
            return adminItemOf(sources, await storedItemOf(request.contentItemId));
        },

        /** A new page of a type. A taken address is refused before the write: two pages would answer one link. */
        createContentItem: async (request: CreateContentItemRequest, context: HandlerContext) => {
            const caller: ICaller = signedCallerOf(context);
            await typeOf(request.contentTypeId);
            const draft: IContentItemDraft = itemDraftOf(request.draft, null, sources.now(), options.locales);
            if (await sources.slugTaken(draft.slug, draft.locale, null)) {
                throw new ConnectError(SLUG_TAKEN, Code.AlreadyExists);
            }
            return adminItemOf(sources, await sources.createItem(request.contentTypeId, draft, caller.subject));
        },

        /** A page another person holds open is not saved: one edit would overwrite the other. */
        updateContentItem: async (request: UpdateContentItemRequest, context: HandlerContext) => {
            const caller: ICaller = signedCallerOf(context);
            const stored: IContentItemRecord = await storedItemOf(request.contentItemId);
            if (lockHolderOf(stored.lockedById, caller.subject) === ELockHolder.Other) {
                throw new ConnectError('another person holds the page open', Code.FailedPrecondition);
            }
            const draft: IContentItemDraft = itemDraftOf(request.draft, stored.publishedAt, sources.now(), options.locales);
            if (await sources.slugTaken(draft.slug, draft.locale, stored.id)) {
                throw new ConnectError(SLUG_TAKEN, Code.AlreadyExists);
            }
            return adminItemOf(sources, await sources.updateItem(stored.id, draft, caller.subject));
        },

        /** The page goes with its tags, connections and media section; the media library files stay. */
        deleteContentItem: async (request: DeleteContentItemRequest, context: HandlerContext) => {
            signedCallerOf(context);
            await storedItemOf(request.contentItemId);
            await sources.deleteItem(request.contentItemId);
            return {};
        },

        /** The featured mark is set from the list, without opening the form and without a lock. */
        setContentItemFeatured: async (request: SetContentItemFeaturedRequest, context: HandlerContext) => {
            signedCallerOf(context);
            await storedItemOf(request.contentItemId);
            return adminItemOf(sources, await sources.setFeatured(request.contentItemId, request.isFeatured));
        },

        /** The lock goes to whoever opened the page. Another's lock is not taken over: the answer names its holder. */
        lockContentItem: async (request: LockContentItemRequest, context: HandlerContext) => {
            const caller: ICaller = signedCallerOf(context);
            const stored: IContentItemRecord = await storedItemOf(request.contentItemId);
            const holder: ELockHolder = lockHolderOf(stored.lockedById, caller.subject);
            const item: IContentItemRecord =
                holder === ELockHolder.Other ? stored : await sources.lockItem(stored.id, caller.subject, sources.now());
            const contract: ContentItem = await contractItemOf(item, sources.mediaFileOf, true);
            return { state: contract.state, lockedByCaller: holder !== ELockHolder.Other };
        },

        /** Only one's own lock is lifted; another's stays, and the answer is the same — nothing to lift. */
        unlockContentItem: async (request: UnlockContentItemRequest, context: HandlerContext) => {
            const caller: ICaller = signedCallerOf(context);
            const stored: IContentItemRecord = await storedItemOf(request.contentItemId);
            if (lockHolderOf(stored.lockedById, caller.subject) === ELockHolder.Caller) {
                await sources.unlockItem(stored.id);
            }
            return {};
        },

        ...cmsDictionaryHandlers(sources),
    };
    return service;
}
