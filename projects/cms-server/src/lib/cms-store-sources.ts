import type { TMediaFileOf } from './cms-contract.function.js';
import {
    allRedirectsOf,
    contentTypeOf,
    contentTypesOf,
    type IContentTypeDelegate,
    type IMediaFolderDelegate,
    type IRedirectDelegate,
    type ITagDelegate,
    mediaFoldersOf,
    redirectFromTaken,
    redirectOf,
    redirectPageOf,
    saveMediaFolder,
    saveRedirect,
    saveTag,
    tagsOf,
    updateContentType,
} from './cms-dictionary-store.function.js';
import type {
    IContentItemDraft,
    IContentItemFilter,
    IContentTypeDraft,
    TMediaFolderDraft,
    TRedirectDraft,
    TTagDraft,
} from './cms-records.model.js';
import type { ICmsSources } from './cms-sources.model.js';
import {
    contentItemBySlugOf,
    contentItemOf,
    contentItemPageOf,
    contentSlugTaken,
    createContentItem,
    deleteContentItem,
    type IContentItemDelegate,
    lockContentItem,
    publishedContentItemsOf,
    publishedContentLocalesOf,
    setContentItemFeatured,
    unlockContentItem,
    updateContentItem,
} from './content-item-store.function.js';

/**
 * What the storage port is assembled from: the delegates of the application's database client,
 * the clock and the media library lookup. With Prisma, the delegates are `prisma.contentType`,
 * `prisma.contentItem`, `prisma.tag`, `prisma.redirect` and `prisma.mediaFolder`.
 */
export interface ICmsStoreDelegates {
    readonly contentTypes: IContentTypeDelegate;
    readonly contentItems: IContentItemDelegate;
    readonly tags: ITagDelegate;
    readonly redirects: IRedirectDelegate;
    readonly folders: IMediaFolderDelegate;
    readonly now: () => Date;
    readonly mediaFileOf: TMediaFileOf;
}

/**
 * The storage port over the delegates of a database client. Removing a tag or a folder relies on
 * the schema: the children move to the root and the relations are dropped by the database itself.
 */
export function cmsStoreSources(store: ICmsStoreDelegates): ICmsSources {
    return {
        now: store.now,
        mediaFileOf: store.mediaFileOf,

        contentTypes: (): ReturnType<ICmsSources['contentTypes']> => contentTypesOf(store.contentTypes),
        contentTypeOf: (contentTypeId: string): ReturnType<ICmsSources['contentTypeOf']> =>
            contentTypeOf(store.contentTypes, contentTypeId),
        updateContentType: (
            contentTypeId: string,
            draft: IContentTypeDraft,
            callerId: string
        ): ReturnType<ICmsSources['updateContentType']> => updateContentType(store.contentTypes, contentTypeId, draft, callerId),

        itemPageOf: (filter: IContentItemFilter, skip: number, take: number): ReturnType<ICmsSources['itemPageOf']> =>
            contentItemPageOf(store.contentItems, filter, skip, take),
        itemOf: (contentItemId: string): ReturnType<ICmsSources['itemOf']> => contentItemOf(store.contentItems, contentItemId),
        slugTaken: (slug: string, locale: string, exceptId: string | null): ReturnType<ICmsSources['slugTaken']> =>
            contentSlugTaken(store.contentItems, slug, locale, exceptId),
        createItem: (contentTypeId: string, draft: IContentItemDraft, callerId: string): ReturnType<ICmsSources['createItem']> =>
            createContentItem(store.contentItems, contentTypeId, draft, callerId),
        updateItem: (contentItemId: string, draft: IContentItemDraft, callerId: string): ReturnType<ICmsSources['updateItem']> =>
            updateContentItem(store.contentItems, contentItemId, draft, callerId),
        deleteItem: (contentItemId: string): ReturnType<ICmsSources['deleteItem']> => deleteContentItem(store.contentItems, contentItemId),
        setFeatured: (contentItemId: string, isFeatured: boolean): ReturnType<ICmsSources['setFeatured']> =>
            setContentItemFeatured(store.contentItems, contentItemId, isFeatured),
        lockItem: (contentItemId: string, callerId: string, at: Date): ReturnType<ICmsSources['lockItem']> =>
            lockContentItem(store.contentItems, contentItemId, callerId, at),
        unlockItem: (contentItemId: string): ReturnType<ICmsSources['unlockItem']> => unlockContentItem(store.contentItems, contentItemId),

        itemBySlugOf: (slug: string, locale: string): ReturnType<ICmsSources['itemBySlugOf']> =>
            contentItemBySlugOf(store.contentItems, slug, locale),
        publishedItemsOf: (adminSlug: string, locale: string): ReturnType<ICmsSources['publishedItemsOf']> =>
            publishedContentItemsOf(store.contentItems, adminSlug, locale),
        publishedLocalesOf: (slug: string): ReturnType<ICmsSources['publishedLocalesOf']> =>
            publishedContentLocalesOf(store.contentItems, slug),

        tags: (): ReturnType<ICmsSources['tags']> => tagsOf(store.tags),
        tagOf: (tagId: string): ReturnType<ICmsSources['tagOf']> => store.tags.findUnique({ where: { id: tagId } }),
        saveTag: (tagId: string | null, draft: TTagDraft): ReturnType<ICmsSources['saveTag']> => saveTag(store.tags, tagId, draft),
        deleteTag: async (tagId: string): ReturnType<ICmsSources['deleteTag']> => {
            await store.tags.delete({ where: { id: tagId } });
        },

        redirectPageOf: (skip: number, take: number, search: string | null): ReturnType<ICmsSources['redirectPageOf']> =>
            redirectPageOf(store.redirects, skip, take, search),
        allRedirects: (): ReturnType<ICmsSources['allRedirects']> => allRedirectsOf(store.redirects),
        redirectOf: (redirectId: string): ReturnType<ICmsSources['redirectOf']> => redirectOf(store.redirects, redirectId),
        redirectFromTaken: (from: string, exceptId: string | null): ReturnType<ICmsSources['redirectFromTaken']> =>
            redirectFromTaken(store.redirects, from, exceptId),
        saveRedirect: (redirectId: string | null, draft: TRedirectDraft, callerId: string): ReturnType<ICmsSources['saveRedirect']> =>
            saveRedirect(store.redirects, redirectId, draft, callerId),
        deleteRedirect: async (redirectId: string): ReturnType<ICmsSources['deleteRedirect']> => {
            await store.redirects.delete({ where: { id: redirectId } });
        },

        folders: (): ReturnType<ICmsSources['folders']> => mediaFoldersOf(store.folders),
        folderOf: (folderId: string): ReturnType<ICmsSources['folderOf']> => store.folders.findUnique({ where: { id: folderId } }),
        saveFolder: (folderId: string | null, draft: TMediaFolderDraft): ReturnType<ICmsSources['saveFolder']> =>
            saveMediaFolder(store.folders, folderId, draft),
        deleteFolder: async (folderId: string): ReturnType<ICmsSources['deleteFolder']> => {
            await store.folders.delete({ where: { id: folderId } });
        },
    };
}
