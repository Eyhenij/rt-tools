/** The name the browser knows a language by, in that language itself; null for a tag it does not know. */
function ownName(languageTag: string): string | null {
    try {
        // Without a fallback an unknown language comes back empty, not as its tag or a guess.
        const name: string | undefined = new Intl.DisplayNames([languageTag], { type: 'language', fallback: 'none' }).of(languageTag);

        return name && name.toLowerCase() !== languageTag.toLowerCase() ? name : null;
    } catch {
        return null;
    }
}

/**
 * The name of a language in the language list: its own name in itself, with a capital letter.
 *
 * Keycloak names the languages by its own messages, and they are of several kinds: «русский» in
 * lower case, «English» capitalised, and the tag itself — `hi`, `ko` — where it has no message.
 * The browser knows every language by its tag, so the name is asked of it; the name Keycloak gave
 * stays only where the browser does not know the tag.
 */
export function languageNameOf(languageTag: string, keycloakLabel: string): string {
    const name: string = ownName(languageTag) ?? keycloakLabel;

    return name.charAt(0).toLocaleUpperCase(languageTag) + name.slice(1);
}
