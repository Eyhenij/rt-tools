# Plan

**Task:** RT-2584 · **Branch:** RT-2584-kit2-tree-scenario-ids
**Behaviour:** unchanged — the owner chose to renumber the tree scenarios: «В PR #2583 (Recommended)»

## Task footprint

| What  | Where                                                             |
| ----- | ----------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/tree/`, `docs/specs/ui-kit-v2/scenarios.md` |
| Code  | `projects/ui-kit-v2/src/lib/components/tree/`                     |

## What counts as done

- No scenario number of the epic branch repeats a number of main.

## Stages

### 1. Renumber

- **Steps:**
    1. Carry over the renumber commit
    2. Run the checks
- **Readiness sign:** the spec check reports no duplicate numbers
- **Verified by:** `npm run check:specs` — exit code 0

## What this work does not do

- The remote branch recreated by the push into the merged RT-2572 branch is removed after the
  owner's word, outside this branch.
