import { ContentItemStatus, RedirectType } from './gen/rt/cms/v1/cms_pb.js';

/** The state of a page — one vocabulary for the server and the admin. The values are those storage writes. */
export enum EContentItemStatus {
    Draft = 'DRAFT',
    Published = 'PUBLISHED',
    Archived = 'ARCHIVED',
}

/** The state of a page in the contract. Both sides translate it by one table: two copies would drift apart silently. */
export const CONTENT_ITEM_STATUS_CONTRACT: Readonly<Record<EContentItemStatus, ContentItemStatus>> = {
    [EContentItemStatus.Draft]: ContentItemStatus.DRAFT,
    [EContentItemStatus.Published]: ContentItemStatus.PUBLISHED,
    [EContentItemStatus.Archived]: ContentItemStatus.ARCHIVED,
};

/** The kind of a redirect: permanent 301 or temporary 302. The values are those storage writes. */
export enum ERedirectType {
    MovedPermanently = 'MOVED_PERMANENTLY',
    Found = 'FOUND',
}

export function contractRedirectTypeOf(type: ERedirectType): RedirectType {
    return type === ERedirectType.Found ? RedirectType.FOUND : RedirectType.MOVED_PERMANENTLY;
}

/** An unknown kind from the contract reads as permanent: the server creates a redirect so by default. */
export function redirectTypeOfContract(type: RedirectType): ERedirectType {
    return type === RedirectType.FOUND ? ERedirectType.Found : ERedirectType.MovedPermanently;
}
