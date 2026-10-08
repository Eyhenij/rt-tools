# Scenarios — the first kit's table as a family of the second kit

The numbers continue the numbering of the second kit and do not change after the merge. Until a
scenario is covered it carries a `Not covered:` mark with the reason. The scenarios of marking the
rows moved with their numbers to `docs/specs/ui-kit-v2/table-selection/scenarios.md`.

### SC-UKV-244 — the selection cell does not activate the row

Given a clickable row with the selection column
When a person presses and double-clicks inside the selection cell
Then the table reports neither a row press nor a double click
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.spec.ts`.

### SC-UKV-257 — a double click on a clickable row is reported with the row

Given a data table with clickable rows
When a person double-clicks the third row
Then the table reports a double click with the third record
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-row-click.directive.spec.ts`.

### SC-UKV-258 — a double click inside an opt-out node is not reported

Given a clickable row with a picture marked as an opt-out node
When a person double-clicks the picture
Then the table reports neither a double click nor a row press
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-row-click.directive.spec.ts`.

### SC-UKV-259 — inline actions stand before the row menu button

Given a data table with two inline actions and a row menu
When a person hovers a row
Then the actions strip is revealed with the two actions before the menu button
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.spec.ts`.

### SC-UKV-260 — inline actions without a menu still get the actions strip

Given a data table with inline actions and no row menu
When a person hovers a row
Then the actions strip is revealed with the inline actions and no menu button
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.spec.ts`.

### SC-UKV-261 — the row menu button does not activate the row

Given a clickable row with a row menu
When a person presses the menu button
Then the menu opens, the row is active and the table reports no row press
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.spec.ts`.

### SC-UKV-262 — an empty value is drawn as a dash

Given a ready cell whose value is absent, and one whose value is zero
When the table is drawn
Then the first cell shows a dash and the second shows 0
Covered: `projects/ui-kit-v2/src/lib/components/data-table/cell/rt-data-table-cell.component.spec.ts`.

### SC-UKV-263 — only a cut value gets a hint with the full value

Given two ready cells of one narrow column, one value fitting and one longer than the column
When a person hovers each
Then only the longer one shows a hint with its full value
Covered: `projects/ui-kit-v2/src/lib/components/data-table/cell/rt-data-table-cell.component.spec.ts`.

### SC-UKV-264 — the column shapes the shown value, and the shown value is copied

Given a copyable column whose shaping function turns 0.25 into "25 %"
When a person presses its copy button
Then the cell shows "25 %" and the clipboard holds "25 %"
Covered: `projects/ui-kit-v2/src/lib/components/data-table/cell/rt-data-table-cell.component.spec.ts`.

### SC-UKV-265 — the icon stands on the declared side with its style computed from the row

Given a column with an icon after the value and a style function by the value
When two rows with different values are drawn
Then each icon stands after its value and carries the style its row's value gave
Covered: `projects/ui-kit-v2/src/lib/components/data-table/cell/rt-data-table-cell.component.spec.ts`.

### SC-UKV-266 — a copyable ready cell with an empty value has no copy button

Given a copyable column and a row whose value is absent
When a person hovers the cell
Then the cell shows a dash and no copy button
Covered: `projects/ui-kit-v2/src/lib/components/data-table/cell/rt-data-table-cell.component.spec.ts`.

### SC-UKV-267 — a column type other than custom draws the raw value by the ready cell

Given columns of the types date, percent, currency, yes-no and list without shaping functions
When the table is drawn
Then each cell shows its value as it came, and a column of the type custom shows the application's template
Covered: `projects/ui-kit-v2/src/lib/components/data-table/cell/rt-data-table-cell.component.spec.ts`.

### SC-UKV-268 — the settings panel carries the two scrollbar switches

Given a data list with the settings button
When a person opens the settings panel
Then the panel shows the vertical and the horizontal scrollbar switches above the column list
Covered: `projects/ui-kit-v2/src/lib/components/data-list/settings/rt-data-list-settings-aside.component.spec.ts`.

### SC-UKV-269 — a table with no saved settings shows the horizontal bar only

Given a storage key with nothing saved under it
When the table is drawn with content wider and taller than its box
Then the horizontal scrollbar is shown and the vertical one is hidden
Covered: `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.spec.ts`.

### SC-UKV-270 — a hidden scrollbar still lets the content scroll

Given a table with both scrollbars hidden and content wider than its box
When a person scrolls sideways
Then the content moves and no bar is drawn
Coverage: partial — the spec checks only the size the list puts on the page root; that no bar is drawn while the content still moves is a matter for a frame.

### SC-UKV-271 — the settings come back when the table is opened again

