import { InjectionToken, Type } from '@angular/core';
import type { KcContext as TKeycloakContext } from 'keycloakify/login/KcContext';

/** The data Keycloak puts on a page of the login theme. */
export type TKcContext = TKeycloakContext;

/** The page ids of the login theme. */
export type TKcPageId = TKcContext['pageId'];

/** The context of one page, narrowed by its id. */
export type TKcPageContext<PAGE extends TKcPageId> = Extract<TKcContext, { pageId: PAGE }>;

declare global {
    interface Window {
        /** Set by the page template Keycloak renders; absent outside Keycloak. */
        kcContext?: TKcContext;
    }
}

/** The context of the page being drawn. */
export const KC_CONTEXT: InjectionToken<TKcContext> = new InjectionToken<TKcContext>('KC_CONTEXT');

/** The theme component of the page being drawn; the shell puts it inside the card. */
export const KC_PAGE: InjectionToken<Type<unknown>> = new InjectionToken<Type<unknown>>('KC_PAGE');
