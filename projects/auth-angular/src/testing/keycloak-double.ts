import { ApplicationInitStatus, EnvironmentProviders, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IKeycloakClaims } from '@rt-tools/auth-contract';
import type { KeycloakInitOptions, KeycloakLoginOptions, KeycloakLogoutOptions, KeycloakTokenParsed } from 'keycloak-js';

import { IRtAuthConfig } from '../lib/auth.config';
import { provideRtAuth } from '../lib/auth.providers';
import { RtAuthService } from '../lib/auth.service';
import { RT_KEYCLOAK, TRtKeycloak } from '../lib/keycloak';

export const CLIENT_ID: string = 'double-admin';

export const TEST_CONFIG: IRtAuthConfig = {
    url: 'https://auth.test',
    realm: 'rt',
    clientId: CLIENT_ID,
    tokenRecipients: ['/api', 'https://api.test'],
};

/** The claims of a person with the given rights in the admin client and roles in other clients. */
export function claimsWith(permissions: readonly string[], others: Record<string, readonly string[]> = {}): IKeycloakClaims {
    const access: Record<string, { roles: readonly string[] }> = { [CLIENT_ID]: { roles: permissions } };
    for (const [client, roles] of Object.entries(others)) {
        access[client] = { roles };
    }
    return { sub: 'person-1', email: 'person@test', name: 'Person', resource_access: access };
}

/**
 * A hand-written double of the adapter. The session is what the test sets before the start, and
 * every token the double hands out is numbered, so a test sees which one a request carried.
 */
export class KeycloakDouble implements TRtKeycloak {
    #issued: number = 0;

    public authenticated: boolean = false;
    public token: string | undefined = undefined;
    public tokenParsed: KeycloakTokenParsed | undefined = undefined;
    public onAuthSuccess?: () => void;
    public onAuthRefreshSuccess?: () => void;
    public onAuthLogout?: () => void;
    public onTokenExpired?: () => void;
    /** Whether a refresh fails, as when the Keycloak session has ended. */
    public refreshFails: boolean = false;
    /** Whether the silent check never answers, as when Keycloak is down. */
    public silentCheckSilent: boolean = false;
    public readonly initCalls: KeycloakInitOptions[] = [];
    public readonly updateCalls: number[] = [];
    public readonly loginCalls: (KeycloakLoginOptions | undefined)[] = [];
    public readonly logoutCalls: (KeycloakLogoutOptions | undefined)[] = [];

    /** Makes the person signed in with the claims, as Keycloak would after an entry. */
    public signIn(claims: IKeycloakClaims): void {
        this.authenticated = true;
        this.tokenParsed = claims as KeycloakTokenParsed;
        this.token = this.#nextToken();
    }

    /** Gives the person new claims with a refreshed token, as a refresh from Keycloak would. */
    public refreshWith(claims: IKeycloakClaims): void {
        this.tokenParsed = claims as KeycloakTokenParsed;
        this.token = this.#nextToken();
        this.onAuthRefreshSuccess?.();
    }

    public init(options: KeycloakInitOptions): Promise<boolean> {
        this.initCalls.push(options);
        if (this.silentCheckSilent) {
            return new Promise<boolean>((): void => undefined);
        }
        return Promise.resolve(this.authenticated);
    }

    public updateToken(minValidity?: number): Promise<boolean> {
        this.updateCalls.push(minValidity ?? 5);
        if (this.refreshFails) {
            return Promise.reject(new Error('The session has ended'));
        }
        if (minValidity === -1) {
            this.token = this.#nextToken();
            this.onAuthRefreshSuccess?.();
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }

    public login(options?: KeycloakLoginOptions): Promise<void> {
        this.loginCalls.push(options);
        return Promise.resolve();
    }

    public logout(options?: KeycloakLogoutOptions): Promise<void> {
        this.logoutCalls.push(options);
        return Promise.resolve();
    }

    #nextToken(): string {
        this.#issued += 1;
        return `token-${this.#issued}`;
    }
}

/** Raises the package over the double and waits until the start has answered. */
export async function startAuth(
    double: KeycloakDouble,
    config: IRtAuthConfig = TEST_CONFIG,
    providers: (Provider | EnvironmentProviders)[] = []
): Promise<RtAuthService> {
    TestBed.configureTestingModule({
        providers: [provideRtAuth(config), { provide: RT_KEYCLOAK, useValue: double }, ...providers],
    });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    return TestBed.inject(RtAuthService);
}
