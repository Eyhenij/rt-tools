# The transfer of the bus people to Keycloak

**Status:** in force · **Revision:** 7 October 2026 · **Scenario prefix:** `SC-MB`
**Depends on:** `access-rights`, `admin-auth`
**Laws:** `access`
**Procedures:** none — the transfer is a command of the tree tools, not an operation of the intake

## Why

The bus signs in through Keycloak, and the migration of the epic drops its tables of people. The
people of production have to reach Keycloak before that, with their rights, or nobody signs in
after the deploy. The chat operators name their person by the old key, and that key has to become
the Keycloak one.

## Terminology

- **The transfer file** — the list of people for `rt-auth-import`: an address and the client roles
  of the bus. It lives outside the repository, because it holds addresses.
- **The address book** — the file where the owner names the address of each bus account. It lives
  next to the transfer file.
- **The key map** — the pairs "old key of the account, address", written by the export for the
  rewrite of the operators.

### What it is called in the interface

Not applicable: the transfer is a command, it has no screen.

## Rules

**The export.**

- **The export reads the people of production before the deploy.** It asks the production storage
  over ssh, read only. After the migration the tables of people are gone, and there is nothing to
  read.
- **The rights of a person are the rights of their role with their edits over it.** A right that
  left the set of the bus is dropped, the same as a name outside the set.
- **A disabled account and the service account of the cargo triage do not move.** The import
  creates every person enabled, and the service account is replaced by a service client. The report
  of the export names each account it left out.
- **An account without an address in the address book refuses the export whole.** A transfer file
  without one person looks complete, and the person learns of it at the sign-in.
- **The export writes no password.** The bus keeps scrypt, which Keycloak does not check; the
  person sets a new password at the first sign-in.

**The rewrite of the operators.**

- **The operator column gets the Keycloak key of the same person.** The key is found by the address
  from the key map, and the old key is replaced by it in one transaction.
- **A person the realm does not know refuses the rewrite whole.** A half-rewritten column leaves
  some operators without their sites, and nothing says which ones.

## What is out of scope

- The import itself: `rt-auth-import` with its own spec.
- The service client of the cargo commands: task RT-2582.
- The Keycloak of production: task RT-2581.

## Contract

Not applicable: the intake gains no operation. The command is `node tools/bus-people-transfer.mjs`
with the verbs `export` and `rekey`.

### Refusal codes

Not applicable: the command answers with a line of the report and the exit code 1.

## Data

The transfer file, the address book and the key map lie in `~/.config/rt-bus-transfer/`. Nothing
of them reaches the repository.

## Screens and states

Not applicable: there is no screen.

## Cross-cutting requirements

### Locales

Not applicable: the report of a command is read by whoever holds the node.

### SEO

Not applicable: there is no page.

### Mobile layout

Not applicable: there is no screen.

### Several objects

There is one intake and one bus client in one realm.

## Decisions

- **A command of the tree tools, not of the receiver.** The code of the epic has no tables of
  people, so the receiver has nothing to read them with.
- **The addresses come from a file of the owner.** The owner on 7 October 2026: «Лучше файл заполню
  сам».

## Open questions

None.

## History of changes

- 7 October 2026 — written by task RT-2579.
