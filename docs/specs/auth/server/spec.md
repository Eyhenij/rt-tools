# The server of the entry module

**Status:** in force · **Revision:** 2026-10-05 · **Scenario prefix:** `SC-AUTH`
**Depends on:** `auth/contract`
**Laws:** `verifiability`, `observability`
**Procedures:** none — the package checks the procedures of the application that installs it

A subdomain of the entry module: how the server of an admin checks the token of a person and the
right of each operation. The package `@rt-tools/auth-server` holds it for NestJS controllers and for
Connect procedures.

## Why

Every admin server answers two questions on every call: who is calling, and may they do this. A
server that answers them its own way either opens an operation by mistake or refuses a right
person. One package answers both the same way for every admin.

## Terminology

| Term                  | What it is                                                                        |
| --------------------- | --------------------------------------------------------------------------------- |
| An access declaration | A mark on an operation: open to all, open to anyone signed in, or open by a right |
| The token check       | Signature by a realm key, the realm issuer, the term and the client of the admin  |
| The catalog sync      | Sending the rights of the admin to Keycloak as client roles at start              |

### What it is called in the interface

Not applicable: the package has no screens.

## Rules

- **An operation without an access declaration stops the application at start.** Otherwise a
  forgotten declaration shows only to the person who calls the operation.
- **An operation with two access declarations stops the application at start.** Otherwise the
  reader cannot tell which of the two holds.
- **A token is accepted only from the realm, within its term and for the client of this admin.**
  The realm signs it by its key and names itself the issuer. Otherwise a token of another admin of
  the same realm opens this one.
- **A call without an accepted token is refused as not signed in, a call without the right as not
  allowed.** The first is cured by signing in, the second is not, and the person is told which.
- **A refusal does not name the missing right or what in the token did not match.** Otherwise the
  answers tell a stranger which rights exist and which tokens come close.
- **The catalog sync creates the roles Keycloak lacks and removes none.** Removing a role takes it
  from every person who holds it; an extra role is named in the log.
- **A Connect procedure is checked by the same token check as a controller.** Otherwise one server
  holds two checks that drift apart.
- **A missing realm setting stops the start and is named.** Otherwise the server checks tokens
  against a guess, and the first refused person learns of it instead of whoever started the server.
- **The catalog goes to Keycloak only when the environment holds the secret of the sync client.**
  The realm of the sync is taken from the issuer, so the two cannot name different realms.

## What is out of scope

- The session in the browser — the client package.
- The organization of the caller — the application reads it from its own database.

## Contract

Not applicable: the package serves no procedures. Its decorators, guard, interceptor and options
are listed in the package README.

### Refusal codes

Not applicable: the refusals are HTTP 401 and 403 for a controller, `unauthenticated` and
`permission_denied` for a Connect procedure.

## Data

Not applicable.

## Screens and states

Not applicable.

## Cross-cutting requirements

### Locales

Not applicable: the refusals carry no text for a person.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

Each admin server names its own client; a token of another client is refused.

## Decisions

- **The keys of the realm are fetched by the key set address and cached.** A new key of the realm
  is picked up without a restart. Rejected: a key in the configuration — a key rotation would stop
  every admin.

## Open questions

None.

## History of changes

- 2026-10-05 — the server package, task RT-2532.
- 2026-10-06 — the options are read from the environment by the package, task RT-2576.
