import { isPermission, TPermission } from '@rt-tools/auth-contract';

/** Where the catalog goes and with what it is let in. */
export interface ICatalogSyncOptions {
    /** The Keycloak address, for example `https://sso.example.com`. */
    readonly baseUrl: string;
    readonly realm: string;
    /** The client of this admin; its roles are its rights. */
    readonly clientId: string;
    /** A client of the realm with a service account allowed to manage clients. */
    readonly syncClientId: string;
    readonly syncClientSecret: string;
}

/** What the sync did: the roles it created and the roles Keycloak holds beyond the catalog. */
export interface ICatalogSyncResult {
    readonly created: readonly string[];
    readonly extra: readonly string[];
}

type TFetch = (input: string, init?: RequestInit) => Promise<Response>;

async function answer<T>(response: Response, step: string): Promise<T> {
    if (!response.ok) {
        throw new Error(`The catalog sync stopped at ${step}: Keycloak answered ${response.status}`);
    }
    return (await response.json()) as T;
}

/**
 * Sends the rights of an admin to Keycloak as roles of its client.
 *
 * Creates the roles Keycloak lacks and removes none: removing a role takes it from every person
 * who holds it. The rights Keycloak holds beyond the catalog come back as `extra` for the log.
 */
export async function syncPermissionCatalog(
    options: ICatalogSyncOptions,
    catalog: readonly TPermission[],
    request: TFetch = fetch
): Promise<ICatalogSyncResult> {
    const base: string = `${options.baseUrl}/realms/${options.realm}`;
    const admin: string = `${options.baseUrl}/admin/realms/${options.realm}`;
    const token: { access_token: string } = await answer(
        await request(`${base}/protocol/openid-connect/token`, {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: options.syncClientId,
                client_secret: options.syncClientSecret,
            }),
        }),
        'the token'
    );
    const headers: Record<string, string> = { authorization: `Bearer ${token.access_token}`, 'content-type': 'application/json' };
    const clients: { id: string }[] = await answer(
        await request(`${admin}/clients?clientId=${encodeURIComponent(options.clientId)}`, { headers }),
        'the client'
    );
    if (clients.length !== 1) {
        throw new Error(`The catalog sync stopped at the client: the realm has no client ${options.clientId}`);
    }
    const rolesUrl: string = `${admin}/clients/${clients[0].id}/roles`;
    const held: Set<string> = new Set(
        (await answer<{ name: string }[]>(await request(rolesUrl, { headers }), 'the roles')).map(
            (role: { name: string }): string => role.name
        )
    );
    const created: string[] = [];
    for (const permission of catalog) {
        if (held.has(permission)) {
            continue;
        }
        const response: Response = await request(rolesUrl, { method: 'POST', body: JSON.stringify({ name: permission }), headers });
        if (!response.ok && response.status !== 409) {
            throw new Error(`The catalog sync stopped at the role ${permission}: Keycloak answered ${response.status}`);
        }
        created.push(permission);
    }
    const wanted: Set<string> = new Set<string>(catalog);
    // Keycloak adds roles of its own to a client; only a role of the right shape counts as extra.
    return { extra: [...held].filter((role: string): boolean => isPermission(role) && !wanted.has(role)), created };
}
