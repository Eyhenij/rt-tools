import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';

import { ICmsSitePage } from './site-page.function';
import { ICmsSitePageHead, SitePageHeadService } from './site-page-head.service';

const PAGE: ICmsSitePage.State = {
    id: 'i1',
    slug: 'pine',
    path: '/blog/pine',
    locale: 'en',
    title: 'Pine',
    description: 'About pine',
    metaTitle: 'Pine wood',
    metaDescription: 'All about pine',
    imageSrc: 'https://example.org/pine.webp',
    imageSrcset: null,
    publishedAt: '2026-10-01T00:00:00Z',
    tagIds: [],
    blocks: [],
    contents: [],
};

const HEAD: ICmsSitePageHead = {
    url: 'https://example.org/blog/pine',
    preview: false,
    locales: ['en'],
    hreflangsOf: { en: ['en', 'x-default'], ru: ['ru-RU', 'ru-BY'] },
};

function hreflangs(doc: Document): string[] {
    return Array.from(doc.head.querySelectorAll('link[rel="alternate"]')).map(
        (link: Element): string => link.getAttribute('hreflang') ?? ''
    );
}

describe('the head of a site page', () => {
    let service: SitePageHeadService;
    let doc: Document;
    let meta: Meta;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SitePageHeadService);
        doc = TestBed.inject(DOCUMENT);
        meta = TestBed.inject(Meta);
        doc.head.querySelectorAll('link[rel="alternate"]').forEach((link: Element): void => link.remove());
        ['en', 'x-default', 'ru-RU', 'ru-BY'].forEach((hreflang: string): void => {
            const link: HTMLLinkElement = doc.createElement('link');
            link.setAttribute('rel', 'alternate');
            link.setAttribute('hreflang', hreflang);
            doc.head.appendChild(link);
        });
    });

    it('SC-CMS-76 — the head carries the page title, description and card', () => {
        service.apply(PAGE, HEAD);

        expect(TestBed.inject(Title).getTitle()).toBe('Pine wood');
        expect(meta.getTag('name="description"')?.content).toBe('All about pine');
        expect(meta.getTag('property="og:url"')?.content).toBe('https://example.org/blog/pine');
        expect(meta.getTag('property="og:image"')?.content).toBe('https://example.org/pine.webp');
        expect(meta.getTag('name="robots"')).toBeNull();
    });

    it('SC-CMS-76 — a page without an image does not set the card image', () => {
        meta.removeTag('property="og:image"');
        service.apply({ ...PAGE, imageSrc: null }, HEAD);

        expect(meta.getTag('property="og:image"')).toBeNull();
    });

    it('SC-CMS-77 — a draft by a preview token is closed from indexing until the page is left', () => {
        service.apply(PAGE, { ...HEAD, preview: true });
        expect(meta.getTag('name="robots"')?.content).toBe('noindex, nofollow');

        service.clear();
        expect(meta.getTag('name="robots"')).toBeNull();
    });

    it('SC-CMS-78 — only the sites where the page is published in their language stay in hreflang, and leaving brings the rest back', () => {
        service.apply(PAGE, HEAD);
        expect(hreflangs(doc)).toEqual(['en', 'x-default']);

        service.apply(PAGE, { ...HEAD, locales: ['fr'] });
        expect(hreflangs(doc)).toEqual([]);

        service.clear();
        expect(hreflangs(doc).sort()).toEqual(['en', 'ru-BY', 'ru-RU', 'x-default']);
    });
});
