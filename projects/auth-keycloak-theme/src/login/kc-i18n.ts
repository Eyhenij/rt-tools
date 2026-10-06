import { InjectionToken } from '@angular/core';
import { i18nBuilder } from 'keycloakify/login/i18n/noJsx';

/**
 * The page texts are the Keycloak messages themselves: the theme adds no words of its own, so
 * the screen says what the realm mails say.
 */
const { getI18n } = i18nBuilder.withThemeName<'rt'>().build();

/** The messages of the page locale. */
export type TKcMessages = ReturnType<typeof getI18n>['i18n'];

export { getI18n };

/**
 * A Keycloak message as plain text. The messages carry HTML entities — `&laquo;` in "back to
 * login" — that the standard theme inserts as markup; the theme puts text, and an entity left as
 * it is shows on the screen literally. The parser only reads the string: it runs no script.
 */
export function plainMessage(message: string): string {
    if (!message.includes('&') && !message.includes('<')) {
        return message;
    }

    return new DOMParser().parseFromString(message, 'text/html').documentElement.textContent ?? '';
}

/** The messages of the page with every text already plain: the pages read them as they are. */
export function plainMessages(i18n: TKcMessages): TKcMessages {
    const msgStr: TKcMessages['msgStr'] = (...args: Parameters<TKcMessages['msgStr']>): string => plainMessage(i18n.msgStr(...args));
    const advancedMsgStr: TKcMessages['advancedMsgStr'] = (...args: Parameters<TKcMessages['advancedMsgStr']>): string =>
        plainMessage(i18n.advancedMsgStr(...args));

    return { ...i18n, msgStr, advancedMsgStr };
}

/** The messages of the page being drawn, already in its locale. */
export const KC_MESSAGES: InjectionToken<TKcMessages> = new InjectionToken<TKcMessages>('KC_MESSAGES');
