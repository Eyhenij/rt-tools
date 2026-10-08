import { timestampDate } from '@bufbuild/protobuf/wkt';

import {
    ContentItem,
    IBlock,
    ISiteContentsEntry,
    MediaCopy,
    Tag,
    parseContentBody,
    siteContentsOf,
    sitePathOf,
} from '@rt-tools/cms-contract';

/** A CMS page as the site shows it. */
export namespace ICmsSitePage {
    export interface State {
        readonly id: string;
        readonly slug: string;
        /** The page path on the site: the page's own link or `<section root>/<slug>`. */
        readonly path: string;
        readonly locale: string;
        readonly title: string;
        readonly description: string;
        /** The title for search; an empty meta title is replaced by the page title. */
        readonly metaTitle: string;
        /** The description for search; an empty meta description is replaced by the page description. */
        readonly metaDescription: string;
        readonly imageSrc: string | null;
        /** The smaller copies of the main image for `srcset`; `null` — no copies, the original is shown. */
        readonly imageSrcset: string | null;
        readonly publishedAt: string;
        readonly tagIds: readonly string[];
        readonly blocks: readonly IBlock.Base[];
        readonly contents: readonly ISiteContentsEntry[];
    }

    /** A CMS tag as the site sees it: the name and the parent id, empty for a root one. */
    export interface Tag {
        readonly id: string;
        readonly name: string;
        readonly parentId: string;
    }
}

/**
 * The image copies as `srcset`: the browser takes the one that fills as much of the page as the
 * image does. No copies — `null`, and the one original stays.
 */
export function srcsetOf(copies: readonly MediaCopy[]): string | null {
    return copies.length === 0 ? null : copies.map((copy: MediaCopy): string => `${copy.url} ${String(copy.width)}w`).join(', ');
}

function filledOr(value: string | undefined, fallback: string): string {
    return value === undefined || value === '' ? fallback : value;
}

/**
 * A CMS page as the site shows it. The body is parsed here: a block of an unknown kind is dropped by
 * the parse, and the contents are built by the H2 headings of the same body. Empty meta fields are
 * replaced by the page title and description.
 */
export function sitePageOf(item: ContentItem, sectionRoot: string): ICmsSitePage.State {
    const slug: string = item.mainFields?.slug ?? '';
    const title: string = item.mainFields?.title ?? '';
    const description: string = item.mainFields?.description ?? '';
    const blocks: IBlock.Base[] = parseContentBody(item.contentBody);
    const imageUrl: string = item.mainImage?.url ?? '';
    const page: ICmsSitePage.State = {
        slug,
        title,
        description,
        blocks,
        id: item.id,
        path: sitePathOf(item.link, slug, sectionRoot),
        locale: item.locale,
        metaTitle: filledOr(item.mainFields?.metaTitle, title),
        metaDescription: filledOr(item.mainFields?.metaDescription, description),
        imageSrc: imageUrl === '' ? null : imageUrl,
        imageSrcset: srcsetOf(item.mainImage?.copies ?? []),
        publishedAt: item.publishedAt === undefined ? '' : timestampDate(item.publishedAt).toISOString(),
        tagIds: item.tagIds,
        contents: siteContentsOf(blocks),
    };

    return page;
}

export function siteTagOf(tag: Tag): ICmsSitePage.Tag {
    const siteTag: ICmsSitePage.Tag = { id: tag.id, name: tag.name, parentId: tag.parentTagId };

    return siteTag;
}

/**
 * The root tag of the page's first tag: the site names a page's rubric by it. A broken chain with a
 * loop stops where it closed. No tags — `null`.
 */
export function rootTagOf(page: ICmsSitePage.State, tags: readonly ICmsSitePage.Tag[]): ICmsSitePage.Tag | null {
    const byId: ReadonlyMap<string, ICmsSitePage.Tag> = new Map<string, ICmsSitePage.Tag>(
        tags.map((tag: ICmsSitePage.Tag): [string, ICmsSitePage.Tag] => [tag.id, tag])
    );
    let tag: ICmsSitePage.Tag | undefined = byId.get(page.tagIds[0] ?? '');
    const seen: Set<string> = new Set<string>();
    while (tag !== undefined && tag.parentId !== '' && !seen.has(tag.id)) {
        seen.add(tag.id);
        tag = byId.get(tag.parentId) ?? tag;
    }

    return tag ?? null;
}

function escapedXml(text: string): string {
    return text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');
}

/**
 * The sitemap: the published pages missing from the fixed map are added to it, once per path. The
 * page address goes into the map escaped: it comes from the CMS, and the map is XML.
 */
export function sitemapXmlOf(staticXml: string, origin: string, pages: readonly ICmsSitePage.State[]): string {
    const paths: Set<string> = new Set<string>();
    const entries: string = pages
        .filter((page: ICmsSitePage.State): boolean => {
            const fresh: boolean = !paths.has(page.path) && !staticXml.includes(`${origin}${page.path}<`);
            paths.add(page.path);

            return fresh;
        })
        .map((page: ICmsSitePage.State): string => {
            const lastmod: string = page.publishedAt === '' ? '' : `<lastmod>${page.publishedAt.slice(0, 10)}</lastmod>`;
            const loc: string = escapedXml(`${origin}${page.path}`);

            return `  <url><loc>${loc}</loc>${lastmod}</url>\n`;
        })
        .join('');

    return staticXml.replace('</urlset>', `${entries}</urlset>`);
}
