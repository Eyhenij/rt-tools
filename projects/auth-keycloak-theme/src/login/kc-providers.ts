import { TKcContext } from './kc-context';

/** A provider the theme draws its own mark for; the value is the provider id of Keycloak. */
export type TKcProviderMark = 'google' | 'apple';

const MARKS: ReadonlySet<string> = new Set<TKcProviderMark>(['google', 'apple']);

/** A provider of the realm as Keycloak puts it on a page. */
interface IKcProvider {
    readonly alias: string;
    readonly displayName: string;
    readonly loginUrl: string;
    readonly providerId: string;
}

/** A provider button: where it leads, what it says and the mark modifier when the theme has one. */
export interface IKcProviderButton {
    readonly alias: string;
    readonly label: string;
    readonly href: string;
    readonly mark: TKcProviderMark | null;
    readonly mods: Readonly<Record<string, boolean>>;
}

function markOf(providerId: string): TKcProviderMark | null {
    return MARKS.has(providerId) ? (providerId as TKcProviderMark) : null;
}

/**
 * The provider buttons of a page. Keycloak puts the providers on the registration page too, while
 * the Keycloakify type names them only on the login page, so the field is read by name.
 *
 * The mark is a picture of the theme drawn by the button modifier. The Google mark is in four
 * colours, and a kit icon name for it is drawn as a font ligature the theme does not load.
 *
 * @returns An empty list for a realm without providers.
 */
export function providerButtonsOf(context: TKcContext): IKcProviderButton[] {
    const social: unknown = Reflect.get(context, 'social');
    const providers: unknown = typeof social === 'object' && social !== null ? Reflect.get(social, 'providers') : undefined;
    if (!Array.isArray(providers)) {
        return [];
    }

    return (providers as IKcProvider[]).map((provider: IKcProvider): IKcProviderButton => {
        const mark: TKcProviderMark | null = markOf(provider.providerId);

        return {
            alias: provider.alias,
            label: provider.displayName,
            href: provider.loginUrl,
            mods: mark === null ? {} : { [mark]: true },
            mark,
        };
    });
}
