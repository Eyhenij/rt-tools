# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 3 of 3 — texts and showcase
- **Done:** the branch from the epic branch, the folder, the focus options, the lead slot, the footer alignment, the content part, the properties
- **Next step:** archive the folder, push, open the request into the epic branch
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Focus options in the dialog config
- [x] 1.2 The header lead slot and the footer alignment
- [x] 1.3 The content part
- [x] 2.1 The dialog, header, title and footer properties
- [x] 3.1 The spec of the subdomain, its bindings and scenarios
- [x] 3.2 The overview tables and the stories for the new slot, alignment, part and properties
- [x] 3.3 Snapshots for the new stories

## Decisions along the way

- The focus trap and the first focus are set after the dialog renders: before it the overlay holds
  neither the frame nor the buttons. The trap leaves on the overlay's detachment, by a stream of its
  own in the service's constructor stream, because the closing streams end on that same detachment.
- Without a trap, `autoFocus: 'first-tabbable'` uses a short-lived CDK trap only to find the first
  control, and destroys it at once.
- The focused frame draws no outline: it is a starting point for a screen reader, not a control.
- The title weight reads `--rt-font-weight-bold` by default — the browser's bold of an `h2`, the same
  700, so the title does not change.
- The footer and header hosts are `display: contents`, so a story cell's width never reached them:
  in the first frames all four footer alignments looked the same. The Align and Lead stories give
  each case a box of the cell's full width. The former Content, Closable and Title stories keep
  the same latent narrowness; their frames are unchanged.
- Snapshots: four written (dialog Content and Properties, footer Align, header Lead); 748 frames of
  748 matched in the full audit, and the sweep found no empty showing among 731 stories and 92
  overview pages.
- The test components of the dialog spec were renamed to `rt-dialog-test-content` and
  `rt-dialog-parts-host`: the first one held the selector `rt-dialog-content`, now taken by the part.

## Sessions

### 2026-10-02

- The branch stands on the epic branch RT-2472-kit2-migration-gaps, which carries main.
