---
name: git-workflow-migration
kind: pattern
rule: deploy-flow
description: Pattern of rule deploy-flow. Load when editing prisma/schema.prisma and prisma/migrations/** — ready-made commands for a one-off container, writing the migration file through migrate diff, applying to the local database. Not for the commit — pattern git-workflow-commit; for the PR — git-workflow-pr.
---
<!-- rt-kit v0.28.0 · patterns/git-workflow-migration.md · d5f7bbe50850 · правится надстройкой, не здесь -->

# A migration and the chain run

Pattern of the rule `deploy-flow`. What must be true meanwhile — the law
`docs/constitution/delivery.md`.

## When to use

- `prisma/schema.prisma` is being edited.
- A directory in `prisma/migrations/` is being created or renamed.
- A branch with a new migration is being prepared for the merge.

## The chain is run by one command

Local `lint`, `test`, `check:all` and the builds do not touch the migration order at all, and the
step `Migrations match schema` in `.github/workflows/deploy.yml` goes after the merge. The check
stands as a push gate and is called by hand:

```bash
npm run check:schema
```

It applies the chain to a shadow database — the same as the working one, with the suffix
`_gate_shadow` — compares it with the schema and tears it down. One's own database is not
touched: an audit against it would judge the state of the machine, not of the repository. A
stopped docker and a production address the check skips silently.

When there is no database at hand at all, the same chain is run on a one-off container:

```bash
docker run -d --rm --name <префикс>-migcheck -e POSTGRES_PASSWORD=migcheck -p 55432:5432 postgres:16-alpine
docker exec <префикс>-migcheck pg_isready -U postgres          # an apply before readiness fails on the connection
DATABASE_URL=postgresql://postgres:migcheck@localhost:55432/postgres npx prisma migrate deploy
DATABASE_URL=postgresql://postgres:migcheck@localhost:55432/postgres npx prisma migrate diff \
    --from-config-datasource --to-schema prisma/schema.prisma --exit-code
docker stop <префикс>-migcheck
```

The address is set as a prefix of the command itself — `export` does not live between calls.

## The migration file is written by the same container

`prisma migrate dev` is not run either as a command or through `npm run prisma:migrate`: any
divergence of state it cures by offering to reset the database, and the local database holds the
owner's properties and bookings. The file is taken as the difference between the applied chain
and the schema:

```bash
DATABASE_URL=postgresql://postgres:migcheck@localhost:55432/postgres npx prisma migrate diff \
    --from-config-datasource --to-schema prisma/schema.prisma --script \
    > prisma/migrations/<метка>_<имя>/migration.sql
```

The directory is created **after** the chain is applied: an empty directory that got into
`migrate deploy` is marked applied, and its contents will no longer land on this container.

## The local database catches up with the branch

```bash
npx prisma migrate deploy
```

A renamed migration stays in it under the old name, and the apply fails on
`relation … already exists`. The state is edited, a repeated apply does not fix it:

```bash
npx prisma migrate resolve --applied <новое имя>
```

## Common misses

- **The apply in the image is set up by the settings file, not by an address in the
  environment.** The seventh edition reads the storage address only from its own settings file:
  neither the declaration in the schema nor an environment variable in the production stack
  replaces it. That file is put into the image explicitly, next to the schema and the migrations.
  Without it the build is green whole — client generation at the build stage passes — and the
  first apply on the node refuses.
- The timestamp is set by the moment of creation, and the apply order is lexicographic: a
  migration from a branch started earlier lands before the one it depends on. On an existing
  database this is invisible — only an apply from scratch fails.
- The flags of `prisma migrate diff` are not those from the examples on the web: `--from-url`,
  `--to-url`, `--shadow-database-url` and `--to-schema-datamodel` are removed, and
  `prisma db execute` takes no database address at all and reads it from `prisma.config.ts`. On
  an unknown flag both commands print the help, and the miss is visible only there. Which flags
  exist now is looked up in `prisma migrate diff --help`, not in this text.
- A write to the production database (port 15432, the production host) is forbidden altogether:
  the schema changes by a migration through the rollout, the data — through the admin.
- Rows are addressed by the primary key, not by a mask: a deletion by a mail mask once took the
  owner's demonstration bookings away together with the test records.
- **The guard's question is not lifted by the form of the query.** It judges a condition by
  identifier the same way in any spelling — one at a time or as a list — and answers both with a
  question to the owner; a refusal comes only on a condition not by identifier. Where the question
  reads as a refusal, there is one way: name the refused command to the owner and ask for the mode
  in which the question gets through — not rewrite the query until it passes. Otherwise the
  session carries away a conclusion about guard requirements it does not have.
