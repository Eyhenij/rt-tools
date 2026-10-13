# Grill

Former address: docs/tasks/RT-2552-kit2-breadcrumbs/grill.md

## The owner request

> 1-9 берем

The words answer the list of the epic RT-2542; item 5 of it is the breadcrumbs. The task card #2552
retells it: «Хлебные крошки есть в двух приложениях: в одном родитель ссылкой, текущий раздел и кнопка
«назад», в другом цепочка предков и заголовок. Во втором ките их нет. Нужно `rt-breadcrumbs`: список
крошек приходит входом, на узком экране — свёртка.»

## What the tree already has

- The second kit has no breadcrumbs. Neighbours: `page-header`, `section-nav`, `side-menu`.
- The application's component draws a parent link, a separator and the current section, with an
  optional back button leading to the parent; the host is a navigation landmark.
- The epic plan `docs/plans/kit2-app-parts.md` says every component is shown on :6007 first, and the
  PR opens after the owner's word.

## What the rules already say

- A port takes the application's component into the kit, it is not reduced to a mode of a ready one.
- No Material in the second kit; labels come from the kit dictionary in eight languages.
- The size of a control follows the pointer sign; truncation goes in a pair with a tooltip.

## Questions and answers

None yet: the shape follows the task card and both application variants.

## Decisions

- **One component covers both variants: a list of crumbs as an input, the last one is the current
  section, an optional back button to the previous one.** Rejected: two components — the two
  variants differ only by the length of the chain.

## What is left unclear

- How the chain folds on a narrow screen — shown on the showcase, the owner judges it there.

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
- On 10 October the stories were compared with the application's code at the owner's word «сравни
  сторис перенесенных компонентов с их использованием». The application's links and separator take
  its secondary text, `--mat-sys-on-surface-variant` of its Material theme. The breadcrumbs'
  material look reads the same name for the links and the separator, with the kit's muted text as
  the fallback; the kit look and the preset without a theme stay as they were. Reading it in the
  whole preset's muted text was tried and dropped: thirteen frames of the material list under the
  violet theme moved, and that list is matched to the first kit. The chain story got the
  application's case: one section and a long record name with the `›` separator. Affected stage: 4.
- That case showed a defect: the record name took the whole row, and the section scrolled out of
  sight. A new rule with scenario SC-UKV-830: while the ancestors fit next to the current crumb cut
  to `--rt-breadcrumbs-current-min` (120px), the crumb shrinks with an ellipsis and the row does not
  scroll. The decision is the pure function `rtBreadcrumbsFits`, taken by the same measurement that
  scrolls the row. Affected stage: 4.
- On 10 October a live comparison showed that the application passes `›` as the separator. The
  Presets story now draws a second path with that separator, so the material half shows the
  application's case. The component is unchanged. Affected stage: 4.

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
