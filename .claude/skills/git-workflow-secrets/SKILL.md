---
name: git-workflow-secrets
kind: pattern
rule: deploy-flow
description: Pattern of rule deploy-flow. Load when working with keys of external services — where they live, how the owner's key differs from the environment key, what each state of an integration row means and why a green probe does not promise a working feature.
---
<!-- rt-kit v0.38.0 · patterns/git-workflow-secrets.md · 8ecd68defd00 · правится надстройкой, не здесь -->

# Keys of external services

Pattern of the rule `deploy-flow`. What must be true meanwhile — the law
`docs/constitution/delivery.md`. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- A feature that goes outside is silent: mails do not leave, translations do not update.
- A key of an external service is being created or changed.
- It is being analysed what exactly is rolled out and what the application lacks to work —
  including a key that lives in the environment and has no screen.

## A rollout secret is not a key of an external service

The keys of this pattern live in the storage or in the production stack, and the application reads them.

## A key created by the owner lives in the storage, not in the environment

Such a key lies as a row in the storage, encrypted with the secrets encryption key; next to it an open hint of the last characters and the outcome of the last probe. One service reads it and gives it to those who go outside.

## Not every key of an external service is created by the owner

The storage holds keys the owner creates themselves and differently for each property. A key that is the same for the whole application stays in the environment, and it has no integrations screen.

## An integration row speaks in five states

The order of analysis matters — the storage state overrides everything else: Hence the short path of analysis: a mail or a translation is silent — first open this screen, not the logs.

## A green probe promises less than it seems

The probe asks the service for what it gives out by the key: the list of domains, the list of models.

## Moving a key from the environment into the storage is not done by a migration

The secret is encrypted by the application, so a query to the storage cannot move it: the migration creates the table and does not touch values.

## Common misses

- **Looking for the key by a search over the production stack and drawing a conclusion.**
- **Going to the logs before the screen.**
- **Taking the absence of errors as a sign of work.**
