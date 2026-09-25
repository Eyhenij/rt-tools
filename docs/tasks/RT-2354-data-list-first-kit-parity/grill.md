# Grill

## The owner request

> по таблице динамик лист из первого кита перенесеннную во второй

The owner pasted a list of nine differences, found by an application that moves to the second kit.
The list does not stretch, the header class does not reach the cell, and three header properties
are not configurable: the text colour, the font weight and the filter row background. The filter
fields do not take the look of the search, the page strip label reads «Per page:», and the row menu
does not take the first kit's markup. The select of the filter row is narrow; on it: «Я не мерил,
проверь».

## What the tree already has

- The specs `docs/specs/ui-kit-v2/table-material-theme/` and `docs/specs/ui-kit-v2/table-full-port/`.
- In the first kit `header.className` lands on the text block of the header cell, not on `th`; the
  second kit puts it on the same block.

## What the rules already say

- The first kit is the sample: every item is measured against it before an edit.

## Questions and answers

No questions: the sample answers each item.

## Decisions

- **Every item is measured against the first kit before the edit** — the list was written by an
  application, and one item already describes the first kit differently from its code.

## What is left unclear

- None.
