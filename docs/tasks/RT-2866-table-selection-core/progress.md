# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 из 2 — closing

### Stage 1 — the selection in the core, with tests

- [x] 1. `table-core/rt-table-selection.core.ts` holds the eleven functions under core names.
- [x] 2. `table-core/rt-table-selection.core.spec.ts` checks every function.
- [x] 3. The data-table and data-list files keep their names as calls of the core.

The core spec: 10 tests. The kit: 287 suites, 3402 tests green; typecheck and eslint clean.

### Stage 2 — closing

- [x] 1. The bindings of `table-full-port` name the core.
- [ ] 2. The visual gate matches every frame; the affected checks are green. ← now
- [ ] 3. The folder is taken apart, the PR opens into the epic branch.

## Decisions along the way

- The card's «written twice» did not reproduce: data-list already calls the data-table functions.
  What holds is the missing tests.

## Sessions

- 2026-10-30: task taken after RT-2865 was handed over (#3018); grill closed by assumption.
