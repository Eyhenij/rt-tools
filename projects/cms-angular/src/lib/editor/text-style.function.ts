/**
 * The actions of the selection menu. The style values are CSS strings: the selection is wrapped in
 * a `span` with the style, and the body keeps that HTML as is.
 */
export enum ETextAction {
    Bold = 'bold',
    Italic = 'italic',
    LineThrough = 'line-through',
    Underline = 'underline',
    Copy = 'copy',
}

/** The menu actions that change the style rather than copy the text. */
export type TStyleAction = Exclude<ETextAction, ETextAction.Copy>;

/** Whether the element carries the style of the action: pressing again removes the style rather than nesting a second one. */
export function isTextStyled(element: HTMLElement, action: TStyleAction): boolean {
    // The action value is the CSS value itself: a string is compared with a string.
    const style: string = action;

    switch (action) {
        case ETextAction.Bold:
            return element.style.fontWeight === style;
        case ETextAction.Italic:
            return element.style.fontStyle === style;
        case ETextAction.LineThrough:
        case ETextAction.Underline:
            return element.style.textDecoration.includes(style);
    }
}

/** Sets the style of the action on the element. */
export function applyTextStyle(element: HTMLElement, action: TStyleAction): void {
    switch (action) {
        case ETextAction.Bold:
            element.style.fontWeight = action;
            break;
        case ETextAction.Italic:
            element.style.fontStyle = action;
            break;
        case ETextAction.LineThrough:
        case ETextAction.Underline:
            element.style.textDecoration = action;
            break;
    }
}

/**
 * Applies the action to the selected range: removes the style if the parent of the selection
 * already carries it, otherwise wraps the selection in a `span` with the style.
 */
export function toggleRangeStyle(range: Range, action: TStyleAction, documentRef: Document): void {
    const parent: HTMLElement | null = range.commonAncestorContainer.parentElement;

    if (parent && isTextStyled(parent, action)) {
        parent.replaceWith(...Array.from(parent.childNodes));
        return;
    }

    const span: HTMLSpanElement = documentRef.createElement('span');
    applyTextStyle(span, action);
    span.appendChild(range.extractContents());
    range.insertNode(span);
}
