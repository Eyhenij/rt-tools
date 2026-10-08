import type { JsonObject } from '@bufbuild/protobuf';
import type { EContentItemStatus, ERedirectType } from '@rt-tools/cms-contract';

/** A content type as storage keeps it. The settings are the JSON of its edit form. */
export interface IContentTypeRecord {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly category: string;
    readonly adminSlug: string;
    readonly layoutType: string;
    readonly settings: unknown;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export interface IContentTypeDraft {
    readonly name: string;
    readonly description: string;
    readonly settings: JsonObject;
}

export interface IContentItemImageRecord {
    readonly mediaFileId: string;
    readonly caption: string;
    readonly altText: string;
    readonly orderIndex: number;
    readonly labels: readonly string[];
}

export interface IContentItemConnectionRecord {
    readonly toId: string;
    readonly to: { readonly name: string; readonly contentTypeId: string; readonly contentType: { readonly name: string } };
}

/** A page as storage keeps it, with its tags, connections and images. */
export interface IContentItemRecord {
    readonly id: string;
    readonly contentTypeId: string;
    readonly name: string;
    readonly status: EContentItemStatus;
    readonly isFeatured: boolean;
    readonly toBePublishedAt: Date | null;
    readonly publishedAt: Date | null;
    readonly mainImageId: string | null;
    readonly link: string;
    readonly locale: string;
    readonly slug: string;
    readonly title: string;
    readonly description: string;
    readonly metaTitle: string;
    readonly metaDescription: string;
    readonly previewToken: string;
    readonly contentBody: string;
    readonly lockedById: string | null;
    readonly lockedAt: Date | null;
    readonly createdById: string | null;
    readonly updatedById: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly tags: readonly { readonly tagId: string }[];
    readonly connections: readonly IContentItemConnectionRecord[];
    readonly images: readonly IContentItemImageRecord[];
}

/** A page edit as the server checked it: the address and the locale are valid, the publication time is computed. */
export interface IContentItemDraft {
    readonly name: string;
    readonly status: EContentItemStatus;
    readonly isFeatured: boolean;
    readonly toBePublishedAt: Date | null;
    readonly publishedAt: Date | null;
    readonly mainImageId: string | null;
    readonly link: string;
    readonly locale: string;
    readonly slug: string;
    readonly title: string;
    readonly description: string;
    readonly metaTitle: string;
    readonly metaDescription: string;
    readonly contentBody: string;
    readonly tagIds: readonly string[];
    readonly connectedItemIds: readonly string[];
    readonly images: readonly Omit<IContentItemImageRecord, 'orderIndex'>[];
}

export interface IContentItemPage {
    readonly items: readonly IContentItemRecord[];
    readonly total: number;
}

export interface IContentItemFilter {
    readonly contentTypeId: string;
    readonly search: string | null;
    readonly status: EContentItemStatus | null;
    readonly locale: string | null;
}

export interface ITagRecord {
    readonly id: string;
    readonly name: string;
    readonly isEnabled: boolean;
    readonly parentTagId: string | null;
}

export interface IRedirectRecord {
    readonly id: string;
    readonly from: string;
    readonly to: string;
    readonly type: ERedirectType;
}

export interface IMediaFolderRecord {
    readonly id: string;
    readonly name: string;
    readonly parentId: string | null;
}

export type TTagDraft = Omit<ITagRecord, 'id'>;
export type TRedirectDraft = Omit<IRedirectRecord, 'id'>;
export type TMediaFolderDraft = Omit<IMediaFolderRecord, 'id'>;

export interface IRedirectPage {
    readonly redirects: readonly IRedirectRecord[];
    readonly total: number;
}
