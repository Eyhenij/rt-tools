# Plan

**Task:** RT-2914 · **Branch:** RT-2914-page-header-more-numbers
**Behaviour:** unchanged — the fix renumbers scenarios and their test titles

After it is written this file is not edited.

## Task footprint

| What  | Where                                                                         |
| ----- | ----------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/page-header-more/`, `docs/specs/ui-kit-v2/scenarios.md` |
| Code  | `projects/ui-kit-v2/src/lib/components/page-header/`                          |

## What counts as done

- The spec check on the branch names no taken identifier.

## Stages

### 1. Renumbering

- **Steps:**
    1. Scenarios, binding and test titles renumbered
- **Readiness sign:** the spec check has no divergence line
- **Verified by:** `npm run check:specs` — no line «is already taken»

## What this work does not do

- The check of scenario numbers across open branches: a wave of branches is checked by a trial
  merge.
