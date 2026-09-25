# Grill

## The owner request

> кгопки экшенов и кнопки фильтов во втором ките квадратные а в первом круглые?

> сравни кнопки копировать содержимсое ячейки их стиль цвета в первом ките и отображаются они
> только на ховер а не постоянно

## What the tree already has

- The spec `docs/specs/ui-kit-v2/table-material-theme/` holds the first kit's look of the list and
  table in the material preset; the list search is already the first kit's 52 px Material field.
- The first kit is the sample: its table buttons are Material icon buttons, its copy button is a
  plate of its own, its filter fields are outlined Material fields.

## What the rules already say

- `rt-tools-styling`: a preset rewrites assignments and never starts names of its own; a
  component takes the look through its own properties.
- `browser-verification`: a look carried over from a sample is accepted by a measurement against
  the sample, not by eye.

## Questions and answers

No questions: both messages name the sample, and a measurement of it answers what to do.

## Decisions

- **The copy button stays visible all the time only where there is no hover** — the width
  threshold of 1080 px showed it in every cell of a laptop window next to a side panel. Rejected:
  the first kit's 600 px threshold, because the kit has one narrow threshold and a second one would
  diverge from it.
- **The filter field takes the list search names** — in the first kit both are the same outlined
  Material field, and the generated assignments file stands at its length limit. Rejected: five
  names of its own, which put the file at 513 lines of 500.

## What is left unclear

- The arrow of the select in the filter row is a triangle in the first kit and a chevron in the
  second. Not asked for; named to the owner.
