# Progress

## Where we stand

- **State:** `этапы-кончились`
- **Stage:** 5 of 5 — Showcase and snapshots, done
- **Done:** all five stages. The rules and scenarios SC-UKV-835–845 with their bindings; every
  visual value of the trees in block properties with today's values; the empty icon, the template
  inputs, the slot under the search, the pass-through and the highlight flag with their specs; the
  material blocks; seven new stories and their references. The final snapshot run matched 841 of
  845 frames, the four left being the icon frames outside this work
- **Next step:** the closing steps — taking the folder apart and the PR — belong to the session
  that leads the epic
- **Uncommitted:** no
- **Waiting for the owner:** «пры не открывай откроеш после моего апрува» — sending the branch and the PR wait for their word. The live comparison with the application matched: rows 32px, gap 5px, radius 6px, indent 46px, checkbox 16px, match #ffeb3b semibold, select all 14/500. The four icon frames diverge until the breadcrumbs task, which retook them, is merged into the epic
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
- [x] 5.1 Write the material and preset stories and update the overview input tables
- [x] 5.2 Re-take the material halves and take the new references after reading them
- [x] 5.3 Run the whole snapshot set

## Decisions along the way

- **The spec check of stage 1 turns green with stage 4, not with stage 1.** Three bindings name the
  material blocks, which stage 4 writes; the scenarios and the other bindings matched once stage 3
  was in. Affected stage: 1.
- **Four icon frames diverge on the epic branch without this work.** The run of stage 2 matched 834
  of 838 frames; the four are `atoms-icon--presets`, `--material-set`, `--material-themes` and
  `--migration-map`, where the new frame holds the `folder` icon that came with main and the
  reference does not. Every frame of the trees, the selectors and the checkbox matched. They are
  not retaken here: the breadcrumbs branch already retook them. Affected stage: 2.
- **The checkbox box takes its size and its border from properties declared on its host.**
  `--rt-checkbox-box-size` and `--rt-checkbox-box-border-color` keep the former 18px and the kit
  border; the tree's element class on the same host overrides them. A fallback inside `var()` was
  tried first and refused by the token graph check. Affected stage: 2.
- **A material row is 32px outside, not inside.** The coordinator measured the material half live:
  the row came out 40px — a minimum height of 32 plus 4px fields on each side — and the checkbox
  18px, because its box counts the 1px border outside. The row now reads `--rt-tree-row-box-sizing`
  (default `content-box`, material `border-box`), the material box is 14px inside and 16px with
  its border, and the unchecked border takes the application's grey `--rt-mat-neutral-40`. Measured
  on the built showcase: the material rows of all five trees are 32px with a step of 37, the box
  16 by 16; the kit rows stay 36px (34 in the draggable tree) and the box 20 by 20. Affected
  stage: 4.

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
- Stage 5: seven new stories — `Material` in each of the five matrices, `Slots` and `Highlight` in
  the selector. All seven were shot locally and looked at before any reference was taken.
- The snapshot run after the stories: 809 of 838 frames matched. The 25 tree frames that diverged
  moved only in the material half. In five of them the bottom edge of the kit half's box moved by
  the grown height of the pair, and not one pixel of a kit tree did. The four icon frames are the
  same as at stage 2.
- The pointed re-take of the five tree matrices: 25 references updated, 7 written, 6 matched.
- The final run on a second raising of the showcase: 841 of 845 frames matched; only the four
  icon frames diverged.
