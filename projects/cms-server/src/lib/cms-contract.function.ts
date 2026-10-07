import { create, type JsonObject, type JsonValue } from '@bufbuild/protobuf';
import { type Timestamp, timestampDate, timestampFromDate } from '@bufbuild/protobuf/wkt';
import { Code, ConnectError } from '@connectrpc/connect';
import {
    CONTENT_ITEM_STATUS_CONTRACT,
    type ContentItem,
    type ContentItemDraft,
    type ContentItemImage,
    type ContentItemImageDraft,
    ContentItemImageSchema,
    ContentItemSchema,
    ContentItemStatus,
    type ContentItemSummary,
    ContentItemSummarySchema,
    type ContentType,
    ContentTypeCategory,
    ContentTypeSchema,
    contractRedirectTypeOf,
    EContentItemStatus,
    type MediaFile,
    type MediaFolder,
    MediaFolderSchema,
    type Redirect,
    RedirectSchema,
    type Tag,
    TagSchema,
} from '@rt-tools/cms-contract';

import type {
    IContentItemConnectionRecord,
    IContentItemDraft,
    IContentItemImageRecord,
    IContentItemRecord,
    IContentTypeRecord,
    IMediaFolderRecord,
    IRedirectRecord,
    ITagRecord,
} from './cms-records.model';
import { isContentSlug, publishedAtAfterSave } from './content-item-rules.function';

/** A media library file by its id, already in the contract shape: the media library builds its address and copies. */
export type TMediaFileOf = (fileId: string) => Promise<MediaFile | null>;

const CATEGORY_TO_CONTRACT: Readonly<Record<string, ContentTypeCategory>> = {
    SYSTEM: ContentTypeCategory.SYSTEM,
    CONTENT: ContentTypeCategory.CONTENT,
    MAIN_PAGES: ContentTypeCategory.MAIN_PAGES,
};

const STATUS_FROM_CONTRACT: Readonly<Partial<Record<ContentItemStatus, EContentItemStatus>>> = {
    [ContentItemStatus.DRAFT]: EContentItemStatus.Draft,
    [ContentItemStatus.PUBLISHED]: EContentItemStatus.Published,
    [ContentItemStatus.ARCHIVED]: EContentItemStatus.Archived,
};

function timestampOrUndefined(date: Date | null): Timestamp | undefined {
    return date === null ? undefined : timestampFromDate(date);
}

/** The page state from the contract; an unspecified state reads as none. */
export function statusFromContract(status: ContentItemStatus): EContentItemStatus | null {
    return STATUS_FROM_CONTRACT[status] ?? null;
}

export function contractContentTypeOf(record: IContentTypeRecord): ContentType {
    return create(ContentTypeSchema, {
        id: record.id,
        name: record.name,
        description: record.description,
        category: CATEGORY_TO_CONTRACT[record.category] ?? ContentTypeCategory.UNSPECIFIED,
        adminSlug: record.adminSlug,
        layoutType: record.layoutType,
        settings: JSON.stringify(record.settings ?? {}),
        createdAt: timestampFromDate(record.createdAt),
        updatedAt: timestampFromDate(record.updatedAt),
    });
}

export function contractSummaryOf(item: IContentItemRecord): ContentItemSummary {
    return create(ContentItemSummarySchema, {
        id: item.id,
        contentTypeId: item.contentTypeId,
        name: item.name,
        status: CONTENT_ITEM_STATUS_CONTRACT[item.status],
        isFeatured: item.isFeatured,
        locale: item.locale,
        slug: item.slug,
        toBePublishedAt: timestampOrUndefined(item.toBePublishedAt),
        publishedAt: timestampOrUndefined(item.publishedAt),
        updatedAt: timestampFromDate(item.updatedAt),
        lockedById: item.lockedById ?? '',
    });
}

async function contractImagesOf(images: readonly IContentItemImageRecord[], mediaFileOf: TMediaFileOf): Promise<ContentItemImage[]> {
    const contract: ContentItemImage[] = [];
    for (const image of images) {
        contract.push(
            create(ContentItemImageSchema, {
                id: image.mediaFileId,
                file: (await mediaFileOf(image.mediaFileId)) ?? undefined,
                caption: image.caption,
                altText: image.altText,
                orderIndex: image.orderIndex,
                labels: [...image.labels],
            })
        );
    }
    return contract;
}

/**
 * A whole page: the main image and the images of the media section come with their addresses and
 * copies. The preview token goes to the admin only: the site gets the page without it.
 */
