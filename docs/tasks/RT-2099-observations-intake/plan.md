# Plan

**Task:** RT-2099 · **Branch:** RT-2099-observations-intake
**Draft:** `docs/specs/message-bus/proposed/rule-usage-stats/`
**Behaviour:** changes

Epic RT-2097, task 2 of 4; the branch stands on `RT-2098-observations-cargo`. The agreement of the receiving side travels in the chain and merges into the domain by the last task.

## Task footprint

| What  | Where                                                                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/message-bus/proposed/rule-usage-stats/`, `docs/specs/message-bus/intake/`                                                                  |
| Laws  | `docs/constitution/verifiability.md`, `docs/constitution/entity-models.md`, `docs/constitution/lib-imports.md`                                         |
| Rules | `.claude/skills/testing/`, `.claude/skills/deploy-flow/`, `.claude/skills/entity-models/`, `.claude/skills/typescript-conventions/`                    |
| Code  | `prisma/schema.prisma`, `prisma/migrations/`, `libs/message-bus-api/observations/`, `apps/message-bus/src/app/`, `projects/agent-kit/src/lib/cargo.ts` |

## What counts as done

- `POST /api/intake/observations` lands the lines as rows, replaces a day of a copy whole, refuses a foreign event kind and a cargo over the caps.
- The nightly cleaning removes rows older than a year and writes a journal line per tree.
- Scenarios `SC-MB-337`…`SC-MB-342` are covered by specs and green; the migration matches the schema.

## Stages

### 1. The storage: the model, the migration, the queries

- **What is done:** the model `Observation` in the schema with the indexes of the agreement; the migration file written by `migrate diff`; `observation.queries.ts` in the data-access lib — replacing a day of a copy in one transaction, deleting by age with a count per tree.
- **Readiness sign:** the migration chain matches the schema, the queries spec is green.
- **Verified by:** `npm run check:schema` — `check-schema-drift: the migrations and the schema match`; `pnpm exec nx test message-bus-api-observations-data-access` — `Tests … passed`.

### 2. The intake operation

- **What is done:** `observation.const.ts` in the util lib — the checks of the lines (event kinds, session sign, caps) as pure functions; `observations-intake.controller.ts` under `@TreeOperation()`; `IObservationsAccepted` in the cargo module; `CARGO_KINDS` of the failure filter gains `observations`.
- **Readiness sign:** the controller spec covers `SC-MB-337`…`SC-MB-341` and is green.
- **Verified by:** `pnpm exec nx test message-bus-api-observations-feature` — `Tests … passed`; `pnpm exec nx test message-bus-api-observations-util` — `Tests … passed`.

### 3. The keeping term

- **What is done:** `observation-retention.service.ts` — the moment of the next run as a pure function of "now", one timer per run, a journal line per tree, a failure as a journal line; registered in the observations module.
- **Readiness sign:** the service spec covers `SC-MB-342` and is green; the application builds; the lint of the touched libs is green.
- **Verified by:** `pnpm exec nx test message-bus-api-observations-feature` — `Tests … passed`; `pnpm exec nx build message-bus` — `Successfully ran target build`; `pnpm exec nx run-many -t lint -p message-bus-api-observations-feature message-bus-api-observations-data-access message-bus-api-observations-util message-bus` — `Successfully ran target lint`.

## What this work does not do

- Does not read the rows back: task RT-2100.
- Does not touch the admin application: task RT-2101.
- Does not merge the agreement: the last task of the epic does.
