# Scenarios — one core of the filter and the sort for both tables

The prefix `SC-UKV` is shared across the domain together with the subdomains; the numbers keep
going after the merge. `SC-UKV-1108` was issued on 30.10 for the sort of another column and taken
out the same day: that work is RT-3015.

### SC-UKV-1104 — each table removes a condition by its own empty mode

Given a column with a filter in `rt-table` and in `rt-data-table`
When the person commits `''`, `0` or `false` as its value
Then `''` removes the condition in both tables; `0` and `false` reach the application as values in
`rt-table` and remove the condition in `rt-data-table`

Covered: `projects/ui-kit-v2/src/lib/components/table-core/rt-table-core.spec.ts`.

### SC-UKV-1105 — a change of the comparison adds the condition of a column with a value

Given a column of either table with a value and no condition yet
When the person changes its comparison
Then the condition with the new comparison and the value reaches the application; a column whose
value is empty by the mode of its table asks nothing

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

Covered: `projects/ui-kit-v2/src/lib/components/table-core/rt-table-core.spec.ts`.
