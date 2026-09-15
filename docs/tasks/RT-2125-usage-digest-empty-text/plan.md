# Plan

**Task:** RT-2125 · **Branch:** RT-2125-usage-digest-empty-text
**Spec:** `docs/specs/message-bus/usage/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/message-bus/usage/` — the rule about the digest names the empty text of the lists                 |
| Laws  | `docs/constitution/reuse-first.md`, `docs/constitution/verifiability.md`                                      |
| Rules | `.claude/skills/reuse-first/`, `.claude/skills/testing/`                                                      |
| Code  | `libs/message-bus-admin/usage/ui/`, `libs/message-bus-admin/common/core/util/`, `apps/message-bus-admin-e2e/` |

## What counts as done

- Over a period without rows the three lists of the digest say their Russian empty text; the end-to-end scenario SC-MB-358 asserts it.

## Stages

### 1. The empty text of the lists

- **What is done:** the digest component passes `emptyText` to the three lists; the label `digestNoDenials` in the dictionary; `uiNoData` in the Russian kit map; the spec rule names the text; SC-MB-358 asserts the text of two lists.
- **Readiness sign:** the usage spec of the end-to-end suite is green; the lint of the two libs is green.
- **Verified by:** `npx playwright test usage-section` in `apps/message-bus-admin-e2e` — `passed`; `pnpm exec nx run-many -t lint -p message-bus-admin-usage-ui message-bus-admin-common-core-util` — `Successfully`.

## What this work does not do

- The kit's own English default stays: the kit ships eight languages, and the admin chooses by its map.
