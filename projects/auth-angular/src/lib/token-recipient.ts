/**
 * Whether a request to the address carries the token. The origin must match, and the path of the
 * recipient must be the path of the request or a whole segment above it: `/api` takes `/api/orders`,
 * not `/apis`.
 */
export function isTokenRecipient(url: string, recipients: readonly string[], baseUri: string): boolean {
    const target: URL = new URL(url, baseUri);
    return recipients.some((recipient: string): boolean => {
        const allowed: URL = new URL(recipient, baseUri);
        if (allowed.origin !== target.origin) {
            return false;
        }
        const prefix: string = allowed.pathname.endsWith('/') ? allowed.pathname : `${allowed.pathname}/`;
        return target.pathname === allowed.pathname || target.pathname.startsWith(prefix);
    });
}
