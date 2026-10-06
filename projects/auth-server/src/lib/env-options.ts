import { TPermission } from '@rt-tools/auth-contract';

import type { IAuthServerOptions } from './auth-server.module';

/** The environment variables the entry module is set up by; `process.env` fits it as it is. */
export interface IAuthEnv {
    readonly AUTH_ISSUER?: string;
    readonly AUTH_CLIENT_ID?: string;
    readonly AUTH_SYNC_SECRET?: string;
    readonly AUTH_SYNC_CLIENT_ID?: string;
}

/** The variables without which a server checks no token. */
export const AUTH_ENV_VARIABLES: readonly (keyof IAuthEnv)[] = ['AUTH_ISSUER', 'AUTH_CLIENT_ID'];

/** The service client of the realm allowed to create the roles of a client, unless named otherwise. */
const SYNC_CLIENT_ID: string = 'rt-catalog-sync';

/** The Keycloak address and the realm name, taken from the issuer: `https://sso.example.com/realms/rt`. */
const ISSUER: RegExp = /^(https?:\/\/.+)\/realms\/([^/]+)\/?$/;

/**
 * The options of the entry module from the environment of the server.
 *
 * The realm and the client belong to the stand, not to the code: a missing one stops the start by
 * name instead of checking tokens against a guess. The catalog goes to Keycloak only when the
 * environment holds the secret of the sync client (`AUTH_SYNC_SECRET`); `AUTH_SYNC_CLIENT_ID`
 * names that client when it is not `rt-catalog-sync`. Without the secret the realm file of the
 * stand declares the roles itself.
 */
export function authOptionsFromEnv(env: IAuthEnv, catalog: readonly TPermission[]): IAuthServerOptions {
    const missing: readonly string[] = AUTH_ENV_VARIABLES.filter((name: keyof IAuthEnv): boolean => !env[name]);
    if (missing.length) {
        throw new Error(`The server needs ${missing.join(' and ')} in the environment`);
    }
    const issuer: string = String(env.AUTH_ISSUER);
    const clientId: string = String(env.AUTH_CLIENT_ID);
    const secret: string | undefined = env.AUTH_SYNC_SECRET;
    if (!secret) {
        return { issuer, clientId, catalog };
    }
    const realm: RegExpExecArray | null = ISSUER.exec(issuer);
    if (!realm) {
        throw new Error(`AUTH_ISSUER is not the address of a Keycloak realm: ${issuer}`);
    }
    return {
        issuer,
        clientId,
        catalog,
        sync: {
            baseUrl: realm[1],
            realm: realm[2],
            syncClientId: env.AUTH_SYNC_CLIENT_ID || SYNC_CLIENT_ID,
            syncClientSecret: secret,
        },
    };
}
