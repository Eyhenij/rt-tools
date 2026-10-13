# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — Vitest 5
- **Done:** Vitest 5.0.3 is in; build, types, specs and lint over the tree are green, 352 of 352
  tasks; 96 Vitest runs report v5.0.3, 1201 tests passed
- **Next step:** run the push gate set
- **Uncommitted:** folders of other tasks of the epic, not part of this branch
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Write the new versions into the root manifest
- [x] 1.2 Install and run build, types, tests and lint over the tree
- [x] 1.3 Fix what Vitest 5 breaks in the configs and specs
- [>] 1.4 Run the push gate set

## Decisions along the way

- **Nothing to fix in the configs and specs** — the full run passed on Vitest 5 without an edit.
  The warnings in the run come from Nx about its next major version, not from Vitest. Affected
  stage of the plan: 1.

## Sessions

### 2026-10-13

- The task is taken; Vitest 5.0.3 is in. 352 of 352 tasks, 96 Vitest runs on v5.0.3.
