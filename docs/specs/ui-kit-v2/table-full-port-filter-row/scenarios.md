# Scenarios — the filter row of the first kit's table in the second kit

The prefix `SC-UKV` is shared across the domain together with the subdomains. The numbers were issued
in `table-full-port` and did not change when the scenarios moved here.

### SC-UKV-303 — a text filter commits by Enter, and an empty value removes the condition

Given the filter row shown and a text filter on the name column
When a person types "ann" and presses Enter, then clears the field
Then the application gets a set with the name condition, and then a set without it
Covered: `projects/ui-kit-v2/src/lib/components/data-table/filter-cell/rt-data-table-filter-cell.component.spec.ts`.

### SC-UKV-304 — an operator change without a value asks nothing

Given a column with operators, no condition and an empty filter field
When a person chooses "Contains" in its operator menu
Then the application gets no new set of conditions and the operator button shows "Contains"
Covered: `projects/ui-kit-v2/src/lib/components/data-table/filter-cell/rt-data-table-filter-cell.component.spec.ts`.

### SC-UKV-763 — clearing a select filter by its cross keeps the focus in the cell

Given a select filter with a chosen option and the focus on its cross
When a person presses the cross
Then the column's condition is removed and the focus stands on the select field of the same cell
Covered: `projects/ui-kit-v2/src/lib/components/data-table/filter-cell/rt-data-table-filter-cell.component.spec.ts`.

### SC-UKV-354 — the look of the search and of the filter fields are set apart

Given a list with the filter row
When the application gives the search the look `fill` and leaves the filter fields at their default
Then the search is a filled field with an underline and the filter fields are outlined; the filter fields change look only by their own input
Covered: `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.spec.ts`.

### SC-UKV-371 — the operator menu leaves the current operator out

Given a column with the operators "Equal" and "Contains", "Equal" being current
When a person opens its operator menu
Then the menu opens from the left edge of the button and lists "Contains" alone
Covered: `projects/ui-kit-v2/src/lib/components/data-table/filter-cell/rt-data-table-filter-cell.component.spec.ts`.