Given a person hid a column, moved another and showed the vertical scrollbar, and saved
When the table is opened again with the same storage key
Then the column stays hidden, the order stays changed and the vertical scrollbar is shown
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-config.service.spec.ts`.

### SC-UKV-272 — saved settings with another set of columns are dropped

Given settings saved for four columns and a declaration of five
When the table is opened
Then the table draws the five declared columns in the declared order
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-config.service.spec.ts`.

### SC-UKV-273 — the scrollbar choice saved by one list applies to every list on the page

Given two data lists on one page with different storage keys, both showing the horizontal scrollbar
When a person hides the horizontal scrollbar of the first and saves
Then the second list shows no horizontal scrollbar either, while its saved settings stay unchanged
Covered: `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.spec.ts`.

### SC-UKV-274 — a press inside an opt-out node does not activate the row

Given a clickable row with a block of text marked as an opt-out node
When a person presses inside the block
Then the table reports no row press
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-row-click.directive.spec.ts`.

### SC-UKV-275 — every story of the family shows both halves of the styling preset

Given the showcase pages of the data table and the data list
When the preset stories check runs
Then every story of both families carries the half of the kit's base preset and the half of its first-kit preset
Not covered: no test names the number, and none can — the promise is about the set of stories, not about a call. It is held by the check `tools/check-preset-stories.mjs`, which refuses a family the preset touches whose showing carries no pair; both families stand among the 70 it counts.

### SC-UKV-300 — a row press is reported on the button going down, before a double click

Given a data table with clickable rows
When a person double-clicks a row
Then the table reports two row presses and then a double click, all with that row
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-row-click.directive.spec.ts`.

### SC-UKV-301 — a row not made clickable reports nothing

Given a data table whose rows are not made clickable
When a person presses and double-clicks a row
Then the table reports neither a row press nor a double click
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-row-click.directive.spec.ts`.

### SC-UKV-302 — a sortable header asks ascending, then descending

Given a column with a sort and no current sort
When a person presses its header twice, the application answering each time
Then the first press asks for the ascending order and the second for the descending one
Covered: `projects/ui-kit-v2/src/lib/components/data-table/header-cell/rt-data-table-header-cell.component.spec.ts`.

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

### SC-UKV-305 — a hidden column draws neither its cell nor its filter cell

Given the filter row shown and the settings with the email column hidden
When the table is drawn
Then neither the header, nor the filter row, nor any row has a cell of the email column
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.spec.ts`.

### SC-UKV-306 — the settings panel saves nothing until something changed

Given the settings panel just opened
When nothing is changed
Then its save is unavailable, and cancel closes it with the settings as they were
Covered: `projects/ui-kit-v2/src/lib/components/data-list/settings/rt-data-list-settings-aside.component.spec.ts`.

### SC-UKV-307 — moving a column in the panel moves it in the table

Given the settings panel open
When a person drags the third column to the top and saves
Then the table draws that column first
Covered: `projects/ui-kit-v2/src/lib/components/data-list/settings/rt-data-list-settings-aside.component.spec.ts`.

### SC-UKV-308 — the copy button says it copied for two seconds, and the row is not pressed

Given a clickable row with a copyable cell
When a person presses the copy button
Then the button shows the check icon and "Copied!", goes back after two seconds, and no row press is reported
Covered: `projects/ui-kit-v2/src/lib/components/data-table/cell/rt-data-table-cell.component.spec.ts`.

### SC-UKV-309 — the placeholder is shown only without rows and without conditions

Given a data list with no rows
When it is drawn first without conditions and then with one condition set
Then the first shows the placeholder "No Data Found", and the second the table with its filter row
Covered: `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.spec.ts`.

### SC-UKV-310 — the search asks once, trimmed, after the typing stopped

Given the list's search field
When a person types " ann " and stops for half a second, then types nothing more
Then the application gets one search request with "ann"
Covered: `projects/ui-kit-v2/src/lib/components/data-list/toolbar/rt-data-list-toolbar.component.spec.ts`.

### SC-UKV-311 — the pagination bar hides while every record fits the smallest page

Given a page model of 8 records and the page size 10
When the list is drawn
Then no pagination bar is drawn
Covered: `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.pagination.spec.ts`.

### SC-UKV-312 — a change of the page size keeps the distance from the end

Given 100 records, page size 10 and the eighth page shown
When a person chooses the page size 20
Then the application is asked for page 4 of size 20
Covered: `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.pagination.spec.ts`.

### SC-UKV-313 — a narrow screen scrolls the table sideways instead of drawing cards

Given a data list of eight columns on a screen below the kit's threshold
When it is drawn
Then the rows stay a table wider than the screen, it scrolls sideways, and no hint opens on hover
Not covered: a frame at that width is impossible — the kit's threshold is a media query over the window width, and the showing's window is never narrow. The substance of the scenario is held by the frame of a narrow box, where no card view switches on and the eight columns stay a table clipped by it: `projects/ui-kit-v2/.storybook/__snapshots__/organisms-material-dynamic-list-datalist--narrow.png`; the sideways scroll itself is the table's own `overflow: auto` and is held by reading.

