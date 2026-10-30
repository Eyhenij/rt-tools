# One core of the filter and the sort for both tables

**Status:** proposed · **Revision:** 2026-10-30 · **Scenario prefix:** `SC-UKV`
**Depends on:** the table `rt-table`, the table `rt-data-table`, the list models of the kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

The product agreement written before the code. It merges by the last commit of the PR: the filter
rules into the subdomain `table-filter`, the sort rules into `table-full-port`.

## Why

The kit has two tables, and each keeps its own copy of the filter and of the sort. An edit made in
one copy does not reach the other, and the copies differ in what counts as an empty value and in
what the third press on a header does. The difference is deliberate: `rt-data-table` repeats the
first kit. So the core holds both behaviours, and each table keeps its own; a person sees no change.

## Terminology

| Term               | What it is                                                                    |
| ------------------ | ----------------------------------------------------------------------------- |
| **The core**       | one set of functions both tables compute their conditions and their sort with |
| **A condition**    | one entry of the filter set: the column, the comparison and the value         |
| **The sort cycle** | what a press on a sorted header asks for after the descending order           |
| **The empty mode** | which values of a filter field remove the condition of its column             |

### What it is called in the interface

| In the domain | On the screen                                 |
| ------------- | --------------------------------------------- |
| A condition   | a value in the field under a column name      |
| The sort      | the arrow next to the name of a sorted column |

## Rules

- **Both tables compute their conditions and their sort by the core.** Neither keeps a copy of its
  own; a table passes its inputs to the core and its outputs onwards.
- **A filter field removes its condition by the empty mode of its table.** In `rt-table` only an
  empty string is empty, and `0` and `false` stay values. In `rt-data-table` any falsy value is
  empty, as in the first kit. The mode is chosen inside the kit; neither table takes an input for it.
- **A change of the comparison on a column with a value adds its condition.** What counts as a value
  is said by the same empty mode. A column without a value asks nothing.
- **A value equal to the one already in the condition reports nothing.** The table does not send
  the same set twice.
- **A press on a sorted header follows the cycle of its table.** In `rt-table` the third press drops
  the sort: ascending, descending, none. In `rt-data-table` the press after the descending order asks
  for the ascending one again, as in the first kit.
- **Both tables name the sort for assistive technology by the same values.** `aria-sort` is
  `ascending`, `descending` or `none`; a column of `rt-data-table` that cannot be sorted carries no
  `aria-sort` at all, as before.

## What is out of scope

- Row selection: RT-2866.
- Column keys and declarations: RT-2867.
- The press on a header of `rt-data-table` while another column is sorted ascending: RT-3015.
- The look of both tables: the frames of the showcase stay as they are.
- The first kit.

## Contract

Not applicable: the inputs and outputs of both tables stay as they are, and so do the functions and
types the two tables already gave to applications — they now call the core. The core lives in an
entry point of its own, `@rt-tools/ui-kit-v2/table-core`, because the two tables live in two
entry points; the root of the kit does not give it.

### Refusal codes

Not applicable.

## Data

Not applicable: nothing is stored.

## Screens and states

| State                                                                                               | What is visible |
| --------------------------------------------------------------------------------------------------- | --------------- |
| Nothing new: both tables draw the states they drew before. The two that differ between them stay as |
| they are.                                                                                           |

| State                                               | What is visible                                      |
| --------------------------------------------------- | ---------------------------------------------------- |
| `rt-data-table`, a column descending, a press on it | the same column ascending                            |
| `rt-table`, a column descending, a press on it      | no arrow, the rows in the order the application gave |

## Cross-cutting requirements

### Locales

Not applicable: the core holds no words.

### SEO

Not applicable.

### Mobile layout

Not applicable: the core draws nothing; the cards of `rt-table` sort by the same core.

### Several objects

Not applicable.

## Decisions

- **The core keeps both sort cycles by a flag.** By the owner's answer «Ядро держит оба
  (Recommended)»: each table keeps the cycle its users already know.
- **The core keeps both empty modes, each table keeps its own, and no input chooses it.** By the
  owner's answers of 30.10: the filter mode is set like the sort cycle, and «Внутри кита
  (Recommended)». A change a person does not see needs no frame.
- **«Nothing changed» is the same set returned, not `null`.** An inner interface: both tables
  compare the set they got with the one they gave.

## Open questions

None.

## History of changes

- 2026-10-30 — the epic «#2860 Таблицы»: one core of the filter and the sort for both tables; the
  same day both empty modes stay, and the sort of another column goes to RT-3015.
