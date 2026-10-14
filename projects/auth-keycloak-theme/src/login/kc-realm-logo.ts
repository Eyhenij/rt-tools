/** The realm logo the card head shows: the picture address and its text for a screen reader. */
export interface IKcRealmLogo {
    readonly src: string;
    readonly alt: string;
}

/**
 * The logo from the HTML display name of the realm. Keycloak keeps that field for the head of the
 * login pages, and the theme serves several realms, so the logo belongs to the realm. Only the
 * first picture is taken, by its address and text: the rest of the markup is not inserted. The
 * parser only reads the string: it runs no script.
 *
 * @returns `null` when the field holds no picture with an address.
 */
export function realmLogoOf(displayNameHtml: string, realmName: string): IKcRealmLogo | null {
    if (!displayNameHtml.includes('<')) {
        return null;
    }
    const image: HTMLImageElement | null = new DOMParser().parseFromString(displayNameHtml, 'text/html').querySelector('img');
    const src: string = image?.getAttribute('src') ?? '';
    if (src === '') {
        return null;
    }

    return { src, alt: image?.getAttribute('alt') || realmName };
}
