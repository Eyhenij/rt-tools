import { createLocalJWKSet, exportJWK, generateKeyPair, JWK, JWTVerifyGetKey, SignJWT } from 'jose';

/** The realm of the tests. */
export const TEST_ISSUER: string = 'http://localhost:58080/realms/rt';
export const TEST_CLIENT: string = 'orders-admin';

/** A realm key pair and the key set the verifier reads, as a realm serves it. */
export interface ITestRealm {
    readonly keys: JWTVerifyGetKey;
    sign(claims: Record<string, unknown>, options?: { issuer?: string; expiresIn?: string; foreignKey?: boolean }): Promise<string>;
}

export async function testRealm(): Promise<ITestRealm> {
    const own: CryptoKeyPair = await generateKeyPair('RS256');
    const foreign: CryptoKeyPair = await generateKeyPair('RS256');
    const jwk: JWK = { ...(await exportJWK(own.publicKey)), kid: 'own', alg: 'RS256', use: 'sig' };
    return {
        keys: createLocalJWKSet({ keys: [jwk] }),
        sign: async (
            claims: Record<string, unknown>,
            options: { issuer?: string; expiresIn?: string; foreignKey?: boolean } = {}
        ): Promise<string> =>
            new SignJWT(claims)
                .setProtectedHeader({ alg: 'RS256', kid: 'own' })
                .setIssuer(options.issuer ?? TEST_ISSUER)
                .setIssuedAt()
                .setExpirationTime(options.expiresIn ?? '5m')
                .sign(options.foreignKey ? foreign.privateKey : own.privateKey),
    };
}

/** The claims of a person with the given roles in the test client, issued to it. */
export function personClaims(roles: readonly string[], azp: string = TEST_CLIENT): Record<string, unknown> {
    return { sub: 'p-1', email: 'anna@example.com', resource_access: { [TEST_CLIENT]: { roles } }, azp };
}
