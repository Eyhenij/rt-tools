# Plan

**Task:** RT-2115 · **Branch:** RT-2115-usage-charts
**Spec:** `docs/specs/message-bus/usage/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                                  |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/message-bus/usage/` — rules of the digest, the contract, scenarios `SC-MB-355`…                                                                            |
| Laws  | `docs/constitution/lists.md`, `docs/constitution/reuse-first.md`, `docs/constitution/verifiability.md`                                                                 |
| Rules | `.claude/skills/lists/`, `.claude/skills/reuse-first/`, `.claude/skills/styling-bem/`, `.claude/skills/testing/`                                                       |
| Code  | `libs/message-bus-common/`, `libs/message-bus-api/observations/`, `libs/message-bus-admin/usage/`, `apps/message-bus-admin/src/styles/`, `apps/message-bus-admin-e2e/` |

## What counts as done

- `GET /api/usage/digest` answers the days of the period, the loads by kind, five top skills by loads and five by refusals, under `usage:read`.
- The section shows above the table a grid: a bar chart of loads by day, and three bar lists — the top skills, the kinds, the refusals; a toggle of 7 / 30 / 90 days stands next to the day pickers.
- The end-to-end spec of the section reads the chart and the lists over the seeded rows; the frames `list-usage` are re-taken.

## Stages

### 1. The digest of the period at the receiver

- **What is done:** the contract `IUsageDigest` in the common lib; `readUsageDays`, `readUsageKinds` in the data-access; the pure `usageDaysOf(from, to, rows)` filling zero days in the util; `GET /api/usage/digest` in the controller; scenarios `SC-MB-355`, `SC-MB-356` in the spec.
- **Readiness sign:** the tests of the observations feature and util are green; the spec check names no divergence.
- **Verified by:** `pnpm exec nx run-many -t test -p message-bus-api-observations-feature message-bus-api-observations-util message-bus-common` — `passed`; `node tools/check-specs.mjs` — no line starting with `check-specs: divergences`.

### 2. The digest in the section

- **What is done:** the digest model and mappers, the pure `usageChartBars`, `usageBarRows`, `quickPeriod(days, now)` in the util; `digest()` in the api; `UsageDigestStore` in the data-access; `admin-usage-digest` and `admin-usage-quick-period` in the ui; the list screen puts them into the slots; the block `admin-digest` in the shared styles layer; the labels in the dictionary; scenarios `SC-MB-357`, `SC-MB-358`.
- **Readiness sign:** the admin build is green; the tests and the lint of the usage libs are green.
- **Verified by:** `pnpm exec nx build message-bus-admin` — `Application bundle generation complete`; `pnpm exec nx run-many -t test,lint -p 'message-bus-admin-usage-*'` — `passed`.

### 3. The end-to-end spec and the texts

- **What is done:** `usage-section.spec.ts` reads the chart bars and the bar lists over the seeded rows; the frame `list-usage` re-taken; the texts of the subdomain bound to the code.
- **Readiness sign:** the end-to-end suite is green; the spec check names no divergence.
- **Verified by:** `pnpm exec nx run message-bus-admin-e2e:e2e` — `passed`; `node tools/check-specs.mjs` — no line starting with `check-specs: divergences`.

## What this work does not do

- A comparison with the equal period before — out of scope by the spec.
- A live badge of active sessions — the intake has no live stream of the lines.
- A funnel — the lines have no steps to build one from.
