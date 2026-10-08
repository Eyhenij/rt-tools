import { EBlockType, ELinkType, IBlock } from '@rt-tools/cms-contract';
import DOMPurify from 'dompurify';

import { ELinkAttribute } from './editor-link.function';

/** The tags a paste keeps; DOMPurify removes the rest together with their attributes. */
const PASTE_ALLOWED_TAGS: string[] = ['div', 'a', 'span', 'p', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const PASTE_ALLOWED_ATTRIBUTES: string[] = ['style', 'target', 'rel', ELinkAttribute.LinkType, 'href'];
/** The elements the blocks of a paste are built from. */
const PASTE_SOURCE_SELECTOR: string = 'a, span, p, ul, ol, h1, h2, h3, h4, h5, h6';
const HEADING_TAGS: string[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
/** The sign text editors mark the items of one list torn into several with. */
const LIST_ID_ATTRIBUTE: string = 'data-listid';

interface IListGroup {
    tag: string;
    items: Element[];
    positions: number[];
}

function tagOf(element: Element): string {
    return element.nodeName.toLowerCase();
}

function isList(element: Element): boolean {
    return tagOf(element) === 'ul' || tagOf(element) === 'ol';
}

/** Cleans the pasted HTML by the allow list and gives the elements the blocks are built from. */
export function pastedElementsOf(html: string): Element[] {
    const clean: string = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: PASTE_ALLOWED_TAGS,
        ALLOWED_ATTR: PASTE_ALLOWED_ATTRIBUTES,
    });
    const parsed: Document = new DOMParser().parseFromString(clean, 'text/html');
    return Array.from(parsed.body.querySelectorAll(PASTE_SOURCE_SELECTOR));
}

/**
 * The paste goes as plain text rather than blocks: the block already has text, the paste has no
 * markup, or the text was copied from the editor itself.
 */
export function isPlainPaste(elements: Element[], blockHasContent: boolean, fromEditor: boolean): boolean {
    return fromEditor || elements.length === 0 || blockHasContent;
}

/** A link without a parent is wrapped in a `span`, and repeats by text are dropped. */
function wrapLooseLinks(elements: Element[], documentRef: Document): Element[] {
    const hasLooseLink: boolean = elements.some(
        (element: Element) => tagOf(element) === 'a' && (!element.parentElement || tagOf(element.parentElement) === 'body')
    );
    if (!hasLooseLink) {
        return elements;
    }

    const wrapped: Element[] = elements.map((element: Element) => {
        if (tagOf(element) !== 'a') {
            return element;
        }
        const span: HTMLSpanElement = documentRef.createElement('span');
        span.appendChild(element.cloneNode(true));
        return span;
    });
    return wrapped.filter(
        (element: Element, index: number) => index === wrapped.findIndex((other: Element) => other.textContent === element.textContent)
    );
}

/** `span` elements alone, without a paragraph, are gathered into a paragraph. */
function gatherSpans(elements: Element[], documentRef: Document): Element[] {
    if (!elements.every((element: Element) => tagOf(element) === 'span')) {
        return elements;
    }

    const paragraph: HTMLParagraphElement = documentRef.createElement('p');
    elements
        .filter((element: Element) => element.children.length > 0 || elements.length === 1)
        .forEach((element: Element) => paragraph.appendChild(element));
    return [paragraph];
}

function listGroupsOf(elements: Element[]): Map<string, IListGroup> {
    const groups: Map<string, IListGroup> = new Map<string, IListGroup>();

    elements.forEach((element: Element, position: number) => {
        if (!isList(element)) {
            return;
        }
        Array.from(element.children)
            .filter((child: Element) => tagOf(child) === 'li')
            .forEach((item: Element) => {
                const listId: string | null = item.getAttribute(LIST_ID_ATTRIBUTE);
                if (!listId) {
                    return;
                }
                const group: IListGroup = groups.get(listId) ?? { tag: tagOf(element), items: [], positions: [] };
                group.items.push(item);
                group.positions.push(position);
                groups.set(listId, group);
            });
    });
    return groups;
}

/** The items of one list torn into several are joined into one list in place of the first. */
function joinSplitLists(elements: Element[], documentRef: Document): Element[] {
    if (!elements.some(isList)) {
        return elements;
    }

    const replacements: Map<number, Element> = new Map<number, Element>();
    const dropped: Set<number> = new Set<number>();

    listGroupsOf(elements).forEach((group: IListGroup) => {
        const first: number = Math.min(...group.positions);
        const list: Element = documentRef.createElement(group.tag);
        group.items.forEach((item: Element) => {
            const copy: Element = item.cloneNode(true) as Element;
            copy.removeAttribute(LIST_ID_ATTRIBUTE);
            list.appendChild(copy);
        });
        replacements.set(first, list);
        group.positions.filter((position: number) => position !== first).forEach((position: number) => dropped.add(position));
    });

    return elements.flatMap((element: Element, position: number) => {
        if (dropped.has(position) && !replacements.has(position)) {
            return [];
        }
        return [replacements.get(position) ?? element];
    });
}

/** Of the pasted styles only bold, italic and the line stay. */
function normalizeStyles(element: HTMLElement): void {
    const { style }: { style: CSSStyleDeclaration } = element;
    const { fontWeight, fontStyle, textDecoration }: Pick<CSSStyleDeclaration, 'fontWeight' | 'fontStyle' | 'textDecoration'> = style;

    if (!element.getAttribute('style')) {
        return;
    }
    element.setAttribute('style', '');

    if (fontWeight.includes('bold') || fontWeight.includes('700')) {
        style.fontWeight = 'bold';
    }
    if (fontStyle.includes('italic')) {
        style.fontStyle = 'italic';
    }
    if (textDecoration) {
        style.textDecoration = textDecoration;
    }
}

