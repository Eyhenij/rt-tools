# Plan

**Task:** RT-3287 · **Branch:** RT-3287-usage-all-trees
**Draft:** `docs/specs/message-bus/proposed/usage-all-trees/`
**Behaviour:** changes

## Points

- **A:** the section «Использование» opens on «Все проекты» and shows «Прочитать не удалось».
- **This task reaches:** the section opens with the table and the digest over all trees.
- **Sign:** the end-to-end spec SC-MB-430 opens the section without a tree and sees rows; the owner
  sees the same on message-bus.dev after the rollout.
- **Milestone G of the epic:** work outside an epic, by the owner's word.
- **Metric:** нет: the section did not read at all with the default filter.

## Task footprint

| What  | Where                                                   |
| ----- | ------------------------------------------------------- |
| Specs | `docs/specs/message-bus/usage/`                         |
| Laws  | `docs/constitution/verifiability.md`, `lists.md`        |
| Rules | `.claude/skills/testing/`, `.claude/skills/doc-style/`  |
| Code  | `libs/message-bus-api/observations/`, `libs/message-bus-admin/usage/`, `apps/message-bus-admin-e2e/` |

## What counts as done

- `GET /api/usage`, `/digest` and `/:skill/sessions` without `tree` answer 200 over all trees.
- A named unknown tree still answers `404 treeUnknown`.
- The section with «Все проекты» shows the table and the digest.

## Stages

### 1. The receiver reads all trees without a tree

- **Steps:**
    1. The usage queries take an optional tree and filter by it only when named
    2. The controller passes no tree for an empty sign and refuses an unknown one
    3. The controller spec covers SC-MB-428 and SC-MB-429
- **Readiness sign:** the observations feature suite is green with the new tests.
- **Verified by:** `pnpm exec nx test message-bus-api-observations-feature --skip-nx-cache` — "passed" and no "failed"

### 2. The screen reads the digest without a tree

- **Steps:**
    1. The digest store reads with an empty tree
    2. The end-to-end spec opens the section without a tree and sees rows (SC-MB-430)
- **Readiness sign:** the store type-checks and lints; the end-to-end spec passes on the stand.
- **Verified by:** `pnpm exec nx run-many -t lint,typecheck -p message-bus-admin-usage-data-access` — no errors

### 3. Closing

- **Steps:**
    1. The agreement merges into the usage spec
    2. The task folder is taken apart into the archive
    3. The PR opens
- **Readiness sign:** `check:specs` is green and the PR is open.
- **Verified by:** `pnpm run check:specs` — no errors

## What this work does not do

- The section «Качество» — it already reads all trees.
- The right `quality:read` for the owner's account — a setting, not code.
