# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 2 из 3 — Showcase
- **Done:** stage 1 — the step labels, the `step` and `stepper` inputs, the arrows and the keys;
  44 field tests green, 13 of them on the arrows
- **Next step:** the arrows in the field stories
- **Uncommitted:** nothing
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Add the step labels to the kit labels
- [x] 1.2 Add the `step` and `stepper` inputs and the step logic
- [x] 1.3 Draw the arrows in the field after the clear button
- [x] 1.4 Handle the Up and Down keys in the field
- [x] 1.5 Cover SC-UKV-1133…1143 by unit tests
- [x] 2.1 Add the arrows to the field stories
- [>] 2.2 Check the stories by eye and by measurement against the mockup
- [ ] 2.3 Get the owner's word on the showcase
- [ ] 3.1 Merge the agreement into the kit spec
- [ ] 3.2 Run the push gate set
- [ ] 3.3 Take the task folder apart and open the PR

## Decisions along the way

- **The branch is taken from RT-2927, not from the main branch** — the chain goes on: RT-2927 stands
  on RT-3041, and the owner's mail in the signature list lives there until they merge.

- **The up and down arrows look different, and the cause is the icons themselves** — the kit's
  `chevron-up` and `chevron-down` (and the mockup's glyphs) have one arm heavier than the other and
  are not mirror copies; at 12 px that reads as a different size. The owner asked about it; the
  choice of glyph waits for their word. Affected stage of the plan: 2.

## Sessions

### 2026-11-03

- The task was free: no assignee, no branch, no archive record. Assigned to `treble3d`, moved to
  in progress.
- The mockup read: the stepper column 20×32, two buttons 20×16 with radius 4, glyph 12.
