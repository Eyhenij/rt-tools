# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — the showcase; all steps done
- **Done:** the error and both own views of the autocomplete and the dynamic selector, the own
  empty view of the six local lists, the own error view of the PDF viewer; the states specs cover
  SC-UKV-1287…1296; the references of the new stories, the overview pages of the nine components,
  and the agreement merged into `docs/specs/ui-kit-v2/error-states-selectors/` with its bindings.
- **Next step:** the task folder taken apart into the archive, the roles on the tip, then the push
  of the RT-3292 → RT-3294 → RT-3295 stack.
- **Uncommitted:** no.
- **Waiting for the owner:** no; the consumer session is asked about the push set limit and about
  sending the epic branch with `main` merged in.
- **PR:** not open yet.

## Steps

- [x] 1.1 Add `error`, `errorDescription`, `retry`, `rtAutocompleteEmpty` and `rtAutocompleteError` to `rt-autocomplete`
- [x] 1.2 Add `error`, `errorDescription`, `retry`, `rtDynamicSelectorEmpty` and `rtDynamicSelectorError` to `rt-dynamic-selector`
- [x] 1.3 Cover SC-UKV-1287…1290 by the specs
- [x] 2.1 Add the empty template directive to `rt-select`, `rt-multiselect`, `rt-tree`, `rt-draggable-tree`, `rt-tree-selector` and `rt-side-menu`
- [x] 2.2 Add `rtPdfViewerError` to `rt-pdf-viewer`
- [x] 2.3 Cover SC-UKV-1291 and SC-UKV-1292 by the specs
- [x] 3.1 Add a story of the error and the own views for each of the nine components
- [x] 3.2 Compare the stories with the frames by measurement and show them to the owner

## Decisions along the way

- **The spec critique is folded in before the first stage** — priority over `fetching`, the
  selection window of the dynamic selector, the label keys, the fate of the present empty inputs,
  the local list empty lines and four scenarios more. The milestone G wording of the epic (the
  local lists and the PDF viewer get part of the contract) goes to the consumer session with the
  PDF question.
- **The dynamic selector keeps the error and its slots in one host directive** — the root and the
  standalone popup both take `error`, `errorDescription`, `retry` and the two templates from
  `RtDynamicSelectorLoadStateDirective`; the root stays under the file length limit, and the popup
  reads the root's state through the parts source.
- **The PDF viewer takes its template through the opening data** — the consumer session gave no
  answer, so the option recommended to it is taken: `errorTemplate` of `IRtPdfViewer.Data`, filled
  from the `rtPdfViewerError` directive. The hybrid trees stay out: no approved frame draws them.
  Both are recorded in the agreement.
- **The autocomplete panel error is compact, as the frame draws it** — the measurement found the
  full empty state in the panel; the code now follows the frame, and the hint stands only when
  `errorDescription` is set.
- **Two frames are brought to the kit, by the owner's word «Оставить, кадры поправить»** —
  `rt-empty-state` puts its action 8 px lower than the dynamic selector frame drew (its own action
  margin on top of the gap), and the side menu panel body pads 16 px where the frame drew 8. The
  frames now draw both; the match is 39 of 39.
- **The autocomplete keyboard counts no options under the error** — binding the agreement to code
  showed that arrows and Enter still chose a hidden option while the error stood; the option count
  is zero under the error now, and a SC-UKV-1287 test holds it.

## Sessions

### 14.11.2026

- The branch `RT-3295-selectors-error-state` from `RT-3294-table-lists-error-state`; the grill
  written from the task body, the epic plan and a survey of the nine components.
- The nine RT-3295 frames read in the kit Figma file: slot names, the default line kept without a
  template, the PDF viewer error with download instead of retry. The agreement written from them.
- Stages 1 and 2 done in three code commits and one more for the PDF viewer.

## Handover of the session

Put together by a hook before the compaction of the context (auto).

**Working tree:** /Users/eyhenij/WebstormProjects/rt-kit-states
**Branch:** RT-3295-selectors-error-state

### Where we stand at the minute of the compaction

- **State:** `этап-идёт`
- **Stage:** 3 of 3 — the showcase; stages 1 and 2 are done
- **Next step:** the showcase references of the new stories, the overview pages of the nine
- **PR:** not open yet.

The progress in full — `docs/tasks/RT-3295-selectors-error-state/progress.md`; the plan lies next to it.

### Uncommitted

