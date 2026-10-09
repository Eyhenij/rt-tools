# The filter row of the first kit's table in the second kit

**Status:** in force · **Revision:** 8 October 2026 · **Scenario prefix:** `SC-UKV`
**Depends on:** the family `table-full-port` — the table and the list of records it belongs to; the
kit's input, number input, select, date picker and menu
**Laws:** `frontend-application`, `verifiability`, `lists`
**Procedures:** none

A subdomain of the second kit's spec. Its rules were written in `table-full-port` by task RT-2316
and moved here unchanged when that spec outgrew the length limit; the scenario numbers stay.

## Why

A list narrows by what stands in its columns. The first kit's table carries a row of filter fields
under its header, and the family that ports it keeps that row with the same behaviour, so an
application moves its screens without edits.

## Terminology

- **The filter row** — the row of filter fields under the table header, one cell per column.
- **A condition** — what one column narrows the list by: an operator and a value.

### What it is called in the interface

A person sees a field under a column name, with an operator button where the column has operators.

## Rules

- **The filter row is drawn under the header only when the application asks for it.** A column
  without a filter keeps its place with an empty cell.
- **A text or number filter commits its value by Enter or by leaving the field.** A date filter
  commits on choosing a date, a select filter on choosing an option.
- **An empty value removes the column's condition, and a value on a column without a condition
  adds one.** The whole set of conditions goes to the application at every change.
- **A column with operators shows the current operator on its button and offers the others, as the
  first kit does.** The menu opens from the left edge of its button, so it does not cover the side menu on
  the left of the page. Changing the operator of a column with neither a condition nor a value
  asks nothing.
- **Clearing a date or select filter by its cross moves the focus into the field next to it.**
  The cross switches off once there is nothing to clear, and a switched-off button dropped the
  focus to the start of the page.
- **The family keeps no conditions of its own and narrows no rows.** The application answers with
  new rows.
- **The search and the filter fields draw one of the two Material field looks, `outline` or
  `fill`, each set by an input of its own.** The list takes `appearance` for its search and
  `filterAppearance` for its filter fields, the table `filterAppearance`; both default to `outline`,
  as in the first kit.

## What is out of scope

- The filter in the header cell of the table — the subdomain `table-filter`.
- Narrowing rows on the client: the application answers with new rows.

## Contract

The table and the list take the conditions out by `filterChange`; the field look is set by
`filterAppearance`. The rest of the family's inputs are in `table-full-port`.

### Refusal codes

Not applicable: there is no server side.

## Data

Not applicable: the family keeps no conditions of its own.

## Screens and states

| State                 | What is visible                                                   |
| --------------------- | ----------------------------------------------------------------- |
| the row not asked for | no filter row under the header                                    |
| the row shown         | a field under every column with a filter, an empty cell elsewhere |

## Cross-cutting requirements

### Locales

The operator names and the select hint come from the kit's labels.

### SEO

Not applicable.

### Mobile layout

The row scrolls together with the table; it has no narrow layout of its own.

### Several objects

Not applicable.

## Decisions

- **The rules moved out of `table-full-port` without a word changed.** The spec outgrew the length
  limit, and the filter row is the part with rules, bindings and scenarios of its own.

## Open questions

None.

## History of changes

- 8 October 2026 — task RT-2644: the filter row moved here from `table-full-port`, with its
  scenario numbers.
