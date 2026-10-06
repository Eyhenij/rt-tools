import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { EnvironmentProviders, Provider, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { claimsWith, KeycloakDouble, startAuth, TEST_CONFIG } from '../testing/keycloak-double';
import { RT_AUTH_ORGANIZATION } from './auth.config';
import { rtAuthInterceptor } from './auth.interceptor';
import { MIN_VALIDITY_SECONDS } from './auth.service';

const HTTP: (Provider | EnvironmentProviders)[] = [provideHttpClient(withInterceptors([rtAuthInterceptor])), provideHttpClientTesting()];
const UNAUTHORIZED: { status: number; statusText: string } = { status: 401, statusText: 'Unauthorized' };

/** Lets the promises of the interceptor settle, so the request reaches the testing backend. */
function settle(): Promise<void> {
    return new Promise<void>((resolve: () => void): void => {
        setTimeout(resolve, 0);
    });
}

async function signedIn(): Promise<{ double: KeycloakDouble; http: HttpClient; backend: HttpTestingController }> {
    const double: KeycloakDouble = new KeycloakDouble();
    double.signIn(claimsWith(['orders:read']));
    await startAuth(double, TEST_CONFIG, HTTP);
    return { double, http: TestBed.inject(HttpClient), backend: TestBed.inject(HttpTestingController) };
}

describe('rtAuthInterceptor', () => {
    it('SC-AUTH-28 — the token goes only to a named recipient', async () => {
        const { http, backend } = await signedIn();

        void firstValueFrom(http.get('/api/orders'));
        void firstValueFrom(http.get('https://foreign.test/data'));
        await settle();

        expect(backend.expectOne('/api/orders').request.headers.get('Authorization')).toBe('Bearer token-1');
        expect(backend.expectOne('https://foreign.test/data').request.headers.has('Authorization')).toBe(false);
    });

    it('SC-AUTH-29 — a token close to its end is refreshed before the request', async () => {
        const { double, http, backend } = await signedIn();

        void firstValueFrom(http.get('/api/orders'));
        await settle();

        expect(double.updateCalls).toEqual([30]);
        expect(MIN_VALIDITY_SECONDS).toBe(30);
        backend.expectOne('/api/orders').flush({});
    });

    it('SC-AUTH-30 — an answer 401 is repeated once with a fresh token', async () => {
        const { http, backend } = await signedIn();

        const answer: Promise<unknown> = firstValueFrom(http.get('/api/orders'));
        await settle();
        backend.expectOne('/api/orders').flush(null, UNAUTHORIZED);
        await settle();
        const repeat: TestRequest = backend.expectOne('/api/orders');
        expect(repeat.request.headers.get('Authorization')).toBe('Bearer token-2');
        repeat.flush({ id: 1 });

        await expect(answer).resolves.toEqual({ id: 1 });
        backend.verify();
    });

    it('SC-AUTH-31 — a second 401 sends the person to the entry', async () => {
        const { double, http, backend } = await signedIn();

        const answer: Promise<unknown> = firstValueFrom(http.get('/api/orders'));
        await settle();
        backend.expectOne('/api/orders').flush(null, UNAUTHORIZED);
        await settle();
        backend.expectOne('/api/orders').flush(null, UNAUTHORIZED);

        await expect(answer).rejects.toMatchObject({ status: 401 });
        expect(double.loginCalls).toHaveLength(1);
        backend.verify();
    });

    it('SC-AUTH-31 — a failed refresh sends the person to the entry without a repeat', async () => {
        const { double, http, backend } = await signedIn();

        const answer: Promise<unknown> = firstValueFrom(http.get('/api/orders'));
        await settle();
        double.refreshFails = true;
        backend.expectOne('/api/orders').flush(null, UNAUTHORIZED);

        await expect(answer).rejects.toMatchObject({ status: 401 });
        expect(double.loginCalls).toHaveLength(1);
        backend.verify();
    });

    it('SC-AUTH-36 — the organization goes in the named header', async () => {
        const organization: WritableSignal<string | null> = signal<string | null>('org-7');
        const double: KeycloakDouble = new KeycloakDouble();
        double.signIn(claimsWith(['orders:read']));
        await startAuth(double, { ...TEST_CONFIG, organizationHeader: 'X-Organization' }, [
            ...HTTP,
            { provide: RT_AUTH_ORGANIZATION, useValue: organization },
        ]);
        const http: HttpClient = TestBed.inject(HttpClient);
        const backend: HttpTestingController = TestBed.inject(HttpTestingController);

        void firstValueFrom(http.get('/api/first'));
        await settle();
        organization.set(null);
        void firstValueFrom(http.get('/api/second'));
        await settle();

        const first: TestRequest = backend.expectOne('/api/first');
        expect(first.request.headers.get('Authorization')).toBe('Bearer token-1');
        expect(first.request.headers.get('X-Organization')).toBe('org-7');
        const second: TestRequest = backend.expectOne('/api/second');
        expect(second.request.headers.get('Authorization')).toBe('Bearer token-1');
        expect(second.request.headers.has('X-Organization')).toBe(false);
    });
});
