# @rt-tools/auth-contract

[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Eyhenij/rt-tools/blob/main/LICENSE)

Rights, the caller and the reading of a Keycloak token — the part of the entry module that the
client and the server share. No framework: the package depends on `tslib` and ships CommonJS and
ESM, so an Angular client and a NestJS server read the same rights the same way.

## A right

A right is a string `resource:action`, for example `orders:write`. In Keycloak it is a client role
of the admin it belongs to.

```ts
import { definePermissions } from '@rt-tools/auth-contract';

export const ORDERS_RIGHTS = definePermissions({
    orders: ['read', 'write'],
    people: ['invite'],
});
// ['orders:read', 'orders:write', 'people:invite'], typed as a union of these literals
```

The catalog is the only place a right is written. The checks take rights from it, and the server
package sends the same list to Keycloak as client roles. A part outside the shape — an upper letter,
a space, a second colon — throws at the start of the application.

## The caller

```ts
import { callerFromClaims, hasPermission } from '@rt-tools/auth-contract';

const caller = callerFromClaims(claims, 'orders-admin');
hasPermission(caller, 'orders:write');
```

`callerFromClaims` takes the claims of a verified access token and the client id of the admin. The
caller gets the roles of that client only, and only those that have the shape of a right: the
roles Keycloak adds itself are dropped. The package does not verify the token — the server package
does that before the claims get here.

| Function             | What it answers                                  |
| -------------------- | ------------------------------------------------ |
| `isPermission`       | whether a value is a right                       |
| `parsePermission`    | the two parts of a right, or `null`              |
| `definePermissions`  | the catalog of one admin                         |
| `callerFromClaims`   | the caller of one client                         |
| `hasPermission`      | whether the caller has the right                 |
| `hasEveryPermission` | whether the caller has all the rights            |
| `hasSomePermission`  | whether the caller has at least one of the rights |
