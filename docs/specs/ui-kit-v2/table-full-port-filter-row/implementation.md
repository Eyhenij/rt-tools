# What it is carried out by — the filter row of the first kit's table in the second kit

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenario it is checked by.

- **The filter row is drawn under the header only when the application asks for it.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.html:data-table-filter-row`; scenario `SC-UKV-303`
- **A text or number filter commits its value by Enter or by leaving the field.** — `projects/ui-kit-v2/src/lib/components/data-table/filter-cell/rt-data-table-filter-cell.component.ts:onCommit`; scenario `SC-UKV-303`
- **An empty value removes the column's condition, and a value on a column without a condition adds one.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-filter.logic.ts:dataTableFiltersWithValue`; scenario `SC-UKV-303`
- **A column with operators shows the current operator on its button and offers the others, as the first kit does.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-filter.logic.ts:dataTableFiltersWithOperator`; scenarios `SC-UKV-304`, `SC-UKV-371`
- **Clearing a date or select filter by its cross moves the focus into the field next to it.** — `projects/ui-kit-v2/src/lib/components/data-table/filter-cell/rt-data-table-filter-cell.component.ts:onClear`; scenario `SC-UKV-763`
- **The family keeps no conditions of its own and narrows no rows.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.ts:filterChange`; scenario `SC-UKV-303`
- **The search and the filter fields draw one of the two Material field looks, `outline` or `fill`, each set by an input of its own.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.ts:filterAppearance`; scenario `SC-UKV-354`
