# The import of users

**Status:** in force · **Revision:** 2026-10-06 · **Scenario prefix:** `SC-AUTH`
**Depends on:** `auth`
**Laws:** `verifiability`, `code-structure`
**Procedures:** none

A subdomain of the entry module: how the people of an existing application move into Keycloak
with their password hashes. The package `@rt-tools/auth-import` holds a command for the terminal.
The application prepares a file of its users in its own repository, and the command loads it into
the realm.

## Why

An application that moves to the module has people who already have passwords. Without the import
every one of them would set a password anew. Keycloak verifies argon2 and pbkdf2 hashes itself,
so such a person enters with the old password on the first day.

## Terminology

| Term              | What it is                                                                  |
| ----------------- | --------------------------------------------------------------------------- |
| The file of users | A JSON list the application exports: address, name, hash, rights            |
| A hash in PHC     | A string `$<algorithm>$<parameters>$<salt>$<hash>` the hash libraries write |
| A kept hash       | A hash of an algorithm Keycloak verifies without extensions                 |
| The import client | A confidential client of the realm with the role `manage-users`             |

### What it is called in the interface

Not applicable: the command prints a report to the terminal and has no screens.

## Rules

- **An argon2 or pbkdf2 hash moves as it is, and the old password enters.** Keycloak verifies
  argon2 and pbkdf2 with SHA-1, SHA-256 and SHA-512 without extensions.
- **A person with another hash or without one moves without a password and must set one.** Keycloak
  cannot verify scrypt or bcrypt without an extension of its own, and the module has none.
- **The letter to set a password is sent only by the flag and only to people added by this run.**
  The application chooses the day of the move, and a second run sends no letter twice.
- **A second run skips the people already in the realm.** Otherwise it would overwrite a password
  the person has changed since.
- **The rights move with the person as client roles of the admin.** A role the client does not
  have is refused before the first write: Keycloak would refuse the whole batch on it.
- **The secret of the import client is read from the environment, not from the arguments.** An
  argument stays in the history of the terminal.
- **A file with an error is refused whole before the first write.** Otherwise half of the people
  move, and the second run has to tell them from the rest.

## What is out of scope

- The export of users from the database of an application — the application.
- The organizations of a person — they stay in the database of the application.
- A Java extension for scrypt or bcrypt — the module has no extensions of its own.

## Contract

Not applicable: the command calls the admin API of Keycloak. The format of the file and the
arguments are listed in the package README.

### Refusal codes

Not applicable: the command ends with the exit code 1 and names the line of the file that broke.

## Data

The file of users is read and not kept. In Keycloak a person is created with the username and the
address equal to the address of the file. At the first entry Keycloak asks a person without a first
and a last name to fill them in, and a person whose address is not verified to verify it.

## Screens and states

Not applicable.

## Cross-cutting requirements

### Locales

Not applicable: the report of the command is in English.

### SEO

Not applicable.

### Mobile layout

Not applicable.

### Several objects

The organizations stay in the database of the application, and the file does not carry them.

## Decisions

- **A person with a hash Keycloak cannot verify moves without a password.** Rejected: a Java
  extension for scrypt — it would be built anew for every Keycloak version.
- **The import creates people one by one through the users API.** It needs only the roles
  `manage-users` and `view-clients`. Rejected: the partial import of the realm — it asks for the
  management of the whole realm.

## Open questions

None.

## History of changes

- 2026-10-06 — the import, task RT-2535.
