# @rt-tools/auth-server

[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Eyhenij/rt-tools/blob/main/LICENSE)

The server side of the entry module: the Keycloak token check, an access declaration on every
operation and the sync of the admin's rights to Keycloak. One check serves NestJS controllers and
Connect procedures.

## Connecting

```ts
import { definePermissions } from '@rt-tools/auth-contract';
import { AuthServerModule } from '@rt-tools/auth-server';

export const RIGHTS = definePermissions({ orders: ['read', 'write'] });

@Module({
    imports: [
        AuthServerModule.forRoot({
            issuer: 'https://sso.example.com/realms/rt',
            clientId: 'orders-admin',
            catalog: RIGHTS,
            sync: { baseUrl: 'https://sso.example.com', realm: 'rt', syncClientId: 'rt-catalog-sync', syncClientSecret: process.env.SYNC_SECRET },
        }),
    ],
})
export class AppModule {}
```

The module puts a guard on every route. At start it checks that every operation declares exactly
one access. When `sync` is given, it also sends the catalog to Keycloak.

The same options are read from the environment by `authOptionsFromEnv`:

```ts
AuthServerModule.forRoot(authOptionsFromEnv(process.env, RIGHTS));
```

`AUTH_ISSUER` and `AUTH_CLIENT_ID` are required, and a missing one stops the start by name.
`AUTH_SYNC_SECRET` turns the catalog sync on; the Keycloak address and the realm are taken from
the issuer, and `AUTH_SYNC_CLIENT_ID` names the sync client when it is not `rt-catalog-sync`.

## Access

```ts
@Get()
@PermittedOperation('orders:read')
public list(@CurrentCaller() caller: ICaller): Order[] { … }
```

| Decorator                         | The operation is open to      |
| --------------------------------- | ----------------------------- |
| `@OpenOperation()`              | everyone, without a token     |
| `@SignedInOperation()`            | anyone with an accepted token |
| `@PermittedOperation(permission)` | a caller with the right       |

An operation with no declaration or with two stops the start and is named. A call without an
accepted token gets 401, a call without the right gets 403. Neither names the right.

A token is accepted when the realm signed it by its key and named itself the issuer. Its term must
hold, and it must be issued to the client of this admin (`azp`). The keys are fetched from the
realm and cached.

## Connect

```ts
const entries = connectAccessEntries(OrdersService, {
    listOrders: { kind: 'permission', permission: 'orders:read' },
    health: { kind: 'public' },
});
const interceptor = createAuthInterceptor(app.get(AUTH_TOKEN_VERIFIER), entries);
```

The map names every method of the service exactly once, otherwise `connectAccessEntries` throws.
The refusals are `unauthenticated` and `permission_denied`. A procedure reads the caller with
`context.values.get(CONNECT_CALLER)`.

## The catalog sync

`syncPermissionCatalog` creates the roles the client of the admin lacks and removes none. Removing
a role takes it from every person who holds it. The rights Keycloak holds beyond the catalog are
named in the log. The sync client needs a service account with `view-clients` and `manage-clients`.

## Connecting it to an application

The order of the whole connection is in the guide of the module.
It covers Keycloak, the server, the admin, the entry screens and the move of people:
[docs/auth-integration.md](https://github.com/Eyhenij/rt-tools/blob/main/docs/auth-integration.md).
