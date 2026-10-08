/** The root element of the standard Keycloakify layout: the selector of its `TemplateComponent`. */
export const STANDARD_ROOT: string = 'kc-root';

/** The root element of the theme's own pages, the only root the page markup holds. */
export const THEME_ROOT: string = 'rt-kc-root';

/**
 * Puts the root of the standard layout in place of the theme root. Without it the standard layout
 * finds no element to start in, and the page stays empty.
 */
export function placeStandardRoot(document: Document): void {
    const root: Element = document.createElement(STANDARD_ROOT);
    const theme: Element | null = document.querySelector(THEME_ROOT);
    if (theme === null) {
        document.body.appendChild(root);

        return;
    }
    theme.replaceWith(root);
}
