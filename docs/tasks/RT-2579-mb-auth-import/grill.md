# Grill

## The owner request

> я вмержил https://github.com/Eyhenij/rt-tools/pull/2559, подтягивай свежий main и чисти вмерженные ветки как локально так и в ремоуте, выпускай итоговые пакеты auth и затем мигрируй логин из message bus на новый auth

## What the tree already has

- `rt-auth-import` from `projects/auth-import/` reads a JSON list of people: an address, a first
  and a last name, a password hash and the client roles. The address is the login. A hash other
  than argon2 or pbkdf2 does not move: the person sets a new password at the first sign-in.
- The command keeps no old key of a person and answers by address only. It creates every person
  enabled.
- The bus keeps its people in the tables `account`, `role` and `account_permission` until the
  deploy of the epic. The migration of RT-2578 drops them. An account has a name and no address,
  and its password is a node scrypt hash, which does not move.
- The rights of a person were the rights of their role with the per-person edits over it.
- The chat operator names its person by the column `personId`. In production it holds the key of a
  bus account until the transfer rewrites it.
- The production database is reached only over `ssh message-bus` and `docker compose exec db
psql`; `deploy/dump.sh` does so for its probe. The database port is not published.
- Spec of the import: `docs/specs/auth/import/spec.md`.

## What the rules already say

- The epic plan: the login is the address, the owner gives the addresses, passwords do not move.
- The import spec: a file with any error is refused whole, and an unknown role refuses it before
  the first write.

## Questions and answers

**Where do the addresses of the bus people come from?**
«Лучше файл заполню сам» — the export writes the names with empty addresses, and the file is
filled in before the deploy. Right after that the owner gave the addresses of the two people in
chat; they stay outside the tree, in the file of the transfer.

**What is the account `cargo-triage`?**
«cargo-triage - это аккаунт для rt-tools для разбора происшествий» — a service sign-in of the cargo
commands, not a person. It does not move: task RT-2582 gives those commands a service client of
Keycloak.

## Decisions

- **The export reads production over ssh before the deploy.** After the migration there is nothing
  to read. Rejected: an export command of the receiver, because the code of the epic has no tables
  of people any more.
- **The file lives outside the repository.** It holds the addresses of people. Rejected: a file in
  the tree, because addresses would reach the history.
- **The service account of the cargo triage does not move.** The export leaves it out by name
  and names it in its report.
- **A disabled account does not move.** The import creates every person enabled, and the
  disabling would be lost. The export names such accounts in its report.
- **The rights of a person are counted the old way and given as client roles of the bus.** A right
  that left the set is dropped, the same as a name outside the set.
- **The operator column is rewritten by a second command after the import.** It finds the Keycloak
  key of each person by address and replaces the old key. It runs after the deploy, when the
  column is `personId`.

## What is left unclear

- Nothing blocks the work. The addresses arrive with the owner's file before the deploy.
