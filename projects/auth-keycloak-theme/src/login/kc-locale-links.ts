import { TKcContext } from './kc-context';

/**
 * The addresses that lead from one entry page to another inside the same entry. Not every page
 * carries all of them: the context of each page names its own set.
 */
const ENTRY_LINKS: readonly string[] = Object.freeze(['loginUrl', 'registrationUrl', 'loginResetCredentialsUrl', 'loginRestartFlowUrl']);

/**
 * The address with `kc_locale` set to the language. The rest of the address stays as Keycloak wrote
 * it, byte for byte: a rebuilt query writes a space as `+` and escapes the slashes of a return
 * address, and nothing about the next page should depend on how the language got onto the link.
 */
export function withLocale(href: string, languageTag: string): string {
    const hashAt: number = href.indexOf('#');
    const head: string = hashAt === -1 ? href : href.slice(0, hashAt);
    const hash: string = hashAt === -1 ? '' : href.slice(hashAt);
    const queryAt: number = head.indexOf('?');
    const path: string = queryAt === -1 ? head : head.slice(0, queryAt);
    const pairs: string[] =
        queryAt === -1
            ? []
            : head
                  .slice(queryAt + 1)
                  .split('&')
                  .filter((pair: string): boolean => pair !== '');
    const kept: string[] = pairs.filter((pair: string): boolean => pair.split('=')[0] !== 'kc_locale');

    const query: string = [...kept, 'kc_locale=' + encodeURIComponent(languageTag)].join('&');

    return `${path}?${query}${hash}`;
}

/**
 * Whether the person chose the language of this page in the language list. The list opens the page
 * by its own address with `kc_locale`, and the links below pass it on, so the parameter in the page
 * address is the sign of a choice; a language from the application or the browser comes without it.
 */
export function isLocaleChosen(pageSearch: string): boolean {
    return new URLSearchParams(pageSearch).has('kc_locale');
}

/**
 * The context whose links between the entry pages carry the language the person chose.
 *
 * The language a person chose lives in the entry of one browser tab. A link that names it opens
 * the next page in it whatever Keycloak keeps or the application asked for: a restarted entry and
 * an application that passes its own language on every new entry no longer take it back.
 *
 * A language nobody chose is left off the links. Keycloak keeps `kc_locale` in a cookie and in the
 * profile of the person, and both stand above the language the application asks for: a link that
 * named the application's language would pin it, and the next entry in another language of the
 * application would open in the old one.
 */
export function withLocaleLinks(context: TKcContext, languageTag: string, chosen: boolean): TKcContext {
    if (!chosen) {
        return context;
    }
    const url: Record<string, unknown> = { ...context.url };
    for (const key of ENTRY_LINKS) {
        const href: unknown = url[key];
        if (typeof href === 'string' && href !== '') {
            url[key] = withLocale(href, languageTag);
        }
    }

    return { ...context, url } as TKcContext;
}
