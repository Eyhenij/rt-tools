import { InjectionToken } from '@angular/core';
import type Keycloak from 'keycloak-js';

/** The part of the adapter the package calls; a test puts a double in its place. */
export type TRtKeycloak = Pick<
    Keycloak,
    | 'init'
    | 'login'
    | 'logout'
    | 'updateToken'
    | 'authenticated'
    | 'token'
    | 'tokenParsed'
    | 'onAuthSuccess'
    | 'onAuthRefreshSuccess'
    | 'onAuthLogout'
    | 'onTokenExpired'
>;

export const RT_KEYCLOAK: InjectionToken<TRtKeycloak> = new InjectionToken<TRtKeycloak>('RT_KEYCLOAK');
