# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 2 — Release 0.1.1
- **Done:** 107 relative imports in 38 files carry `.js`; a test per package holds it
- **Next step:** 2.2 — publish both packages from the task branch
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Add `.js` to the relative imports of both packages
- [x] 1.2 Add a test per package that holds the extensions
- [x] 2.1 Raise both packages to 0.1.1
- [>] 2.2 Publish both packages from the task branch
- [ ] 2.3 Load the published module build under Node

## Decisions along the way

## Sessions

### 2026-10-08

- The task taken from the epic branch after the release of 0.1.0 merged.
- Stage 1: 107 relative imports in 38 files got `.js`; the test of each package fails on a planted
  import without it and passes after. The module build has 19 and 36 relative paths, none without
  `.js`. Tests, lint and builds of both packages green.
