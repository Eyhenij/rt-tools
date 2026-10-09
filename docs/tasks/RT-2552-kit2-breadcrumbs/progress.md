# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Snapshots and delivery
- **Done:** the spec, the component, ten specs, the overview page and seven stories; the frames were
  looked at and measured on :6007; seven references are taken. The whole set of the second kit
  passed after the epic branch was merged in: 2677 tests, 844 frames of 844.
- **Next step:** take the folder apart and open the PR into the epic branch when the owner approves
  the opening.
- **Uncommitted:** no
- **Waiting for the owner:** «пры не открывай откроеш после моего апрува» — the push and the PR wait
  for the owner's approval in the morning
- **PR:** not open

## Decisions along the way

- The ancestors keep their width and the row scrolls to its end: a shrinking last crumb collapsed to
  nothing once the row overflowed, and the open page vanished from a long chain.
- The row is scrolled to its end again whenever a crumb changes size: the page font arrives after the
  first render, and the end measured before it was 32 pixels short.
- The focus ring gets inner room in the scrolling row: the row clipped it to two vertical bars.
- Colours, type, gaps and the back button became `--rt-breadcrumbs-*` properties with the former steps
  as defaults. The material preset reassigns five of them after the application's breadcrumbs.
  The owner's words: «все переносимые компоненты из апки должны иметь базовую вьюху кита +
  материальную но без использования пакетов материал, стили должны быть заданы через токены чтобы
  поддавались модификации из апки + необходимые входы». The kit's own look does not move, and the
  material half of the Presets frames is retaken.
- The scenarios moved from SC-UKV-775–780 to SC-UKV-819–824. The merge of main brought the chat and
  icon scenarios under the same numbers, and main keeps its numbers; the test titles moved by the
  same commit.

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Write the subdomain spec, scenarios and bindings for the breadcrumbs
- [x] 1.2 Take scenario numbers from the tree command
- [x] 2.1 Write the component, its model and styles in the components layer
- [x] 2.2 Write the specs on inputs, links, the back button and the fold
- [x] 3.1 Write the overview page, the matrix stories and the playground
- [x] 3.2 Measure the layout on :6007 and show it to the owner
- [x] 4.1 Take the references of the new stories after looking at them
- [>] 4.2 Run the whole set and open the PR into the epic branch after the owner's word

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-2552-kit2-breadcrumbs

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Snapshots and delivery
- **Next step:** take the folder apart and open the PR into the epic branch when the owner approves
- **PR:** not open

The progress in full — `docs/tasks/RT-2552-kit2-breadcrumbs/progress.md`; the plan lies next to it.

### Uncommitted

```
 M projects/ui-kit-v2/src/lib/components/breadcrumbs/Overview.mdx
 M projects/ui-kit-v2/src/lib/components/breadcrumbs/rt-breadcrumbs.component.scss
```

### Commits over the main branch

```
40d362078 chore(rt:ui-kit-v2): ветка эпика RT-2542 со свежим main влита в ветку задачи RT-2552
483d21965 chore(rt:ui-kit-v2): main влита в ветку эпика RT-2542
f14cb33ea chore(rt:ui-kit-v2): ветка эпика RT-2542 со свежим main влита в ветку задачи
649779996 chore(rt:ui-kit-v2): main влита в ветку эпика RT-2542
5033aa114 chore(rt:ui-kit-v2): main влита в ветку эпика RT-2542
a4fd9a09e Merge branch 'RT-2542-kit2-app-parts' into RT-2552-kit2-breadcrumbs
3e047648b chore(rt:ui-kit-v2): main влита в ветку эпика RT-2542
df761f327 docs(rt:ui-kit-v2): ход RT-2552 — весь набор второго кита зелёный после слияния эпика
aa9110374 Merge branch 'RT-2542-kit2-app-parts' into RT-2552-kit2-breadcrumbs
e88c4b0ba test(rt:ui-kit-v2): кадры значков после слияния main несут значки эпика
391ff9c68 feat(rt:ui-kit-v2): хлебные крошки rt-breadcrumbs
ae941a688 Merge branch 'RT-2542-kit2-app-parts' into RT-2552-kit2-breadcrumbs
b452f2622 chore(rt:ui-kit-v2): main влита в ветку эпика RT-2542
3702f44b9 chore(rt:ui-kit-v2): main влита в ветку эпика RT-2542
2a7f410ce docs: папка задачи RT-2552 — хлебные крошки второго кита
720dd3e75 Merge remote-tracking branch 'origin/main' into RT-2542-kit2-app-parts
e99be6700 [RT-2551] Во втором ките появился гибридный выбор деревом (#2622)
43120470d Merge branch 'RT-2542-kit2-app-parts' into RT-2551-kit2-hybrid-tree-selector
1189e339c Merge branch 'RT-2611-delivery-guard-length' into RT-2542-kit2-app-parts
2ed9cfb12 Merge remote-tracking branch 'origin/RT-2542-kit2-app-parts' into RT-2551-kit2-hybrid-tree-selector
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
