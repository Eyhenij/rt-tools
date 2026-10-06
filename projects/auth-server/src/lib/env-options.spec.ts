import { TPermission } from '@rt-tools/auth-contract';

import { IAuthServerOptions } from './auth-server.module';
import { authOptionsFromEnv, clientSettingsOf } from './env-options';

const CATALOG: readonly TPermission[] = ['orders:read', 'orders:write'];

describe('authOptionsFromEnv', () => {
    it('SC-AUTH-69 — a missing realm setting stops the start and is named', () => {
        expect(() => authOptionsFromEnv({ AUTH_CLIENT_ID: 'orders-admin' }, CATALOG)).toThrow('needs AUTH_ISSUER in the environment');
        expect(() => authOptionsFromEnv({}, CATALOG)).toThrow('needs AUTH_ISSUER and AUTH_CLIENT_ID in the environment');
    });

    it('SC-AUTH-69 — without the sync secret the catalog is not sent', () => {
        const options: IAuthServerOptions = authOptionsFromEnv(
            { AUTH_ISSUER: 'http://sso.test/realms/rt', AUTH_CLIENT_ID: 'orders-admin' },
            CATALOG
        );

        expect(options).toEqual({ issuer: 'http://sso.test/realms/rt', clientId: 'orders-admin', catalog: CATALOG });
    });

    it('SC-AUTH-70 — the sync secret sends the catalog to the realm of the issuer', () => {
        const options: IAuthServerOptions = authOptionsFromEnv(
            { AUTH_ISSUER: 'https://sso.test/realms/rt/', AUTH_CLIENT_ID: 'orders-admin', AUTH_SYNC_SECRET: 'secret' },
            CATALOG
        );

        expect(options.sync).toEqual({
            baseUrl: 'https://sso.test',
            realm: 'rt',
            syncClientId: 'rt-catalog-sync',
            syncClientSecret: 'secret',
        });
    });

    it('SC-AUTH-70 — the sync client is named by the environment when it is another', () => {
        const options: IAuthServerOptions = authOptionsFromEnv(
            { AUTH_ISSUER: 'https://sso.test/realms/rt', AUTH_CLIENT_ID: 'a', AUTH_SYNC_SECRET: 's', AUTH_SYNC_CLIENT_ID: 'own-sync' },
            CATALOG
        );

        expect(options.sync?.syncClientId).toBe('own-sync');
    });

    it('SC-AUTH-70 — an issuer that is not a realm address stops the start when the catalog is to be sent', () => {
        expect(() =>
            authOptionsFromEnv({ AUTH_ISSUER: 'https://sso.test/rt', AUTH_CLIENT_ID: 'a', AUTH_SYNC_SECRET: 's' }, CATALOG)
        ).toThrow('is not the address of a Keycloak realm');
    });

    it('SC-AUTH-71 — the browser part gets the realm and the client the server checks tokens of', () => {
        const options: IAuthServerOptions = authOptionsFromEnv(
            { AUTH_ISSUER: 'https://sso.test/realms/rt', AUTH_CLIENT_ID: 'orders-admin' },
            CATALOG
        );

        expect(clientSettingsOf(options)).toEqual({ url: 'https://sso.test', realm: 'rt', clientId: 'orders-admin' });
    });

    it('SC-AUTH-72 — the keys are read by the address the environment names', () => {
        const options: IAuthServerOptions = authOptionsFromEnv(
            {
                AUTH_ISSUER: 'http://host.docker.internal:58080/realms/rt',
                AUTH_CLIENT_ID: 'orders-admin',
                AUTH_KEYS_URL: 'http://localhost:58080/realms/rt/protocol/openid-connect/certs',
            },
            CATALOG
        );

        expect(options.keysUrl).toBe('http://localhost:58080/realms/rt/protocol/openid-connect/certs');
        expect(clientSettingsOf(options).url).toBe('http://host.docker.internal:58080');
    });
});
