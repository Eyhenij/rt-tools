# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 2 of 2 — showcase
- **Done:** the behaviour, 28 uploader tests; the story Options; 778 of 778 frames, the sweep over
  756 stories and 92 overview pages
- **Next step:** take the folder apart and open the PR
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 The spec of the subdomain, its scenarios and bindings
- [x] 1.2 The download properties and the icon size input
- [x] 1.3 The choose button inputs and the preview without the gap
- [x] 2.1 The overview tables and the story for the new values
- [x] 2.2 Snapshots for the new story and the re-taken uploader frames

## Decisions along the way

- The download size is the uploader's own property, declared at its root with the button's former
  step, and it reaches the button as `--rt-icon-button-size-step`. The first draft wrote the public
  `--rt-icon-button-size` on the button; the token graph refused it, and the icon button's own
  comment says kit components write the step, so the application keeps the last word. The spec's
  decision is rewritten by the same commit, and no consumer handle is added.
- The overview and CONTEXT tables are updated in stage 1 together with the inputs: the docs check
  pairs them with the component.
- The step is written on the root of the button's template, not on its host: the button declares
  its step there, and the first frame of the story Options showed the large button at the default
  size. The frames States, Presets and Themes matched before and after this fix.

## Sessions

### 2026-10-04

- The task is taken by the owner's word «Да, бери (Recommended)»: items 51–54 of the consumer's
  request, after the epic RT-2472 was merged into main.
