# Grill

## The owner request

> Пагинатор вынесен в RT-2332 нужно сделать и нужно все чтобы таблица юзала уже компоненты второго
> кита, я просил сначала перенести все что нужно для таблицы а ты блядь на чал с таблицы а потом
> тянеш еще

> ты можешь сравнить сторис Many Items первого кита и второго??? найти различия и поправить
> очевидные, что требует более глубоких правок спрашивай у меня

## What the tree already has

- The list of the first kit in the second kit draws its page strip with its own component
  `rt-data-list-pagination`, carried over from the first kit, while the kit has `rt-pagination` —
  two components for one thing. Every other part of the list and the table is already a component
  of the second kit: toolbar, checkbox, select, input, date picker, menu, aside, buttons.
- `rt-pagination` shows a range label, a compact strip for narrow screens, page buttons with gaps
  and a per-page select; it hides itself when everything fits one page at the smallest page size.
- The material preset already reshapes the list search and the toolbar buttons through list names
  (`--rt-list-search-*`, `--rt-list-action-*`): the same technique is taken here.
- Spec `docs/specs/ui-kit-v2/table-material-theme/` names the paginator as out of scope, filed as
  RT-2332.

Measured on `components-dynamiclist--many-items` of the first kit: arrows and page numbers are
34 × 34 boxes with a 1 px `#d1d1d1` border and a 12 px radius, `#747474` text; the current page is
filled `#747474` with white text; 8 px between boxes; the label «Items per page:» and a 48 × 32
select with the same border and radius. No range label.

## What the rules already say

- `reuse-first`: the ready-made is extended where it lives, not cloned next to it — so the list
  takes `rt-pagination` and its own copy goes away.
- `rt-tools-styling`: a preset is a second layer of assignments; the look comes through the
  component's own properties with defaults equal to the former values.

## Questions and answers

**Does the task change the behaviour?** Closed by assumption: the look of the list's page strip
changes, and the list starts drawing the kit's component. Spec written straight into the domain spec.

**Does it need an edit of a law or a rule?** Closed by assumption: no.

**One task or several?** Closed by the owner's word: RT-2332.

**What is not part of the task?** Closed by assumption: the filter fields, the row «+» button, the
font and the table heights — they wait for the owner's answer in RT-2330.

**What shows the task is closed?** Closed by assumption: the list draws `rt-pagination`, its own
page strip is removed, and in the material preset the strip matches the first kit by measurement.

**Is there a sample?** The list search and the toolbar buttons in the material preset.

## Decisions

- **The list takes `rt-pagination`, and `rt-data-list-pagination` is removed** — the owner asked
  that the table use the components of the second kit. Rejected: restyling the list's own strip,
  which keeps two components for one thing.

## What is left unclear

- The owner's reproach about the order — the kit components first, the table after — is taken as
  the order of this work: the kit component is made right first, the list switches to it second.
