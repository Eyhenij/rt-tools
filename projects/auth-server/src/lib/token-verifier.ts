import { createRemoteJWKSet, JWTPayload, JWTVerifyGetKey, jwtVerify } from 'jose';

import { callerFromClaims, ICaller, IKeycloakClaims } from '@rt-tools/auth-contract';

/** Where the tokens of an admin come from: the realm and the client of this admin. */
export interface ITokenCheckOptions {
    /** The realm issuer, for example `https://sso.example.com/realms/rt`. */
    readonly issuer: string;
    /** The client of this admin in the realm. A token issued to another client is refused. */
    readonly clientId: string;
    /**
     * The service clients whose tokens this admin accepts too: commands that call it without a
     * person. Their rights are the roles of `clientId` on their service account, the same place the
     * rights of a person are read from.
     */
    readonly serviceClients?: readonly string[];
    /**
     * Where the server reads the keys of the realm, when it reaches Keycloak by another address than
     * the browser does: an inner network, a container. By default — the key set of the issuer.
     */
    readonly keysUrl?: string;
}

const BEARER: RegExp = /^Bearer ([A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+)$/;

/** The token of the `Authorization` header, or `null` when the header is absent or of another form. */
export function bearerToken(authorization: string | null | undefined): string | null {
    const match: RegExpExecArray | null = BEARER.exec(authorization?.trim() ?? '');
    return match ? match[1] : null;
}

function resourceAccessOf(value: unknown): IKeycloakClaims['resource_access'] {
    if (typeof value !== 'object' || value === null) {
        return undefined;
    }
    const access: Record<string, { roles?: readonly string[] }> = {};
    for (const [clientId, entry] of Object.entries(value)) {
        const roles: unknown = typeof entry === 'object' && entry !== null ? Reflect.get(entry, 'roles') : undefined;
        access[clientId] = { roles: Array.isArray(roles) ? roles.filter((role: unknown): role is string => typeof role === 'string') : [] };
    }
    return access;
}

/** The claims the caller is read from, taken from a verified payload by their shape. */
function claimsOf(payload: JWTPayload): IKeycloakClaims {
    return {
        sub: String(payload.sub),
        email: typeof payload['email'] === 'string' ? payload['email'] : undefined,
        email_verified: payload['email_verified'] === true,
        name: typeof payload['name'] === 'string' ? payload['name'] : undefined,
        preferred_username: typeof payload['preferred_username'] === 'string' ? payload['preferred_username'] : undefined,
        resource_access: resourceAccessOf(payload['resource_access']),
    };
}

/**
 * The token check of one admin, shared by the NestJS guard and the Connect interceptor.
 *
 * A token is accepted when a key of the realm signed it, the realm issued it, its term holds and
 * it was issued to the client of this admin or to a service client it names (`azp`). Every other
 * case answers `null` and nothing
 * more: the reason of a refusal is not told to the caller, so the answers do not show which tokens
 * come close.
 *
 * The keys are fetched from the key set address of the realm and cached by `jose`; a key the
 * realm rotates in is picked up without a restart.
 */
export class KeycloakTokenVerifier {
    readonly #options: ITokenCheckOptions;
    readonly #keys: JWTVerifyGetKey;

    constructor(options: ITokenCheckOptions, keys?: JWTVerifyGetKey) {
        this.#options = options;
        this.#keys = keys ?? createRemoteJWKSet(new URL(options.keysUrl ?? `${options.issuer}/protocol/openid-connect/certs`));
    }

    /** The caller of the `Authorization` header, or `null` when the token is not accepted. */
    public async callerOf(authorization: string | null | undefined): Promise<ICaller | null> {
        const token: string | null = bearerToken(authorization);
        if (!token) {
            return null;
        }
        try {
            const { payload } = await jwtVerify(token, this.#keys, { issuer: this.#options.issuer });
            if (!this.#accepts(payload['azp']) || typeof payload.sub !== 'string') {
                return null;
            }
            return callerFromClaims(claimsOf(payload), this.#options.clientId);
        } catch {
            return null;
        }
    }

    /** Whether a token issued to this client is accepted: the client of this admin or a service client it names. */
    #accepts(azp: unknown): boolean {
        return azp === this.#options.clientId || (typeof azp === 'string' && (this.#options.serviceClients ?? []).includes(azp));
    }
}
