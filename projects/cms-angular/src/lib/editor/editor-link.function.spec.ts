import { ELinkType, IBlock } from '@rt-tools/cms-contract';

import { present } from '../testing/dom.function';
import { emptyLinkOf, insertLink, linkOfElement, updateLink } from './editor-link.function';

function pageWith(html: string): Document {
    return new DOMParser().parseFromString(html, 'text/html');
}

describe('a link in block text', () => {
    it('SC-CMS-42 — a link to a page reads from the tag with the same settings', () => {
        const page: Document = pageWith('<p>look here</p>');
        const text: Text = present(page.querySelector('p')?.firstChild, 'the paragraph text') as Text;
        const range: Range = page.createRange();
        range.setStart(text, 5);
        range.setEnd(text, 9);
        const link: IBlock.Content.Button = {
            linkType: ELinkType.Internal,
            label: 'here',
            contentTypeId: '1',
            contentItemId: '42',
            link: '/blog/straight-stair',
            newTab: true,
            noFollow: true,
        };

        const anchor: HTMLAnchorElement = insertLink(link, range, page);

        expect(page.querySelector('p')?.textContent).toBe('look here');
        expect(linkOfElement(anchor)).toEqual(link);
    });

    it('SC-CMS-42 — an empty link reads back as not set', () => {
        const page: Document = pageWith('<p>text</p>');
        const range: Range = page.createRange();
        range.selectNodeContents(present(page.querySelector('p'), 'a paragraph'));

        const anchor: HTMLAnchorElement = insertLink(emptyLinkOf('text'), range, page);

        expect(linkOfElement(anchor)).toEqual(emptyLinkOf('text'));
    });

    it('SC-CMS-43 — removed nofollow leaves foreign rel values alone', () => {
        const page: Document = pageWith('<a href="https://example.org" rel="noopener nofollow" linkType="external">site</a>');
        const anchor: HTMLAnchorElement = present(page.querySelector('a'), 'a link');

        updateLink(anchor, { ...linkOfElement(anchor), noFollow: false });

        expect(anchor.getAttribute('rel')).toBe('noopener');
        expect(linkOfElement(anchor).noFollow).toBe(false);
        expect(linkOfElement(anchor).linkType).toBe(ELinkType.External);
    });
});
