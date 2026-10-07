# Connecting the entry module to an application

A step-by-step guide for an agent that connects an admin of another application to the entry
module: the Keycloak sign-in, the session, the rights on the screen and on the server, the entry
screens and the move of existing people. Each package README describes its own package in full;
this guide is the order in which they are put together.

## What the module is made of

| Package                         | Where it goes             | What it gives                                                   |
| ------------------------------- | ------------------------- | --------------------------------------------------------------- |
| `@rt-tools/auth-contract`       | the client and the server | the right `resource:action`, the caller, the reading of a token |
| `@rt-tools/auth-angular`        | the Angular admin         | the entry through Keycloak, the session, route checks, rights   |
| `@rt-tools/auth-server`         | the NestJS server         | the token check, access on every operation, the rights catalog  |
| `@rt-tools/auth-keycloak-theme` | Keycloak                  | the entry screens drawn with the second kit                     |
| `@rt-tools/auth-import`         | a terminal, once          | the move of the application people into Keycloak with passwords |

Before starting, ask npm which versions are published: `npm view @rt-tools/auth-angular version`.
A package npm does not know is not released yet — ask the owner of the module, do not copy its
sources into the application.

## The rules the module stands on

- **A right is a string `resource:action`** — `orders:read`, `orders:write`. Lower-case letters, a
  digit or a hyphen in each part, exactly one colon.
- **Rights live in Keycloak as client roles.** Every admin has its own client, and its rights are
  the roles of that client. A role of another client never reaches this admin.
- **The rights catalog is written once, in code**, by `definePermissions`. The client and the
  server take it from there, and the server sends it to Keycloak.
- **Every server operation declares its access exactly once.** An operation without a declaration
  stops the server start.
- **The screen hides what the person may not do, and the server refuses it.** Hiding a button is
  never the protection; the server answers 403 whatever the screen shows.
- **Organizations stay in the application database.** The module only carries the current one in a
  header the application names.
- **Tokens stay in the memory of the page.** Nothing goes to the browser storage.

## 1. Keycloak: the client of the admin

One Keycloak serves all admins; each admin gets a client in the realm. The client is **public**,
uses the **code flow with PKCE (S256)** and refuses the password grant.

```json
{
    "clientId": "orders-admin",
    "publicClient": true,
    "standardFlowEnabled": true,
    "directAccessGrantsEnabled": false,
    "redirectUris": ["https://orders.example.com/*"],
    "webOrigins": ["https://orders.example.com"],
    "attributes": {
        "pkce.code.challenge.method": "S256",
        "post.logout.redirect.uris": "https://orders.example.com/*"
    }
}
```

- `redirectUris` and `post.logout.redirect.uris` hold every address the admin is served from:
  production and the local port of development. Without the second one the exit ends on a Keycloak
  error page.
- `webOrigins` lets the page call the token endpoint; without it the silent check fails.
- The roles of the client are not written by hand: the server sends them (step 2).

A working sample of a realm with such a client is the stand of this module,
`deploy/auth/realm/rt.json`, raised by `pnpm run serve:auth` in the module repository.

## 2. The server: `@rt-tools/auth-server`

```bash
npm install @rt-tools/auth-server @rt-tools/auth-contract
```

Peer packages: `@nestjs/common` and `@nestjs/core` 11, `reflect-metadata`, `rxjs`; `@connectrpc/connect`
only for Connect.

**The catalog.** One file of the server declares every right of the admin:

```ts
import { definePermissions } from '@rt-tools/auth-contract';

export const ORDERS_RIGHTS = definePermissions({
    orders: ['read', 'write'],
    people: ['invite'],
});
```

**The module.** The issuer and the client come from the environment, never from code:

```ts
import { AuthServerModule } from '@rt-tools/auth-server';

@Module({
    imports: [
        AuthServerModule.forRoot({
            issuer: process.env.AUTH_ISSUER, // https://sso.example.com/realms/rt
            clientId: process.env.AUTH_CLIENT_ID, // orders-admin
            serviceClients: ['orders-tools'], // tokens of these clients carry the roles of orders-admin
            catalog: ORDERS_RIGHTS,
            sync: {
                baseUrl: process.env.AUTH_URL, // https://sso.example.com
                realm: 'rt',
                syncClientId: 'rt-catalog-sync',
                syncClientSecret: process.env.AUTH_SYNC_SECRET,
            },
        }),
    ],
})
export class AppModule {}
```

Fail the start when `AUTH_ISSUER` or `AUTH_CLIENT_ID` is missing: a server that starts without them
refuses every call and looks broken in another place.

**Access on every operation.**

```ts
@Get()
@PermittedOperation('orders:read')
public list(@CurrentCaller() caller: ICaller): Order[] { … }

@Get('health')
@OpenOperation()
public health(): string { return 'ok'; }
```

| Decorator                         | Who may call                  |
| --------------------------------- | ----------------------------- |
| `@OpenOperation()`                | everyone, without a token     |
| `@SignedInOperation()`            | anyone with an accepted token |
| `@PermittedOperation(permission)` | a caller holding the right    |

No token or a bad one — 401; no right — 403. Neither names the right.

**Connect procedures** take a map that names every method of the service once:

```ts
const entries = connectAccessEntries(OrdersService, {
    listOrders: { kind: 'permission', permission: 'orders:read' },
    health: { kind: 'public' },
});
const interceptor = createAuthInterceptor(app.get(AUTH_TOKEN_VERIFIER), entries);
```

