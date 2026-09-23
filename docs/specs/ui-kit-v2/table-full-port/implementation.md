# What it is carried out by — the first kit's table as a family of the second kit

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree; the scenario it is checked by is named there too, and what exactly every scenario is
covered by is said in `scenarios.md`.

A rule without a line and a line without a rule is a divergence: the spec promises what is not in
the tree, or the tree holds what the spec is silent about. A decision that lives in a pure function
is bound to that function, not to the component calling it: the component is a thin wrapper and has
no branching of its own. A private `#field` is never a binding — a rule carried out by one is bound
to the public entry that calls it.

### The family

- **The family stands next to `rt-table` and `rt-dynamic-list` and changes neither.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.ts:RtDataTableComponent`; scenario —
- **The family carries no Material of any kind.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.ts:imports`; scenario —
- **Every colour of the family comes from an appointment of the kit, except the style line a column gives its icon.** — `projects/ui-kit-v2/src/lib/components/data-table/cell/rt-data-table-cell.component.ts:iconStyle`; scenario `SC-UKV-265`
- **An application moves a screen from the first kit's table without editing its column declarations, its bindings or its saved settings.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.model.ts:Column`; scenario `SC-UKV-317`

### Columns and cells

- **A column of the type "custom" draws the application's template for its property; a column of any other type draws the ready cell.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-cells.directive.ts:getTemplateByPropName`; scenario `SC-UKV-267`
- **An absent value and an empty string are drawn as a dash.** — `projects/ui-kit-v2/src/lib/components/data-table/cell/rt-data-table-cell.component.html:emptyToDash`; scenario `SC-UKV-262`
- **The value keeps one line and is cut with an ellipsis; a hint shows the full value only when it was cut.** — `projects/ui-kit-v2/src/lib/components/data-table/cell/rt-data-table-cell.component.ts:onMouseEnter`; scenario `SC-UKV-263`
- **The column may put an icon before or after the value, and the icon's style is a free line of style the column computes per row from the value.** — `projects/ui-kit-v2/src/lib/components/data-table/cell/rt-data-table-cell.component.html:data-table-cell-suffix`; scenario `SC-UKV-265`
- **The column declaration takes every field of the first kit's, the ones nothing draws included.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.model.ts:Column`; scenario —
- **A copyable ready cell carries a copy button, revealed while the pointer is over the cell.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-cell.logic.ts:dataTableCopyButtonSide`; scenario `SC-UKV-264`
- **A copyable ready cell whose value is absent, an empty string, an empty list or an empty object has no copy button.** — `projects/ui-kit-v2/src/lib/components/data-table/cell/rt-data-table-cell.component.ts:copyable`; scenario `SC-UKV-266`
- **A press on the copy button copies the shown value and the button says "Copied!" for two seconds.** — `projects/ui-kit-v2/src/lib/components/data-table/cell/rt-data-table-cell.component.ts:onCopy`; scenarios `SC-UKV-308`, `SC-UKV-264`
- **A column's width and minimum width, when declared, are the width of its cells.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.html:width`; scenario —

### The header

- **The header stays on top while the rows scroll under it.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.scss:thead`; scenario —
- **A press on a sortable header asks for the ascending order, and on the column already sorted ascending — for the descending one.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-sort.logic.ts:dataTableNextSortOrder`; scenario `SC-UKV-302`
- **A sort is asked only for a column the table has.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.ts:onSortChange`; scenario —
- **The header of a sorted column shows which way it is sorted.** — `projects/ui-kit-v2/src/lib/components/data-table/header-cell/rt-data-table-header-cell.component.html:data-table-header-sort`; scenario `SC-UKV-302`
- **A header may carry an icon before or after its label and a hint on the label.** — `projects/ui-kit-v2/src/lib/components/data-table/header-cell/rt-data-table-header-cell.component.html:data-table-header-prefix`; scenario `SC-UKV-321`

### Icons of the column declarations

- **An icon a column declaration names, in its header or its cells, is drawn by the kit's own icon set through the kit's map of first-kit names; nothing is drawn by a font.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-cell.logic.ts:dataTableIconName`; scenario `SC-UKV-318`
- **The application can hand the family an icon template by the directive `rtDataTableIcon`, placed inside `rt-data-table` or inside `rt-data-list`, which hands it to its table.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-icon.directive.ts:RtDataTableIconDirective`; scenarios `SC-UKV-320`, `SC-UKV-321`
- **When an icon template is given, it draws every header and cell icon a column declaration names, and the kit's map is not asked.** — `projects/ui-kit-v2/src/lib/components/data-table/cell/rt-data-table-cell.component.ts:iconTemplate`; scenario `SC-UKV-322`
- **Without an icon template, a name with no pair in the map draws no icon.** — `projects/ui-kit-v2/src/lib/components/data-table/cell/rt-data-table-cell.component.ts:kitIcon`; scenario `SC-UKV-319`
- **A column of the type "custom" is the second way: the whole cell, its icon included, is the application's template.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-cells.directive.ts:RtDataTableCustomCellsDirective`; scenario `SC-UKV-267`

