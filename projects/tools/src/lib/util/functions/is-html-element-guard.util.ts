/**
 * This function is type guard that defines is value HTMLElement
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isHTMLElement(element: any): element is HTMLElement {
    return element instanceof HTMLElement;
}
