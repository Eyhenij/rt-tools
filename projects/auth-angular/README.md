# @rt-tools/auth-angular

[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Eyhenij/rt-tools/blob/main/LICENSE)

The entry of an Angular admin through Keycloak: the session, the token in requests, route checks
and blocks shown by a right. The protocol is driven by the official adapter `keycloak-js`; the
rights are read by `@rt-tools/auth-contract`, the same code the server package uses.

## Connecting

```ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRtAuth, rtAuthInterceptor } from '@rt-tools/auth-angular';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRtAuth({
            url: 'https://auth.example.com',
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

The application starts after the silent check has answered, so the first navigation already sees
the session. The start waits for it five seconds at most: past that the admin starts with nobody
signed in, and a Keycloak that is down does not leave a blank page. The page of the silent check ships in the package and is published by the
application next to `index.html`:

```json
{ "glob": "silent-check-sso.html", "input": "node_modules/@rt-tools/auth-angular/src/assets", "output": "/" }
```

| Setting                     | What it is                                                                |
| --------------------------- | ------------------------------------------------------------------------- |
| `url`, `realm`, `clientId`  | Keycloak, the realm and the client of the admin                           |
| `tokenRecipients`           | Origins or paths whose requests carry the token; all others go without it |
| `silentCheckSsoRedirectUri` | The page of the silent check; by default next to the page                 |
| `organizationHeader`        | The header of the current organization; without it nothing is sent        |
| `forbiddenPath`             | Where a person without the rights of a route goes; without it they stay   |
| `logoutRedirectUri`         | Where Keycloak returns after the exit; by default the base of the admin   |
| `silentCheckTimeoutMs`      | How long the start waits for the silent check; by default 5000            |

## The session

```ts
const auth = inject(RtAuthService);
auth.caller(); // ICaller | null — the person and the rights of the admin client
auth.authenticated(); // boolean
auth.login(); // to the Keycloak entry and back to this page
auth.logout(); // ends the session in Keycloak
```

The tokens stay in the adapter, in the memory of the page; nothing goes to the browser storage. A
token that expires within thirty seconds is refreshed before a request. An answer 401 refreshes
the token and repeats the request once; a second 401 or a failed refresh sends the person to the
entry.

## Routes and blocks

```ts
{ path: 'orders', canActivate: [rtAuthGuard], loadComponent: … },
{ path: 'orders/new', canActivate: [rtPermissionGuard({ every: ['orders:write'] })], loadComponent: … },
```

```html
<a *rtIfPermission="'orders:write'">New order</a>
<section *rtIfPermission="{ some: ['orders:read', 'orders:write'] }">…</section>
```

A requirement of several rights always says whether all (`every`) or any (`some`) are needed. A
block follows the rights: a refreshed token that brings a right shows it without a reload.

## The current organization

The organizations live in the database of the application. The application gives the package the
value as a signal, and the package puts it in the header named by `organizationHeader`:

```ts
{ provide: RT_AUTH_ORGANIZATION, useFactory: () => inject(OrganizationStore).currentId }
```

No value means no header.

## Connect

The interceptor of a Connect transport lives in a second entry, so an admin without Connect does
not install it. It is called in an injection context:

```ts
import { rtAuthConnectInterceptor } from '@rt-tools/auth-angular/connect';

createConnectTransport({ baseUrl: '/api', interceptors: [rtAuthConnectInterceptor()] });
```

A refusal Unauthenticated repeats a unary call once with a fresh token. A streaming call is not
repeated: its messages are already gone.

## What it exports

| Symbol                     | What it is                                               |
| -------------------------- | -------------------------------------------------------- |
| `provideRtAuth`            | the whole entry in one call                              |
| `RtAuthService`            | the session: caller, entry, exit, token                  |
| `rtAuthInterceptor`        | the token and the organization on HttpClient requests    |
| `rtAuthGuard`              | a route that needs an entry                              |
| `rtPermissionGuard`        | a route that needs rights                                |
| `RtIfPermissionDirective`  | a block shown by a right                                 |
| `RT_AUTH_ORGANIZATION`     | the current organization, given by the application       |
| `RT_KEYCLOAK`              | the adapter; a test puts a double in its place           |
| `isTokenRecipient`         | whether an address takes the token                       |
| `meetsRequirement`         | whether a caller meets a requirement                     |
| `rtAuthConnectInterceptor` | the token on Connect calls, from `/connect`              |

The agreement of the package is `docs/specs/auth/angular/`.

## Connecting it to an application

The order of the whole connection is in the guide of the module.
It covers Keycloak, the server, the admin, the entry screens and the move of people:
[docs/auth-integration.md](https://github.com/Eyhenij/rt-tools/blob/main/docs/auth-integration.md).
