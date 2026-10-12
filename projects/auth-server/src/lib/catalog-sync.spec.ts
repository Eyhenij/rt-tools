import { ICatalogSyncOptions, ICatalogSyncResult, syncPermissionCatalog } from './catalog-sync.js';

interface ICall {
    readonly url: string;
    readonly method: string;
    readonly body?: string;
}

interface IKeycloakDouble {
    readonly calls: ICall[];
    readonly request: (url: string, init?: RequestInit) => Promise<Response>;
}

function keycloakDouble(roles: string[], failAt?: string): IKeycloakDouble {
    const calls: ICall[] = [];
    const json: (body: unknown, status?: number) => Response = (body: unknown, status: number = 200): Response =>
        new Response(JSON.stringify(body), { status });
    return {
        calls,
        request: async (url: string, init: RequestInit = {}): Promise<Response> => {
            const method: string = init.method ?? 'GET';
            calls.push({ url, method, body: typeof init.body === 'string' ? init.body : undefined });
            if (failAt && url.includes(failAt)) {
                return json({}, 500);
            }
            if (url.endsWith('/token')) {
                return json({ access_token: 'admin' });
            }
            if (url.includes('/clients?clientId=missing')) {
                return json([]);
            }
            if (url.includes('/clients?clientId=')) {
                return json([{ id: 'c-1' }]);
            }
            if (method === 'POST') {
                const name: string = String(JSON.parse(String(init.body)).name);
                return json({}, name === 'orders:dup' ? 409 : name === 'orders:bad' ? 400 : 201);
            }
            return json(roles.map((name: string) => ({ name })));
        },
    };
}

const OPTIONS: ICatalogSyncOptions = {
    baseUrl: 'http://kc',
    realm: 'rt',
    clientId: 'orders-admin',
    syncClientId: 'rt-catalog-sync',
    syncClientSecret: 's',
};

describe('syncPermissionCatalog', () => {
    it('SC-AUTH-16 — the missing right is created, the extra one stays and is named', async () => {
        const keycloak: IKeycloakDouble = keycloakDouble(['orders:read', 'orders:archive', 'uma_protection']);
        const result: ICatalogSyncResult = await syncPermissionCatalog(OPTIONS, ['orders:read', 'orders:write'], keycloak.request);

        expect(result).toEqual({ created: ['orders:write'], extra: ['orders:archive'] });
        expect(
            keycloak.calls.filter((call: ICall) => call.method === 'POST' && call.url.endsWith('/roles')).map((call: ICall) => call.body)
        ).toEqual([JSON.stringify({ name: 'orders:write' })]);
        expect(keycloak.calls.some((call: ICall) => call.method === 'DELETE')).toBe(false);
    });

    it('SC-AUTH-16 — a role created by a neighbour in the meantime is not a failure', async () => {
        const result: ICatalogSyncResult = await syncPermissionCatalog(OPTIONS, ['orders:dup'], keycloakDouble([]).request);

        expect(result.created).toEqual(['orders:dup']);
    });

    it('SC-AUTH-16 — the sync names the step it stopped at', async () => {
        await expect(syncPermissionCatalog(OPTIONS, [], keycloakDouble([], '/token').request)).rejects.toThrow(
            'stopped at the token: Keycloak answered 500'
        );
        await expect(syncPermissionCatalog({ ...OPTIONS, clientId: 'missing' }, [], keycloakDouble([]).request)).rejects.toThrow(
            'no client missing'
        );
        await expect(syncPermissionCatalog(OPTIONS, ['orders:bad'], keycloakDouble([]).request)).rejects.toThrow(
            'the role orders:bad: Keycloak answered 400'
        );
    });
});
