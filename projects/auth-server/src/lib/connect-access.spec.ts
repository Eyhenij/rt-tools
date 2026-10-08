import { Code, ConnectError, createContextValues, Interceptor, StreamRequest, UnaryRequest } from '@connectrpc/connect';

import { ICaller } from '@rt-tools/auth-contract';

import { TAccess } from './access.js';
import { CONNECT_CALLER, connectAccessEntries, createAuthInterceptor, IConnectServiceLike } from './connect-access.js';
import { ITestRealm, personClaims, TEST_CLIENT, TEST_ISSUER, testRealm } from './testing/keys.js';
import { KeycloakTokenVerifier } from './token-verifier.js';

const SERVICE: IConnectServiceLike = {
    typeName: 'orders.v1.OrdersService',
    methods: [
        { name: 'ListOrders', localName: 'listOrders' },
        { name: 'Health', localName: 'health' },
    ],
};

function request(method: string, authorization?: string): UnaryRequest {
    const header: Headers = new Headers(authorization ? { authorization } : {});
    return {
        method: { name: method, parent: { typeName: SERVICE.typeName } },
        header,
        contextValues: createContextValues(),
    } as unknown as UnaryRequest;
}

describe('createAuthInterceptor', () => {
    let realm: ITestRealm;
    let run: (req: UnaryRequest) => Promise<unknown>;
    let seen: ICaller | null;

    beforeAll(async () => {
        realm = await testRealm();
        const verifier: KeycloakTokenVerifier = new KeycloakTokenVerifier({ issuer: TEST_ISSUER, clientId: TEST_CLIENT }, realm.keys);
        const entries: readonly [string, TAccess][] = connectAccessEntries(SERVICE, {
            listOrders: { kind: 'permission', permission: 'orders:read' },
            health: { kind: 'public' },
        });
        const interceptor: Interceptor = createAuthInterceptor(verifier, entries);
        const next: (req: UnaryRequest | StreamRequest) => Promise<unknown> = async (
            req: UnaryRequest | StreamRequest
        ): Promise<unknown> => {
            seen = req.contextValues.get(CONNECT_CALLER);
            return { message: 'result' };
        };
        run = (req: UnaryRequest): Promise<unknown> => interceptor(next as never)(req);
    });

    async function codeOf(req: UnaryRequest): Promise<Code | 'result'> {
        try {
            await run(req);
            return 'result';
        } catch (error) {
            return ConnectError.from(error).code;
        }
    }

    it('SC-AUTH-17 — a procedure open by a right answers unauthenticated, permission denied and the result', async () => {
        expect(await codeOf(request('ListOrders'))).toBe(Code.Unauthenticated);
        expect(await codeOf(request('ListOrders', `Bearer ${await realm.sign(personClaims(['orders:write']))}`))).toBe(
            Code.PermissionDenied
        );
        seen = null;
        expect(await codeOf(request('ListOrders', `Bearer ${await realm.sign(personClaims(['orders:read']))}`))).toBe('result');
        expect(seen?.subject).toBe('p-1');
    });

    it('SC-AUTH-17 — an open procedure answers without a token, a method the map lacks is refused', async () => {
        expect(await codeOf(request('Health'))).toBe('result');
        expect(await codeOf(request('Unknown'))).toBe(Code.Unauthenticated);
    });

    it('SC-AUTH-17 — a map that misses a method or names an unknown one is refused', () => {
        expect(() => connectAccessEntries(SERVICE, { listOrders: { kind: 'public' } })).toThrow('missing: health; unknown: none');
        expect(() =>
            connectAccessEntries(SERVICE, { listOrders: { kind: 'public' }, health: { kind: 'public' }, extra: { kind: 'public' } })
        ).toThrow('missing: none; unknown: extra');
    });
});
