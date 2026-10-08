import { create, MessageInitShape } from '@bufbuild/protobuf';
import { Timestamp, timestampDate, timestampFromDate } from '@bufbuild/protobuf/wkt';
import {
    CONTENT_ITEM_STATUS_CONTRACT,
    ContentItem,
    ContentItemConnection,
    ContentItemDraftSchema,
    ContentItemImage,
    ContentItemImageDraftSchema,
    ContentItemStatus,
    ContentItemSummary,
    ContentType,
    EContentItemStatus,
    Redirect,
    redirectTypeOfContract,
    Tag,
} from '@rt-tools/cms-contract';
import {
    IContentItem,
    IContentItemConnection,
    IContentItemImage,
    IContentItemListRow,
    IContentTypeRow,
    IEditedContentItem,
    IRedirectListRow,
    ITagNode,
    IWebPageFields,
} from '@rt-tools/cms-angular';

/** A page draft in the shape the contract takes. */
export type TContractDraft = MessageInitShape<typeof ContentItemDraftSchema>;

// The contract is translated into the CMS notions in one place: two translations would drift apart silently.

const STATUS_OF_CONTRACT: Readonly<Record<ContentItemStatus, EContentItemStatus>> = {
    [ContentItemStatus.UNSPECIFIED]: EContentItemStatus.Draft,
    [ContentItemStatus.DRAFT]: EContentItemStatus.Draft,
    [ContentItemStatus.PUBLISHED]: EContentItemStatus.Published,
    [ContentItemStatus.ARCHIVED]: EContentItemStatus.Archived,
};

/** The contract status of a filter; no status means "any". */
export function contractStatusOf(status: EContentItemStatus | null): ContentItemStatus {
    return status === null ? ContentItemStatus.UNSPECIFIED : CONTENT_ITEM_STATUS_CONTRACT[status];
}

function dateOf(stamp: Timestamp | undefined): Date | null {
    return stamp === undefined ? null : timestampDate(stamp);
}

export function contentTypeRowOf(type: ContentType): IContentTypeRow {
    const row: IContentTypeRow = { id: type.id, name: type.name, description: type.description, settings: type.settings };
    return row;
}

export function contentItemRowOf(item: ContentItemSummary): IContentItemListRow {
    const row: IContentItemListRow = {
        id: item.id,
        name: item.name,
        slug: item.slug,
        locale: item.locale,
        status: STATUS_OF_CONTRACT[item.status],
        isFeatured: item.isFeatured,
        updatedAt: dateOf(item.updatedAt),
    };
    return row;
}

function imageOf(image: ContentItemImage): IContentItemImage {
    const result: IContentItemImage = {
        fileId: image.file?.id ?? '',
        url: image.file?.url ?? '',
        caption: image.caption,
        altText: image.altText,
    };
    return result;
}

function connectionOf(connection: ContentItemConnection): IContentItemConnection {
    const result: IContentItemConnection = {
        contentTypeId: connection.contentTypeId,
        itemId: connection.contentItemId,
        typeName: connection.contentTypeName,
        itemName: connection.contentItemName,
    };
    return result;
}

function draftOf(item: ContentItem): IEditedContentItem {
    const page: IWebPageFields = {
        slug: item.mainFields?.slug ?? '',
        title: item.mainFields?.title ?? '',
        description: item.mainFields?.description ?? '',
        metaTitle: item.mainFields?.metaTitle ?? '',
        metaDescription: item.mainFields?.metaDescription ?? '',
    };
    const draft: IEditedContentItem = {
        page,
        name: item.name,
        status: STATUS_OF_CONTRACT[item.status],
        isFeatured: item.isFeatured,
        toBePublishedAt: dateOf(item.toBePublishedAt),
        locale: item.locale,
        link: item.link,
        mainImageId: item.mainImage?.id ?? '',
        images: [...item.images].sort((left: ContentItemImage, right: ContentItemImage) => left.orderIndex - right.orderIndex).map(imageOf),
        tagIds: [...item.tagIds],
        connections: item.connections.map(connectionOf),
        contentBody: item.contentBody,
    };
    return draft;
}

/** An answer without a record breaks the contract on the server side; it is not a refusal to tell the person about. */
export function required<T>(value: T | undefined, what: string): T {
    if (value === undefined) {
        throw new Error(`The server answered without ${what}`);
    }
    return value;
}

export function contentItemOf(item: ContentItem | undefined): IContentItem {
    const present: ContentItem = required(item, 'the page');
    const result: IContentItem = {
        id: present.id,
        contentTypeId: present.contentTypeId,
        draft: draftOf(present),
        previewToken: present.mainFields?.previewToken ?? '',
        lockedById: present.state?.lockedById ?? '',
        updatedAt: dateOf(present.state?.updatedAt),
    };
    return result;
}

export function contractDraftOf(draft: IEditedContentItem): TContractDraft {
    const result: TContractDraft = {
        ...draft.page,
        name: draft.name,
        status: CONTENT_ITEM_STATUS_CONTRACT[draft.status],
        isFeatured: draft.isFeatured,
        toBePublishedAt: draft.toBePublishedAt === null ? undefined : timestampFromDate(draft.toBePublishedAt),
        mainImageId: draft.mainImageId,
        link: draft.link,
        locale: draft.locale,
        contentBody: draft.contentBody,
        tagIds: [...draft.tagIds],
        connectedItemIds: draft.connections.map((connection: IContentItemConnection) => connection.itemId),
        images: draft.images.map((image: IContentItemImage) =>
            create(ContentItemImageDraftSchema, { mediaFileId: image.fileId, caption: image.caption, altText: image.altText })
        ),
    };
    return result;
}

export function tagNodeOf(tag: Tag): ITagNode {
    const node: ITagNode = { id: tag.id, name: tag.name, parentId: tag.parentTagId, children: tag.tags.map(tagNodeOf) };
    return node;
}

export function redirectRowOf(redirect: Redirect): IRedirectListRow {
    const row: IRedirectListRow = { id: redirect.id, from: redirect.from, to: redirect.to, type: redirectTypeOfContract(redirect.type) };
    return row;
}
