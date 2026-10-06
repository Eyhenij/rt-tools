import { isPermission, TPermission } from './permission.js';

/** The fields of a Keycloak access token the caller is read from. */
export interface IKeycloakClaims {
    readonly sub: string;
    readonly email?: string;
    readonly email_verified?: boolean;
    readonly name?: string;
    readonly preferred_username?: string;
    readonly resource_access?: Readonly<Record<string, { readonly roles?: readonly string[] }>>;
}

/** The person behind a token, with the rights of one client. */
export interface ICaller {
    readonly subject: string;
    readonly email: string | null;
    readonly emailVerified: boolean;
    readonly name: string | null;
    readonly permissions: ReadonlySet<TPermission>;
}

/**
 * The caller of one client, read from the claims of a token.
 *
 * Only the roles of the named client become rights: a person with rights in one admin carries
 * none of them into another. A role of another shape — Keycloak adds its own — is dropped.
 */
export function callerFromClaims(claims: IKeycloakClaims, clientId: string): ICaller {
    const roles: readonly string[] = claims.resource_access?.[clientId]?.roles ?? [];
    return {
        subject: claims.sub,
        email: claims.email ?? null,
        emailVerified: claims.email_verified === true,
        name: claims.name ?? claims.preferred_username ?? null,
        permissions: new Set<TPermission>(roles.filter(isPermission)),
    };
}

/** Whether the caller has the right. */
export function hasPermission(caller: ICaller, permission: TPermission): boolean {
    return caller.permissions.has(permission);
}

/** Whether the caller has every one of the rights. An empty list asks for nothing and is met. */
export function hasEveryPermission(caller: ICaller, permissions: readonly TPermission[]): boolean {
    return permissions.every((permission: TPermission): boolean => caller.permissions.has(permission));
}

/** Whether the caller has at least one of the rights. An empty list offers nothing and is not met. */
export function hasSomePermission(caller: ICaller, permissions: readonly TPermission[]): boolean {
    return permissions.some((permission: TPermission): boolean => caller.permissions.has(permission));
}
