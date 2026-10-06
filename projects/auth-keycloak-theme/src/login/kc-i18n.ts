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

/** The messages of the page being drawn, already in its locale. */
export const KC_MESSAGES: InjectionToken<TKcMessages> = new InjectionToken<TKcMessages>('KC_MESSAGES');
