# What it is carried out by — the filter in the header cell of the table

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in the
tree, or the tree holds what the spec is silent about.

- **The filter stands in the header cell, next to the name of the column and its sorting.** — `projects/ui-kit-v2/src/lib/components/table/filter-header/rt-table-filter-header.component.html:rt-table-filter-header` — scenarios `SC-UKV-214`, `SC-UKV-215`
- **The kind of the filter is declared by the column, not guessed from the value.** — `projects/ui-kit-v2/src/lib/components/table/rt-table.model.ts:ColumnFilter` — scenario `SC-UKV-216`
- **Each kind calls the ready part of the kit for it.** — `projects/ui-kit-v2/src/lib/components/table/filter-header/rt-table-filter-header.component.html:switch` — scenario `SC-UKV-216`
- **The comparison operator is chosen from the list the column allows, and the column names the one it starts with.** — `projects/ui-kit-v2/src/lib/components/table/filter-header/rt-table-filter-header.component.ts:operators` — scenario `SC-UKV-217`
- **An empty value takes the column out of the set of conditions and does not travel as an empty condition.** — `projects/ui-kit-v2/src/lib/components/table/rt-table-filter.logic.ts:filtersWithValue` — scenario `SC-UKV-219`
- **Choosing the value that is already chosen reports nothing outward.** — `projects/ui-kit-v2/src/lib/components/table/rt-table-filter.logic.ts:filtersWithValue` — scenario `SC-UKV-220`
- **Changing the operator while no value is set reports nothing outward.** — `projects/ui-kit-v2/src/lib/components/table/rt-table-filter.logic.ts:filtersWithOperator` — scenarios `SC-UKV-221`, `SC-UKV-222`
- **A date is kept as a string and compared as a string.** — `projects/ui-kit-v2/src/lib/components/table/rt-table-filter.logic.ts:filterValueOf` — scenario `SC-UKV-223`
- **The filter reports outward and narrows no rows itself.** — `projects/ui-kit-v2/src/lib/components/table/filter-header/rt-table-filter-header.component.ts:filtersChange` — scenario `SC-UKV-224`
- **The whole set of conditions goes outward, not the one condition that changed.** — `projects/ui-kit-v2/src/lib/components/table/filter-header/rt-table-filter-header.component.ts:filters` — scenario `SC-UKV-218`
- **Clearing is shown only where there is something to clear.** — `projects/ui-kit-v2/src/lib/components/table/filter-header/rt-table-filter-header.component.ts:clearable` — scenario `SC-UKV-225`
- **The styles of the filter live in the cascade layer of the kit's components.** — `projects/ui-kit-v2/src/lib/components/table/filter-header/rt-table-filter-header.component.scss:layer` — scenario `SC-UKV-226`
