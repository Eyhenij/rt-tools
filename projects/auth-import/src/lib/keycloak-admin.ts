import { IKeycloakUser } from './import-user.js';

/** What the command needs to reach the admin API of a realm. */
export interface IKeycloakAdminOptions {
    readonly url: string;
    readonly realm: string;
    readonly clientId: string;
    readonly clientSecret: string;
    /** The HTTP client; a test puts a double in its place. */
    readonly fetch?: typeof fetch;
}

/** A role of a client the way the role mapping takes it. */
export interface IClientRole {
    readonly id: string;
    readonly name: string;
}

/** A client of the realm with its roles by name. */
export interface IRealmClient {
    readonly id: string;
    readonly roles: ReadonlyMap<string, IClientRole>;
}

interface IToken {
    readonly value: string;
    readonly expiresAt: number;
}

/** A token is taken anew this long before it ends: a request must not leave with an expired one. */
const TOKEN_MARGIN_MS: number = 30_000;
const CONFLICT: number = 409;

/**
 * The admin API of one realm, entered by the import client with its secret. It needs only the
 * roles `manage-users` and `view-clients`: the partial import of the realm would ask for the
 * management of the whole realm. A token ends in minutes and an import of many people lasts
 * longer, so a token is taken anew before it ends.
 */
export class KeycloakAdmin {
    readonly #options: IKeycloakAdminOptions;
    readonly #fetch: typeof fetch;
    #token: IToken | null = null;

    constructor(options: IKeycloakAdminOptions) {
        this.#options = options;
        this.#fetch = options.fetch ?? fetch;
    }

    /** A client of the realm with its roles; `null` when the realm has no such client. */
    public async client(clientId: string): Promise<IRealmClient | null> {
        const clients: { id: string }[] = (await (await this.#request(`/clients?clientId=${encodeURIComponent(clientId)}`)).json()) as {
            id: string;
        }[];
        const client: { id: string } | undefined = clients.at(0);
        if (client === undefined) {
            return null;
        }
        const roles: IClientRole[] = (await (await this.#request(`/clients/${client.id}/roles`)).json()) as IClientRole[];
        return {
            id: client.id,
            roles: new Map<string, IClientRole>(roles.map((role: IClientRole): [string, IClientRole] => [role.name, role])),
        };
    }

    /**
     * Creates the person and returns the id. A person already in the realm is never overwritten:
     * the answer is `null`, and the caller counts them as skipped.
     */
    public async createUser(user: IKeycloakUser): Promise<string | null> {
        const response: Response = await this.#request('/users', { method: 'POST', body: JSON.stringify(user) }, [CONFLICT]);
        if (response.status === CONFLICT) {
            return null;
        }
        return response.headers.get('location')?.split('/').at(-1) ?? null;
    }

    /** Gives the person the roles of a client. */
    public async addClientRoles(userId: string, client: IRealmClient, roles: readonly IClientRole[]): Promise<void> {
        await this.#request(`/users/${userId}/role-mappings/clients/${client.id}`, { method: 'POST', body: JSON.stringify(roles) });
    }

    /** Sends the person the Keycloak letter with a link to carry out the actions. */
    public async executeActionsEmail(userId: string, actions: readonly string[]): Promise<void> {
        await this.#request(`/users/${userId}/execute-actions-email`, { method: 'PUT', body: JSON.stringify(actions) });
    }

    async #request(path: string, init: RequestInit = {}, allowed: readonly number[] = []): Promise<Response> {
        const response: Response = await this.#fetch(`${this.#options.url}/admin/realms/${this.#options.realm}${path}`, {
            ...init,
            headers: { authorization: `Bearer ${await this.#accessToken()}`, 'content-type': 'application/json' },
        });
        if (!response.ok && !allowed.includes(response.status)) {
            throw new Error(`Keycloak answered ${response.status} to ${init.method ?? 'GET'} ${path}: ${await response.text()}`);
        }
        return response;
    }

    async #accessToken(): Promise<string> {
        if (this.#token !== null && this.#token.expiresAt - TOKEN_MARGIN_MS > Date.now()) {
            return this.#token.value;
        }
        const response: Response = await this.#fetch(`${this.#options.url}/realms/${this.#options.realm}/protocol/openid-connect/token`, {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: this.#options.clientId,
                client_secret: this.#options.clientSecret,
            }),
        });
        if (!response.ok) {
            throw new Error(`Keycloak refused the import client with ${response.status}: ${await response.text()}`);
        }
        const body: { access_token: string; expires_in: number } = (await response.json()) as { access_token: string; expires_in: number };
        this.#token = { value: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };
        return this.#token.value;
    }
}
