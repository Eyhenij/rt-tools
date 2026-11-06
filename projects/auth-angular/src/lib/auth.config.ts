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
    /**
     * How long the start waits for the silent check, in milliseconds; by default five seconds. Past
     * it the admin starts with nobody signed in.
     */
    readonly silentCheckTimeoutMs?: number;
    /**
     * How long the start waits for the exchange of the code on the return from the entry form, in
     * milliseconds; by default thirty seconds. Past it the admin starts with nobody signed in.
     */
    readonly codeExchangeTimeoutMs?: number;
}

/**
 * How long the start waits for the silent check by default. The adapter itself waits for it
 * without a limit: a Keycloak that is down, or one that refuses the return address, would leave
 * the admin unstarted for good.
 */
export const SILENT_CHECK_TIMEOUT_MS: number = 5000;

/**
 * How long the start waits for the exchange of the code by default. It is longer than the limit of
 * the silent check: cut, the exchange sends the person back to the form they have just passed,
 * while a hung one would leave a blank page.
 */
export const CODE_EXCHANGE_TIMEOUT_MS: number = 30_000;

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
