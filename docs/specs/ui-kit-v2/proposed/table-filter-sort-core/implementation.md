# What it is carried out by — one core of the filter and the sort for both tables

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenarios it is checked by; what exactly every scenario is covered by is said in
`scenarios.md`.

- **Both tables compute their conditions and their sort by the core.** — `projects/ui-kit-v2/src/lib/components/table-core/rt-table-filter.core.ts:filtersWithValue`, `projects/ui-kit-v2/src/lib/components/table-core/rt-table-sort.core.ts:nextSort`; scenarios `SC-UKV-1104`, `SC-UKV-1107`
- **A filter field removes its condition by the empty mode of its table.** — `projects/ui-kit-v2/src/lib/components/table-core/rt-table-filter.core.ts:isEmptyFilterValue`; scenario `SC-UKV-1104`
- **A change of the comparison on a column with a value adds its condition.** — `projects/ui-kit-v2/src/lib/components/table-core/rt-table-filter.core.ts:filtersWithOperator`; scenario `SC-UKV-1105`
- **A value equal to the one already in the condition reports nothing.** — `projects/ui-kit-v2/src/lib/components/table-core/rt-table-filter.core.ts:filtersWithValue`; scenario `SC-UKV-1106`
- **A press on a sorted header follows the cycle of its table.** — `projects/ui-kit-v2/src/lib/components/table-core/rt-table-sort.core.ts:nextSort`; scenario `SC-UKV-1107`
- **Both tables name the sort for assistive technology by the same values.** — `projects/ui-kit-v2/src/lib/components/table-core/rt-table-sort.core.ts:ariaSortOf`
