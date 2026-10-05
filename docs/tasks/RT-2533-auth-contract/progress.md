# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — Texts
- **Done:** all three stages. The package builds, 9 tests pass.
- **Next step:** take the folder apart and open the PR.
- **Uncommitted:** nothing.
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Create the package files
- [x] 1.2 Register the package in the workspace
- [x] 1.3 Let the manifest script assemble any package
- [x] 2.1 Write the right and the catalog
- [x] 2.2 Write the caller and the checks
- [x] 2.3 Write the tests of SC-AUTH-6…10
- [x] 3.1 Write the package README
- [x] 3.2 Run the spec audit

## Decisions along the way

- **The branch stands on RT-2529, not on the epic branch.** The contract is a subdomain of the
  domain the first task creates. The spec audit refuses a subdomain without its domain, and RT-2529
  is not merged yet. Affected stage: 3.
- **The contract table lives in the package README.** The audit matches the section «Contract»
  against server procedures, and the package has none. Affected stage: 3.
- **Four bindings are written as not checked by a machine.** The anchor audit does not follow a
  `.js` import of a barrel. Published functions then read to it as called by tests alone. The fix
  is task RT-2537. Affected stage: 3.

## Sessions

### 2026-10-05

- The owner named the packages: «auth-* (Recommended)».
