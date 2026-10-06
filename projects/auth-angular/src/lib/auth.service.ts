import { computed, DOCUMENT, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { callerFromClaims, ICaller, IKeycloakClaims } from '@rt-tools/auth-contract';

import { IRtAuthConfig, keycloakInitOptions, RT_AUTH_CONFIG, RT_AUTH_ORGANIZATION } from './auth.config';
import { RT_KEYCLOAK, TRtKeycloak } from './keycloak';
import { meetsRequirement, TRtPermissionRequirement } from './requirement';
import { isTokenRecipient } from './token-recipient';

/** A token that expires sooner than this is refreshed before a request leaves. */
export const MIN_VALIDITY_SECONDS: number = 30;

/** The minimal validity that makes the adapter refresh the token whatever is left of it. */
const FORCE_REFRESH: number = -1;

/**
 * The session of the person in the admin.
 *
 * The caller is read by the contract for the client of the admin, so a section is hidden by the
 * same right the server refuses by. The tokens stay in the adapter, in the memory of the page.
 */
@Injectable()
export class RtAuthService {
    readonly #keycloak: TRtKeycloak = inject(RT_KEYCLOAK);
    readonly #config: IRtAuthConfig = inject(RT_AUTH_CONFIG);
    readonly #organization: Signal<string | null> | null = inject(RT_AUTH_ORGANIZATION, { optional: true });
    readonly #document: Document = inject(DOCUMENT);
    readonly #caller: WritableSignal<ICaller | null> = signal<ICaller | null>(null);

    /** The person signed in, with the rights of the admin client; `null` while nobody is. */
    public readonly caller: Signal<ICaller | null> = this.#caller.asReadonly();
    public readonly authenticated: Signal<boolean> = computed((): boolean => this.#caller() !== null);

    /** Starts the adapter and brings the session back through the silent check. */
    public async init(): Promise<void> {
        this.#keycloak.onAuthSuccess = (): void => this.#read();
        this.#keycloak.onAuthRefreshSuccess = (): void => this.#read();
        this.#keycloak.onAuthLogout = (): void => this.#caller.set(null);
        this.#keycloak.onTokenExpired = (): void => void this.refresh();
        await this.#keycloak.init(keycloakInitOptions(this.#config, this.#document.baseURI));
        this.#read();
    }

    /** Whether the caller meets the requirement. */
    public meets(requirement: TRtPermissionRequirement): boolean {
        return meetsRequirement(this.#caller(), requirement);
    }

    /** Whether a request to the address carries the token. */
    public isRecipient(url: string): boolean {
        return isTokenRecipient(url, this.#config.tokenRecipients, this.#document.baseURI);
    }

    /** Sends the person to the Keycloak entry; they come back to the address, by default this page. */
    public login(redirectUri?: string): Promise<void> {
        return this.#keycloak.login(redirectUri === undefined ? undefined : { redirectUri });
    }

    /** Ends the session in Keycloak, not only on the page. */
    public logout(): Promise<void> {
        return this.#keycloak.logout({ redirectUri: this.#config.logoutRedirectUri ?? this.#document.baseURI });
    }

    /** The token for a request, refreshed when it expires soon; `null` when nobody is signed in. */
    public async token(): Promise<string | null> {
        if (!this.authenticated()) {
            return null;
        }
        return this.#update(MIN_VALIDITY_SECONDS);
    }

    /** A fresh token whatever is left of the current one; `null` when the session has ended. */
    public refresh(): Promise<string | null> {
        return this.#update(FORCE_REFRESH);
    }

    /** The headers of a request to a recipient: the token and the current organization, if any. */
    public requestHeaders(token: string): Record<string, string> {
        const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
        const organization: string | null = this.#organization?.() ?? null;
        if (this.#config.organizationHeader !== undefined && organization !== null && organization !== '') {
            headers[this.#config.organizationHeader] = organization;
        }
        return headers;
    }

    async #update(minValidity: number): Promise<string | null> {
        try {
            await this.#keycloak.updateToken(minValidity);
        } catch {
            this.#caller.set(null);
            return null;
        }
        return this.#keycloak.token ?? null;
    }

    #read(): void {
        const claims: IKeycloakClaims | undefined = this.#keycloak.authenticated
            ? (this.#keycloak.tokenParsed as IKeycloakClaims | undefined)
            : undefined;
        this.#caller.set(claims === undefined ? null : callerFromClaims(claims, this.#config.clientId));
    }
}
