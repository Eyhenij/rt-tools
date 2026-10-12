import type { TMediaFileOf } from './cms-contract.function.js';
import type {
    IContentItemDraft,
    IContentItemFilter,
    IContentItemPage,
    IContentItemRecord,
    IContentTypeDraft,
    IContentTypeRecord,
    IMediaFolderRecord,
    IRedirectPage,
    IRedirectRecord,
    ITagRecord,
    TMediaFolderDraft,
    TRedirectDraft,
    TTagDraft,
} from './cms-records.model.js';

/**
 * The storage port of the CMS services: everything the procedures read and write. The application
 * implements it over its own database; the time comes from outside so the procedures never read
 * the machine clock. A media library file arrives already in the contract shape.
 */
export interface ICmsSources {
    readonly now: () => Date;
    readonly mediaFileOf: TMediaFileOf;

    readonly contentTypes: () => Promise<IContentTypeRecord[]>;
    readonly contentTypeOf: (contentTypeId: string) => Promise<IContentTypeRecord | null>;
    readonly updateContentType: (contentTypeId: string, draft: IContentTypeDraft, callerId: string) => Promise<IContentTypeRecord>;

    readonly itemPageOf: (filter: IContentItemFilter, skip: number, take: number) => Promise<IContentItemPage>;
    readonly itemOf: (contentItemId: string) => Promise<IContentItemRecord | null>;
    readonly slugTaken: (slug: string, locale: string, exceptId: string | null) => Promise<boolean>;
    readonly createItem: (contentTypeId: string, draft: IContentItemDraft, callerId: string) => Promise<IContentItemRecord>;
    readonly updateItem: (contentItemId: string, draft: IContentItemDraft, callerId: string) => Promise<IContentItemRecord>;
    readonly deleteItem: (contentItemId: string) => Promise<void>;
    readonly setFeatured: (contentItemId: string, isFeatured: boolean) => Promise<IContentItemRecord>;
    readonly lockItem: (contentItemId: string, callerId: string, at: Date) => Promise<IContentItemRecord>;
    readonly unlockItem: (contentItemId: string) => Promise<IContentItemRecord>;

    readonly itemBySlugOf: (slug: string, locale: string) => Promise<IContentItemRecord | null>;
    readonly publishedItemsOf: (adminSlug: string, locale: string) => Promise<IContentItemRecord[]>;
    readonly publishedLocalesOf: (slug: string) => Promise<string[]>;

    readonly tags: () => Promise<ITagRecord[]>;
    readonly tagOf: (tagId: string) => Promise<ITagRecord | null>;
    readonly saveTag: (tagId: string | null, draft: TTagDraft) => Promise<ITagRecord>;
    readonly deleteTag: (tagId: string) => Promise<void>;

    readonly redirectPageOf: (skip: number, take: number, search: string | null) => Promise<IRedirectPage>;
    readonly allRedirects: () => Promise<IRedirectRecord[]>;
    readonly redirectOf: (redirectId: string) => Promise<IRedirectRecord | null>;
    readonly redirectFromTaken: (from: string, exceptId: string | null) => Promise<boolean>;
    readonly saveRedirect: (redirectId: string | null, draft: TRedirectDraft, callerId: string) => Promise<IRedirectRecord>;
    readonly deleteRedirect: (redirectId: string) => Promise<void>;

    readonly folders: () => Promise<IMediaFolderRecord[]>;
    readonly folderOf: (folderId: string) => Promise<IMediaFolderRecord | null>;
    readonly saveFolder: (folderId: string | null, draft: TMediaFolderDraft) => Promise<IMediaFolderRecord>;
    readonly deleteFolder: (folderId: string) => Promise<void>;
}

/** What the CMS services take: the storage port and the site locales the application names. */
export interface ICmsServerOptions {
    readonly sources: ICmsSources;
    readonly locales: readonly string[];
}
