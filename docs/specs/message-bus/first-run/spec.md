# The first person and the end of the account commands

**Status:** in force · **Revision:** 6 October 2026 · **Scenario prefix:** `SC-MB`
**Depends on:** `admin-auth`
**Laws:** `access`, `navigation`
**Procedures:** none

## Why

Creating, a new password and disabling came to the screen of the people section, and the same
three actions stayed as commands of the launch line. Two ways to one action diverge in silence: a
condition edited in one does not reach the other, and the test of one says nothing about the
other.

The commands held the only way to the first record. After the move of the entry to Keycloak a
fresh node needs no record of its own at all: the first person is created in Keycloak with the
roles of the bus client, by whoever holds the node.

## Terminology

- **The first person** — the person who signs in to a fresh node; they are created in Keycloak,
  not in the intake.

### What it is called in the interface

Not applicable: the admin panel has no screen of the first run.

## Rules

**The receiver.**

- **The four commands of accounts are not in the tree.** `account:add`, `account:passwd`,
  `account:disable` and `account:list` leave together with their parse and their report; the tree
  commands stay. A command kept "just in case" is the second way the agreement removes.
- **The intake serves no operation of the first run.** The accounts live in Keycloak, and the
  first person is created there by whoever holds the node. An empty storage of the intake says
  nothing about who can sign in, so the intake neither asks it nor warns about it at the start.

**The admin panel.**

- **The admin panel has no screen of the first run.** A person who is not signed in is sent to
  Keycloak, whatever the storage of the intake holds.

## What is out of scope

- Creating people in Keycloak — the realm and its owner.
- The tree commands of the launch line.

## Contract

Not applicable: the intake serves no operation of the first run. `GET /api/setup` and
`POST /api/setup` left together with the entry by a password.

### Refusal codes

Not applicable: there is no operation to refuse.

## Data

Nothing is stored: the first person lives in Keycloak.

## Screens and states

Not applicable: there is no screen.

## Cross-cutting requirements

### Locales

Not applicable: there are no words of a screen.

### SEO

Not applicable: the admin panel is closed.

### Mobile layout

Not applicable: there is no screen.

### Several objects

One receiver, one realm.

## Decisions

- **The first person is created in Keycloak.** The owner on 6 October 2026: «мигрируй логин из
  message bus на новый auth». A screen of the first run in the admin panel would be a second way to
  create a person next to Keycloak's own.
- **The scenarios about the commands are reworded, not renumbered.** SC-MB-42, 43, 58 and 59
  speak of the people section now and are carried by the tests that stay; the command tests
  leave with the commands.

## Open questions

None.

## History of changes

- 2026-09-15 — the agreement was written before the code.
- 2026-09-15 — merged into the domain by the task RT-1902.
- 2026-10-06 — the operations and the screens of the first run left by the task RT-2576: the
  people live in Keycloak.
