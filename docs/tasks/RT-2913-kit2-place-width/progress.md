# Progress

## Where we stand

- **State:** `разбор-кончился`
- **Stage:** 3 of 3 — Showcase and frames
- **Done:** agreement, place width in code, story and frames
- **Next step:** take the folder apart and open the PR
- **Uncommitted:** the whole work
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Spec subdomain with rules and scenarios
- [x] 2.1 Named container on the frame and on the root, mixin for the query
- [x] 2.2 Component styles moved to the mixin
- [x] 2.3 Breakpoint service reads the frame width
- [x] 3.1 Story of a narrow frame in a wide window
- [x] 3.2 Snapshots updated and looked at

## Decisions along the way

- **The form vocabulary of the panel stays on `@media`.** Its tests demand the threshold of the
  panel itself, and the panel is an overlay. Affected stage of the plan: 2.
- **The container frames of the showcase get the width of their cell.** A container of width
  declares no width by its content, and in a cell sized by content it collapsed. Affected stage of
  the plan: 3.
- **The scenario numbers of the «More» header collided with the card media on the main branch.**
  The fix went as its own task RT-2914, and this branch stands on it. Affected stage of the plan: 1.

## Sessions

### 2026-10-21

- Task and branch created, stacked on the numbering fix.
- Kit tests: the service and the container 151 of 151; the form styles 51 of 51 after the revert.
- Snapshot gate: only the container frames differed; six reshot, two new, all looked at.
