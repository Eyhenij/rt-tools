# The entry into the admin application

**Status:** in force · **Revision:** 2026-10-07 · **Scenario prefix:** `SC-MB`
**Depends on:** none
**Laws:** `frontend-application`, `reuse-first`
**Procedures:** none — the operations are declared by the controllers of the intake

A subdomain of the domain "the intake of the cargo": what a person introduces themselves to the
intake by. What they read after the entry — the subdomain next to
it: `docs/specs/message-bus/admin/`.

## Why

The service goes out into the internet. Knowing the tokens of the trees alone, it would give what
was taken in to anyone who reached its address and would not answer the question of who read it.
Hence the entry of a person. Since October 2026 it goes through Keycloak, and the people live
there.

## Terminology

The vocabulary of the domain whole is in the spec of the domain. Here only what lives in the entry:

| Term                  | What it is                                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| A person              | Whoever signs in at Keycloak. The intake keeps no record of them and knows them by the token alone  |
| The entry             | The state in which the intake knows who is asking. It lives by a term and is broken off by the exit |
| The term of the entry | The time after which the entry stops being accepted and a person introduces themselves anew         |

### What it is called in the interface

| In the agreement      | On the screen                                                              |
| --------------------- | -------------------------------------------------------------------------- |
| the entry             | the sign-in screen of the Keycloak realm; the admin application draws none |
| a refusal of the pair | the message of that screen: the pair is not accepted, and what is not said |

## Rules

**The entry.**

- **Not a single operation gives the cargo without an entry.** The giving out of the application
  itself the entry does not guard: without the cargo it is empty, and closed statics demand a proxy
  the work has none of.
- **A person signs in through Keycloak, and the intake keeps neither a password check nor an entry
  of its own.** The sign-in form and the term of the entry belong to Keycloak. So do the refusal of a
  pair and the slowdown of guessing, as in every admin of the shared entry module.
- **A request of a person carries the access token of the bus client in the `Authorization`
  header.** A token of another client or of another realm is refused the same way as no token.
- **A token of a tree does not open the admin application, and the entry of a person does not open the
  intake of the cargo.** The two ways of introducing oneself live apart: otherwise a token that leaked
  from a tree reads the whole cargo of all the trees.
- **Every operation declares its way of access openly.** The default "open until it is closed" opens
  outward every new operation the author did not think about; the default here is the reverse, and
  openness is named in the operation itself.
- **The intake does not start while one of its operations declares no access.** An operation that
  slipped past the declaration is found at the start, not by a foreign request.
- **The admin application asks the intake where to sign in.** The intake names the Keycloak address,
  the realm and the client whose tokens it checks, without a token and without secrets. A copy
  built into the page would drift from the intake when Keycloak moves.

- **A person sent to the entry from the address of a section lands after the entry where they were
  going.** Otherwise a link to a section works only for whoever has already entered.

## What is out of scope

- **People, their passwords and their rights.** Keycloak holds them, and the admin application has
  no screen of its own for them; the first person of an empty node is the subdomain `first-run`.
- **The restoring of a password by mail.** Keycloak holds it, as every other step of the sign-in.
- **Rights inside the admin application.** Subdomain `access-rights`.
- **The requirements of the password itself.** Keycloak sets them for its realm.

## Contract

The intake serves no operations of the entry: the sign-in, the exit and the renewal of the token go
to Keycloak. Every operation of a person reads the access token from the `Authorization` header.

| Operation              | Access | What it does                                                      |
| ---------------------- | ------ | ----------------------------------------------------------------- |
| GET /api/auth/settings | public | `{ url, realm, clientId }` — where the admin application signs in |

### Refusal codes

Not applicable: the intake answers with a code of the answer of HTTP, not with named codes of the
domain. Where the entry is obliged to refuse instead of staying silent:

| What happened                                      | Code  | What it says                        |
| -------------------------------------------------- | ----- | ----------------------------------- |
| there is no token, it has expired or it is foreign | `401` | that the operation demands an entry |

## Data

Not applicable: the intake keeps no record of a person. Keycloak holds the people, their
passwords and their rights.

## Screens and states

| Screen    | States                                                                              |
| --------- | ----------------------------------------------------------------------------------- |
| The entry | drawn by Keycloak: an empty form · a refusal of the pair · a refusal of the service |

The table of the states is checked by nothing: a state the code does not know how to come into reads
here as a description of something working. The states are confirmed by scenarios.

## Cross-cutting requirements

### Locales

The screen of the entry is drawn by the theme of the realm, and its labels lie in that theme, not in
the dictionary of the admin application.

### SEO

Not applicable: the screen of the entry promises nothing to the search engines, and everything else
stands behind it.

### Mobile layout

The form of the entry is the screen of the realm, and its narrow layout belongs to the theme.

### Several objects

A person belongs to the service, not to a tree: whoever entered gets the cargo of all the trees, and
what they may do is said by their rights.

## Decisions

- **The entry goes through the shared Keycloak.** The owner on 6 October 2026: «мигрируй логин из
  message bus на новый auth». Rejected: the own entry by a password and a cookie — every admin would
  keep its own passwords and its own guessing defence.

## Open questions

The open questions of the domain are shared, and they live in the spec next to it.

## History of changes

- 2026-10-07 — the records of people left the intake, task RT-2578: Keycloak keeps them. The
  rules of the account are gone, and so are the scenarios `SC-MB-42`, `SC-MB-43`, `SC-MB-59` and
  `SC-MB-60`.

- 2026-10-06 — the entry moved to Keycloak, task RT-2576. The operations of the sign-in, the exit
  and the session are gone. So are the scenarios `SC-MB-38`, `SC-MB-41`, `SC-MB-56`, `SC-MB-57`,
  `SC-MB-58`, `SC-MB-61` and `SC-MB-80`.
  The scenarios `SC-MB-33`…`SC-MB-37`, `SC-MB-44` and `SC-MB-45` now name the entry screen of
  the realm, and `SC-MB-59` checks the stored hash alone.

- 2026-09-15 — the commands of the launch line for the accounts were removed: the first record is
  created by the first-run screen, the rest by the people section. The scenarios of the commands
  were reworded to the operations under the same numbers: `SC-MB-42`, `SC-MB-43`, `SC-MB-58`,
  `SC-MB-59`.

- 2026-08-21 — the subdomain was split out of the spec of the reading of what was taken in, which had
  outgrown the length limit. The rules of the entry, the scenarios `SC-MB-33`…`SC-MB-45`,
  `SC-MB-56`…`SC-MB-61`, `SC-MB-79` and `SC-MB-80`, their bindings, the operations of the entry, the
  codes of its refusals and both entities of its own moved here as they were: the scenario numbers
  were not recounted.
