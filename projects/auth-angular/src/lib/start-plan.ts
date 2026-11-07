import type { KeycloakInitOptions } from 'keycloak-js';

import { CODE_EXCHANGE_TIMEOUT_MS, IRtAuthConfig, keycloakInitOptions, SILENT_CHECK_TIMEOUT_MS } from './auth.config';

/** What the start of the adapter is: its options and how long the admin waits for it. */
export interface IRtAuthStartPlan {
    readonly options: KeycloakInitOptions;
    readonly limitMs: number;
}

/**
 * Whether the fragment of the address carries an OAuth code answer: the code and the state. Only
 * the adapter knows whether it sent that state; one it did not send ends in a full redirect to
 * Keycloak with no form, and the person comes back with an answer the adapter knows.
 */
function hasOAuthCodeFragment(href: string): boolean {
    const params: URLSearchParams = new URLSearchParams(new URL(href).hash.slice(1));
    return params.has('code') && params.has('state');
}

/**
 * The start for the address of the page. On the return from the entry form the adapter only
 * exchanges the code: neither the silent frame nor its cookie probe is raised, and the wait has a
 * limit of its own. Any other address starts with the silent check and its limit.
 */
export function startPlan(config: IRtAuthConfig, baseUri: string, href: string): IRtAuthStartPlan {
    const options: KeycloakInitOptions = keycloakInitOptions(config, baseUri);
    if (hasOAuthCodeFragment(href)) {
        const exchange: KeycloakInitOptions = { ...options };
        delete exchange.silentCheckSsoRedirectUri;
        return { options: exchange, limitMs: config.codeExchangeTimeoutMs ?? CODE_EXCHANGE_TIMEOUT_MS };
    }
    return { options, limitMs: config.silentCheckTimeoutMs ?? SILENT_CHECK_TIMEOUT_MS };
}
