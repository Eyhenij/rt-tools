# Grill

## The owner request

> ты можешь переименовать этот экшен как-то иначе? сейчас непонятно что это за deploy

The owner's word of 21.11.2026, said while he started the rollout of the server before the release
of `@rt-tools/agent-kit` 0.38.0: he asked whether that rollout releases the package.

## What the tree already has

- **The workflow.** `.github/workflows/deploy.yml` is named «Deploy». It builds two images — the
  message-bus receiver and its admin panel — and raises them on the node with the database
  migration. It publishes no npm package.
- **The neighbour.** `.github/workflows/deploy-auth.yml` is named «Deploy Auth».
- **The texts.** `docs/PROD.md:189` names the rollout «Deploy» of the receiver.
- **The board checks.** `tools/check-board.mjs` finds the last rollout by the workflow file, not by
  its name: `lastDeploy(DEPLOY_WORKFLOW, …)`.

## What the rules already say

- The rule `deploy-flow`: the rollout is started by hand from the main branch.

## Questions and answers

**Какое имя дать экшену в списке Actions?**
Deploy message-bus: приёмник и админка (Recommended)

## Decisions

- **Only the display name changes, the file keeps its name** — the board checks find the rollout by
  the file. Rejected: renaming the file, which would move every reference to it.

## What is left unclear

- Whether «Deploy Auth» should be renamed too. The owner named one workflow; the neighbour is left.
