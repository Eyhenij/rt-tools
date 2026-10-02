# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — texts and showcase
- **Done:** the branch from the epic branch, the folder, the focus options, the lead slot, the footer alignment, the content part, the properties
- **Next step:** the spec bindings and scenarios
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Focus options in the dialog config
- [x] 1.2 The header lead slot and the footer alignment
- [x] 1.3 The content part
- [x] 2.1 The dialog, header, title and footer properties
- [>] 3.1 The spec of the subdomain, its bindings and scenarios
- [ ] 3.2 The overview tables and the stories for the new slot, alignment, part and properties
- [ ] 3.3 Snapshots for the new stories

## Decisions along the way

- The focus trap and the first focus are set after the dialog renders: before it the overlay holds
  neither the frame nor the buttons. The trap leaves on the overlay's detachment, by a stream of its
  own in the service's constructor stream, because the closing streams end on that same detachment.
- Without a trap, `autoFocus: 'first-tabbable'` uses a short-lived CDK trap only to find the first
  control, and destroys it at once.
- The focused frame draws no outline: it is a starting point for a screen reader, not a control.
- The title weight reads `--rt-font-weight-bold` by default — the browser's bold of an `h2`, the same
  700, so the title does not change.
- The test components of the dialog spec were renamed to `rt-dialog-test-content` and
  `rt-dialog-parts-host`: the first one held the selector `rt-dialog-content`, now taken by the part.

## Sessions

### 2026-10-02

- The branch stands on the epic branch RT-2472-kit2-migration-gaps, which carries main.
