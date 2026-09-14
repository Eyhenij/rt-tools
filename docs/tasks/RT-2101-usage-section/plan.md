# Plan

**Task:** RT-2101 · **Branch:** RT-2101-usage-section
**Draft:** `docs/specs/message-bus/proposed/rule-usage-stats/`
**Behaviour:** changes

Epic RT-2097, task 4 of 4 — the last; the branch stands on `RT-2100-usage-read`. The agreement of the receiving side merges into a subdomain of its own by one of the last commits of this branch.

## Task footprint

| What  | Where                                                                                                                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/message-bus/proposed/rule-usage-stats/`, `docs/specs/message-bus/admin/`, `docs/specs/message-bus/admin-list-page/`, `docs/specs/message-bus/spec.md`, `docs/specs/README.md`                     |
| Laws  | `docs/constitution/lists.md`, `docs/constitution/reuse-first.md`, `docs/constitution/entity-models.md`, `docs/constitution/verifiability.md`                                                                  |
| Rules | `.claude/skills/lists/`, `.claude/skills/admin-lists-screen/`, `.claude/skills/entity-models/`, `.claude/skills/testing/`, `.claude/skills/reuse-first/`                                                      |
| Code  | `libs/message-bus-admin/common/`, `libs/message-bus-admin/usage/`, `apps/message-bus-admin/src/app/`, `libs/message-bus-api/observations/`, `libs/message-bus-common/src/lib/`, `apps/message-bus-admin-e2e/` |

## What counts as done

- The section «Использование» stands in the row of the sections under `usage:read`, on the common list base, with the tree and period filters, a table of skills and a panel of sessions per row.
- Scenarios `SC-MB-348`…`SC-MB-352` are covered by the end-to-end spec and green on the stand; the frame of the screen is captured.
- The agreement is merged into the subdomain `docs/specs/message-bus/usage/`, and `npm run check:specs` names no divergence.

## Stages

### 1. The period in the shared list query and the usage operation as a page

- **What is done:** `from` and `to` in `IAdminListQuery`, `listQueryOf`, `listQueryParams` and `readPage`; `changePeriod` on the list base; `GET /api/usage` answers a page `{ rows, total, from, to }` by page, size, sort and dir with the default period of the receiver; the sortable fields of the usage declared in the common lib.
- **Readiness sign:** the specs of the core util, the core data-access and the observations feature are green.
- **Verified by:** `pnpm exec nx run-many -t test -p message-bus-admin-common-core-util message-bus-admin-common-core-data-access message-bus-api-observations-feature message-bus-api-observations-util message-bus-common` — `Tests … passed`.

### 2. The section of the admin application

- **What is done:** the period filter in the core ui; the libs `libs/message-bus-admin/usage/{api,data-access,feature/list,feature/sessions-aside,shell,util}`; the menu item, the routes, the labels; the section access specs know the new right.
- **Readiness sign:** the admin application builds; the specs of the new libs and of the container are green; the lint of the admin projects is green.
- **Verified by:** `pnpm exec nx build message-bus-admin` — `Successfully ran target build`; `pnpm exec nx run-many -t test --projects 'message-bus-admin-*'` — `Tests … passed`; `pnpm exec nx run-many -t lint --projects 'message-bus-admin-*'` — `Successfully ran target lint`.

### 3. The stand, the end-to-end spec and the merge of the agreement

- **What is done:** the stand seeds observation lines by the intake; `usage-section.spec.ts` covers `SC-MB-348`…`SC-MB-352` with the frame `list-usage`; the agreement merges into `docs/specs/message-bus/usage/`; the domain texts are brought up to what was done.
- **Readiness sign:** the end-to-end spec is green on the stand; the spec checks name no divergence.
- **Verified by:** `pnpm exec nx e2e message-bus-admin-e2e -- src/usage-section.spec.ts` — `passed`; `npm run check:specs` — `check-specs: domains …` without a `divergences` line; `npm run check:docs` — `no divergences`.

## What this work does not do

- Does not chart anything and does not sum several trees.
- Does not open the PR of the epic: that is the morning's step of the owner.
