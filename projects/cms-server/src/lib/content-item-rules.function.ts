import { EContentItemStatus } from '@rt-tools/cms-contract';

/** A page address is a part of the page link: lower-case Latin letters and digits with single hyphens between them. */
const SLUG_PATTERN: RegExp = /^[a-z\d]+(?:-[a-z\d]+)*$/;

/** Who holds a page open, relative to the caller. */
export enum ELockHolder {
    Nobody = 'nobody',
    Caller = 'caller',
    Other = 'other',
}

export function isContentSlug(slug: string): boolean {
    return SLUG_PATTERN.test(slug);
}

/** The source of a redirect is a site path from the root: the site server compares the request path with it. */
export function isRedirectPath(path: string): boolean {
    return path.startsWith('/') && !path.startsWith('//') && !/\s/.test(path);
}

export function lockHolderOf(lockedById: string | null, callerId: string): ELockHolder {
    if (lockedById === null) {
        return ELockHolder.Nobody;
    }

    return lockedById === callerId ? ELockHolder.Caller : ELockHolder.Other;
}

/**
 * The publication time of a page after an edit. A published page keeps its time, and a page
 * published for the first time gets the moment of the edit. A draft and an archived page keep the
 * time too: back on the site, the page comes out with its former date.
 */
export function publishedAtAfterSave(status: EContentItemStatus, previous: Date | null, now: Date): Date | null {
    if (status === EContentItemStatus.Published) {
        return previous ?? now;
    }

    return previous;
}

/** A draft whose publication date has come is due for publication. */
export function isDueForPublication(status: EContentItemStatus, toBePublishedAt: Date | null, now: Date): boolean {
    return status === EContentItemStatus.Draft && toBePublishedAt !== null && toBePublishedAt.getTime() <= now.getTime();
}

/**
 * The site shows a published page to everyone and a draft only by its preview token. An archived
 * page is never shown: it is taken off the site.
 */
export function isVisibleOnSite(status: EContentItemStatus, previewToken: string, requestToken: string): boolean {
    if (status === EContentItemStatus.Published) {
        return true;
    }

    return status === EContentItemStatus.Draft && requestToken !== '' && requestToken === previewToken;
}
