import { TKcContext } from './kc-context';

/**
 * The addresses that lead from one entry page to another inside the same entry. Not every page
 * carries all of them: the context of each page names its own set.
 */
const ENTRY_LINKS: readonly string[] = Object.freeze(['loginUrl', 'registrationUrl', 'loginResetCredentialsUrl', 'loginRestartFlowUrl']);

/** The base a relative address is read against; nothing is ever asked of it. */
const RELATIVE_BASE: string = 'https://relative.invalid';

/** The address with `kc_locale` set to the language; an address it cannot read stays as it is. */
export function withLocale(href: string, languageTag: string): string {
    try {
        const parsed: URL = new URL(href, RELATIVE_BASE);
        parsed.searchParams.set('kc_locale', languageTag);

        return parsed.origin === RELATIVE_BASE ? `${parsed.pathname}${parsed.search}${parsed.hash}` : parsed.toString();
    } catch {
        return href;
    }
}

/**
 * The context whose links between the entry pages carry the language of the page.
 *
 * The language a person chose lives in the entry of one browser tab. A link that names it opens
 * the next page in it whatever Keycloak keeps or the application asked for: a restarted entry and
 * an application that passes its own language on every new entry no longer take it back.
 */
export function withLocaleLinks(context: TKcContext, languageTag: string): TKcContext {
    const url: Record<string, unknown> = { ...context.url };
    for (const key of ENTRY_LINKS) {
        const href: unknown = url[key];
        if (typeof href === 'string' && href !== '') {
            url[key] = withLocale(href, languageTag);
        }
    }

    return { ...context, url } as TKcContext;
}