```
 M ../../../projects/ui-kit-v2/src/lib/components/autocomplete/CONTEXT.md
 M ../../../projects/ui-kit-v2/src/lib/components/autocomplete/Overview.mdx
 M ../../../projects/ui-kit-v2/src/lib/components/draggable-tree/CONTEXT.md
 M ../../../projects/ui-kit-v2/src/lib/components/draggable-tree/Overview.mdx
 M ../../../projects/ui-kit-v2/src/lib/components/dynamic-selector/CONTEXT.md
 M ../../../projects/ui-kit-v2/src/lib/components/dynamic-selector/Overview.mdx
 M ../../../projects/ui-kit-v2/src/lib/components/dynamic-selector/popup/rt-dynamic-selector-popup.component.html
 M ../../../projects/ui-kit-v2/src/lib/components/multiselect/CONTEXT.md
 M ../../../projects/ui-kit-v2/src/lib/components/multiselect/Overview.mdx
 M ../../../projects/ui-kit-v2/src/lib/components/pdf-viewer/CONTEXT.md
 M ../../../projects/ui-kit-v2/src/lib/components/pdf-viewer/Overview.mdx
 M ../../../projects/ui-kit-v2/src/lib/components/select/CONTEXT.md
 M ../../../projects/ui-kit-v2/src/lib/components/select/Overview.mdx
 M ../../../projects/ui-kit-v2/src/lib/components/side-menu/CONTEXT.md
 M ../../../projects/ui-kit-v2/src/lib/components/side-menu/Overview.mdx
 M ../../../projects/ui-kit-v2/src/lib/components/tree-selector/CONTEXT.md
 M ../../../projects/ui-kit-v2/src/lib/components/tree-selector/Overview.mdx
 M ../../../projects/ui-kit-v2/src/lib/components/tree/CONTEXT.md
 M ../../../projects/ui-kit-v2/src/lib/components/tree/Overview.mdx
?? ../../../projects/ui-kit-v2/.storybook/__snapshots__/molecules-forms-autocomplete--panel-error.png
```

### Commits over the main branch

```
c8e64fe49 docs(rt:ui-kit-v2): витрина RT-3295 одобрена, совпадение с макетами 39 из 39
31abc9fd3 docs(rt:ui-kit-v2): витрина RT-3295 собрана и сверена с кадрами, ждёт слова владельца
55d716606 fix(rt:ui-kit-v2): компактная ошибка в панели поиска и витрина по замеру кадров
a2a370330 feat(rt:ui-kit-v2): витрина ошибки и своих шаблонов у поиска, селектора и PDF
b4117f651 feat(rt:ui-kit-v2): витрина своего вида пустого у шести местных списков
c215d119e feat(rt:ui-kit-v2): свой вид ошибки у просмотрщика PDF
d325429a3 feat(rt:ui-kit-v2): свой вид пустого у шести местных списков
17511316b feat(rt:ui-kit-v2): ошибка загрузки и свои шаблоны у динамического селектора
1f07f2d4a feat(rt:ui-kit-v2): ошибка загрузки и свои шаблоны у поиска с подсказками
b353908e8 docs(rt:ui-kit-v2): план RT-3295, запись одобрений макетов и правки договорённости
d2781a599 docs(rt:ui-kit-v2): договорённость RT-3295 по девяти одобренным кадрам
3f2a0f757 docs(rt:ui-kit-v2): папка задачи RT-3295 — разбор
3754a9746 Merge branch 'RT-3292-thread-list-error-state' into RT-3294-table-lists-error-state
9c7f738f2 Merge branch 'RT-3288-kit-error-states' into RT-3292-thread-list-error-state
909590290 Merge remote-tracking branch 'origin/main' into RT-3288-kit-error-states
df122b032 test(rt:message-bus): эталон встраиваемой страницы переписок с заглушкой кита
b39a8d704 fix(rt:ui-kit-v2): ошибка списка данных важнее дозагрузки
f7f3c7748 Merge branch 'RT-3292-thread-list-error-state' into RT-3294-table-lists-error-state
f127b2a6c chore(rt:agent-kit): общий лимит отправки 620 с для правок второго кита
737fb517f docs(rt:ui-kit-v2): привязка спека называет шаблон ошибки списка долей
```

Written by a hook before the compaction of the context. Everything standing here is checked
against the tree: a handover retells what was written and describes the minute it was put together.
