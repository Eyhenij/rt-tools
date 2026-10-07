import { EContentItemStatus, sitePathOf } from '@rt-tools/cms-contract';

import { IWebPageFields } from './cms-item.model';

/** Which page fields the person has already edited themselves. The title echo no longer touches them. */
export interface ITouchedPageFields {
    readonly description: boolean;
    readonly metaDescription: boolean;
}

/**
 * The page fields of a new page after an edit: the description repeats the title, and the meta
 * description repeats the meta title, until the person edits them. A saved page has them unlinked.
 */
export function echoedPageFields(next: IWebPageFields, touched: ITouchedPageFields, isNew: boolean): IWebPageFields {
    if (!isNew) {
        return next;
    }
    return {
        ...next,
        description: touched.description ? next.description : next.title,
        metaDescription: touched.metaDescription ? next.metaDescription : next.metaTitle,
    };
}

/** What the edit header knows when it decides whether saving is open. */
export interface ISaveGate {
    readonly dirty: boolean;
    readonly valid: boolean;
    readonly lockedByOther: boolean;
    readonly saving: boolean;
}

/** Saving is closed while there are no edits, the form is invalid, another person holds the page or a save is running. */
export function canSaveItem(gate: ISaveGate): boolean {
    return gate.dirty && gate.valid && !gate.lockedByOther && !gate.saving;
}

/** What the preview address of a page on the site is built from. */
export interface IPreviewSource {
    readonly id: string;
    readonly status: EContentItemStatus;
    readonly link: string;
    readonly slug: string;
    readonly previewToken: string;
}

/** Where the site is and under which section root it shows pages without an own link. */
export interface ISiteAddress {
    readonly baseUrl: string;
    readonly sectionRoot: string;
}

/**
 * The preview address: the site address and the page path. A draft and an archived page get the
 * preview token. An unsaved page has no address.
 */
export function itemPreviewUrlOf(site: ISiteAddress, source: IPreviewSource): string | null {
    if (source.id === '') {
        return null;
    }
    const base: string = site.baseUrl.endsWith('/') ? site.baseUrl.slice(0, -1) : site.baseUrl;
    const url: string = `${base}${sitePathOf(source.link, source.slug, site.sectionRoot)}`;
    return source.status === EContentItemStatus.Published ? url : `${url}?previewToken=${encodeURIComponent(source.previewToken)}`;
}
