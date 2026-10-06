# The client of the entry module

**Status:** in force · **Revision:** 2026-10-06 · **Scenario prefix:** `SC-AUTH`
**Depends on:** `auth/contract`
**Laws:** `frontend-application`, `verifiability`
**Procedures:** none

A subdomain of the entry module: how an Angular admin signs a person in through Keycloak, keeps
the session and sends its token with the requests. The package `@rt-tools/auth-angular` holds it.
It reads rights with the functions of the contract, so the client and the server agree on them.

## Why

Each admin used to keep its own entry form, its own session and its own handling of an expired
session. With one Keycloak for every admin, the entry, the session and the token in the requests
are the same code everywhere. The package gives them by one call in the configuration.

## Terminology

| Term                     | What it is                                                                   |
| ------------------------ | ---------------------------------------------------------------------------- |
| The adapter              | `keycloak-js`, the official browser client of Keycloak                       |
| The silent check         | A hidden frame asks Keycloak whether the person is signed in, without a form |
| A recipient of the token | An address the application named as its own API                              |
| The requirement          | Rights a route or a block needs, with the word whether all or any are needed |
| The current organization | The organization the person works in now; the application keeps it           |

### What it is called in the interface

Not applicable: the package has no screens. The entry form is the theme of the module.

## Rules

- **The tokens live only in the memory of the page.** A token in the browser storage can be read
  by any script on the page.
- **The entry uses the code flow with PKCE.** The client of an admin is public and has no secret.
- **After a reload the session comes back through the silent check, without a password.** If the
  browser blocks the frame, the next entry passes without a form while the Keycloak session lives.
- **The caller is read by the contract for the client of the admin.** Otherwise the client shows
  a section by a right the server refuses.
- **The token goes only to a recipient the application named.** Otherwise a request to a foreign
  service carries the token out.
- **A token that expires within thirty seconds is refreshed before the request.** Otherwise the
  request leaves with a token that expires on the way.
- **An answer 401 refreshes the token and repeats the request once.** A second 401 or a failed
  refresh sends the person to the entry: a loop of repeats would hide a broken session.
- **A route that needs an entry sends a person who is not signed in to Keycloak.** After the entry
  the person comes back to the address they asked for.
- **A route that needs rights names whether all or any are needed.** Without the rights the person
  goes to the address the application named, or stays where they were.
- **A block shown by a right appears and disappears when the rights change.** The rights change
  with a refreshed token, and the block must follow without a reload.
- **The current organization goes in a header the application named, and no value means no
  header.** The package does not know the organizations: they live in the database of the
  application.
- **The exit ends the session in Keycloak, not only on the page.** Otherwise the next entry passes
  without a form and the person is signed in again.

## What is out of scope

- The entry screens — the theme of the module.
- Checking the token on the server — the server package.
- The list of organizations and the choice of one — the application.
- A live entry through a browser on the stand — the example admin of the epic.

## Contract

Not applicable: the package calls the standard OpenID Connect endpoints of Keycloak through the
adapter. What it exports is listed in the package README.

### Refusal codes

Not applicable: the package sends no answers of its own.

## Data

Not applicable: the package keeps nothing outside the memory of the page.

## Screens and states

Not applicable.

## Cross-cutting requirements

### Locales

Not applicable: the package shows no text.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The organization the person works in is chosen in the application. The package reads its value
from a token the application fills, and puts it in the header of each request to a recipient.

## Decisions

- **The adapter is the official `keycloak-js`.** It keeps the tokens in memory, does PKCE, the
  silent check and the refresh. Rejected: our own reading of OpenID Connect repeats the adapter
  with its own mistakes; `angular-oauth2-oidc` keeps the tokens in the session storage by default.
- **The interceptor of Connect lives in a separate entry of the package.** An admin without
  Connect does not install it.

## Open questions

None.

## History of changes

- 2026-10-06 — the client, task RT-2531.
