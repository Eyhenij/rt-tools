import { IAuthServerOptions } from '@rt-tools/auth-server';

import { EXAMPLE_RIGHTS } from './rights';

/** The variables the example server reads the realm from. */
export const AUTH_VARIABLES: readonly string[] = ['AUTH_ISSUER', 'AUTH_CLIENT_ID'];

/**
 * The options of the entry module from the environment.
 *
 * Both values belong to the stand, not to the code: the stand that raises the example names its
 * realm, and a missing one stops the start by name instead of checking tokens against a guess.
 * The catalog is not sent to Keycloak: the realm file of the stand declares the roles itself, and
 * the example holds no sync secret.
 */
export function authOptions(env: NodeJS.ProcessEnv): IAuthServerOptions {
    const missing: readonly string[] = AUTH_VARIABLES.filter((name: string): boolean => !env[name]);
    if (missing.length) {
        throw new Error(`The example server needs ${missing.join(' and ')} in the environment`);
    }
    return {
        issuer: String(env['AUTH_ISSUER']),
        clientId: String(env['AUTH_CLIENT_ID']),
        catalog: EXAMPLE_RIGHTS,
    };
}
