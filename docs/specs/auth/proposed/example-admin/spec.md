# The example admin

**Status:** proposed · **Revision:** 2026-10-06 · **Scenario prefix:** `SC-AUTH`
**Depends on:** `auth/angular`, `auth/server`, `auth/theme`
**Laws:** `verifiability`, `frontend-application`
**Procedures:** none

An agreement about the product written before the code. It is merged into the spec of the domain by
the last commit of the PR, with the same scenario numbers.

The example admin is an Angular admin and a NestJS server of the tree that use the packages of the
entry module the way an application would. The end-to-end suite runs a person through it on the
stand: the entry, the session and the rights are checked whole, not package by package.

## Why

Each package of the module is checked by its own tests with doubles. A person meets all of them at
once: the theme of Keycloak, the client, the token in the request, the check on the server. A miss
between two packages shows only when they work together.

## Terminology

| Term        | What it is                                                         |
| ----------- | ------------------------------------------------------------------ |
| The example | The example admin and the example server, two programs of the tree |
| A record    | The only thing of the example: a line with a title                 |
| A reader    | A person with the right `example:read`                             |
| An editor   | A person with the rights `example:read` and `example:write`        |

### What it is called in the interface

| On the screen | What it is                     |
| ------------- | ------------------------------ |
| Records       | The list of records            |
| New record    | The form that creates a record |
| Sign out      | The exit through Keycloak      |

## Rules

- **The example admin opens only to a person who entered through Keycloak.** A person who is not
  signed in is sent to the entry screen of the realm.
- **The list of records is shown to a reader, the form of a new record only to an editor.** A
  person without the right does not see the part, not a disabled one.
- **The example server refuses a call without the right with 403, whatever the screen shows.** The
  hidden form is convenience; the protection is on the server.
- **A token near its end is refreshed without a new entry.** A person who keeps working is not sent
  back to the entry screen while the Keycloak session lives.
- **Sign out ends the session in Keycloak.** The next opening of the admin asks for the entry
  again.
- **The token of the example client lives forty seconds on the stand.** The end-to-end suite then
  sees a refresh within one test instead of waiting five minutes.
- **The stand offers the entry through Google only when the keys of the owner lie in its
  environment.** Without them the provider is in the realm and switched off, and the entry screen
  shows no Google button. The keys never get into the history of the tree.

## What is out of scope

- The entry through Apple — task RT-2547.
- The organizations — the example has none.

## Contract

| Call                | Access          | Answer                         |
| ------------------- | --------------- | ------------------------------ |
| `GET /api/records`  | `example:read`  | the records                    |
| `POST /api/records` | `example:write` | the created record             |
| `GET /api/health`   | open            | `ok`, for the stand to wait on |

### Refusal codes

| Code | When                                   |
| ---- | -------------------------------------- |
| 401  | no token or a token the realm refuses  |
| 403  | the caller lacks the right of the call |

## Data

The records live in the memory of the example server and are lost with it: the example checks the
entry, not the keeping.

## Screens and states

| Screen  | State              | What the person sees                         |
| ------- | ------------------ | -------------------------------------------- |
| Records | a reader           | the list and their name with «Sign out»      |
| Records | an editor          | the same and the form «New record»           |
| Records | no right to read   | the line «You have no access to the records» |
| Records | the server refuses | the message of the refusal above the list    |

## Cross-cutting requirements

### Locales

The example is in English only: it is a stand, not a product screen.

### SEO

Not applicable.

### Mobile layout

Not applicable: the suite checks the entry, not the layout.

### Several objects

Not applicable.

## Decisions

- **The example lives in the tree as two applications next to the suite.** A test page inside the
  suite would check what the suite itself wrote, not what an application connects.

## Open questions

None.

## History of changes

- 2026-10-06 — the agreement, task RT-2534.
