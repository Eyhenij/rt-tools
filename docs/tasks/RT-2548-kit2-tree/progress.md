# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этапы-кончились`
- **Stage:** 4 of 4 — Closing
- **Done:** the logic and the component (22 tests); the marks drawn by the kit checkbox and radio; choosing no longer folds a branch (SC-UKV-652); the tooltip on a cut label (SC-UKV-653); `CONTEXT.md` and `Overview.mdx`; `Playground` and nine matrices in the preset pair; the agreement merged into `docs/specs/ui-kit-v2/tree/`; 9 references taken through the image browser and looked at as files; the sweep: 766 stories, no empty showings
- **Next step:** on the owner's «открывай» — take the task folder apart by the last commit and open the PR into `RT-2542-kit2-app-parts`; the branch is on the host, the full gate let it through
- **Uncommitted:** the folders of RT-2549 … RT-2556 under `docs/tasks/` — each goes into its own branch; nothing of RT-2548
- **Waiting for the owner:** the word «открывай» before the PR; the owner looked at the frames and said the look is fine
- **PR:** not open yet

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Declare `IRtTree` in `rt-tree.model.ts`: the node, the mode, the mark.
- [x] 1.2 Write `rt-tree.logic.ts`: `rtTreeChoose`, `rtTreeMark`, `rtTreeSelectAll`, `rtTreeLabelParts` over the select tree module.
- [x] 1.3 Write `rt-tree.logic.spec.ts` for SC-UKV-639 … SC-UKV-643, SC-UKV-645, SC-UKV-647 by the logic.
- [x] 2.1 Write `rt-tree.component.ts`, `.html`, `.scss` and `rt-tree.directives.ts` with the row template directive.
- [x] 2.2 Export the folder from the components barrel.
- [x] 2.3 Write `rt-tree.component.spec.ts` for every scenario through the drawn component.
- [x] 2.4 Write `CONTEXT.md` and `Overview.mdx` next to the component.
- [x] 3.1 Write the stories of `rt-tree` with a matrix per axis.
- [x] 3.2 Run the story sweep over the raised showcase.
- [x] 3.3 Take the snapshots of the new stories and look at every frame.
- [x] 3.4 Give the owner the links to the stories on :6007.
- [x] 4.1 Merge the agreement into `docs/specs/ui-kit-v2/tree/` and name it in the domain index.
- [x] 4.2 Run the spec check and the full set before the push.

## Decisions along the way

- **The epic grill lives in this folder.** It was written for the whole epic before the numbers
  existed; RT-2548 is the first task, and the grill leaves for the archive with this folder.
- **Every tree matrix stands in the preset pair, not only `Presets`.** The preset repaints the
  chosen and highlighted row ground, and those show on every axis.
- **`ng-template[rtTreeNodeEnd]` is named as shown inside `tree-matrix.stories.ts`.** It is a
  template slot with no look of its own; the `NodeEnd` story shows it.

## Sessions

### 2026-10-06

- The epic RT-2542 and tasks RT-2548 … RT-2556 created; the epic branch pushed.
- The consumer's name got into the first epic card and branch name; the owner caught it, both fixed
  before the branch left the machine.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-2548-kit2-tree

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 2 of 4 — The component
- **Next step:** `Overview.mdx` (step 2.4), then the stories with a preset half (stage 3)
- **PR:** not open yet

The progress in full — `docs/tasks/RT-2548-kit2-tree/progress.md`; the plan lies next to it.

### Uncommitted

```
?? ../../../../docs/tasks/RT-2549-kit2-draggable-tree/
?? ../../../../docs/tasks/RT-2550-kit2-multiselect-apply/
?? ../../../../docs/tasks/RT-2551-kit2-hybrid-tree/
?? ../../../../docs/tasks/RT-2552-kit2-breadcrumbs/
?? ../../../../docs/tasks/RT-2553-kit2-inline-edit/
?? ../../../../docs/tasks/RT-2554-kit2-speed-menu/
?? ../../../../docs/tasks/RT-2555-kit2-color-palette/
?? ../../../../docs/tasks/RT-2556-kit2-carousel/
?? ../lib/components/tree/stories/
```

### Commits over the main branch

```
78a34f4f1 docs: передача сессии по RT-2548 обновлена
9a0981c12 test(rt:ui-kit-v2): тесты компонента rt-tree и токены его стилей
faef3d9de docs: передача сессии по RT-2548
aca64cb60 feat(rt:ui-kit-v2): компонент rt-tree
ef3ee56f0 feat(rt:ui-kit-v2): модель и расчёт выбора дерева rt-tree
f75f2d6f5 docs(rt:ui-kit-v2): папка задачи RT-2548 и договорённость о дереве выбора
a123b11dd Merge remote-tracking branch 'origin/main' into RT-2542-kit2-app-parts
dd4c332bb docs: просроченные записи архива удалены
5860a059b docs: план эпика RT-2542 и назначение копии
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
