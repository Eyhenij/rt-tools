# The contract of the entry module

**Status:** in force · **Revision:** 2026-10-05 · **Scenario prefix:** `SC-AUTH`
**Depends on:** none
**Laws:** `entity-models`, `verifiability`
**Procedures:** none

A subdomain of the entry module: what a right is, who the caller is and how both are read from a
Keycloak token. The package `@rt-tools/auth-contract` holds it, and the client and the server
packages of the module take it from there.

## Why

The client hides a section by a right, and the server refuses a call by the same right. If each
side reads rights from the token its own way, a person sees a section the server refuses, or the
reverse. One package holds the reading once for both.

## Terminology

| Term        | What it is                                                                        |
| ----------- | --------------------------------------------------------------------------------- |
| A right     | A string `resource:action`, for example `orders:write`; a client role in Keycloak |
| The catalog | All rights of one admin, declared in its code by resource and actions             |
| The caller  | The person behind a token: subject, address, name and the rights for one client   |
| The claims  | The fields of a Keycloak access token the caller is read from                     |

### What it is called in the interface

Not applicable: the package has no screens.

## Rules

- **A right is two non-empty parts of lowercase letters, digits and dashes joined by one colon.**
  Otherwise a role made by hand in the console with a space or a second colon reads as a right.
- **The caller gets only the rights of the client named by the reader.** Otherwise a person with
  rights in one admin carries them into another.
- **A role of another shape is not a right and is dropped while the caller is read.** Keycloak adds
  its own roles to the token, and they are not rights of the module.
- **The catalog lists every right of an admin once, and the rights are built from it.** Otherwise a
  right is typed by hand in a check and differs from the one sent to Keycloak.
- **A check of several rights says whether all or any are needed.** Otherwise one function is read
  both ways in different places.

## What is out of scope

- Checking the signature and the term of a token — the server package.
- Keeping the session and the token in the browser — the client package.

## Contract

| Name                 | Takes                        | Returns                            |
| -------------------- | ---------------------------- | ---------------------------------- |
| `isPermission`       | any value                    | whether it is a right              |
| `parsePermission`    | a string                     | `{ resource, action }` or `null`   |
| `definePermissions`  | resources with their actions | the catalog: the list of rights    |
| `callerFromClaims`   | the claims and the client id | the caller                         |
| `hasPermission`      | the caller and a right       | whether the caller has it          |
| `hasEveryPermission` | the caller and rights        | whether the caller has all of them |
| `hasSomePermission`  | the caller and rights        | whether the caller has one of them |

### Refusal codes

Not applicable: the functions return a value and throw nothing.

## Data

Not applicable.

## Screens and states

Not applicable.

## Cross-cutting requirements

### Locales

Not applicable.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The organization of the caller is not read here: it lives in the database of each application.

## Decisions

- **Rights are client roles, not realm roles.** A realm role is shared by every admin, a client
  role belongs to one. Rejected: realm roles with a prefix per admin — the prefix is a convention
  nobody checks.

## Open questions

None.

## History of changes

- 2026-10-05 — the contract, task RT-2533.
