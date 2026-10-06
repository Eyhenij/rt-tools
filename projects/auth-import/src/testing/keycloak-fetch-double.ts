import { IKeycloakUser } from '../lib/import-user';

interface IRecordedRequest {
    readonly method: string;
    readonly path: string;
}

/** A person of the realm with the client roles given to them. */
type TStoredUser = IKeycloakUser & { readonly id: string; readonly clientRoles: Record<string, string[]> };
type TRoute = (match: RegExpExecArray, url: URL, init: RequestInit) => Response;

const TOKEN: RegExp = /\/protocol\/openid-connect\/token$/;
const ADMIN: RegExp = /^\/admin\/realms\/[^/]+/;
const REALM_URL: string = 'https://auth.test/admin/realms/rt';

/**
 * A hand-written double of the Keycloak admin API over one realm: it keeps the clients with their
 * roles and the people, answers a second creation of a person with 409 the way Keycloak does, and
 * records every request and every letter.
 */
export class KeycloakFetchDouble {
    readonly #clients: Map<string, Set<string>>;
    readonly #users: Map<string, TStoredUser> = new Map<string, TStoredUser>();
    readonly #routes: readonly [string, RegExp, TRoute][] = [
        ['GET', /^\/clients$/, (_match: RegExpExecArray, url: URL): Response => this.#client(url.searchParams.get('clientId') ?? '')],
        ['GET', /^\/clients\/uuid-(.+)\/roles$/, (match: RegExpExecArray): Response => this.#roles(match[1] ?? '')],
        ['POST', /^\/users$/, (_match: RegExpExecArray, _url: URL, init: RequestInit): Response => this.#create(String(init.body))],
        [
            'POST',
            /^\/users\/(.+)\/role-mappings\/clients\/uuid-(.+)$/,
            (match: RegExpExecArray, _url: URL, init: RequestInit): Response => this.#grant(match, String(init.body)),
        ],
        [
            'PUT',
            /^\/users\/(.+)\/execute-actions-email$/,
            (match: RegExpExecArray, _url: URL, init: RequestInit): Response => this.#letter(match[1] ?? '', String(init.body)),
        ],
    ];

    public readonly requests: IRecordedRequest[] = [];
    public readonly letters: { userId: string; actions: string[] }[] = [];
    public readonly secrets: string[] = [];

    constructor(clients: Record<string, readonly string[]> = {}) {
        this.#clients = new Map<string, Set<string>>(
            Object.entries(clients).map(([id, roles]: [string, readonly string[]]): [string, Set<string>] => [id, new Set<string>(roles)])
        );
    }

    /** The people of the realm by username. */
    public users(): ReadonlyMap<string, TStoredUser> {
        return this.#users;
    }

    /** The requests that change the realm. */
    public writes(): IRecordedRequest[] {
        return this.requests.filter((request: IRecordedRequest): boolean => request.method !== 'GET' && !TOKEN.test(request.path));
    }

    public readonly fetch: typeof fetch = (input: string | URL | Request, init: RequestInit = {}): Promise<Response> => {
        const url: URL = new URL(String(input));
        const method: string = init.method ?? 'GET';
        this.requests.push({ method, path: url.pathname });
        if (TOKEN.test(url.pathname)) {
            this.secrets.push(new URLSearchParams(String(init.body)).get('client_secret') ?? '');
            return Promise.resolve(Response.json({ access_token: 'admin-token', expires_in: 300 }));
        }
        const path: string = url.pathname.replace(ADMIN, '');
        for (const [routeMethod, pattern, route] of this.#routes) {
            const match: RegExpExecArray | null = routeMethod === method ? pattern.exec(path) : null;
            if (match !== null) {
                return Promise.resolve(route(match, url, init));
            }
        }
        return Promise.resolve(new Response('not found', { status: 404 }));
    };

    #client(clientId: string): Response {
        return Response.json(this.#clients.has(clientId) ? [{ id: `uuid-${clientId}` }] : []);
    }

    #roles(clientId: string): Response {
        return Response.json(
            [...(this.#clients.get(clientId) ?? [])].map((name: string): { id: string; name: string } => ({ id: `role-${name}`, name }))
        );
    }

    #create(raw: string): Response {
        const user: IKeycloakUser = JSON.parse(raw) as IKeycloakUser;
        if (this.#users.has(user.username)) {
            return Response.json({ errorMessage: 'User exists with same username' }, { status: 409 });
        }
        const id: string = `user-${this.#users.size + 1}`;
        this.#users.set(user.username, { ...user, id, clientRoles: {} });
        return new Response(null, { status: 201, headers: { location: `${REALM_URL}/users/${id}` } });
    }

    #grant(match: RegExpExecArray, raw: string): Response {
        const user: TStoredUser | undefined = [...this.#users.values()].find((each: TStoredUser): boolean => each.id === match[1]);
        if (user === undefined) {
            return new Response('no such user', { status: 404 });
        }
        const names: string[] = (JSON.parse(raw) as { name: string }[]).map((role: { name: string }): string => role.name);
        user.clientRoles[match[2] ?? ''] = [...(user.clientRoles[match[2] ?? ''] ?? []), ...names];
        return new Response(null, { status: 204 });
    }

    #letter(userId: string, body: string): Response {
        this.letters.push({ userId, actions: JSON.parse(body) as string[] });
        return new Response(null, { status: 204 });
    }
}