### SC-UKV-315 — the family's words follow the page language

Given the page in German
When the data list with the filter row, the toolbar and the pagination bar is drawn
Then every word of the family comes from the German dictionary entries
Covered: `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.spec.ts`.

### SC-UKV-316 — the first loading and a later fetching look different

Given a data list
When it is drawn first with loading on and then with rows and fetching on
Then the first shows a spinner in place of the list, and the second keeps the rows under a spinner with a backdrop
Covered: `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.spec.ts`.

### SC-UKV-317 — settings the first kit saved come back in the family

Given settings the first kit's table saved under the key "orders", with one column hidden
When a data list with the storage key "orders" and the same columns is opened
Then the column is drawn hidden and the saved order and scrollbar flags are applied
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-config.service.spec.ts`.

### SC-UKV-318 — a first-kit icon name in a column declaration is drawn by the kit's own set

Given a header icon and a cell icon declared by first-kit names that have pairs in the kit's map
When the data table is drawn
Then both are the kit's icons of the paired names, and no icon font is asked for
Covered: `projects/ui-kit-v2/src/lib/components/data-table/cell/rt-data-table-cell.component.spec.ts`.

### SC-UKV-319 — an icon name without a pair in the map is drawn as a Material Symbols glyph

Given a cell or header icon declared by a first-kit name that has no pair in the kit's map, and no icon template
When the data table is drawn
Then the cell shows its value with the name beside it as a Material Symbols glyph, the header shows the glyph too, and no kit icon
Covered: the data table cell and header cell component specs.

### SC-UKV-320 — an icon template draws the icon of a cell

Given a column declaring a cell icon and an icon template given by `rtDataTableIcon`
When the data table is drawn
Then every cell of the column shows the template's drawing, which received the icon name, the column and the row
Covered: `projects/ui-kit-v2/src/lib/components/data-table/cell/rt-data-table-cell.component.spec.ts`.

### SC-UKV-321 — an icon template draws the icon of a header

Given a column declaring a header icon and an icon template given by `rtDataTableIcon`
When the data table is drawn
Then the header shows the template's drawing, which received the icon name and the column
Covered: `projects/ui-kit-v2/src/lib/components/data-table/header-cell/rt-data-table-header-cell.component.spec.ts`.

### SC-UKV-322 — an icon template takes precedence over the kit's map

Given two columns — one declaring a name paired in the kit's map, one a name without a pair — and an icon template
When the data table is drawn
Then both icons are the template's drawings, and neither is the kit's icon of the map
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table.component.spec.ts`.

### SC-UKV-351 — the list's theme story reads on a narrow canvas

Given the list's theme story open on a canvas 900 px wide
When the showcase draws both halves of every set
Then no node of a half passes its right edge
Not covered: passing the edge shows only in the raster, and a call does not read the raster. It is held by the measurement at three canvas widths and by the frame `projects/ui-kit-v2/.storybook/__snapshots__/organisms-material-dynamic-list-datalist--themes.png`.

### SC-UKV-352 — the settings panel draws the first kit's look

Given the list's settings panel open on columns one of which is hidden
When the panel is drawn
Then the title has a caption under it, each switch stands left of its label, and each column is a plaque with a handle, its name and an eye button, the hidden one marked
Covered: `projects/ui-kit-v2/src/lib/components/data-list/settings/rt-data-list-settings-aside.component.spec.ts`.

### SC-UKV-353 — the family has paired frames with the first kit

Given the list of the two kits' paired frames
When the pairs check reads the table family
Then frames of both kits are named for it and no reason "not moved yet" is written
Not covered: the promise is about a list of frames, not about a call. It is held by `tools/check-kit-shot-pairs.mjs`.

### SC-UKV-354 — the look of the search and of the filter fields are set apart

Given a list with the filter row
When the application gives the search the look `fill` and leaves the filter fields at their default
Then the search is a filled field with an underline and the filter fields are outlined; the filter fields change look only by their own input
Covered: `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.component.spec.ts`.

### SC-UKV-365 — the switch of the pagination bar hides it

Given a list with more records than fit on one page
When the application sets `isPaginationShown` to false
Then the pagination bar is not in the markup, and it comes back once the switch is on again
Covered: `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list.pagination.spec.ts`.

### SC-UKV-371 — the operator menu leaves the current operator out

Given a column with the operators "Equal" and "Contains", "Equal" being current
When a person opens its operator menu
Then the menu opens from the left edge of the button and lists "Contains" alone
Covered: `projects/ui-kit-v2/src/lib/components/data-table/filter-cell/rt-data-table-filter-cell.component.spec.ts`.
