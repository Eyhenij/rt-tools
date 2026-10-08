import { EContentItemStatus, ERedirectType } from '@rt-tools/cms-contract';

import { TCmsLabelKey } from '../i18n/cms-labels.model';

/** The label of a page status on screen. The set of statuses itself is the contract's. */
export const CONTENT_ITEM_STATUS_LABELS: Readonly<Record<EContentItemStatus, TCmsLabelKey>> = {
    [EContentItemStatus.Draft]: 'statusDraft',
    [EContentItemStatus.Published]: 'statusPublished',
    [EContentItemStatus.Archived]: 'statusArchived',
};

/** A content type in the list and in the screen header. The settings are the JSON string the server keeps. */
export interface IContentTypeRow {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly settings: string;
}

/** A row of the page list. Its shape is the product's, not a retelling of the contract. */
export interface IContentItemListRow {
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly locale: string;
    readonly status: EContentItemStatus;
    readonly isFeatured: boolean;
    readonly updatedAt: Date | null;
}

export interface IContentItemList {
    readonly items: readonly IContentItemListRow[];
    readonly total: number;
}

/** An image of a page: a media library file with a caption. The order is its place in the list. */
export interface IContentItemImage {
    readonly fileId: string;
    readonly url: string;
    readonly caption: string;
    readonly altText: string;
}

/** A connection to another page. The names are kept beside it, so the list asks the server nothing. */
export interface IContentItemConnection {
    readonly contentTypeId: string;
    readonly itemId: string;
    readonly typeName: string;
    readonly itemName: string;
}

/** The page fields: the address and what the site puts into the title and the meta tags. */
export interface IWebPageFields {
    readonly slug: string;
    readonly title: string;
    readonly description: string;
    readonly metaTitle: string;
    readonly metaDescription: string;
}

/** A page as the form edits it. */
export interface IEditedContentItem {
    readonly name: string;
    readonly status: EContentItemStatus;
    readonly isFeatured: boolean;
    readonly toBePublishedAt: Date | null;
    readonly locale: string;
    readonly link: string;
    readonly page: IWebPageFields;
    readonly mainImageId: string;
    readonly images: readonly IContentItemImage[];
    readonly tagIds: readonly string[];
    readonly connections: readonly IContentItemConnection[];
    readonly contentBody: string;
}

/** A saved page: the form draft and what the form does not edit. */
export interface IContentItem {
    readonly id: string;
    readonly contentTypeId: string;
    readonly draft: IEditedContentItem;
    readonly previewToken: string;
    readonly lockedById: string;
    readonly updatedAt: Date | null;
}

/** A tag of the tag tree. */
export interface ITagNode {
    readonly id: string;
    readonly name: string;
    readonly parentId: string;
    readonly children: readonly ITagNode[];
}

/** The depth of the tag tree: a nested tag is created only under a tag above the third level. */
export const MAX_TAG_DEPTH: number = 3;

/** The kind of a redirect on screen is its response code; it needs no translation. */
export const REDIRECT_TYPE_TITLES: Readonly<Record<ERedirectType, string>> = {
    [ERedirectType.MovedPermanently]: '301',
    [ERedirectType.Found]: '302',
};

export interface IRedirectListRow {
    readonly id: string;
    readonly from: string;
    readonly to: string;
    readonly type: ERedirectType;
}

export interface IRedirectList {
    readonly redirects: readonly IRedirectListRow[];
    readonly total: number;
}

/** The empty draft of a new page. */
export function emptyItemDraft(locale: string): IEditedContentItem {
    const draft: IEditedContentItem = {
        locale,
        name: '',
        status: EContentItemStatus.Draft,
        isFeatured: false,
        toBePublishedAt: null,
        link: '',
        page: { slug: '', title: '', description: '', metaTitle: '', metaDescription: '' },
        mainImageId: '',
        images: [],
        tagIds: [],
        connections: [],
        contentBody: '[]',
    };
    return draft;
}
