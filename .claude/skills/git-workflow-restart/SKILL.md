---
name: git-workflow-restart
kind: pattern
rule: deploy-flow
description: Pattern of rule deploy-flow. Load for a manual production restart — after editing .env.prod, when investigating a rollout, when starting a container on the server. Ready-made commands with the image tag by sha and what to check the result against. Migrations — pattern git-workflow-migration.
---
<!-- rt-kit v0.37.0 · patterns/git-workflow-restart.md · 7fabbeba5b75 · правится надстройкой, не здесь -->

# A manual production restart

Pattern of the rule `deploy-flow`. What must be true meanwhile — the law
`docs/constitution/delivery.md`. Cold part: `pitfalls.md` — every section below whole, with its code and reasons.

## When to use

- `.env.prod` was edited, and the container must be brought up again.
- It is being analysed what exactly is rolled out now.
- A container is brought up on the server by hand, past the rollout by merge.

## The command must carry the sha

The rollout pipeline of the tree rolls out images by the commit sha.

## The sha is taken before the restart

## The check goes by the log, not by the response code

A substituted image is visible only by the missing lines of the new code: the `startup` digest with `integrations` disappears from the logs, while `API is running` stays in place. After the restart — the same `inspect` and the presence of the expected lines in the log.

## Rollback: the same call with the previous sha

A rollback is not a separate mechanism but the same startup by sha, only taken one step back.

## Common misses

The conclusion "production is alive, so it rolled out" — the response code does not show a substituted image. Environment variables, secrets and name records are set **before** the merge: the merge rolls out at once, and a branch that depends on a new variable lands on production before the variable is created.
