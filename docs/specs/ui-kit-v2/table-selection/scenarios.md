# Scenarios — marking the rows of the first kit's table in the second kit

The numbers continue the numbering of the second kit and stayed the same when the scenarios moved
here from the spec of the first kit's table. Until a scenario is covered it carries a
`Not covered:` mark with the reason.

### SC-UKV-236 — multiple selection draws a checkbox in every row and the page checkbox

Given a data table asked for the selection column in multiple selection, with five rows
When it is drawn
Then every row carries a kit checkbox and the header of the first column carries the page checkbox
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.spec.ts`.

### SC-UKV-237 — marking a row hands the record to the application

Given a data table with multiple selection and nothing marked
When a person checks the checkbox of the second row
Then the application reads one marked record, and it is the record of the second row
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.spec.ts`.

### SC-UKV-238 — the page checkbox is indeterminate while some rows of the page are marked

Given a page of five rows, two of them marked
When the table is drawn
Then the page checkbox is indeterminate
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.spec.ts`.

### SC-UKV-239 — the page checkbox is checked when every row of the page is marked

Given a page of five rows, all five marked
When the table is drawn
Then the page checkbox is checked and not indeterminate
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.spec.ts`.

### SC-UKV-240 — a mark on another page keeps the page checkbox indeterminate after a row change

Given a data list with one row marked on the first page and the second page shown with no marks
When a person marks a row of the second page and unmarks it again
Then the page checkbox of the second page is indeterminate
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.spec.ts`.

### SC-UKV-241 — the page checkbox marks the rows of the shown page only

Given two rows marked on the first page and the second page shown
When a person checks the page checkbox and then unchecks it
Then the two rows of the first page are still marked
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.spec.ts`.

### SC-UKV-242 — marks survive going to another page and back

Given the second row of the first page marked
When the person goes to the second page and back to the first
Then the second row is drawn marked
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.spec.ts`.

### SC-UKV-243 — clearing the selection leaves nothing behind

Given three marked rows and the page checkbox indeterminate
When the application clears the selection
Then no row is marked and the page checkbox is empty
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.spec.ts`.

### SC-UKV-245 — single selection draws radio buttons and no page checkbox or select all

Given a data list with single selection
When it is drawn
Then every row carries a kit radio button with an accessible name, the header of the first column is empty, and the toolbar has neither select all nor the counter
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.spec.ts`.

### SC-UKV-246 — choosing a second row takes the mark off the first

Given single selection with the first row chosen
When a person chooses the third row
Then only the third row is marked and the application reads the third record alone
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.spec.ts`.

### SC-UKV-247 — the preset marks are applied to the first rows

Given the preset marks name two records of the first page
When the first rows arrive
Then those two rows are drawn marked and the application reads both records
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.spec.ts`.

### SC-UKV-248 — a later preset does not overwrite what the person marked

Given the preset marks were applied and the person marked one more row
When the application changes the preset marks
Then the marks stay as the person left them
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.spec.ts`.

### SC-UKV-249 — a switched-off selection column keeps its marks and changes nothing

Given two marked rows and the selection column switched off
When a person presses a row checkbox, the page checkbox and select all
Then all three are unavailable and the same two rows stay marked
Covered: `projects/ui-kit-v2/src/lib/components/data-table/rt-data-table-selectors.directive.spec.ts`.

### SC-UKV-250 — select all marks the loaded rows and every page that arrives after

Given a data list of three pages in the across-pages mode, the first page shown
When a person checks select all and goes to the second page
Then every row of both pages is marked and select all is checked
Covered: `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-selectors.directive.spec.ts`.

### SC-UKV-251 — unmarking a row under select all excludes it

Given select all is checked in the across-pages mode
When a person unmarks the second row
Then the application reads that record among the exclusions and select all is indeterminate
Covered: `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-selectors.directive.spec.ts`.

### SC-UKV-252 — marking the only excluded record again checks select all

Given select all is on with one excluded record
When a person marks that record again
Then the exclusions are empty and select all is checked
Covered: `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-selectors.directive.spec.ts`.

### SC-UKV-253 — an excluded record stays unmarked when its page comes back

Given select all is on and a record of the first page is excluded
When the person goes to the second page and back to the first
Then the excluded record is drawn unmarked and every other row of the page marked
Covered: `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-selectors.directive.spec.ts`.

### SC-UKV-254 — unchecking the page checkbox under select all excludes the page

Given select all is on and the first page of five rows is shown
When a person unchecks the page checkbox
Then all five records are among the exclusions and select all is indeterminate
Covered: `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-selectors.directive.spec.ts`.

### SC-UKV-255 — unchecking select all takes every mark off

Given select all is on in the across-pages mode
When a person unchecks select all
Then no row is marked and the application reads that the across-pages mode is off
Covered: `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-selectors.directive.spec.ts`.

### SC-UKV-256 — with the across-pages mode off select all marks the loaded rows only

Given a data list with the across-pages mode switched off by the application
When a person checks select all and goes to the second page
Then the rows of the first page are marked and the rows of the second are not
Covered: `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-selectors.directive.spec.ts`.

### SC-UKV-314 — the counter stands in place of a hidden select all

Given a data list in multiple selection with select all hidden by the application
When a person marks two rows
Then the toolbar shows "Selected: 2" and no select all
Covered: `projects/ui-kit-v2/src/lib/components/data-list/toolbar/rt-data-list-toolbar.component.spec.ts`.

### SC-UKV-323 — an empty page leaves the page checkbox checked, as in the first kit

Given a list whose page holds no rows and no row is marked
When the page arrives and the page state is recomputed
Then the page checkbox is checked and not indeterminate — the first kit answers the same, because "no row is left unmarked" holds over an empty page
Covered: `projects/ui-kit-v2/src/lib/components/data-list/rt-data-list-selectors.directive.spec.ts`.
