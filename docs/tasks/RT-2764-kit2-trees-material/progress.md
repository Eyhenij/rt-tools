# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 5 of 5 — Showcase and snapshots
- **Done:** the rules and scenarios SC-UKV-835–845 with their bindings; every visual value of the
  trees in block properties with today's values, and the whole snapshot set matched every tree and
  checkbox frame; the empty icon, the template inputs, the slot under the search, the pass-through
  and the highlight flag with their specs
- **Next step:** the material stories of the five trees; the overview tables are already updated
- **Uncommitted:** no
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Write the rules and scenarios for the new inputs, the slot and the material look
- [x] 1.2 Bind every new rule to code in the companion files
- [x] 2.1 Move every visual value of the trees into block properties with today's values
- [x] 2.2 Run the whole snapshot set against the existing references
- [x] 3.1 Add the empty icon, the node template inputs, the slot under the search, the pass-through and the highlight flag
- [x] 3.2 Write the specs on them by the scenario numbers
- [x] 4.1 Add the material blocks to the trees and the missing scale step
- [x] 4.2 Run the token and style checks
- [>] 5.1 Write the material and preset stories and update the overview input tables
- [ ] 5.2 Re-take the material halves and take the new references after reading them
- [ ] 5.3 Run the whole snapshot set

## Decisions along the way

- **The spec check of stage 1 turns green with stage 4, not with stage 1.** Three bindings name the
  material blocks, which stage 4 writes; the scenarios and the other bindings matched once stage 3
  was in. Affected stage: 1.
- **Four icon frames diverge on the epic branch without this work.** The run of stage 2 matched 834
  of 838 frames; the four are `atoms-icon--presets`, `--material-set`, `--material-themes` and
  `--migration-map`, where the new frame holds the `folder` icon that came with main and the
  reference does not. Every frame of the trees, the selectors and the checkbox matched. They are
  not retaken here: the breadcrumbs branch already retook them. Affected stage: 2.
- **The checkbox box takes its size from `--rt-checkbox-box-size` with 18px as the fallback.** The
  checkbox declares nothing, so its own look stays; the tree passes its size only when its own
  property is set. Affected stage: 2.

## Sessions

### 2026-10-10

- The task folder is written: the grill, the plan of five stages, this progress.
- Baseline: the tree tests pass 99 of 99 in 12 suites; the token style check finds no new literals.
- The snapshot run of stage 2: 834 of 838 frames matched; the four that did not are icon frames
  outside this work.
- The tree tests after stage 3: 107 of 107 in 12 suites; the typecheck and the linter are clean.
- Stage 4: the material blocks and the step `--rt-mat-yellow-100`. The token build, graph, styles,
  theme and cascade checks pass; the spec check exits 0. The graph check refused two fallbacks at
  names the kit declares, and both went: the checkbox declares its box size on its host.
