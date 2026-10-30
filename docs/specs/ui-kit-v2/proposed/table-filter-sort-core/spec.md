# One core of the filter and the sort for both tables

**Status:** proposed · **Revision:** 2026-10-30 · **Scenario prefix:** `SC-UKV`
**Depends on:** the table `rt-table`, the table `rt-data-table`, the list models of the kit
**Laws:** `frontend-application`, `verifiability`, `reuse-first`
**Procedures:** none

The product agreement written before the code. It merges by the last commit of the PR: the filter
rules into the subdomain `table-filter`, the sort rules into `table-full-port`.

## Why

The kit has two tables, and each keeps its own copy of the filter and of the sort. The copies have
already drifted. `rt-data-table` drops a condition on any falsy value, so a condition «active = no»
or «stock = 0» chosen from a list never reaches the application, and the person sees every row.
`rt-data-table` also turns the sort descending when any column is sorted ascending, while its own
spec says this happens only on that column. An edit made in one copy does not reach the other.

## Terminology

| Term               | What it is                                                                    |
| ------------------ | ----------------------------------------------------------------------------- |
| **The core**       | one set of functions both tables compute their conditions and their sort with |
| **A condition**    | one entry of the filter set: the column, the comparison and the value         |
| **The sort cycle** | what a press on a sorted header asks for after the descending order           |

### What it is called in the interface

| In the domain | On the screen                                 |
| ------------- | --------------------------------------------- |
| A condition   | a value in the field under a column name      |
| The sort      | the arrow next to the name of a sorted column |

## Rules

- **Both tables compute their conditions and their sort by the core.** Neither keeps a copy of its
  own; a table passes its inputs to the core and its outputs onwards.
- **Only an empty string removes a condition.** `0` and `false` are values: a condition «stock = 0»
  or «active = no» reaches the application in both tables.
- **A change of the comparison on a column with a value adds its condition, whatever the value is.**
  A column without a value asks nothing.
- **A value equal to the one already in the condition reports nothing.** The table does not send
  the same set twice.
- **A press on a sorted header follows the cycle of its table.** In `rt-table` the third press drops
  the sort: ascending, descending, none. In `rt-data-table` the press after the descending order asks
  for the ascending one again, as in the first kit.
- **A press on the header of a column not sorted now asks for the ascending order, in both tables.**
  The order of another column does not count.
- **Both tables name the sort for assistive technology by the same values.** `aria-sort` is
  `ascending`, `descending` or `none`; a column of `rt-data-table` that cannot be sorted carries no
  `aria-sort` at all, as before.

## What is out of scope

- Row selection: RT-2866.
- Column keys and declarations: RT-2867.
- The look of both tables: the frames of the showcase stay as they are.
- The first kit.

## Contract

Not applicable: the inputs and outputs of both tables stay as they are; the core is inner code of
the kit and is not exported.

### Refusal codes

Not applicable.

## Data

Not applicable: nothing is stored.

## Screens and states

| State                                               | What is visible                                      |
| --------------------------------------------------- | ---------------------------------------------------- |
| `rt-data-table`, a list filter set to «no» or `0`   | the rows that match it, not every row                |
| `rt-data-table`, column A ascending, a press on B   | B sorted ascending                                   |
| `rt-data-table`, a column descending, a press on it | the same column ascending                            |
| `rt-table`, a column descending, a press on it      | no arrow, the rows in the order the application gave |

## Decisions

- **The core keeps both sort cycles by a flag.** By the owner's answer «Ядро держит оба
  (Recommended)»: each table keeps the cycle its users already know.
- **Only `''` is empty.** By the owner's question «как правильно?» and the answer given in chat:
  `0` and `false` are real values of a condition, and dropping them shows every row.
- **«Nothing changed» is the same set returned, not `null`.** An inner interface: both tables
  compare the set they got with the one they gave.
