# Progress

## Where we stand

- **State:** `этап-идёт`
- **Stage:** 4 of 4 — Snapshots and delivery
- **Done:** the subdomain spec with scenarios SC-UKV-786–792; the component, its model, logic and
  styles; fifteen specs; seven stories, the overview page and the folder note. The look on :6007 is
  measured, and six references are taken. The whole set after the merge of main is green: 2707
  tests, 843 frames of 843, the kit checks and the overview pages.
- **Next step:** the push and the PR into the epic branch after the owner's word.
- **Uncommitted:** no
- **Waiting for the owner:** «пры не открывай откроеш после моего апрува» — the push and the PR wait
  for the owner's approval in the morning.
- **PR:** not open

## Decisions along the way

- The applications' samples, read before the spec. The first application's badge is a field all the
  time: focus selects the text, Enter and leaving save, Escape restores, an empty value goes back
  silently. The same wiring is copied by hand into a page title. The second application opens a
  field with «Save» and «Cancel» under a settings row, the save unavailable for an empty value,
  without keys. Neither is a component of the kit, and the kit holds the pattern only inside the
  editable list rows.
- The draft lives in a form control, not in a two-way binding: the binding wrote the value into the
  field a tick after the first render, and the select-all on opening found an empty field.
- Leaving the field keeps it open by default; the first application's way — save on leaving — is the
  input `blurAction="save"`.
- The measurement on :6007 found two defects, both fixed. The badge took the action colour on a light
  plate, a contrast of 4.0 and 3.4 for small text; it now takes the neutral `rt-tag` colours, and an
  empty badge is muted. A field disabled while saving dropped the focus onto the page, and it now
  comes back to the field on a refusal and to the value on closing.

## Steps

- `[x]` done · `[>]` going on right now · `[ ]` not begun

- [x] 1.1 Read the application's component and write what it does into the progress
- [x] 1.2 Write the subdomain spec, scenarios and bindings for the inline edit
- [x] 2.1 Write the component, its model and styles in the components layer
- [x] 2.2 Write the specs on the rest, the edit, the keys, the save and the cancel
- [x] 3.1 Write the overview page, the matrix stories and the playground
- [x] 3.2 Measure the layout on :6007
- [x] 4.1 Take the references of the new stories after looking at them
- [>] 4.2 Run the whole set and open the PR into the epic branch after the owner's word

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/sviatoslavkhutornoy/WebstormProjects/rt-tools
**Branch:** RT-2553-kit2-inline-edit

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 3 of 4 — Showcase
- **Next step:** the overview page, the matrix stories and the playground, then a measurement on
- **PR:** not open

The progress in full — `docs/tasks/RT-2553-kit2-inline-edit/progress.md`; the plan lies next to it.

### Uncommitted

```
?? projects/ui-kit-v2/src/lib/components/inline-edit/CONTEXT.md
?? projects/ui-kit-v2/src/lib/components/inline-edit/Overview.mdx
?? projects/ui-kit-v2/src/lib/components/inline-edit/stories/
```

### Commits over the main branch

```
b6fd2b5b4 feat(rt:ui-kit-v2): правка значения на месте rt-inline-edit — компонент и спека
c14234463 docs(rt:ui-kit-v2): папка задачи RT-2553, разбор и замысел правки на месте
e88c4b0ba test(rt:ui-kit-v2): кадры значков после слияния main несут значки эпика
b452f2622 chore(rt:ui-kit-v2): main влита в ветку эпика RT-2542
3702f44b9 chore(rt:ui-kit-v2): main влита в ветку эпика RT-2542
720dd3e75 Merge remote-tracking branch 'origin/main' into RT-2542-kit2-app-parts
e99be6700 [RT-2551] Во втором ките появился гибридный выбор деревом (#2622)
43120470d Merge branch 'RT-2542-kit2-app-parts' into RT-2551-kit2-hybrid-tree-selector
1189e339c Merge branch 'RT-2611-delivery-guard-length' into RT-2542-kit2-app-parts
2ed9cfb12 Merge remote-tracking branch 'origin/RT-2542-kit2-app-parts' into RT-2551-kit2-hybrid-tree-selector
54a5d3b7d [RT-2550] Во втором ките появился выбор деревом с поиском и «Применить» (#2617)
7bb124732 Merge branch 'RT-2550-kit2-tree-selector' into RT-2551-kit2-hybrid-tree-selector
b43abb017 Merge branch 'RT-2542-kit2-app-parts' into RT-2550-kit2-tree-selector
7f722f130 Merge branch 'RT-2611-delivery-guard-length' into RT-2542-kit2-app-parts
2e5e081d4 docs: папка задачи RT-2551 разобрана в архив
cb1938099 Merge branch 'RT-2550-kit2-tree-selector' into RT-2551-kit2-hybrid-tree-selector
22520a205 docs: папка задачи RT-2550 разобрана в архив, задача в плане эпика на ревью
1a00a8478 Merge branch 'RT-2542-kit2-app-parts' into RT-2550-kit2-tree-selector
40d3f3cf9 Merge remote-tracking branch 'origin/main' into RT-2542-kit2-app-parts
7a4a0f41c feat(rt:ui-kit-v2): «Выбрать все» липкая и необязательная
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