/** A pasted link becomes external, opens in a new tab and passes no weight. */
function normalizeLink(anchor: Element, documentRef: Document): void {
    anchor.removeAttribute('style');
    anchor.setAttribute(ELinkAttribute.LinkType, ELinkType.External);
    anchor.setAttribute(ELinkAttribute.Target, '_blank');
    anchor.setAttribute(ELinkAttribute.Rel, 'nofollow');
    const firstChild: Element | null = anchor.firstElementChild;
    if (firstChild) {
        firstChild.replaceWith(documentRef.createTextNode(anchor.textContent));
    }
}

/**
 * Links are normalized, leaf tags without links become text. A list item stays an item even when it
 * holds only text: otherwise a plain list would lose all its items.
 */
function normalizeMarkup(element: Element, documentRef: Document): void {
    if (element instanceof HTMLElement) {
        normalizeStyles(element);
    }
    if (tagOf(element) === 'a') {
        normalizeLink(element, documentRef);
    }

    Array.from(element.children).forEach((child: Element) => {
        if (tagOf(child) === 'a') {
            normalizeLink(child, documentRef);
        } else if (child.children.length > 0 || tagOf(child) === 'li') {
            normalizeMarkup(child, documentRef);
        } else {
            child.replaceWith(documentRef.createTextNode(child.textContent));
        }
    });
}

/** A paragraph with text not lying in a list item: a paragraph of a list goes with the list. */
function isStandaloneParagraph(element: Element): boolean {
    const parent: Element | null = element.parentElement;
    return tagOf(element) === 'p' && element.textContent.trim() !== '' && (!parent || tagOf(parent) !== 'li');
}

function listBlockOf(element: Element, newId: () => string): IBlock.Base | null {
    const items: string[] = Array.from(element.querySelectorAll('li')).map((item: Element) => item.innerHTML);
    if (!items.length) {
        return null;
    }
    const block: IBlock.Base = {
        id: newId(),
        type: tagOf(element) === 'ul' ? EBlockType.BulletedList : EBlockType.NumberedList,
        content: JSON.stringify(items),
    };
    return block;
}

function blockOf(element: Element, newId: () => string): IBlock.Base | null {
    if (isList(element)) {
        return listBlockOf(element, newId);
    }
    if (!element.innerHTML) {
        return null;
    }
    if (isStandaloneParagraph(element)) {
        return { id: newId(), type: EBlockType.Paragraph, content: element.innerHTML };
    }
    if (HEADING_TAGS.includes(tagOf(element))) {
        return { id: newId(), type: EBlockType.Heading2, content: element.innerHTML };
    }
    return null;
}

/**
 * Parses the pasted markup into blocks: paragraphs into paragraphs, lists into bulleted and
 * numbered lists, headings of any level into H2.
 */
export function pastedBlocksOf(elements: Element[], documentRef: Document, newId: () => string): IBlock.Base[] {
    let prepared: Element[] = wrapLooseLinks(elements, documentRef);
    prepared = gatherSpans(prepared, documentRef);
    prepared = joinSplitLists(prepared, documentRef);
    prepared.forEach((element: Element) => {
        normalizeMarkup(element, documentRef);
    });

    return prepared
        .map((element: Element) => blockOf(element, newId))
        .filter((block: IBlock.Base | null): block is IBlock.Base => block !== null);
}

/** The clipboard mark: the text was copied from the editor itself and is pasted as plain text. */
export const EDITOR_CLIPBOARD_MARK: string = 'text/currentPage';

function wrapTextNodes(node: Node, documentRef: Document): Node {
    if (node instanceof Text && node.data.trim()) {
        const span: HTMLSpanElement = documentRef.createElement('span');
        span.textContent = node.data;
        return span;
    }
    if (node instanceof Element) {
        const copy: Element = documentRef.createElement(node.tagName.toLowerCase());
        Array.from(node.attributes).forEach((attribute: Attr) => {
            copy.setAttribute(attribute.name, attribute.value);
        });
        node.childNodes.forEach((child: ChildNode) => copy.appendChild(wrapTextNodes(child, documentRef)));
        return copy;
    }
    return node.cloneNode(true);
}

/** The HTML of a selected piece for the clipboard: bare text is wrapped in a `span`. */
export function copiedHtmlOf(fragment: DocumentFragment, documentRef: Document): string {
    const holder: HTMLDivElement = documentRef.createElement('div');
    fragment.childNodes.forEach((node: ChildNode) => holder.appendChild(wrapTextNodes(node, documentRef)));
    return holder.innerHTML;
}

/** Puts plain text in place of the selection and moves the caret after it. */
export function insertPlainText(selection: Selection, text: string, documentRef: Document): void {
    if (!selection.rangeCount) {
        return;
    }
    const range: Range = selection.getRangeAt(0);
    range.deleteContents();
    const node: Text = documentRef.createTextNode(text);
    range.insertNode(node);
    range.setStartAfter(node);
    range.setEndAfter(node);
    selection.removeAllRanges();
    selection.addRange(range);
}

/** Text as HTML: markup signs stay text. So text moves into a block of another kind. */
export function htmlOfText(text: string, documentRef: Document): string {
    const holder: HTMLDivElement = documentRef.createElement('div');
    holder.textContent = text;
    return holder.innerHTML;
}