A procedure reads the caller by `context.values.get(CONNECT_CALLER)`.

**The catalog sync.** With `sync` given, the server creates in Keycloak the roles its client lacks
and removes none: removing a role would take it from every person who holds it. The sync client is
a confidential client with a service account and the `realm-management` roles `view-clients` and
`manage-clients`. Its secret goes in the environment.

## 3. The admin: `@rt-tools/auth-angular`

```bash
npm install @rt-tools/auth-angular
```

The package brings `@rt-tools/auth-contract` and the official adapter `keycloak-js` itself. Peer
packages: Angular 22 (`@angular/common`, `@angular/core`, `@angular/router`), `rxjs`;
`@connectrpc/connect` only for Connect.

**The application config.**

```ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRtAuth, rtAuthInterceptor } from '@rt-tools/auth-angular';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRtAuth({
            url: 'https://sso.example.com',
            realm: 'rt',
            clientId: 'orders-admin',
            tokenRecipients: ['/api'],
            organizationHeader: 'X-Organization',
            forbiddenPath: '/forbidden',
        }),
        provideHttpClient(withInterceptors([rtAuthInterceptor])),
    ],
};
```

- `tokenRecipients` names the origins or paths that get the token. A request anywhere else goes
  without it — keep the list to the own server.
- The application starts after the silent check has answered, so the first route already knows the
  session.

**The silent check page.** Publish it from the package next to `index.html`, in the `assets` of the
build target:

```json
{ "glob": "silent-check-sso.html", "input": "node_modules/@rt-tools/auth-angular/src/assets", "output": "/" }
```

Without it the session is lost on every reload.

**Routes.**

```ts
{ path: '', canActivate: [rtAuthGuard], loadComponent: … },
{ path: 'orders/new', canActivate: [rtPermissionGuard({ every: ['orders:write'] })], loadComponent: … },
```

A requirement of several rights always says `every` or `some`.

**Blocks in templates.**

```html
<button *rtIfPermission="'orders:write'">New order</button>
<section *rtIfPermission="{ some: ['orders:read', 'orders:write'] }">…</section>
```

**The session.**

```ts
const auth: RtAuthService = inject(RtAuthService);
auth.caller(); // the person and the rights, or null
auth.authenticated();
auth.login();
auth.logout(); // ends the session in Keycloak too
```

A token close to its end is refreshed before a request. A 401 refreshes and repeats the request
once; a second 401 sends the person to the entry.

**The current organization**, when the admin has one:

```ts
{ provide: RT_AUTH_ORGANIZATION, useFactory: () => inject(OrganizationStore).currentId }
```

**Connect** lives in the second entry:

```ts
import { rtAuthConnectInterceptor } from '@rt-tools/auth-angular/connect';

createConnectTransport({ baseUrl: '/api', interceptors: [rtAuthConnectInterceptor()] });
```

**Development.** Proxy `/api` to the local server, add the local port to the client addresses of
step 1, and give the server the same realm in `AUTH_ISSUER`.

## 4. The entry screens: `@rt-tools/auth-keycloak-theme`

The theme is a JAR, not an npm package. It is attached to the GitHub release
`rt-auth-keycloak-theme@<version>` of the module repository.

1. Put the JAR into `/opt/keycloak/providers/` of the Keycloak container.
2. Name the theme in the realm: `"loginTheme": "rt"`.
3. Restart Keycloak: it reads providers only at start.

The screens take the texts of Keycloak in the page language and add no words of their own, so the
realm languages (`internationalizationEnabled`, `supportedLocales`) set the language list. The
Google button appears when the realm holds the Google provider switched on.

## 5. Moving existing people: `@rt-tools/auth-import`

Run once per application, from a terminal, never from the application code.

1. The application exports its people into a JSON file in its own repository: address, names,
   `emailVerified`, the password hash and the rights by client. The format is in the package README.
2. The realm gets a confidential client with a service account and the `realm-management` roles
   `manage-users` and `view-clients`.
3. The roles named in the file must already exist: start the server of step 2 with `sync` first.
4. Run the command with the secret in the environment:

```bash
export RT_AUTH_IMPORT_CLIENT_SECRET=…
npx rt-auth-import --url https://sso.example.com --realm rt --client-id rt-user-import --file users.json --send-actions-email
```

argon2 and pbkdf2 hashes move as they are, and the old password enters. scrypt, bcrypt and the rest
move without a password: the person gets the Keycloak letter to set one. A second run skips the
people already in the realm.

## 6. How to check the connection

- **A person without a session** opening the admin lands on the Keycloak entry screen and comes back
  after the entry.
- **A person without the right** does not see the block, and the server answers 403 to the same call
  made by hand.
- **A request to a foreign address** carries no `Authorization` header.
- **The exit** ends the session: the next opening asks for the password again.
- **A reload** keeps the session without a new entry.
- **The server start** fails and names the operation when one has no access declaration.

The example of the module — `apps/auth-example-admin` and `apps/auth-example-api` — does all of the
above, and its end-to-end suite `apps/auth-example-e2e` checks it.

## Mistakes seen on the way

- **A right written in place instead of the catalog.** It never reaches Keycloak, and nobody holds it.
- **`tokenRecipients` left as a whole origin of a shared host.** The token then leaves to every
  service behind it.
- **The silent check page not published.** The session is lost on every reload.
- **The client role created by hand in the console.** The next sync leaves it, and the catalog no
  longer says what the admin can do.
- **Hiding a block instead of declaring access on the server.** The screen is not a protection.
