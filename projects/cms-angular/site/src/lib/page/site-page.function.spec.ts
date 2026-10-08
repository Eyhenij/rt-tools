import { create } from '@bufbuild/protobuf';
import { timestampFromDate } from '@bufbuild/protobuf/wkt';

import { ContentItem, ContentItemSchema, EBlockType, MediaCopySchema, MediaFileSchema, TagSchema } from '@rt-tools/cms-contract';

import { ICmsSitePage, rootTagOf, sitePageOf, siteTagOf, sitemapXmlOf, srcsetOf } from './site-page.function';

function item(mainFields: Partial<Record<'metaTitle' | 'metaDescription', string>> = {}): ContentItem {
    return create(ContentItemSchema, {
        id: 'i1',
        link: '',
        locale: 'en',
        tagIds: ['t-child'],
        publishedAt: timestampFromDate(new Date('2026-09-27T10:00:00.000Z')),
        mainImage: create(MediaFileSchema, {
            url: 'https://cdn.example/media/f1.jpg',
            copies: [create(MediaCopySchema, { width: 480, url: 'https://cdn.example/media/f1-480.webp' })],
        }),
        mainFields: { slug: 'pine-stairs', title: 'Pine', description: 'About pine', ...mainFields },
        contentBody: JSON.stringify([
            { id: 'b1', type: EBlockType.Heading2, content: 'Why pine' },
            { id: 'b2', type: 'sidebarBanner', content: 'an ad' },
            { id: 'b3', type: EBlockType.Paragraph, content: '<p>Text</p>' },
        ]),
    });
}

function page(slug: string, publishedAt: string = '2026-09-27T10:00:00.000Z'): ICmsSitePage.State {
    return { ...sitePageOf(item(), '/blog'), slug, publishedAt, id: slug, path: `/blog/${slug}`, tagIds: [] };
}

const TAGS: ICmsSitePage.Tag[] = [
    { id: 't-root', name: 'materials', parentId: '' },
    { id: 't-child', name: 'Pine', parentId: 't-root' },
    { id: 't-loop-a', name: 'A', parentId: 't-loop-b' },
    { id: 't-loop-b', name: 'B', parentId: 't-loop-a' },
];

describe('a site page from a CMS page', () => {
    it('SC-CMS-71 — the page search fields come from the page, the image from the main image', () => {
        const sitePage: ICmsSitePage.State = sitePageOf(item({ metaTitle: 'Pine stairs', metaDescription: 'All about pine' }), '/blog');

        expect(sitePage.metaTitle).toBe('Pine stairs');
        expect(sitePage.metaDescription).toBe('All about pine');
        expect(sitePage.imageSrc).toBe('https://cdn.example/media/f1.jpg');
        expect(sitePage.imageSrcset).toBe('https://cdn.example/media/f1-480.webp 480w');
        expect(sitePage.path).toBe('/blog/pine-stairs');
        expect(sitePage.publishedAt).toBe('2026-09-27T10:00:00.000Z');
    });

    it('SC-CMS-71 — empty meta fields are taken from the title and the description', () => {
        const sitePage: ICmsSitePage.State = sitePageOf(item(), '/blog');

        expect(sitePage.metaTitle).toBe('Pine');
        expect(sitePage.metaDescription).toBe('About pine');
    });

    it('SC-CMS-71 — a block of an unknown kind is skipped, the contents are built by H2', () => {
        const sitePage: ICmsSitePage.State = sitePageOf(item(), '/blog');

        expect(sitePage.blocks.map((block: { id: string }): string => block.id)).toEqual(['b1', 'b3']);
        expect(sitePage.contents).toEqual([{ blockId: 'b1', title: 'Why pine' }]);
    });

    it('SC-CMS-71 — a page without an image, copies and a publication date', () => {
        const sitePage: ICmsSitePage.State = sitePageOf(create(ContentItemSchema, { id: 'i2' }), '/blog');

        expect(sitePage.imageSrc).toBeNull();
        expect(sitePage.imageSrcset).toBeNull();
        expect(sitePage.publishedAt).toBe('');
        expect(sitePage.slug).toBe('');
        expect(srcsetOf([])).toBeNull();
    });
});

describe('the rubric tag of a site page', () => {
    it('SC-CMS-71 — the rubric is the root tag of the first tag', () => {
        expect(rootTagOf(sitePageOf(item(), '/blog'), TAGS)?.id).toBe('t-root');
        expect(siteTagOf(create(TagSchema, { id: 't1', name: 'Pine', parentTagId: 't0' }))).toEqual({
            id: 't1',
            name: 'Pine',
            parentId: 't0',
        });
    });

    it('SC-CMS-71 — no tags give no rubric, and a loop in the chain stops', () => {
        expect(rootTagOf({ ...page('a'), tagIds: [] }, TAGS)).toBeNull();
        expect(rootTagOf({ ...page('b'), tagIds: ['t-loop-a'] }, TAGS)?.name).toMatch(/^[AB]$/);
    });
});

describe('CMS pages in the sitemap', () => {
    it('SC-CMS-72 — the sitemap names published pages once each, with the publication date', () => {
        const staticXml: string = '<urlset>\n  <url><loc>https://example.org/blog/straight-stair</loc></url>\n</urlset>\n';

        const xml: string = sitemapXmlOf(staticXml, 'https://example.org', [
            page('pine-stairs'),
            page('pine-stairs'),
            page('straight-stair'),
            page('draft', ''),
        ]);

        expect(xml).toContain('<loc>https://example.org/blog/pine-stairs</loc><lastmod>2026-09-27</lastmod>');
        expect(xml).toContain('<loc>https://example.org/blog/draft</loc></url>');
        expect(xml.match(/blog\/pine-stairs</g)?.length).toBe(1);
        expect(xml.match(/blog\/straight-stair</g)?.length).toBe(1);
        expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
    });

    it('SC-CMS-72 — a page address goes into the map escaped', () => {
        const xml: string = sitemapXmlOf('<urlset>\n</urlset>\n', 'https://example.org', [{ ...page('q'), path: `/a&b<"'>` }]);

        expect(xml).toContain('<loc>https://example.org/a&amp;b&lt;&quot;&apos;&gt;</loc>');
    });
});
