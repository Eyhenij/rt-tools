# Grill

Former address: docs/tasks/RT-2764-kit2-trees-material/grill.md

## The owner request

> все переносимые компоненты из апки должны иметь базовую вьюху кита + материальную но без
> использования пакетов материал, стили должны быть заданы через токены чтобы поддавались
> модификации из апки + необходимые входы

> важно не допустить регрессий и изменения дефолтной вьюхи второго кита

> мигрировать на новую апку будет без проблем без потери вьюхи и функционала, хватает окинов и входов?

> доделывай

The first two quotes are the owner's words for the whole epic RT-2542; the last two answer the
comparison of the ported trees with the application. The card #2764 names the gap: none of the five
kit trees has the application's material look.

## What the tree already has

- Five trees in `projects/ui-kit-v2/src/lib/components/`: `rt-tree`, `rt-hybrid-tree` (the same
  template and styles as `rt-tree`), `rt-tree-selector`, `rt-hybrid-tree-selector` (the same
  template and styles as the selector) and `rt-draggable-tree`.
- Their specs: `docs/specs/ui-kit-v2/{tree,tree-selector,draggable-tree,hybrid-tree-selector}/`.
- Every matrix story of the trees already stands in `app-story-presets`: each frame holds a kit half
  and a material half. Today both halves look the same, because no tree reads the preset.
- Samples of a component material block in this epic: the breadcrumbs, the quick menu, the palette
  and the carousel — a `:is(.rt-preset-material, [data-preset='material']) &` block that only
  reassigns the component's own properties.
- The epic plan `docs/plans/kit2-app-parts.md`, section «Сравнение с приложением 10 октября», lists
  what the trees lack: rows 8px 12px with a 6px radius and a 5px gap, a level indent of 46px with a
  line, an arrow in the primary colour, the match highlight #ffeb3b, an empty state with an icon, a
  count pill; in the selector a place under the search, row content at the end, a flag for the
  match highlight; in the draggable tree a radius of 8px, a shadow under the pointer, a handle on
  hover and 2px lines.

## The application's trees measured live

Measured by the main session with `getComputedStyle` on the application's hybrid tree selector, at a
pixel ratio of 1:

- A group row is a button 32px high, padding 8px 12px, radius 6px, transparent; 10px between the
  arrow and the name; the arrow is 16px in the theme's primary colour; the name is 14px/400 in the
  on-surface colour.
- The children list has padding 5px 0 0 46px: the indent is 46px, and 5px stand between rows.
- A leaf row is the same 32px button; a 16px checkbox box with a 1px border and a 4px radius, 10px
  to the name.
- The search field and the two pill buttons above the list are kit controls already.
- The list area of the static selector has 10px above it.

## What the rules already say

- No Angular Material packages in the second kit; `var(--mat-sys-…, <kit step>)` is allowed in a
  component's own property declarations.
- A raw value is not written where a token exists; a value off the scale is composed from steps.
- A new colour step goes into the material scale, and a scale step is never rewritten by the dark
  theme.
- The checkbox and the radio keep the kit's own look under the material preset (owner, 29 September
  2026): the tree sizes its checkbox through a property, the checkbox block does not change.

## Questions and answers

None asked: the owner's «доделывай» answers the list of gaps from the comparison.

## Decisions

- **The default look stays pixel for pixel.** Every new property takes today's value as its
  default; the proof is two runs: the properties without the material block must match every
  existing frame, and only then the material block goes in. Rejected: one change and a re-take of
  all tree frames — a moved kit half would hide in it.
- **The empty state icon is an input, not a preset effect.** `emptyIcon` defaults to none, so the
  kit look draws no icon; the application names its icon. Rejected: an icon drawn only under the
  preset — CSS cannot add an element, and a hidden icon in every kit tree is dead markup.
- **The node templates reach the inner tree by inputs.** `rt-tree` takes `nodeEndTemplate` and
  `nodeMetaTemplate` next to its directives; the selector reads the directives from its content and
  passes their templates down. Rejected: projecting them — a template given to the selector is not
  content of the tree inside it.
- **The place under the search is a template directive, like the selector's controls.** Rejected:
  `ng-content` — the selector already takes its slots as templates.
- **The match highlight in the selector is switched by `matchHighlight`, on by default.** Off,
  the tree inside gets no term; `highlight` alone would read as the highlighted row. Rejected: an input on `rt-tree` — the standalone tree's term is the
  application's own, and it can pass none.
- **The checkbox box takes its size from an optional property with today's 18px as the fallback.**
  The tree sets it to 16px under the preset; the checkbox declares nothing and looks as before.

## What is left unclear

- Where the application draws the level line: the measurement names the indent, not the line. The
  line stands under the parent's arrow; the owner judges it on the showcase.

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
