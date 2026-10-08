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

- **`auth-server` leaves as 0.2.1, not 0.1.1, and `cms-server` 0.1.1 depends on `^0.2.1`.** The
  registry already has `auth-server` 0.2.0: it differs from 0.1.0 only by the required peer
  `@connectrpc/connect`, which `cms-server` declares too. A 0.1.1 would branch off an old line, and
  the consumer would stay on the version without that peer. Order: `auth-server` 0.2.1 is published
  first, then `cms-server` takes it in the lockfile and leaves as 0.1.1. Affected stage of the plan: 2.

## Sessions

### 2026-10-08

- The task taken from the epic branch after the release of 0.1.0 merged.
- Stage 1: 107 relative imports in 38 files got `.js`; the test of each package fails on a planted
  import without it and passes after. The module build has 19 and 36 relative paths, none without
  `.js`. Tests, lint and builds of both packages green.
