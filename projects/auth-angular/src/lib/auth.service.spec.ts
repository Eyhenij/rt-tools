import { claimsWith, KeycloakDouble, startAuth, TEST_CONFIG } from '../testing/keycloak-double';
import { RtAuthService } from './auth.service';

/** Puts the code answer of Keycloak into the address, as the return from the entry form does. */
function onTheReturnFromTheForm(): void {
    window.history.replaceState(null, '', `${window.location.pathname}#state=s-1&session_state=k-1&code=c-1`);
}

describe('RtAuthService', () => {
    afterEach((): void => {
        window.history.replaceState(null, '', window.location.pathname);
    });

    it('SC-AUTH-26 — the adapter starts with PKCE, the silent check and no storage', async () => {
        const double: KeycloakDouble = new KeycloakDouble();

        await startAuth(double);

        expect(double.initCalls).toHaveLength(1);
        const options: Record<string, unknown> = { ...double.initCalls[0] };
        expect(options['pkceMethod']).toBe('S256');
        expect(options['onLoad']).toBe('check-sso');
        expect(options['silentCheckSsoRedirectUri']).toBe(new URL('silent-check-sso.html', document.baseURI).href);
        expect(options).not.toHaveProperty('token');
        expect(options).not.toHaveProperty('refreshToken');
        expect(options).not.toHaveProperty('idToken');
    });

    it('SC-AUTH-27 — the caller has the rights of the admin client only', async () => {
        const double: KeycloakDouble = new KeycloakDouble();
        double.signIn(claimsWith(['orders:read', 'uma_protection'], { 'another-admin': ['users:write'] }));

        const auth: RtAuthService = await startAuth(double);

        expect(auth.authenticated()).toBe(true);
        expect(auth.caller()?.subject).toBe('person-1');
        expect([...(auth.caller()?.permissions ?? [])]).toEqual(['orders:read']);
    });

    it('SC-AUTH-27 — nobody is the caller when the silent check finds no session', async () => {
        const auth: RtAuthService = await startAuth(new KeycloakDouble());

        expect(auth.authenticated()).toBe(false);
        expect(auth.caller()).toBeNull();
    });

    it('SC-AUTH-76 — a silent check that never answers lets the admin start with nobody signed in', async () => {
        const double: KeycloakDouble = new KeycloakDouble();
        double.silentCheckSilent = true;

        const auth: RtAuthService = await startAuth(double, { ...TEST_CONFIG, silentCheckTimeoutMs: 10 });

        expect(double.initCalls).toHaveLength(1);
        expect(auth.authenticated()).toBe(false);
    });

    it('SC-AUTH-97 — the exchange of the code is not cut by the limit of the silent check', async () => {
        onTheReturnFromTheForm();
        const double: KeycloakDouble = new KeycloakDouble();
        double.claimsOnStart = claimsWith(['orders:read']);
        double.initDelayMs = 50;

        const auth: RtAuthService = await startAuth(double, { ...TEST_CONFIG, silentCheckTimeoutMs: 10 });

        expect(double.initCalls[0]).not.toHaveProperty('silentCheckSsoRedirectUri');
        expect(auth.authenticated()).toBe(true);
    });

    it('SC-AUTH-98 — an exchange of the code that hangs past its own limit lets the admin start with nobody signed in', async () => {
        onTheReturnFromTheForm();
        const double: KeycloakDouble = new KeycloakDouble();
        double.silentCheckSilent = true;

        const auth: RtAuthService = await startAuth(double, { ...TEST_CONFIG, codeExchangeTimeoutMs: 10 });

        expect(double.initCalls).toHaveLength(1);
        expect(auth.authenticated()).toBe(false);
    });

    it('SC-AUTH-76 — without the code answer a late start is cut by the limit of the silent check', async () => {
        const double: KeycloakDouble = new KeycloakDouble();
        double.claimsOnStart = claimsWith(['orders:read']);
        double.initDelayMs = 50;

        const auth: RtAuthService = await startAuth(double, { ...TEST_CONFIG, silentCheckTimeoutMs: 10 });

        expect(double.initCalls[0].silentCheckSsoRedirectUri).toBe(new URL('silent-check-sso.html', document.baseURI).href);
        expect(auth.authenticated()).toBe(false);
    });

    it('SC-AUTH-37 — the exit goes through Keycloak', async () => {
        const double: KeycloakDouble = new KeycloakDouble();
        double.signIn(claimsWith(['orders:read']));
        const auth: RtAuthService = await startAuth(double, { ...TEST_CONFIG, logoutRedirectUri: 'https://admin.test/bye' });

        await auth.logout();

        expect(double.logoutCalls).toEqual([{ redirectUri: 'https://admin.test/bye' }]);
    });

    it('SC-AUTH-37 — without an address of its own the exit returns to the base of the admin', async () => {
        const double: KeycloakDouble = new KeycloakDouble();
        double.signIn(claimsWith(['orders:read']));
        const auth: RtAuthService = await startAuth(double);

        await auth.logout();

        expect(double.logoutCalls).toEqual([{ redirectUri: document.baseURI }]);
    });

    it('a refresh that fails ends the session on the page', async () => {
        const double: KeycloakDouble = new KeycloakDouble();
        double.signIn(claimsWith(['orders:read']));
        const auth: RtAuthService = await startAuth(double);
        double.refreshFails = true;

        expect(await auth.refresh()).toBeNull();
        expect(auth.caller()).toBeNull();
    });
});
