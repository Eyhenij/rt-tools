import { EBlockType, type IBlock } from './block.model.js';
import { ERedirectType } from './content-item-status.js';
import {
    type ISiteRedirect,
    type TSiteRedirectsAnswer,
    cachedSiteRedirects,
    plainTextOf,
    siteContentsOf,
    siteHtmlOf,
    sitePathOf,
    siteRedirectOf,
} from './site-page.function.js';

const REDIRECTS: ISiteRedirect[] = [
    { from: '/old', to: '/news/new', type: ERedirectType.MovedPermanently },
    { from: '/promo', to: '/news/sale?utm=ads', type: ERedirectType.Found },
];

describe('the site page', () => {
    it('SC-CMS-6 — the contents are the H2 headings of the body', () => {
        const blocks: IBlock.Base[] = [
            { id: 'b1', type: EBlockType.Heading2, content: 'Kinds of <b>stairs</b>' },
            { id: 'b2', type: EBlockType.Paragraph, content: 'A paragraph' },
            { id: 'b3', type: EBlockType.Heading3, content: 'A subsection' },
            { id: 'b4', type: EBlockType.Heading2, content: 'Rails &amp; fences' },
            { id: 'b5', type: EBlockType.Heading2, content: '<br>' },
        ];

        expect(siteContentsOf(blocks)).toEqual([
            { blockId: 'b1', title: 'Kinds of stairs' },
            { blockId: 'b4', title: 'Rails & fences' },
        ]);
    });

    it('SC-CMS-6 — a heading text goes without markup and extra spaces', () => {
        expect(plainTextOf('  <i>Pine</i>\n and  <a href="/x">oak</a>&nbsp;&lt;&gt;&quot;&#39;&copy; ')).toBe('Pine and oak <>"\'&copy;');
    });

    it('SC-CMS-7 — the page path is its own link or its address under the section root', () => {
        expect(sitePathOf('', 'pine-stairs', '/blog')).toBe('/blog/pine-stairs');
        expect(sitePathOf('', 'pine-stairs', '/news/')).toBe('/news/pine-stairs');
        expect(sitePathOf('about', 'x', '/blog')).toBe('/about');
        expect(sitePathOf('/about', 'x', '/blog')).toBe('/about');
    });

    it('SC-CMS-8 — a redirect answers with its code and carries the query string', () => {
        expect(siteRedirectOf(REDIRECTS, '/old', 'ref=mail')).toEqual({ status: 301, location: '/news/new?ref=mail' });
        expect(siteRedirectOf(REDIRECTS, '/old', '')).toEqual({ status: 301, location: '/news/new' });
        expect(siteRedirectOf(REDIRECTS, '/promo', 'ref=mail')).toEqual({ status: 302, location: '/news/sale?utm=ads' });
    });

    it('SC-CMS-8 — a path without a redirect answers nothing', () => {
        expect(siteRedirectOf(REDIRECTS, '/old/', '')).toBeNull();
        expect(siteRedirectOf([], '/old', '')).toBeNull();
    });

    it('SC-CMS-9 — the redirect list is reread at most once per its time', async () => {
        let clock: number = 0;
        let loads: number = 0;
        const answer: TSiteRedirectsAnswer = cachedSiteRedirects(
            () => {
                loads += 1;
                return Promise.resolve(REDIRECTS);
            },
            60_000,
            () => clock
        );

        expect(await answer('/old', '')).toEqual({ status: 301, location: '/news/new' });
        clock = 59_999;
        await answer('/promo', '');
        expect(loads).toBe(1);
        clock = 60_000;
        await answer('/promo', '');
        expect(loads).toBe(2);
    });

    it('SC-CMS-10 — without an answer of the CMS server there is no redirect, and the answer does not fail', async () => {
        const answer: TSiteRedirectsAnswer = cachedSiteRedirects(() => Promise.reject(new Error('unavailable')));

        expect(await answer('/old', '')).toBeNull();
    });

    it('SC-CMS-11 — the editor emphasis reaches the page as tags, and a span with a handler is dropped', () => {
        expect(siteHtmlOf('Steps of <span style="font-weight: bold;">oak</span>')).toBe('Steps of <b>oak</b>');
        expect(
            siteHtmlOf('<span style="font-style: italic; text-decoration: underline">a<span style=\'font-weight:bold\'>b</span></span>')
        ).toBe('<i><u>a<b>b</b></u></i>');
        expect(siteHtmlOf('<SPAN style="text-decoration: line-through">x</span>')).toBe('<s>x</s>');
        expect(siteHtmlOf('<span onclick="alert(1)">click</span> and <a href="/news/x">a link</a>')).toBe(
            'click and <a href="/news/x">a link</a>'
        );
        expect(siteHtmlOf('<span style="color: red">x</span><span style="broken>y</span></span>')).toBe('xy');
        expect(siteHtmlOf('text without tags')).toBe('text without tags');
        expect(siteHtmlOf('a cut <span')).toBe('a cut <span');
    });
});
