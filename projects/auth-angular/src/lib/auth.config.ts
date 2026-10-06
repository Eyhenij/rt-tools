import { InjectionToken, Signal } from '@angular/core';
import type { KeycloakInitOptions } from 'keycloak-js';

/** What an admin tells the package about its Keycloak client and its own API. */
export interface IRtAuthConfig {
    /** The address of Keycloak, for example `https://auth.example.com`. */
    readonly url: string;
    readonly realm: string;
    /** The client of the admin; its client roles are the rights of the caller. */
    readonly clientId: string;
    /**
     * The addresses whose requests carry the token: an origin or an origin with a path. A relative
     * path is read against the address of the page. A request to any other address goes without it.
     */
    readonly tokenRecipients: readonly string[];
    /** The page of the silent check; by default `silent-check-sso.html` next to the page. */
    readonly silentCheckSsoRedirectUri?: string;
    /** The header the current organization goes in; without it the organization is not sent. */
    readonly organizationHeader?: string;
    /** Where a person without the rights of a route goes; without it they stay where they were. */
    readonly forbiddenPath?: string;
    /** Where Keycloak returns the person after the exit; by default the address of the page base. */
    readonly logoutRedirectUri?: string;
}

export const RT_AUTH_CONFIG: InjectionToken<IRtAuthConfig> = new InjectionToken<IRtAuthConfig>('RT_AUTH_CONFIG');

/**
 * The current organization of the person. The application provides it — the organizations live in
 * its database — and the package puts the value in the header named by the configuration.
 */
export const RT_AUTH_ORGANIZATION: InjectionToken<Signal<string | null>> = new InjectionToken<Signal<string | null>>(
    'RT_AUTH_ORGANIZATION'
);

/**
 * How the adapter starts: the code flow with PKCE and the silent check of the Keycloak session.
 *
 * No token or refresh token is passed in: nothing is restored from the browser storage, the
 * session comes back only from Keycloak. The frame that watches the session is off — browsers
 * block its cookie, and the token refresh finds an ended session anyway.
 */
export function keycloakInitOptions(config: IRtAuthConfig, baseUri: string): KeycloakInitOptions {
    return {
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        silentCheckSsoRedirectUri: config.silentCheckSsoRedirectUri ?? new URL('silent-check-sso.html', baseUri).href,
        checkLoginIframe: false,
    };
}