### The filter row

- **The filter row is drawn under the header only when the application asks for it.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.html:data-table-filter-row`; scenario `SC-UKV-303`
- **A text or number filter commits its value by Enter or by leaving the field.** — `projects/ui-kit-v2/src/lib/components/data-table/filter-cell/rt-data-table-filter-cell.component.ts:onCommit`; scenario `SC-UKV-303`
- **An empty value removes the column's condition, and a value on a column without a condition adds one.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-filter.logic.ts:dataTableFiltersWithValue`; scenario `SC-UKV-303`
- **A column with operators shows the current operator and offers the rest.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-filter.logic.ts:dataTableFiltersWithOperator`; scenario `SC-UKV-304`
- **The family keeps no conditions of its own and narrows no rows.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.ts:filterChange`; scenario `SC-UKV-303`
- **The family takes no field-look input.** — `projects/ui-kit-v2/src/lib/components/data-table/filter-cell/rt-data-table-filter-cell.component.html:size`; scenario —

### Rows and presses

- **A row made clickable reports a press on it with the row and the event.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.ts:rowClick`; scenario `SC-UKV-301`
- **A press is reported when a pointer button goes down, not when it goes up, and any button counts, the right one included.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-row-click.directive.ts:onMouseDown`; scenario `SC-UKV-300`
- **A row takes no keyboard focus and no key.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-row-click.directive.ts:RtDataTableRowClickDirective`; scenario —
- **A double click on a clickable row is reported with the row.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.ts:rowDoubleClick`; scenario `SC-UKV-257`
- **A press or a double click inside an opt-out node, in the selection cell, in the header or on the row menu button does not reach the row.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-row-click.directive.ts:RT_DATA_TABLE_STOP_ROW_CLICK_ATTRIBUTE`; scenarios `SC-UKV-258`, `SC-UKV-274`, `SC-UKV-244`, `SC-UKV-261`

### The actions strip

- **A table with a row menu or inline actions draws the actions strip over the end of every row and an "Actions" header cell as wide as the strip.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.ts:ngAfterViewChecked`; scenarios `SC-UKV-259`, `SC-UKV-260`
- **Inline actions stand before the row menu button.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.html:data-table-actions`; scenarios `SC-UKV-259`, `SC-UKV-260`
- **The strip is revealed while the pointer is over its row and while the row's menu is open.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.scss:.rt-data-table-actions`; scenario `SC-UKV-259`
- **A row whose menu is open is marked as the active row until the menu closes.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.ts:activeRowIndex`; scenario `SC-UKV-261`
- **A press on an inline action reaches the row unless the application stops it itself.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.html:data-table-row-menu`; scenario `SC-UKV-261`

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

### The column settings

