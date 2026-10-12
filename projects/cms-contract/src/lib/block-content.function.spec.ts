import { ELinkType } from './block.model.js';
import {
    blockJsonOf,
    buttonOfContent,
    imagesOfContent,
    itemLinkOfContent,
    listOfContent,
    prosConsOfContent,
    titledOfContent,
} from './block-content.function.js';

describe('the content of a block', () => {
    it('SC-CMS-4 — a broken or empty content reads as empty instead of failing', () => {
        expect(blockJsonOf('')).toBeNull();
        expect(blockJsonOf('{broken')).toBeNull();
        expect(listOfContent('{broken')).toEqual([]);
        expect(titledOfContent('')).toEqual({ title: '', text: '' });
        expect(itemLinkOfContent('[]')).toEqual({ contentTypeId: '', contentItemId: '' });
    });

    it('SC-CMS-4 — a button reads its link, flags and label; an empty block gets the default label', () => {
        expect(buttonOfContent('', 'More')).toEqual({
            linkType: ELinkType.Internal,
            label: 'More',
            contentTypeId: null,
            contentItemId: null,
            link: null,
            newTab: false,
            noFollow: false,
        });
        expect(
            buttonOfContent(
                JSON.stringify({ linkType: 'external', label: 'Go', link: 'https://example.com', newTab: true, noFollow: 'yes' }),
                'More'
            )
        ).toEqual({
            linkType: ELinkType.External,
            label: 'Go',
            contentTypeId: null,
            contentItemId: null,
            link: 'https://example.com',
            newTab: true,
            noFollow: false,
        });
    });

    it('SC-CMS-4 — a list keeps only its string items, and images without a file are dropped', () => {
        expect(listOfContent(JSON.stringify(['<b>a</b>', 2, 'b']))).toEqual(['<b>a</b>', 'b']);
        expect(
            imagesOfContent(
                JSON.stringify([
                    { fileId: 'f1', imageUrl: 'https://cdn/f1.png' },
                    { fileId: '', imageUrl: 'https://cdn/x.png' },
                ])
            )
        ).toEqual([{ fileId: 'f1', imageUrl: 'https://cdn/f1.png' }]);
        expect(imagesOfContent('{"fileId": "f1"}')).toEqual([]);
    });

    it('SC-CMS-4 — pros and cons take the passed label for an empty side title', () => {
        expect(prosConsOfContent(JSON.stringify({ prosTitle: '', consTitle: 'Against', pros: ['a'], cons: 'b' }), 'For', 'Cons')).toEqual({
            prosTitle: 'For',
            consTitle: 'Against',
            pros: ['a'],
            cons: [],
        });
        expect(prosConsOfContent('', 'For', 'Against')).toEqual({ prosTitle: 'For', consTitle: 'Against', pros: [], cons: [] });
    });

    it('SC-CMS-4 — a note and a page link read their fields', () => {
        expect(titledOfContent(JSON.stringify({ title: 'Tip', text: '<i>x</i>' }))).toEqual({ title: 'Tip', text: '<i>x</i>' });
        expect(itemLinkOfContent(JSON.stringify({ contentTypeId: 't1', contentItemId: 'i1' }))).toEqual({
            contentTypeId: 't1',
            contentItemId: 'i1',
        });
    });
});