- The tree and checkbox tests: 108 of 108 in 10 suites; the whole package 2741 of 2741. The
  typecheck, the linter, stylelint, the overview audit, the spec check and the token checks pass.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-2764-kit2-trees-material

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 5 of 5 — Showcase and snapshots
- **Next step:** the material stories of the five trees; the overview tables are already updated
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2764-kit2-trees-material/progress.md`; the plan lies next to it.

### Uncommitted

```
 M docs/tasks/RT-2764-kit2-trees-material/progress.md
 M projects/ui-kit-v2/src/lib/components/checkbox/rt-checkbox.component.scss
 M projects/ui-kit-v2/src/lib/components/draggable-tree/Overview.mdx
 M projects/ui-kit-v2/src/lib/components/draggable-tree/rt-draggable-tree.component.scss
 M projects/ui-kit-v2/src/lib/components/draggable-tree/stories/component/test-draggable-tree-matrix.component.html
 M projects/ui-kit-v2/src/lib/components/draggable-tree/stories/component/test-draggable-tree-matrix.component.ts
 M projects/ui-kit-v2/src/lib/components/draggable-tree/stories/draggable-tree-matrix.stories.ts
 M projects/ui-kit-v2/src/lib/components/hybrid-tree-selector/stories/component/test-hybrid-tree-selector-matrix.component.html
 M projects/ui-kit-v2/src/lib/components/hybrid-tree-selector/stories/component/test-hybrid-tree-selector-matrix.component.ts
 M projects/ui-kit-v2/src/lib/components/hybrid-tree-selector/stories/hybrid-tree-selector-matrix.stories.ts
 M projects/ui-kit-v2/src/lib/components/hybrid-tree/stories/component/test-hybrid-tree-matrix.component.html
 M projects/ui-kit-v2/src/lib/components/hybrid-tree/stories/component/test-hybrid-tree-matrix.component.ts
 M projects/ui-kit-v2/src/lib/components/hybrid-tree/stories/hybrid-tree-matrix.stories.ts
 M projects/ui-kit-v2/src/lib/components/tree-selector/stories/component/test-tree-selector-matrix.component.html
 M projects/ui-kit-v2/src/lib/components/tree-selector/stories/component/test-tree-selector-matrix.component.ts
 M projects/ui-kit-v2/src/lib/components/tree-selector/stories/tree-selector-matrix.stories.ts
 M projects/ui-kit-v2/src/lib/components/tree/Overview.mdx
 M projects/ui-kit-v2/src/lib/components/tree/rt-tree.component.scss
 M projects/ui-kit-v2/src/lib/components/tree/stories/component/test-tree-matrix.component.html
 M projects/ui-kit-v2/src/lib/components/tree/stories/component/test-tree-matrix.component.ts
```

### Commits over the main branch

```
91e116570 feat(rt:ui-kit-v2): деревья второго кита получают материальный вид приложения и входы под него
c8633683f docs(rt:ui-kit-v2): папка задачи RT-2764
bea80f739 chore(rt:ui-kit-v2): main влита в ветку эпика RT-2542
37170b12e docs(rt:ui-kit-v2): план эпика RT-2542 — меню действий сделано, следующая палитра
c44bbfca7 docs(rt:ui-kit-v2): план эпика RT-2542 — итог сравнения компонентов с приложением
dc402a83b chore(rt:ui-kit-v2): main влита в ветку эпика RT-2542
98c30c88a chore(rt:ui-kit-v2): main влита в ветку эпика RT-2542
7d32090ff chore(rt:ui-kit-v2): main влита в ветку эпика RT-2542
df6f656a5 chore(rt:ui-kit-v2): main влита в ветку эпика RT-2542
483d21965 chore(rt:ui-kit-v2): main влита в ветку эпика RT-2542
649779996 chore(rt:ui-kit-v2): main влита в ветку эпика RT-2542
5033aa114 chore(rt:ui-kit-v2): main влита в ветку эпика RT-2542
3e047648b chore(rt:ui-kit-v2): main влита в ветку эпика RT-2542
e88c4b0ba test(rt:ui-kit-v2): кадры значков после слияния main несут значки эпика
b452f2622 chore(rt:ui-kit-v2): main влита в ветку эпика RT-2542
3702f44b9 chore(rt:ui-kit-v2): main влита в ветку эпика RT-2542
720dd3e75 Merge remote-tracking branch 'origin/main' into RT-2542-kit2-app-parts
e99be6700 [RT-2551] Во втором ките появился гибридный выбор деревом (#2622)
43120470d Merge branch 'RT-2542-kit2-app-parts' into RT-2551-kit2-hybrid-tree-selector
1189e339c Merge branch 'RT-2611-delivery-guard-length' into RT-2542-kit2-app-parts
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