export async function contractItemOf(item: IContentItemRecord, mediaFileOf: TMediaFileOf, withPreviewToken: boolean): Promise<ContentItem> {
    return create(ContentItemSchema, {
        id: item.id,
        contentTypeId: item.contentTypeId,
        name: item.name,
        status: CONTENT_ITEM_STATUS_CONTRACT[item.status],
        isFeatured: item.isFeatured,
        toBePublishedAt: timestampOrUndefined(item.toBePublishedAt),
        publishedAt: timestampOrUndefined(item.publishedAt),
        mainImage: item.mainImageId === null ? undefined : ((await mediaFileOf(item.mainImageId)) ?? undefined),
        link: item.link,
        locale: item.locale,
        mainFields: {
            slug: item.slug,
            title: item.title,
            description: item.description,
            metaTitle: item.metaTitle,
            metaDescription: item.metaDescription,
            previewToken: withPreviewToken ? item.previewToken : '',
        },
        state: {
            createdById: item.createdById ?? '',
            updatedById: item.updatedById ?? '',
            createdAt: timestampFromDate(item.createdAt),
            updatedAt: timestampFromDate(item.updatedAt),
            lockedById: item.lockedById ?? '',
            lockedAt: timestampOrUndefined(item.lockedAt),
        },
        connections: item.connections.map((connection: IContentItemConnectionRecord) => ({
            contentTypeId: connection.to.contentTypeId,
            contentItemId: connection.toId,
            contentTypeName: connection.to.contentType.name,
            contentItemName: connection.to.name,
        })),
        tagIds: item.tags.map((tag: { tagId: string }) => tag.tagId),
        images: await contractImagesOf(item.images, mediaFileOf),
        contentBody: item.contentBody,
    });
}

/**
 * A page edit from the form. The address and the locale are checked before the write, and the
 * publication time is computed by the server. The locales are those the application names.
 */
export function itemDraftOf(
    draft: ContentItemDraft | undefined,
    previousPublishedAt: Date | null,
    now: Date,
    locales: readonly string[]
): IContentItemDraft {
    if (draft === undefined) {
        throw new ConnectError('the page edit is empty', Code.InvalidArgument);
    }
    if (!isContentSlug(draft.slug)) {
        throw new ConnectError('the page address is empty or malformed', Code.InvalidArgument);
    }
    if (!locales.includes(draft.locale)) {
        throw new ConnectError('the page locale is not a site locale', Code.InvalidArgument);
    }
    const status: EContentItemStatus = statusFromContract(draft.status) ?? EContentItemStatus.Draft;

    return {
        status,
        name: draft.name.trim() === '' ? draft.title : draft.name,
        isFeatured: draft.isFeatured,
        toBePublishedAt: draft.toBePublishedAt === undefined ? null : timestampDate(draft.toBePublishedAt),
        publishedAt: publishedAtAfterSave(status, previousPublishedAt, now),
        mainImageId: draft.mainImageId === '' ? null : draft.mainImageId,
        link: draft.link,
        locale: draft.locale,
        slug: draft.slug,
        title: draft.title,
        description: draft.description,
        metaTitle: draft.metaTitle,
        metaDescription: draft.metaDescription,
        contentBody: draft.contentBody === '' ? '[]' : draft.contentBody,
        tagIds: [...draft.tagIds],
        connectedItemIds: [...draft.connectedItemIds],
        images: draft.images.map((image: ContentItemImageDraft) => ({
            mediaFileId: image.mediaFileId,
            caption: image.caption,
            altText: image.altText,
            labels: [...image.labels],
        })),
    };
}

function contractTagFields(record: ITagRecord): Omit<Tag, '$typeName' | 'tags'> {
    return { id: record.id, name: record.name, isEnabled: record.isEnabled, parentTagId: record.parentTagId ?? '' };
}

/** The tags as a tree: the roots, each with its children. A tag whose parent is gone stands at the root. */
export function contractTagTreeOf(records: readonly ITagRecord[]): Tag[] {
    const known: ReadonlySet<string> = new Set<string>(records.map((record: ITagRecord) => record.id));

    function childrenOf(parentId: string | null): Tag[] {
        return records
            .filter((record: ITagRecord) =>
                parentId === null ? record.parentTagId === null || !known.has(record.parentTagId) : record.parentTagId === parentId
            )
            .map((record: ITagRecord) => create(TagSchema, { ...contractTagFields(record), tags: childrenOf(record.id) }));
    }

    return childrenOf(null);
}

export function contractTagOf(record: ITagRecord): Tag {
    return create(TagSchema, contractTagFields(record));
}

export function contractRedirectOf(record: IRedirectRecord): Redirect {
    return create(RedirectSchema, { id: record.id, from: record.from, to: record.to, type: contractRedirectTypeOf(record.type) });
}

export function contractFolderOf(record: IMediaFolderRecord): MediaFolder {
    return create(MediaFolderSchema, { id: record.id, name: record.name, parentId: record.parentId ?? '' });
}

/** The record by its id was found — or a `NotFound` refusal naming what was not. */
export function found<T>(record: T | null, what: string): T {
    if (record === null) {
        throw new ConnectError(`there is no ${what} with this id`, Code.NotFound);
    }
    return record;
}

/** An id from the contract: an empty string means none. */
export function idOrNull(id: string): string | null {
    return id === '' ? null : id;
}

function isJsonObject(value: JsonValue): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * The settings of a content type form arrive as a JSON string. A broken string or a non-object is
 * a refusal, not empty settings: empty ones would silently switch off every section of the form.
 */
export function settingsOf(settings: string): JsonObject {
    let parsed: JsonValue;
    try {
        parsed = JSON.parse(settings === '' ? '{}' : settings) as JsonValue;
    } catch {
        throw new ConnectError('the content type settings are not JSON', Code.InvalidArgument);
    }
    if (!isJsonObject(parsed)) {
        throw new ConnectError('the content type settings are not a JSON object', Code.InvalidArgument);
    }
    return parsed;
}
