# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 1 of 1 — renumbering
- **Done:** 43 identifiers moved to 491–533; the uploader's download button moved to the radius input main brought
- **Next step:** commit, push, PR into the epic
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Move the 43 colliding identifiers of the four epic subdomains to 491–533 in specs, bindings, the index and test titles
- [>] 1.2 Run the spec check and the second kit's specs

## Decisions along the way

- **The uploader's download button takes `radius` instead of `shape`** — main folded the icon button's `shape` into the shared `radius` input, and the epic's uploader still bound `shape`: two specs fell with NG0303. The uploader's own `downloadShape` input stays; a circle maps to the `full` step. Affected stage of the plan: 1.

## Sessions

### 2026-10-01

- The branch stands on the local epic with main merged in (merge commit 0d47a6940).
