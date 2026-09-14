# Plan

**Task:** RT-2100 · **Branch:** RT-2100-usage-read
**Draft:** `docs/specs/message-bus/proposed/rule-usage-stats/`
**Behaviour:** changes

Epic RT-2097, task 3 of 4; the branch stands on `RT-2099-observations-intake`. The agreement of the receiving side travels in the chain and merges into the domain by the last task.

## Task footprint

| What  | Where                                                                                                                                                        |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/message-bus/proposed/rule-usage-stats/`, `docs/specs/message-bus/access-rights/`                                                                 |
| Laws  | `docs/constitution/verifiability.md`, `docs/constitution/lists.md`, `docs/constitution/lib-imports.md`                                                       |
| Rules | `.claude/skills/testing/`, `.claude/skills/deploy-flow/`, `.claude/skills/typescript-conventions/`                                                           |
| Code  | `libs/message-bus-common/src/lib/rights.ts`, `prisma/migrations/`, `libs/message-bus-api/observations/`, `apps/message-bus-admin-e2e/stand/seed-account.mjs` |

## What counts as done

- `GET /api/usage` answers the usage of a tree over a period — a row per skill with the kind, the loads, the sessions and the refusals of the gate — under `usage:read`; a period over four hundred days is refused; an empty period answers with an empty list.
- `GET /api/usage/:skill/sessions` answers the sessions of one skill, newest day first.
- Scenarios `SC-MB-343`…`SC-MB-347` are covered by specs and green; the owner role holds the new right by a migration.

## Stages

### 1. The right and the period

- **What is done:** `usage:read` in the closed set; the migration granting it to the owner role; the stand seed names it; `usage-period.util.ts` — the period check and the parsing as pure functions with a spec.
- **Readiness sign:** the migration chain matches the schema; the util spec is green.
- **Verified by:** `npm run check:schema` — `check-schema-drift: the migrations and the schema match`; `pnpm exec nx test message-bus-api-observations-util` — `Tests … passed`.

### 2. The queries and the operations

- **What is done:** `usage.queries.ts` — the grouped raw query of the usage and the query of the sessions; `usage-read.controller.ts` with the two operations under `@RequiresRight('usage:read')`; the tree resolved by its sign.
- **Readiness sign:** the controller spec covers `SC-MB-343`…`SC-MB-347` and is green; the application builds; the lint of the touched projects is green.
- **Verified by:** `pnpm exec nx test message-bus-api-observations-feature` — `Tests … passed`; `pnpm exec nx build message-bus` — `Successfully ran target build`; `pnpm exec nx run-many -t lint -p message-bus-api-observations-feature message-bus-api-observations-data-access message-bus-api-observations-util message-bus-common` — `Successfully ran target lint`.

## What this work does not do

- Does not draw the section: task RT-2101.
- Does not merge the agreement: the last task of the epic does.
