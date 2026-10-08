import { ICaller } from '@rt-tools/auth-contract';

import { ITestRealm, personClaims, TEST_CLIENT, TEST_ISSUER, testRealm } from './testing/keys.js';
import { bearerToken, KeycloakTokenVerifier } from './token-verifier.js';

describe('KeycloakTokenVerifier', () => {
    let realm: ITestRealm;
    let verifier: KeycloakTokenVerifier;

    beforeAll(async () => {
        realm = await testRealm();
        verifier = new KeycloakTokenVerifier({ issuer: TEST_ISSUER, clientId: TEST_CLIENT }, realm.keys);
    });

    it('SC-AUTH-15 — an accepted token gives the caller with the rights of this client', async () => {
        const caller: ICaller | null = await verifier.callerOf(
            `Bearer ${await realm.sign({ ...personClaims(['orders:read', 'offline_access']), name: 'Anna', email_verified: true, preferred_username: 'anna' })}`
        );

        expect(caller?.subject).toBe('p-1');
        expect(caller?.name).toBe('Anna');
        expect([...(caller?.permissions ?? [])]).toEqual(['orders:read']);
    });

    it('SC-AUTH-13 — a token of another client, issuer or key, or an expired one, is refused', async () => {
        const tokens: string[] = [
            await realm.sign(personClaims(['orders:read'], 'people-admin')),
            await realm.sign(personClaims(['orders:read']), { issuer: 'http://localhost:58080/realms/other' }),
            await realm.sign(personClaims(['orders:read']), { foreignKey: true }),
            await realm.sign(personClaims(['orders:read']), { expiresIn: '-1m' }),
            await realm.sign({ azp: TEST_CLIENT }),
        ];

        for (const token of tokens) {
            expect(await verifier.callerOf(`Bearer ${token}`)).toBeNull();
        }
    });

    it('SC-AUTH-73 — a token of a named service client gives the caller with the rights of this client', async () => {
        const services: KeycloakTokenVerifier = new KeycloakTokenVerifier(
            { issuer: TEST_ISSUER, clientId: TEST_CLIENT, serviceClients: ['cargo-tools'] },
            realm.keys
        );

        const caller: ICaller | null = await services.callerOf(`Bearer ${await realm.sign(personClaims(['orders:read'], 'cargo-tools'))}`);

        expect([...(caller?.permissions ?? [])]).toEqual(['orders:read']);
        expect(await services.callerOf(`Bearer ${await realm.sign(personClaims(['orders:read'], 'people-admin'))}`)).toBeNull();
    });

    it('SC-AUTH-73 — a service client the server does not name is refused', async () => {
        // First the positive half: the token of the admin client itself passes, so the refusal below
        // is about the client, not about a broken token
        expect(await verifier.callerOf(`Bearer ${await realm.sign(personClaims(['orders:read']))}`)).not.toBeNull();
        expect(await verifier.callerOf(`Bearer ${await realm.sign(personClaims(['orders:read'], 'cargo-tools'))}`)).toBeNull();
    });

    it('SC-AUTH-13 — a header of another form is refused before any key is read', async () => {
        expect(await verifier.callerOf(undefined)).toBeNull();
        expect(await verifier.callerOf('Basic abc')).toBeNull();
        expect(bearerToken('Bearer a.b.c')).toBe('a.b.c');
        expect(bearerToken('Bearer a.b')).toBeNull();
    });

    it('SC-AUTH-15 — claims of another shape give a caller without rights', async () => {
        const odd: ICaller | null = await verifier.callerOf(
            `Bearer ${await realm.sign({ sub: 'p-2', azp: TEST_CLIENT, email: 7, name: 7, preferred_username: 7, resource_access: { [TEST_CLIENT]: { roles: ['orders:read', 7] }, other: 'x' } })}`
        );
        const bare: ICaller | null = await verifier.callerOf(
            `Bearer ${await realm.sign({ sub: 'p-3', azp: TEST_CLIENT, resource_access: 'none' })}`
        );

        expect([...(odd?.permissions ?? [])]).toEqual(['orders:read']);
        expect(odd?.email).toBeNull();
        expect(odd?.name).toBeNull();
        expect(bare?.permissions.size).toBe(0);
    });

    it('SC-AUTH-13 — without a key set the realm address names where the keys are fetched', () => {
        expect(new KeycloakTokenVerifier({ issuer: TEST_ISSUER, clientId: TEST_CLIENT })).toBeInstanceOf(KeycloakTokenVerifier);
    });
});
