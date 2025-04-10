/**
 * This function is a type guard that checks if a value is an instance of HTMLElement.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isHTMLElement(element: any): element is HTMLElement {
    return element instanceof HTMLElement;
}
