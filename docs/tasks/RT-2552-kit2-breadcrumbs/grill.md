# Grill

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
