# Plan

**Task:** RT-2514 · **Branch:** RT-2514-epic-plan-dups
**Behaviour:** unchanged — a plan document only; the owner's word «Делай RT-2514»

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What | Where                               |
| ---- | ----------------------------------- |
| Text | `docs/plans/kit2-migration-gaps.md` |

## What counts as done

- The epic task table holds one row per task, every one «влит», and the plan has no other repeats.

## Stages

### 1. The cleanup

- **Steps:**
    1. Leave one row per task in the task table, every state «влит».
    2. Check the rest of the plan for repeated lines.
- **Readiness sign:** the epic table prints ten rows, each «влит».
- **Verified by:** `node tools/epic-table.mjs 2472` and `npm run check:docs`.

## What this work does not do

- A check that refuses a repeated task number in an epic table — a proposal to the owner.
