# @rt-tools/auth-import

[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](https://github.com/Eyhenij/rt-tools/blob/main/LICENSE)

Moves the people of an existing application into Keycloak with their password hashes. The
application exports its users to a file in its own repository, and the command loads the file into
the realm. A person whose hash Keycloak can verify enters with the old password on the first day.

## Which hashes move

| Hash in the application                          | In Keycloak                                         |
| ------------------------------------------------ | --------------------------------------------------- |
| argon2id, argon2i, argon2d in PHC                | moves as it is, the old password enters             |
| pbkdf2 with SHA-1, SHA-256, SHA-512              | moves as it is, the old password enters             |
| scrypt, bcrypt, any other, none                  | the person moves without a password and sets a new one |

Keycloak verifies argon2 and pbkdf2 without extensions. scrypt and bcrypt would need a Java
extension of Keycloak, and the module has none of its own. Such a person gets the Keycloak action
"update password": with `--send-actions-email` the command sends them the Keycloak letter with a
link, and without it they set the password through "forgot password" on the entry screen.

## The file of users

A JSON list, one object per person:

```json
[
    {
        "email": "anna@example.com",
        "firstName": "Anna",
        "lastName": "Ivanova",
        "emailVerified": true,
        "passwordHash": "$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$…",
        "roles": { "orders-admin": ["orders:read", "orders:write"] }
    },
    {
        "email": "boris@example.com",
        "firstName": "Boris",
        "lastName": "Petrov",
        "emailVerified": true,
        "password": { "algorithm": "pbkdf2-sha256", "iterations": 27500, "salt": "<base64>", "hash": "<base64>" }
    }
]
```

| Field           | What it is                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------- |
| `email`         | The address; it becomes the username too                                                    |
| `firstName`     | Without it Keycloak asks for the name at the first entry                                    |
| `lastName`      | The same                                                                                    |
| `emailVerified` | Without `true` Keycloak asks to verify the address at the first entry                       |
| `passwordHash`  | A hash in PHC: `$argon2id$…`, `$pbkdf2-sha256$i=…$…$…`; passlib's `$pbkdf2-sha256$29000$…` too |
| `password`      | A pbkdf2 hash part by part, for an application that keeps pbkdf2 in its own form            |
| `roles`         | The rights by client of an admin; each role must already exist in the client                |

A file with an error is refused whole before the first write: the command names every broken entry
and every role the client does not have.

## Running

The realm needs a confidential client with a service account and the roles `manage-users` and
`view-clients` of `realm-management`. The secret goes in the environment, not in the arguments: an
argument stays in the history of the terminal.

```bash
export RT_AUTH_IMPORT_CLIENT_SECRET=…
npx rt-auth-import --url https://auth.example.com --realm rt --client-id rt-user-import --file users.json --send-actions-email
```

```
added 120, skipped as already in the realm 3
must set a password 40, got the letter 40
  without a password: boris@example.com
```

A second run skips the people already in the realm and does not touch their passwords: a person
may have changed the password since. A letter goes only to the people added by the run.

## From code

```ts
import { importUsers, KeycloakAdmin, readUsers, realmClients, unknownRoles } from '@rt-tools/auth-import';
```

The agreement of the package is `docs/specs/auth/import/`.
