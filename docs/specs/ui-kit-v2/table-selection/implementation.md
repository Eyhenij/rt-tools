# What it is carried out by — marking the rows of the first kit's table in the second kit

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in
the tree, or the tree holds what the spec is silent about. A decision that lives in a pure function
is bound to that function, not to the component calling it: the component is a thin wrapper and has
no branching of its own. A private `#field` is never a binding — a rule carried out by one is bound
to the public entry that calls it.

### The selection column

- **The selection column is drawn only when the application asks for it; the list asks for it whenever the list's selection is on.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.ts:isSelectorColumnShown`; scenario `SC-UKV-236`
- **In multiple selection every row carries a checkbox and the header carries the page checkbox.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.html:data-table-page-checkbox`; scenario `SC-UKV-236`
- **The page checkbox is checked when every row of the shown page is marked.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selection.logic.ts:dataTableAllOnPage`; scenarios `SC-UKV-239`, `SC-UKV-238`, `SC-UKV-323`
- **After a row is marked or unmarked the page checkbox is indeterminate while any record is marked, on the shown page or on another.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.ts:toggleEntity`; scenario `SC-UKV-240`
- **After the page checkbox is pressed it is indeterminate while some row of the shown page is marked.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.ts:togglePageEntities`; scenario `SC-UKV-241`
- **The list recounts the page checkbox for the shown page when rows arrive; the bare table does not, and keeps the state it had on the page before.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-selectors.directive.ts:setExistingEntitiesState`; scenario `SC-UKV-323`
- **The page checkbox marks or unmarks the rows of the shown page and touches no other mark.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selection.logic.ts:dataTableWithPageEntities`; scenario `SC-UKV-241`
- **Marks are held by the record key and survive a change of the page.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selection.logic.ts:dataTableKeysOf`; scenario `SC-UKV-242`
- **The application reads the marked records themselves, not only their keys.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.ts:selectedEntities`; scenario `SC-UKV-237`
- **The application can clear the selection; clearing leaves no mark and no checked checkbox.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.ts:clearSelectedList`; scenario `SC-UKV-243`

### One row at a time

- **In single selection every row carries a radio button, and the header carries nothing.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.html:data-table-row-radio`; scenario `SC-UKV-245`
- **Choosing a row takes the mark off the row chosen before; choosing the chosen row keeps it.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.ts:toggleEntity`; scenario `SC-UKV-246`
- **In single selection the list's toolbar shows neither select all nor the counter.** — `projects/ui-kit-v2/src/lib/components/data-list/toolbar/rt-data-list-toolbar.component.ts:isMultiSelect`; scenario `SC-UKV-245`

### Holding the selection

- **The preset marks are applied once, when the first non-empty rows and a non-empty preset have both arrived.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.ts:ngOnInit`; scenarios `SC-UKV-247`, `SC-UKV-248`
- **Only the preset records found among those first rows are marked; the other keys of the preset are dropped.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selection.logic.ts:dataTablePresetEntities`; scenario `SC-UKV-247`
- **A switched-off selection column keeps its marks visible and lets none be changed.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.ts:isSelectorsColumnDisabled`; scenario `SC-UKV-249`

### All records across pages

- **The list's toolbar shows select all, or, when the application hides it, the counter of marked records.** — `projects/ui-kit-v2/src/lib/components/data-list/toolbar/rt-data-list-toolbar.component.html:data-list-selected-count`; scenario `SC-UKV-314`
- **Select all marks every loaded row; in the across-pages mode every page that arrives after it comes with its rows marked.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-selectors.directive.ts:toggleAllEntities`; scenarios `SC-UKV-250`, `SC-UKV-256`
- **Select all is indeterminate while some records are marked and not every record is.** — `projects/ui-kit-v2/src/lib/components/data-list/toolbar/rt-data-list-toolbar.component.ts:isAllEntitiesIndeterminate`; scenarios `SC-UKV-251`, `SC-UKV-254`
- **Unmarking a row in the across-pages mode puts the record into the exclusions.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-selection.logic.ts:dataListExcludedAfterEntity`; scenarios `SC-UKV-251`, `SC-UKV-254`
- **Marking an excluded record again takes it out of the exclusions; with none left select all is checked again.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-selectors.directive.ts:toggleEntity`; scenario `SC-UKV-252`
- **An excluded record arrives unmarked every time its page is loaded again.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-selection.logic.ts:dataListSelectedAfterPage`; scenario `SC-UKV-253`
- **Unchecking select all takes every mark off and ends the across-pages mode, and the exclusions stay.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-selectors.directive.ts:clearExcludedList`; scenario `SC-UKV-255`
- **The application reads whether select all is on, whether the across-pages mode is on and which records are excluded.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-selectors.directive.ts:excludedEntities`; scenarios `SC-UKV-251`, `SC-UKV-255`
