import { EBlockType, type IBlock } from './block.model.js';
import { ERedirectType } from './content-item-status.js';

/** An entry of the page contents: the id of the heading block and its text. */
export interface ISiteContentsEntry {
    readonly blockId: string;
    readonly title: string;
}

/** A redirect as the site server sees it: from where, to where and its kind. */
export interface ISiteRedirect {
    readonly from: string;
    readonly to: string;
    readonly type: ERedirectType;
}

/** The answer of the site server to a found redirect: the code and the new address. */
export interface ISiteRedirectAnswer {
    readonly status: 301 | 302;
    readonly location: string;
}

const REDIRECT_STATUS: Readonly<Record<ERedirectType, 301 | 302>> = {
    [ERedirectType.MovedPermanently]: 301,
    [ERedirectType.Found]: 302,
};

const HTML_ENTITIES: Readonly<Record<string, string>> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
};

/**
 * The path of a page on the site from the root: its own link, and without a link — its address
 * under the section root the application names, such as `/blog`.
 */
export function sitePathOf(link: string, slug: string, sectionRoot: string): string {
    if (link === '') {
        let root: string = sectionRoot;
        while (root.endsWith('/')) {
            root = root.slice(0, -1);
        }
        return `${root}/${slug}`;
    }
    return link.startsWith('/') ? link : `/${link}`;
}

// A tag is cut out by walking the signs: the expression "from `<` to `>`" is refused by the linter
// as backtracking.
function withoutTags(html: string): string {
    let text: string = '';
    let inTag: boolean = false;
    for (const sign of html) {
        const opens: boolean = sign === '<';
        const closes: boolean = sign === '>' && inTag;
        if (!opens && !closes && !inTag) {
            text += sign;
        }
        inTag = opens || (inTag && !closes);
    }
    return text;
}

/** The text of HTML without markup: a heading block holds HTML, and the contents need text. */
export function plainTextOf(html: string): string {
    return withoutTags(html)
        .replaceAll(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (entity: string) => HTML_ENTITIES[entity])
        .split(/\s/)
        .filter((word: string) => word !== '')
        .join(' ');
}

/** The page contents — the H2 headings of the body in order; an empty heading is left out. */
export function siteContentsOf(blocks: readonly IBlock.Base[]): ISiteContentsEntry[] {
    return blocks
        .filter((block: IBlock.Base) => block.type === EBlockType.Heading2)
        .map((block: IBlock.Base) => ({ blockId: block.id, title: plainTextOf(block.content) }))
        .filter((entry: ISiteContentsEntry) => entry.title !== '');
}

/**
 * The redirect for a request path. The path is matched without the query string, and the query
 * string is carried into the new address unless it has its own. No redirect from the path — `null`.
 */
export function siteRedirectOf(redirects: readonly ISiteRedirect[], path: string, query: string): ISiteRedirectAnswer | null {
    const found: ISiteRedirect | undefined = redirects.find((redirect: ISiteRedirect) => redirect.from === path);
    if (found === undefined) {
        return null;
    }
    const carried: string = query === '' || found.to.includes('?') ? '' : `?${query}`;
    return { status: REDIRECT_STATUS[found.type], location: `${found.to}${carried}` };
}

/** The answer to a request path by a list of redirects held for a set time. */
export type TSiteRedirectsAnswer = (path: string, query: string) => Promise<ISiteRedirectAnswer | null>;

/** The site server holds the list of redirects a minute: a new redirect acts within a minute. */
export const SITE_REDIRECTS_TTL_MS: number = 60_000;

/**
 * The answer to a path by a list of redirects reread at most once per `ttlMs`. The CMS server did not
 * answer — the previous list stays, and without one there are no redirects: the page is drawn as usual.
 */
export function cachedSiteRedirects(
    load: () => Promise<readonly ISiteRedirect[]>,
    ttlMs: number = SITE_REDIRECTS_TTL_MS,
    now: () => number = Date.now
): TSiteRedirectsAnswer {
    let redirects: readonly ISiteRedirect[] = [];
    let loadedAt: number = Number.NEGATIVE_INFINITY;
    return async (path: string, query: string): Promise<ISiteRedirectAnswer | null> => {
        if (now() - loadedAt >= ttlMs) {
            loadedAt = now();
            redirects = await load().catch(() => redirects);
        }
        return siteRedirectOf(redirects, path, query);
    };
}

// The style of an editor emphasis and the tag it reaches the page with: the Angular sanitizer drops
// the `style` attribute and keeps the emphasis tags.
interface IStyleTag {
    readonly property: string;
    readonly value: string;
    readonly tag: string;
}

const STYLE_TAGS: readonly IStyleTag[] = [
    { property: 'font-weight', value: 'bold', tag: 'b' },
    { property: 'font-style', value: 'italic', tag: 'i' },
    { property: 'text-decoration', value: 'line-through', tag: 's' },
    { property: 'text-decoration', value: 'underline', tag: 'u' },
];

function styleAttributeOf(tag: string): string {
    const at: number = tag.toLowerCase().indexOf('style=');
    if (at === -1) {
        return '';
    }
    const quote: string = tag.charAt(at + 6);
    const end: number = tag.indexOf(quote, at + 7);
    return end === -1 ? '' : tag.slice(at + 7, end);
}

function tagsOfStyle(style: string): string[] {
    const declarations: Map<string, string> = new Map<string, string>(
        style.split(';').map((declaration: string): [string, string] => {
            const colon: number = declaration.indexOf(':');
            return [
                declaration.slice(0, colon).trim().toLowerCase(),
                declaration
                    .slice(colon + 1)
                    .trim()
                    .toLowerCase(),
            ];
        })
    );
    return STYLE_TAGS.filter((styleTag: IStyleTag) => (declarations.get(styleTag.property) ?? '').includes(styleTag.value)).map(
        (styleTag: IStyleTag) => styleTag.tag
    );
}

function isSpanOpening(tag: string): boolean {
    const lower: string = tag.toLowerCase();
    return lower === '<span>' || lower.startsWith('<span ');
}

/**
 * The HTML of a text block for a site page. The editor marks emphasis with a styled `span`, and the
 * Angular sanitizer drops the style: here every such `span` becomes emphasis tags — bold, italic,
 * strike-through, underline — and the `span` itself with all its attributes is dropped.
 */
export function siteHtmlOf(html: string): string {
    let page: string = '';
    let at: number = 0;
    const opened: string[][] = [];
    while (at < html.length) {
        const open: number = html.indexOf('<', at);
        const close: number = open === -1 ? -1 : html.indexOf('>', open);
        if (close === -1) {
            return page + html.slice(at);
        }
        const tag: string = html.slice(open, close + 1);
        page += html.slice(at, open);
        at = close + 1;
        if (isSpanOpening(tag)) {
            const tags: string[] = tagsOfStyle(styleAttributeOf(tag));
            opened.push(tags);
            page += tags.map((name: string) => `<${name}>`).join('');
        } else if (tag.toLowerCase() === '</span>') {
            page += [...(opened.pop() ?? [])]
                .reverse()
                .map((name: string) => `</${name}>`)
                .join('');
        } else {
            page += tag;
        }
    }
    return page;
}
