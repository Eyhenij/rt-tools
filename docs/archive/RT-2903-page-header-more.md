# Grill

Former address: docs/tasks/RT-2903-page-header-more/grill.md

## The owner request

> меню всегда должно быть показано в одну строку, еслине хватает места - нужно прятать пункты
> которые используются наименее часто

Asked who edits the header, the owner chose «Задача в кит, делаю сам».

## What the tree already has

- `rt-page-header` puts its sections into a list with `flex-flow: row wrap`. A list wider than the
  header wraps onto a second row.
- Below 1080 the header hides the sections behind the burger; below 1380 it hides their icons.
- The narrow-screen menu draws sections with a panel as a heading with groups and items under it.

## What the rules already say

- A new kit part comes with a unit spec, a visual snapshot, a story and an overview page.
- Every caption is a kit label with an English default.

## Questions and answers

**What does the selected section inside «More» look like?**
«Подсветить «Ещё»»: the «More» item looks selected, and the panel marks the selected line.

**How does a section with a panel stand inside «More»?**
«Заголовок и пункты под ним»: as the narrow-screen menu draws it.

## Decisions

- **Importance is an optional `priority` number of a section.** A lower number leaves first, ties
  leave from the end. Without it the declaration order decides. Rejected: counting opens inside the
  kit — the kit has no storage for it, the application passes the number.
- **The fit is a pure function of measured widths.** Rejected: measuring inside the decision, it
  could not be checked by a call.

## Decisions along the way

- **The list keeps `row wrap`.** Without wrapping the list declares the width of all its sections
  and widens a container that sizes itself by the header. The fit moves a section into «More»
  before it could wrap.
- **The top lines of the «More» panel are dark, as the sections of the narrow menu.** The first
  version drew them grey, as second-level items.
