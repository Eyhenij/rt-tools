# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — Catalog sync
- **Done:** stages 1 and 2. 23 tests pass, coverage is full.
- **Next step:** run the sync against the stand.
- **Uncommitted:** nothing beyond this folder and the spec.
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Create the package files
- [x] 1.2 Register the package in the workspace
- [x] 2.1 Write the token check
- [x] 2.2 Write the access declarations and the start audit
- [x] 2.3 Write the guard
- [x] 2.4 Write the Connect interceptor
- [x] 2.5 Write the tests of SC-AUTH-11…15 and SC-AUTH-17
- [x] 3.1 Write the catalog sync
- [x] 3.2 Write the test of SC-AUTH-16
- [>] 3.3 Run the sync against the stand
- [ ] 4.1 Write the package README
- [ ] 4.2 Run the spec audit

## Decisions along the way

- **The catalog sync was written with its test in stage 2.** The start check calls it, and the
  module could not be covered without it. Affected stage: 3.
- **The server package compiles against the built contract.** From the contract sources the
  compiler put them inside the output of this package. Affected stage: 1.

## Sessions

### 2026-10-05

- The branch stands on RT-2533: the package takes the contract.
