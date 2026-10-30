# Scenarios — one core of the filter and the sort for both tables

The prefix `SC-UKV` is shared across the domain together with the subdomains; the numbers keep
going after the merge.

### SC-UKV-1104 — zero and false are values of a condition

Given a column of either table with a filter
When the person chooses `0` or `false` as its value
Then the condition with that value reaches the application; an empty string removes the condition,
and a column without one asks nothing

Covered: `projects/ui-kit-v2/src/lib/components/table-core/rt-table-core.spec.ts`,
`projects/ui-kit-v2/src/lib/components/data-table/filter-cell/rt-data-table-filter-cell.component.spec.ts`.

### SC-UKV-1105 — a change of the comparison adds the condition of a column with a value

Given a column of either table with a value and no condition yet
When the person changes its comparison
Then the condition with the new comparison and the value reaches the application, `0` and `false`
included; a column without a value asks nothing

Covered: `projects/ui-kit-v2/src/lib/components/table-core/rt-table-core.spec.ts`.

### SC-UKV-1106 — the same value reports nothing

Given a column of either table with a condition
When the person commits the value the condition already holds
Then the table sends nothing

Covered: `projects/ui-kit-v2/src/lib/components/table-core/rt-table-core.spec.ts`.

### SC-UKV-1107 — each table keeps its own sort cycle

Given a column sorted descending
When the person presses its header
Then `rt-table` drops the sort, and `rt-data-table` asks for the ascending order

Covered: `projects/ui-kit-v2/src/lib/components/table-core/rt-table-core.spec.ts`,
`projects/ui-kit-v2/src/lib/components/table/rt-table-sort.logic.spec.ts`.

### SC-UKV-1108 — a press on another column asks for the ascending order

Given column A of `rt-data-table` sorted ascending
When the person presses the header of column B
Then column B is asked ascending, not descending

Covered: `projects/ui-kit-v2/src/lib/components/table-core/rt-table-core.spec.ts`,
`projects/ui-kit-v2/src/lib/components/data-table/header-cell/rt-data-table-header-cell.component.spec.ts`.
