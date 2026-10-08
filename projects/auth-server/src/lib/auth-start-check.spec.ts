import { ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { AuthStartCheck, IAuthServerOptions } from './auth-server.module.js';
import { AuthGuard } from './auth.guard.js';
import { KeycloakTokenVerifier } from './token-verifier.js';

function rolesAnswer(url: string): Response {
    if (url.endsWith('/token')) {
        return new Response(JSON.stringify({ access_token: 'admin' }));
    }
    if (url.includes('/clients?clientId=')) {
        return new Response(JSON.stringify([{ id: 'c-1' }]));
    }
    if (url.endsWith('/roles')) {
        return new Response(JSON.stringify([{ name: 'orders:archive' }]));
    }
    return new Response('{}', { status: 201 });
}

const OPTIONS: IAuthServerOptions = {
    issuer: 'http://kc/realms/rt',
    clientId: 'orders-admin',
    catalog: ['orders:read'],
    sync: { baseUrl: 'http://kc', realm: 'rt', syncClientId: 'rt-catalog-sync', syncClientSecret: 's' },
};

const NO_CONTROLLERS: DiscoveryService = { getControllers: () => [{ metatype: null }] } as unknown as DiscoveryService;

describe('AuthStartCheck', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('SC-AUTH-16 — at start the catalog reaches Keycloak and the extra right is named in the log', async () => {
        const fetchSpy: jest.SpyInstance = jest
            .spyOn(globalThis, 'fetch')
            .mockImplementation(async (input: string | URL | Request) => rolesAnswer(String(input)));
        const warn: jest.SpyInstance = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);

        await new AuthStartCheck(NO_CONTROLLERS, OPTIONS).onApplicationBootstrap();

        expect(fetchSpy.mock.calls.some(([url, init]: [string, RequestInit?]) => url.endsWith('/roles') && init?.method === 'POST')).toBe(
            true
        );
        expect(warn).toHaveBeenCalledWith('Keycloak holds rights the catalog lacks: orders:archive');
    });

    it('SC-AUTH-16 — a catalog Keycloak already holds whole leaves the log without a warning', async () => {
        jest.spyOn(globalThis, 'fetch').mockImplementation(async (input: string | URL | Request) =>
            String(input).endsWith('/roles') ? new Response(JSON.stringify([{ name: 'orders:read' }])) : rolesAnswer(String(input))
        );
        const warn: jest.SpyInstance = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);

        await new AuthStartCheck(NO_CONTROLLERS, OPTIONS).onApplicationBootstrap();

        expect(warn).not.toHaveBeenCalled();
    });
});

describe('AuthGuard', () => {
    it('SC-AUTH-11 — a handler that slipped past the start audit is refused, not opened', async () => {
        const guard: AuthGuard = new AuthGuard(
            new KeycloakTokenVerifier({ issuer: OPTIONS.issuer, clientId: OPTIONS.clientId }, async () => {
                throw new Error('no key is read');
            })
        );
        const context: ExecutionContext = { getHandler: () => function undeclared(): void {} } as unknown as ExecutionContext;

        await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    });
});
