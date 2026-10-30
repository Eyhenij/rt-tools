/**
 * Adds one script per address Keycloak lists for the page. The standard layout does the same, and
 * the theme pages bypass it: without this the reCAPTCHA script of the registration page is never
 * loaded. An address already in the document is not added twice.
 */
export function loadPageScripts(document: Document, addresses: readonly string[]): void {
    const loaded: Set<string> = new Set<string>(
        Array.from(document.scripts, (script: HTMLScriptElement): string => script.getAttribute('src') ?? '')
    );
    for (const address of addresses) {
        if (loaded.has(address)) {
            continue;
        }
        const script: HTMLScriptElement = document.createElement('script');
        script.src = address;
        script.async = true;
        document.head.appendChild(script);
        loaded.add(address);
    }
}
