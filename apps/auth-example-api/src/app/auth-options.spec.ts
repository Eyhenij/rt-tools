import { IAuthServerOptions } from '@rt-tools/auth-server';
import { describe, expect, it } from 'vitest';

import { authOptions } from './auth-options';

describe('authOptions', () => {
    it('takes the realm and the client from the environment, with the catalog of the example', () => {
        const options: IAuthServerOptions = authOptions({ AUTH_ISSUER: 'http://sso.test/realms/rt', AUTH_CLIENT_ID: 'example' });

        expect(options).toEqual({ issuer: 'http://sso.test/realms/rt', clientId: 'example', catalog: ['example:read', 'example:write'] });
    });

    it('stops the start and names every missing variable', () => {
        expect(() => authOptions({ AUTH_CLIENT_ID: 'example' })).toThrow('needs AUTH_ISSUER in the environment');
        expect(() => authOptions({})).toThrow('needs AUTH_ISSUER and AUTH_CLIENT_ID in the environment');
    });
});
