import { Component, EnvironmentProviders } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { claimsWith, KeycloakDouble, startAuth, TEST_CONFIG } from '../testing/keycloak-double';
import { rtAuthGuard, rtPermissionGuard } from './auth.guards';

@Component({ selector: 'rt-test-page', template: '' })
class TestPageComponent {}

const ROUTES: EnvironmentProviders = provideRouter([
    { path: 'orders', component: TestPageComponent, canActivate: [rtAuthGuard] },
    { path: 'all', component: TestPageComponent, canActivate: [rtPermissionGuard({ every: ['orders:read', 'orders:write'] })] },
    { path: 'any', component: TestPageComponent, canActivate: [rtPermissionGuard({ some: ['orders:read', 'orders:write'] })] },
    { path: 'forbidden', component: TestPageComponent },
]);

describe('route checks', () => {
    it('SC-AUTH-33 — a route that needs an entry sends a stranger to Keycloak', async () => {
        const double: KeycloakDouble = new KeycloakDouble();
        await startAuth(double, TEST_CONFIG, [ROUTES]);

        const opened: boolean = await TestBed.inject(Router).navigateByUrl('/orders?page=2');

        expect(opened).toBe(false);
        expect(double.loginCalls).toEqual([{ redirectUri: new URL('/orders?page=2', document.baseURI).href }]);
    });

    it('SC-AUTH-33 — a signed-in person opens the route', async () => {
        const double: KeycloakDouble = new KeycloakDouble();
        double.signIn(claimsWith([]));
        await startAuth(double, TEST_CONFIG, [ROUTES]);

        expect(await TestBed.inject(Router).navigateByUrl('/orders')).toBe(true);
        expect(double.loginCalls).toHaveLength(0);
    });

    it('SC-AUTH-34 — a route that needs rights names all or any', async () => {
        const double: KeycloakDouble = new KeycloakDouble();
        double.signIn(claimsWith(['orders:read']));
        await startAuth(double, { ...TEST_CONFIG, forbiddenPath: '/forbidden' }, [ROUTES]);
        const router: Router = TestBed.inject(Router);

        await router.navigateByUrl('/all');
        expect(router.url).toBe('/forbidden');

        expect(await router.navigateByUrl('/any')).toBe(true);
        expect(router.url).toBe('/any');
    });

    it('SC-AUTH-34 — without an address for a refusal the person stays where they were', async () => {
        const double: KeycloakDouble = new KeycloakDouble();
        double.signIn(claimsWith(['orders:read']));
        await startAuth(double, TEST_CONFIG, [ROUTES]);
        const router: Router = TestBed.inject(Router);
        await router.navigateByUrl('/any');

        expect(await router.navigateByUrl('/all')).toBe(false);
        expect(router.url).toBe('/any');
    });
});
