---
name: git-workflow-migration
kind: pattern
rule: deploy-flow
description: Pattern of rule deploy-flow. Load when editing prisma/schema.prisma and prisma/migrations/** — ready-made commands for a one-off container, writing the migration file through migrate diff, applying to the local database. Not for the commit — pattern git-workflow-commit; for the PR — git-workflow-pr.
---
<!-- rt-kit v0.39.0 · patterns/git-workflow-migration.md · 3c3c225794ca · правится надстройкой, не здесь -->

# A migration and the chain run

Pattern of the rule `deploy-flow`. What must be true meanwhile — the law
`docs/constitution/delivery.md`. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- `prisma/schema.prisma` is being edited.
- A directory in `prisma/migrations/` is being created or renamed.
- A branch with a new migration is being prepared for the merge.

## The chain is run by one command

Local `lint`, `test`, `check:all` and the builds do not touch the migration order at all, and the schema check of the pipeline goes after the push. The check stands as a push gate and is called by hand: It applies the chain to a shadow database — the same as the working one, with the suffix `_gate_shadow` — compares it with the schema and tears it down. One's own database is not touched: an audit against it would judge the state of the machine, not of the repository.

## The migration file is written by the same container

`prisma migrate dev` is not run either as a command or through `npm run prisma:migrate`: any divergence of state it cures by offering to reset the database, and the local database holds the owner's properties and bookings. The file is taken as the difference between the applied chain and the schema: The directory is created **after** the chain is applied: an empty directory that got into `migrate deploy` is marked applied, and its contents will no longer land on this container.

## The local database catches up with the branch

A renamed migration stays in it under the old name, and the apply fails on `relation … already exists`.

## Common misses

- **The guard's question is not lifted by the form of the query.**
