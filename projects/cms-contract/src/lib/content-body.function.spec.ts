import { EBlockType, IBlock } from './block.model.js';
import { parseContentBody, serializeContentBody } from './content-body.function.js';

describe('the page body', () => {
    it('SC-CMS-1 — the body reads back from its string as it was written', () => {
        const blocks: IBlock.Base[] = [
            { id: 'b1', type: EBlockType.Heading2, content: 'Section' },
            { id: 'b2', type: EBlockType.Paragraph, content: '<b>bold</b> text' },
        ];

        expect(parseContentBody(serializeContentBody(blocks))).toEqual(blocks);
    });

    it('SC-CMS-2 — a broken string gives an empty body, and a block of an unknown kind is dropped', () => {
        const body: string = JSON.stringify([
            { id: 'b1', type: 'product', content: '{}' },
            { id: 'b2', type: EBlockType.Quote, content: 'a quote' },
            { id: 'b3', type: EBlockType.Note },
            null,
        ]);

        expect(parseContentBody('{not JSON')).toEqual([]);
        expect(parseContentBody('{"blocks": []}')).toEqual([]);
        expect(parseContentBody(body)).toEqual([{ id: 'b2', type: EBlockType.Quote, content: 'a quote' }]);
    });

    it('SC-CMS-3 — the block kinds are fixed by their stored values', () => {
        expect(Object.values(EBlockType)).toEqual([
            'paragraph',
            'heading2',
            'heading3',
            'prosCons',
            'list',
            'bulletedList',
            'numberedList',
            'image',
            'note',
            'quote',
            'accordion',
            'button',
            'embeddedLink',
            'contentAnchors',
            'contentItemLink',
        ]);
    });
});
