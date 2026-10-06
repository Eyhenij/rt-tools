# The entry module

**Status:** in force · **Revision:** 2026-10-05 · **Scenario prefix:** `SC-AUTH`
**Depends on:** none
**Laws:** `verifiability`, `delivery`
**Procedures:** none

One entry for every admin application: one Keycloak, a client per admin, rights as client roles.
So far the domain holds the stand — Keycloak with its own database, raised on a machine by one
command. The packages of the module and the example admin application are checked against it.

## Why

The entry module moves the entry of every admin application into one Keycloak. Without a stand
nothing of the module can be checked: the client has nowhere to send a person, the server has no
keys to check a token by, and the theme has nowhere to be shown.

## Terminology

| Term                  | What it is                                                                        |
| --------------------- | --------------------------------------------------------------------------------- |
| The stand             | Keycloak, its database and a mail catcher, raised together on one machine         |
| The realm             | One Keycloak realm shared by all admin applications; its users are the people     |
| A client              | One admin application in the realm; its client roles are the rights of that admin |
| The file of the realm | The realm, its clients and roles written in the repository and applied at start   |

### What it is called in the interface

Not applicable: the stand has no screens of its own. The entry screens belong to the theme task.

## Rules

- **The stand is raised by one command and is ready when the command returns.** Otherwise the first
  check after the start refuses for a reason that is not about the check.
- **The realm, its clients and roles are applied from a file in the repository at every start.** A
  realm edited by hand in the console lives on one machine and is lost with its volume.
- **The stand takes no port another stand on the machine already holds.** Keycloak, its database and
  the mail catcher listen on ports outside those of the other applications of the tree.
- **The stand sends mail to a local catcher, not out.** Otherwise invitations and password recovery
  reach real addresses.
- **The example client uses the code flow with PKCE and does not accept a password grant.** The
  module promises no password grant; a client that accepts one lets a check pass by a road the
  module does not have.
- **The stand is checked by a command that asks it, not by a look at the console.** The command
  reads the discovery document of the realm, the example client and the mail settings, sends a test
  letter and finds it in the catcher.
- **The stand offers the entry through Google only when the keys of the owner lie in its
  environment.** Without them the provider is in the realm and switched off, and the entry screen
  shows no Google button. The keys never get into the history of the tree.

## What is out of scope

- The entry through Apple — task RT-2547.
- The entry screens — the subdomain `theme`.
- Keycloak in the production environment of the applications.
- The users of the existing applications — the import task of the epic.

## Contract

Not applicable: the stand serves the standard OpenID Connect endpoints of Keycloak.

### Refusal codes

Not applicable.

## Data

The Keycloak database of the stand, in a volume of its own. It holds nothing the file of the realm
cannot recreate except the users made by hand on the stand.

## Screens and states

Not applicable.

## Cross-cutting requirements

### Locales

The realm enables English and Russian. The texts of the screens belong to the subdomain `theme`.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

One realm for all admin applications, a client per application.

## Decisions

- **One realm for all admins, a client per admin.** One person enters every admin by one account;
  the rights of each admin are its own client roles. Rejected: a realm per application — a person
  would have an account per admin, which is what the module removes.
- **The realm is applied by keycloak-config-cli.** It applies a file again over a running realm.
  Rejected: the realm import at Keycloak start — it skips a realm that already exists, so an edit of
  the file does not reach a running stand.

- **The realm loader keeps the client roles the file does not name.** The catalog sync of every
  admin adds its rights as client roles, and the file knows nothing of them. Rejected: the file as
  the full list of roles — the next raising would take the rights away from people.
- **The stand holds a client for the catalog sync with a service account.** It may view and manage
  clients and nothing else. The secret is plain, as the other passwords of the stand.

## Open questions

- `Q-1` — the names of the packages of the module. The epic plan proposes them; the work goes on
  with those names until the owner names others.

## History of changes

- 2026-10-05 — the stand of Keycloak, task RT-2529.
- 2026-10-05 — the client of the catalog sync and kept roles, task RT-2532.
- 2026-10-06 — the entry through Google by the keys of the owner, task RT-2534.
