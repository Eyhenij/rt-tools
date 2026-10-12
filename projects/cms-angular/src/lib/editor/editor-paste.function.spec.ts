import { EBlockType, ELinkType, IBlock } from '@rt-tools/cms-contract';

import { present } from '../testing/dom.function';
import { copiedHtmlOf, htmlOfText, insertPlainText, isPlainPaste, pastedBlocksOf, pastedElementsOf } from './editor-paste.function';

const PAGE: Document = new DOMParser().parseFromString('', 'text/html');

function sequentialIds(): () => string {
    let next: number = 0;
    return (): string => {
        next += 1;
        return `b${next.toString()}`;
    };
}

function blocksOf(html: string): IBlock.Base[] {
    return pastedBlocksOf(pastedElementsOf(html), PAGE, sequentialIds());
}

describe('pasting into the editor', () => {
    it('SC-CMS-44 — a script, an image and a handler are removed, the text stays', () => {
        const elements: Element[] = pastedElementsOf('<p onclick="steal()">important text<img src="x.png"><script>steal()</script></p>');

        expect(elements.map((element: Element) => element.outerHTML)).toEqual(['<p>important text</p>']);
    });

    it('SC-CMS-45 — a paragraph, lists and a heading become blocks of their own', () => {
        const blocks: IBlock.Base[] = blocksOf('<p>Paragraph</p><ul><li>one</li><li>two</li></ul><ol><li>first</li></ol><h1>Heading</h1>');

        expect(blocks).toEqual([
            { id: 'b1', type: EBlockType.Paragraph, content: 'Paragraph' },
            { id: 'b2', type: EBlockType.BulletedList, content: JSON.stringify(['one', 'two']) },
            { id: 'b3', type: EBlockType.NumberedList, content: JSON.stringify(['first']) },
            { id: 'b4', type: EBlockType.Heading2, content: 'Heading' },
        ]);
    });

    it('SC-CMS-45 — a loose span becomes a paragraph, and an empty list gives no block', () => {
        expect(blocksOf('<span><b>bold</b> text</span>')).toEqual([{ id: 'b1', type: EBlockType.Paragraph, content: 'bold text' }]);
        expect(blocksOf('<ul></ul><p></p>')).toEqual([]);
        expect(pastedBlocksOf([PAGE.createElementNS('http://www.w3.org/2000/svg', 'svg')], PAGE, sequentialIds())).toEqual([]);
    });

    it('SC-CMS-46 — text is pasted into a block with text, from the editor and without markup', () => {
        const markup: Element[] = pastedElementsOf('<p>Paragraph</p>');

        expect(isPlainPaste(markup, false, false)).toBe(false);
        expect(isPlainPaste(markup, true, false)).toBe(true);
        expect(isPlainPaste(markup, false, true)).toBe(true);
        expect(isPlainPaste(pastedElementsOf('just text'), false, false)).toBe(true);
    });

    it('SC-CMS-47 — a pasted link is external, opens in a new tab and has nofollow', () => {
        const [paragraph]: IBlock.Base[] = blocksOf('<p>Read <a href="https://example.org" style="color: red">here</a></p>');
        const parsed: Document = new DOMParser().parseFromString(paragraph.content, 'text/html');
        const anchor: HTMLAnchorElement = present(parsed.querySelector('a'), 'a link in the paragraph');

        expect(paragraph.type).toBe(EBlockType.Paragraph);
        expect(anchor.getAttribute('href')).toBe('https://example.org');
        expect(anchor.getAttribute('linkType')).toBe(ELinkType.External);
        expect(anchor.getAttribute('target')).toBe('_blank');
        expect(anchor.getAttribute('rel')).toBe('nofollow');
        expect(anchor.hasAttribute('style')).toBe(false);
    });

    it('SC-CMS-47 — a loose link becomes a paragraph, and a repeat of it by text is dropped', () => {
        const blocks: IBlock.Base[] = blocksOf('<a href="https://example.org"><span>site</span></a>');

        expect(blocks).toHaveLength(1);
        expect(blocks[0].type).toBe(EBlockType.Paragraph);
        expect(blocks[0].content).toContain('rel="nofollow"');
    });

    it('SC-CMS-47 — of the pasted styles only bold, italic and the line stay', () => {
        const [paragraph]: IBlock.Base[] = blocksOf(
            '<p><span style="font-weight: 700; color: red"><a href="https://x.org">a</a></span> ' +
                '<span style="font-style: italic; text-decoration: underline"><a href="https://y.org">b</a></span></p>'
        );

        expect(paragraph.content).toContain('<span style="font-weight: bold;">');
        expect(paragraph.content).toContain('<span style="font-style: italic; text-decoration: underline;">');
        expect(paragraph.content).not.toContain('color');
    });

    it('SC-CMS-48 — items with one list number are joined into one list', () => {
        const blocks: IBlock.Base[] = blocksOf('<ul><li data-listid="7">one</li></ul><p>between</p><ul><li data-listid="7">two</li></ul>');

        expect(blocks).toEqual([
            { id: 'b1', type: EBlockType.BulletedList, content: JSON.stringify(['one', 'two']) },
            { id: 'b2', type: EBlockType.Paragraph, content: 'between' },
        ]);
    });

    it('SC-CMS-46 — text copied from the editor wraps bare text, and plain text replaces the selection', () => {
        document.body.innerHTML = '<p>old <b class="x">bold</b> <!-- note --></p>';
        const paragraph: HTMLParagraphElement = present(document.querySelector('p'), 'a paragraph');
        const range: Range = document.createRange();
        range.selectNodeContents(paragraph);

        expect(copiedHtmlOf(range.cloneContents(), document)).toBe('<span>old </span><b class="x"><span>bold</span></b> <!-- note -->');

        const selection: Selection = present(document.getSelection(), 'a selection');
        selection.removeAllRanges();
        selection.addRange(range);
        insertPlainText(selection, 'new', document);
        expect(paragraph.textContent).toBe('new');
        expect(htmlOfText('<b>', document)).toBe('&lt;b&gt;');

        selection.removeAllRanges();
        insertPlainText(selection, 'ignored', document);
        expect(paragraph.textContent).toBe('new');
    });
});