- **The toolbar's "Table configuration" button opens the settings panel on the right side.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.ts:onOpenSettings`; scenario `SC-UKV-268`
- **The panel reorders columns by dragging and hides or shows each by its eye button.** — `projects/ui-kit-v2/src/lib/components/data-list/settings/rt-data-list-settings-aside.component.html:data-list-settings-columns`; scenario `SC-UKV-307`
- **The panel carries two switches — the vertical and the horizontal scrollbar.** — `projects/ui-kit-v2/src/lib/components/data-list/settings/rt-data-list-settings-aside.component.html:data-list-settings-vertical`; scenario `SC-UKV-268`
- **The panel's save is unavailable until something in it changed; cancel closes it and changes nothing.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-settings.logic.ts:dataListSettingsChanged`; scenario `SC-UKV-306`
- **Saved settings are kept in the browser's database under the table's storage key and come back when the table is opened again.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-config.service.ts:initConfig`; scenario `SC-UKV-271`
- **Saved settings whose set of columns differs from the declared one are dropped, and the table is drawn by the declaration.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-config.service.ts:comparePropNames`; scenario `SC-UKV-272`
- **Settings the first kit saved under a storage key are read by the family under the same key.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.model.ts:Config`; scenario `SC-UKV-317`
- **A table with no saved settings shows the horizontal scrollbar and hides the vertical one.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-config.service.ts:tableConfig`; scenario `SC-UKV-269`
- **A hidden scrollbar hides the bar, not the scrolling.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.ts:SCROLLBAR_HIDDEN`; scenario `SC-UKV-270`
- **The scrollbar choice is applied to the whole page: every table of the family on it shows the choice last applied.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.ts:SCROLLBAR_SIZE`; scenario `SC-UKV-273`
- **A hidden column draws neither its cell nor its filter cell.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.ts:visibleColumns`; scenario `SC-UKV-305`

### The toolbar and the list

- **The search asks the application for the trimmed text half a second after the person stopped typing, and never twice for the same text.** — `projects/ui-kit-v2/src/lib/components/data-list/toolbar/rt-data-list-toolbar.component.ts:searchControl`; scenario `SC-UKV-310`
- **The search field is shown while there are rows, and on the placeholder only when the search holds text or was touched.** — `projects/ui-kit-v2/src/lib/components/data-list/toolbar/rt-data-list-toolbar.component.ts:isSearchShown`; scenario —
- **The clear-filters button is shown while the filter row is, and is unavailable while no condition is set.** — `projects/ui-kit-v2/src/lib/components/data-list/toolbar/rt-data-list-toolbar.component.html:data-list-clear-filters`; scenario —
- **Refresh asks the application to reload.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.ts:refresh`; scenario —
- **The list takes the switch of the pagination bar and passes it nowhere.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.ts:isPaginationShown`; scenario —
- **The application's toolbar selectors and actions stand in the toolbar next to the kit's controls.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-toolbar.directive.ts:RtDataListToolbarSelectorsDirective`; scenario —
- **The placeholder replaces the table when there are no rows and no conditions.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.ts:isPlaceholderShown`; scenario `SC-UKV-309`
- **The first loading replaces the list with a spinner; a later fetching keeps the rows under a spinner with a backdrop.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.html:data-list-fetching`; scenario `SC-UKV-316`

### The pagination bar

- **The bar is hidden while all records fit into the smallest offered page size.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-pagination.logic.ts:dataListPaginationShown`; scenario `SC-UKV-311`
- **The page sizes offered are 10, 20, 40 and 50, each only while half of it does not exceed the number of records, and the current size always.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-pagination.logic.ts:dataListPageSizes`; scenario —
- **Up to six pages are all shown; beyond that the first, the last and the neighbours of the current one are shown with dividers between them.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-pagination.logic.ts:dataListPageNumbers`; scenario —
- **The arrows and the numbers ask for a page only when there is one to go to.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-pagination.logic.ts:dataListPageReachable`; scenario —
- **An arrow or a page number asks for its page on any key pressed on it, Tab included.** — `projects/ui-kit-v2/src/lib/components/data-list/pagination/rt-data-list-pagination.component.html:keydown`; scenario —
- **A change of the page size asks for the page that keeps the person at the same distance from the end of the list.** — `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-pagination.logic.ts:dataListPageAfterSizeChange`; scenario `SC-UKV-312`

### The narrow screen

- **Below the kit's threshold the table keeps its columns and scrolls sideways; it never turns into cards.** — `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.scss:.rt-data-table`; scenario `SC-UKV-313`
- **Below the threshold no hint of the family is shown, the pagination bar shows only the current number, and the toolbar puts the search on a line of its own.** — `projects/ui-kit-v2/src/lib/components/data-list/pagination/rt-data-list-pagination.component.ts:narrow`; scenario `SC-UKV-313`
