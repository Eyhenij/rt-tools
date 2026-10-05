# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 2 of 2 — Contract bindings
- **Done:** both stages. The suite and the spec audit are green.
- **Next step:** take the folder apart and open the PR.
- **Uncommitted:** nothing.
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Fix the published files reading
- [x] 1.2 Add the suite probe of SC-AK-1187
- [x] 1.3 Lay the package out
- [x] 2.1 Bind the four rules of the contract to their functions
- [x] 2.2 Run the spec audit

## Decisions along the way

- **The probe names the file unlike the function.** With the same name the import line of the
  barrel counted as a call by itself, and the probe was green without the fix. Affected stage: 1.

## Sessions

### 2026-10-05

- The branch stands on RT-2533: the contract companion lives there.
