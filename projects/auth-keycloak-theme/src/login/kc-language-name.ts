/**
 * The tag the name is asked by. Chinese is written in two scripts, and a region tag names the
 * country, not the script: `zh-TW` reads «中文（台灣）» where a person looks for «繁體中文». So for
 * Chinese the name is asked by the script the tag implies.
 */
function nameTagOf(languageTag: string): string {
    try {
        const locale: Intl.Locale = new Intl.Locale(languageTag).maximize();

        return locale.language === 'zh' && locale.script ? `${locale.language}-${locale.script}` : languageTag;
    } catch {
        return languageTag;
    }
}

/** The name the browser knows a language by, in that language itself; null for a tag it does not know. */
function ownName(languageTag: string): string | null {
    try {
        const tag: string = nameTagOf(languageTag);
        // Without a fallback an unknown language comes back empty, not as its tag or a guess.
        const name: string | undefined = new Intl.DisplayNames([tag], { type: 'language', fallback: 'none' }).of(tag);

        return name && name.toLowerCase() !== languageTag.toLowerCase() ? name : null;
    } catch {
        return null;
    }
}

/**
 * The first letter in upper case by the rules of the language. A tag the browser cannot read —
 * `pt_BR`, a code of the realm's own — throws on the language rules, and the letter then goes by
 * the common rules: a realm with such a language still draws its pages.
 */
function capitalised(name: string, languageTag: string): string {
    let first: string;
    try {
        first = name.charAt(0).toLocaleUpperCase(languageTag);
    } catch {
        first = name.charAt(0).toUpperCase();
    }

    return first + name.slice(1);
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
    return capitalised(ownName(languageTag) ?? keycloakLabel, languageTag);
}
