import { EContentItemStatus } from '@rt-tools/cms-contract';

import {
    ELockHolder,
    isContentSlug,
    isDueForPublication,
    isRedirectPath,
    isVisibleOnSite,
    lockHolderOf,
    publishedAtAfterSave,
} from './content-item-rules.function.js';

const NOW: Date = new Date('2026-10-07T10:00:00Z');
const EARLIER: Date = new Date('2026-10-01T10:00:00Z');

describe('the page rules', () => {
    it('SC-CMS-12 — a page address is lower-case Latin letters and digits with single hyphens', () => {
        expect(isContentSlug('pine-stairs-2')).toBe(true);
        expect(isContentSlug('Pine')).toBe(false);
        expect(isContentSlug('pine--stairs')).toBe(false);
        expect(isContentSlug('')).toBe(false);
    });

    it('SC-CMS-12 — a redirect source is a site path from the root without spaces', () => {
        expect(isRedirectPath('/blog/old')).toBe(true);
        expect(isRedirectPath('blog/old')).toBe(false);
        expect(isRedirectPath('//evil.example')).toBe(false);
        expect(isRedirectPath('/blog old')).toBe(false);
    });

    it('SC-CMS-13 — the lock holder is nobody, the caller or another person', () => {
        expect(lockHolderOf(null, 'u1')).toBe(ELockHolder.Nobody);
        expect(lockHolderOf('u1', 'u1')).toBe(ELockHolder.Caller);
        expect(lockHolderOf('u2', 'u1')).toBe(ELockHolder.Other);
    });

    it('SC-CMS-14 — a published page keeps its time, a first publication gets the moment, a draft keeps the former time', () => {
        expect(publishedAtAfterSave(EContentItemStatus.Published, EARLIER, NOW)).toBe(EARLIER);
        expect(publishedAtAfterSave(EContentItemStatus.Published, null, NOW)).toBe(NOW);
        expect(publishedAtAfterSave(EContentItemStatus.Draft, EARLIER, NOW)).toBe(EARLIER);
        expect(publishedAtAfterSave(EContentItemStatus.Archived, null, NOW)).toBeNull();
    });

    it('SC-CMS-15 — the site shows a published page, a draft only by its token, an archived page never', () => {
        expect(isVisibleOnSite(EContentItemStatus.Published, 't', '')).toBe(true);
        expect(isVisibleOnSite(EContentItemStatus.Draft, 't', 't')).toBe(true);
        expect(isVisibleOnSite(EContentItemStatus.Draft, 't', 'x')).toBe(false);
        expect(isVisibleOnSite(EContentItemStatus.Draft, '', '')).toBe(false);
        expect(isVisibleOnSite(EContentItemStatus.Archived, 't', 't')).toBe(false);
    });

    it('SC-CMS-16 — a draft whose date has come is due, a future one and a published one are not', () => {
        expect(isDueForPublication(EContentItemStatus.Draft, EARLIER, NOW)).toBe(true);
        expect(isDueForPublication(EContentItemStatus.Draft, NOW, NOW)).toBe(true);
        expect(isDueForPublication(EContentItemStatus.Draft, new Date('2026-10-08T00:00:00Z'), NOW)).toBe(false);
        expect(isDueForPublication(EContentItemStatus.Draft, null, NOW)).toBe(false);
        expect(isDueForPublication(EContentItemStatus.Published, EARLIER, NOW)).toBe(false);
    });
});
