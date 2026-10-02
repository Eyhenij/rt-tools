# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — texts and showcase
- **Done:** the branch from the epic branch, the folder, the options, the replace mode, the icon token, the layer property, the strip and the colour handles
- **Next step:** the spec bindings and scenarios
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Duration and progress in the options, the model and the toast timer
- [x] 1.2 The replace mode of the toaster
- [x] 1.3 The per-toast icon and the severity icons token
- [x] 2.1 The toaster layer property
- [x] 2.2 The progress strip and the colour handles of the toast and its filled kinds
- [>] 3.1 The spec of the subdomain, its bindings and scenarios
- [ ] 3.2 The overview tables and the stories for the new options, mode and handles
- [ ] 3.3 Snapshots for the new stories

## Decisions along the way

- The icon no longer takes its colour by the icon's `color` input, which writes an inline style no
  rule can override. The toast paints it from a private severity colour, read under the icon handle.
- The strip's lifetime is the internal `--lifetime`, like the stack's `--offset`: the toast writes it
  from its own binding, and it is no handle.
- The filled kinds keep their icon on the text colour, so the filled text handle repaints both.

## Sessions

### 2026-10-02

- The branch stands on the epic branch RT-2472-kit2-migration-gaps, which carries main.
- The owner added a request for the icon button mid-task; it is task RT-2493 of the same epic,
  taken after this one.
