import { Controller, Get, Inject, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ICaller } from '@rt-tools/auth-contract';

import { PermittedOperation, OpenOperation, SignedInOperation } from './access';
import { AuthServerModule, IAuthServerOptions } from './auth-server.module';
import { AUTH_SERVER_OPTIONS, AUTH_TOKEN_VERIFIER } from './auth.tokens';
import { clientSettingsOf, IAuthClientSettings } from './env-options';
import { CurrentCaller } from './current-caller.decorator';
import { ITestRealm, personClaims, TEST_CLIENT, TEST_ISSUER, testRealm } from './testing/keys';
import { KeycloakTokenVerifier } from './token-verifier';

@Controller('orders')
class OrdersController {
    @Get()
    @PermittedOperation('orders:read')
    public list(@CurrentCaller() caller: ICaller): { subject: string; rights: string[] } {
        return { subject: caller.subject, rights: [...caller.permissions] };
    }

    @Get('me')
    @SignedInOperation()
    public me(@CurrentCaller() caller: ICaller): string {
        return caller.subject;
    }

    @Get('health')
    @OpenOperation()
    public health(@CurrentCaller() caller: ICaller | undefined): string {
        return caller === undefined ? 'ok' : 'caller';
    }
}

/** The settings operation of an application: it reads the options the module was set up with. */
@Controller('entry')
class EntryController {
    readonly #settings: IAuthClientSettings;

    constructor(@Inject(AUTH_SERVER_OPTIONS) options: IAuthServerOptions) {
        this.#settings = clientSettingsOf(options);
    }

    @Get()
    @OpenOperation()
    public settings(): IAuthClientSettings {
        return this.#settings;
    }
}

@Controller('forgotten')
class ForgottenController {
    @Get()
    public open(): string {
        return 'should not start';
    }
}

async function start(realm: ITestRealm, controllers: (new () => object)[]): Promise<INestApplication> {
    const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [AuthServerModule.forRoot({ issuer: TEST_ISSUER, clientId: TEST_CLIENT, catalog: ['orders:read'] })],
        controllers,
    })
        .overrideProvider(AUTH_TOKEN_VERIFIER)
        .useValue(new KeycloakTokenVerifier({ issuer: TEST_ISSUER, clientId: TEST_CLIENT }, realm.keys))
        .compile();
    const app: INestApplication = moduleRef.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    return app;
}

describe('AuthServerModule', () => {
    let realm: ITestRealm;
    let app: INestApplication;
    let base: string;

    beforeAll(async () => {
        realm = await testRealm();
        app = await start(realm, [OrdersController, EntryController]);
        base = await app.getUrl();
    });

    afterAll(async () => {
        await app.close();
    });

    it('SC-AUTH-14 — a call without a token is refused as not signed in, without naming the right', async () => {
        const response: Response = await fetch(`${base}/orders`);

        expect(response.status).toBe(401);
        expect(await response.text()).not.toContain('orders:read');
    });

    it('SC-AUTH-14 — a token without the right is refused as not allowed, without naming the right', async () => {
        const token: string = await realm.sign(personClaims(['orders:write']));
        const response: Response = await fetch(`${base}/orders`, { headers: { authorization: `Bearer ${token}` } });

        expect(response.status).toBe(403);
        expect(await response.text()).not.toContain('orders:read');
    });

    it('SC-AUTH-15 — the caller with the right reaches the operation and reads its rights', async () => {
        const token: string = await realm.sign(personClaims(['orders:read', 'uma_protection']));
        const response: Response = await fetch(`${base}/orders`, { headers: { authorization: `Bearer ${token}` } });

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ subject: 'p-1', rights: ['orders:read'] });
    });

    it('SC-AUTH-15 — an operation open to anyone signed in takes a token without rights', async () => {
        const token: string = await realm.sign(personClaims([]));

        expect((await fetch(`${base}/orders/me`, { headers: { authorization: `Bearer ${token}` } })).status).toBe(200);
        expect((await fetch(`${base}/orders/me`)).status).toBe(401);
    });

    it('SC-AUTH-15 — an open operation answers without a token and gets no caller', async () => {
        const response: Response = await fetch(`${base}/orders/health`);

        expect(await response.text()).toBe('ok');
    });

    it('SC-AUTH-71 — an operation of the application reads the options the module was set up with', async () => {
        const response: Response = await fetch(`${base}/entry`);

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual(clientSettingsOf({ issuer: TEST_ISSUER, clientId: TEST_CLIENT, catalog: ['orders:read'] }));
    });

    it('SC-AUTH-11 — an application with an undeclared operation does not start', async () => {
        await expect(start(realm, [ForgottenController])).rejects.toThrow('ForgottenController.open — none');
    });
});
