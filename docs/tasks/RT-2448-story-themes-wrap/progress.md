# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 of 3 — The frames
- **Done:** the task, the branch, the plan, the wrapping pair
- **Next step:** look at every moved frame and re-take it
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Move the themes panes from the grid to a wrapping row
- [x] 1.2 Remove the fixed-track item from the showcase rule
- [>] 2.1 Run the snapshots of the second showcase
- [ ] 2.2 Look at every moved frame and re-take it
- [ ] 2.3 Confirm the re-taken frames by a second raising
- [ ] 3.1 Run the full suite
- [ ] 3.2 Take the task folder apart into the archive

## Decisions along the way

- **The branch stands on RT-2446.** The fixed-track item of the showcase rule lives only in that branch, not yet merged; the item is removed here, and the pull request goes into that branch. Affected stage of the plan: 1.
- **The date range story shows the wide panel in its themes pair.** It showed the sheet layout because the wide panel did not fit the fixed track; with the wrapping pair it fits. Affected stage of the plan: 1.
- **The snapshots run through the image gate.** `node tools/visual-gate.mjs ui-kit-v2` builds the showcase and shoots it in the image, which is how the references were taken; the plan named the run against a raised showcase. Affected stage of the plan: 2.

## Sessions

### 2026-10-01

- The task RT-2448 is taken outside an epic by the owner's word; the row of this copy is rewritten.
