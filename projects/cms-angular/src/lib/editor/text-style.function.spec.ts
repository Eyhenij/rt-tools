import { present } from '../testing/dom.function';
import { ETextAction, toggleRangeStyle, TStyleAction } from './text-style.function';

function paragraphOf(html: string): { page: Document; paragraph: HTMLParagraphElement; text: Text } {
    const page: Document = new DOMParser().parseFromString(html, 'text/html');
    const paragraph: HTMLParagraphElement = present(page.querySelector('p'), 'a paragraph');
    const text: Text = present(paragraph.firstChild, 'the paragraph text') as Text;
    return { page, paragraph, text };
}

/** The person's selection lies in the text node inside the wrapper. */
function wrappedTextRange(page: Document, paragraph: HTMLParagraphElement): Range {
    const styled: Range = page.createRange();
    styled.selectNodeContents(present(paragraph.querySelector('span')?.firstChild, 'the wrapped text'));
    return styled;
}

describe('selection styles', () => {
    it('SC-CMS-41 — bold pressed again removes the style rather than nesting a second one', () => {
        const { page, paragraph, text }: { page: Document; paragraph: HTMLParagraphElement; text: Text } =
            paragraphOf('<p>one two three</p>');
        const range: Range = page.createRange();
        range.setStart(text, 4);
        range.setEnd(text, 7);

        toggleRangeStyle(range, ETextAction.Bold, page);
        expect(paragraph.innerHTML).toBe('one <span style="font-weight: bold;">two</span> three');

        toggleRangeStyle(wrappedTextRange(page, paragraph), ETextAction.Bold, page);
        expect(paragraph.textContent).toBe('one two three');
        expect(paragraph.querySelector('span')).toBeNull();
    });

    it('SC-CMS-41 — italic, line-through and underline wrap the selection and are removed the same way', () => {
        const actions: TStyleAction[] = [ETextAction.Italic, ETextAction.LineThrough, ETextAction.Underline];
        actions.forEach((action: TStyleAction) => {
            const { page, paragraph, text }: { page: Document; paragraph: HTMLParagraphElement; text: Text } = paragraphOf('<p>word</p>');
            const range: Range = page.createRange();
            range.selectNodeContents(text);

            toggleRangeStyle(range, action, page);
            expect(paragraph.querySelector('span')).not.toBeNull();

            toggleRangeStyle(wrappedTextRange(page, paragraph), action, page);
            expect(paragraph.innerHTML).toBe('word');
        });
    });
});
