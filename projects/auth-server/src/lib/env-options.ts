import { TPermission } from '@rt-tools/auth-contract';

import type { IAuthServerOptions } from './auth-server.module.js';

/** The environment variables the entry module is set up by; `process.env` fits it as it is. */
export interface IAuthEnv {
    readonly AUTH_ISSUER?: string;
    readonly AUTH_CLIENT_ID?: string;
    readonly AUTH_SYNC_SECRET?: string;
    readonly AUTH_SYNC_CLIENT_ID?: string;
    readonly AUTH_KEYS_URL?: string;
    readonly AUTH_SERVICE_CLIENTS?: string;
}

/** The variables without which a server checks no token. */
export const AUTH_ENV_VARIABLES: readonly (keyof IAuthEnv)[] = ['AUTH_ISSUER', 'AUTH_CLIENT_ID'];

/** The service client of the realm allowed to create the roles of a client, unless named otherwise. */
const SYNC_CLIENT_ID: string = 'rt-catalog-sync';

/** The Keycloak address and the realm name, taken from the issuer: `https://sso.example.com/realms/rt`. */
const ISSUER: RegExp = /^(https?:\/\/.+)\/realms\/([^/]+)\/?$/;

/** What the browser part of an admin needs to sign a person in: the same realm and client as the server. */
export interface IAuthClientSettings {
    /** The Keycloak address, for example `https://sso.example.com`. */
    readonly url: string;
    readonly realm: string;
    readonly clientId: string;
}

/** The Keycloak address and the realm of an issuer, or `null` when it is not the address of a realm. */
export function realmOfIssuer(issuer: string): { readonly url: string; readonly realm: string } | null {
    const match: RegExpExecArray | null = ISSUER.exec(issuer);
    return match ? { url: match[1], realm: match[2] } : null;
}

/**
 * The settings the browser part signs in with, taken from the options of the server. The admin
 * asks them at start instead of carrying its own copy: a copy built into the page drifts from the
 * server at the first move of Keycloak to another address.
 */
export function clientSettingsOf(options: IAuthServerOptions): IAuthClientSettings {
    const realm: { readonly url: string; readonly realm: string } | null = realmOfIssuer(options.issuer);
    if (!realm) {
        throw new Error(`The issuer is not the address of a Keycloak realm: ${options.issuer}`);
    }
    return { ...realm, clientId: options.clientId };
}

/**
 * The options of the entry module from the environment of the server.
 *
 * The realm and the client belong to the stand, not to the code: a missing one stops the start by
 * name instead of checking tokens against a guess. The catalog goes to Keycloak only when the
 * environment holds the secret of the sync client (`AUTH_SYNC_SECRET`); `AUTH_SYNC_CLIENT_ID`
 * names that client when it is not `rt-catalog-sync`. Without the secret the realm file of the
 * stand declares the roles itself. `AUTH_KEYS_URL` names where the keys are read when the server
 * reaches Keycloak by another address than the browser. `AUTH_SERVICE_CLIENTS` names, by commas, the
 * service clients whose tokens the server accepts besides the client of the admin.
 */
export function authOptionsFromEnv(env: IAuthEnv, catalog: readonly TPermission[]): IAuthServerOptions {
    const missing: readonly string[] = AUTH_ENV_VARIABLES.filter((name: keyof IAuthEnv): boolean => !env[name]);
    if (missing.length) {
        throw new Error(`The server needs ${missing.join(' and ')} in the environment`);
    }
    const issuer: string = String(env.AUTH_ISSUER);
    const clientId: string = String(env.AUTH_CLIENT_ID);
    const secret: string | undefined = env.AUTH_SYNC_SECRET;
    const services: readonly string[] = (env.AUTH_SERVICE_CLIENTS ?? '')
        .split(',')
        .map((name: string): string => name.trim())
        .filter(Boolean);
    const keys: { readonly keysUrl?: string; readonly serviceClients?: readonly string[] } = {
        ...(env.AUTH_KEYS_URL ? { keysUrl: env.AUTH_KEYS_URL } : {}),
        ...(services.length ? { serviceClients: services } : {}),
    };
    if (!secret) {
        return { issuer, clientId, catalog, ...keys };
    }
    const realm: { readonly url: string; readonly realm: string } | null = realmOfIssuer(issuer);
    if (!realm) {
        throw new Error(`AUTH_ISSUER is not the address of a Keycloak realm: ${issuer}`);
    }
    return {
        issuer,
        clientId,
        catalog,
        ...keys,
        sync: {
            baseUrl: realm.url,
            realm: realm.realm,
            syncClientId: env.AUTH_SYNC_CLIENT_ID || SYNC_CLIENT_ID,
            syncClientSecret: secret,
        },
    };
}
