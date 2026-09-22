# Scenarios — the whole table of the first kit in the second kit

The numbers continue the numbering of the second kit and do not change after the merge. Until a
scenario is covered it carries a `Not covered:` mark with the reason.

### SC-UKV-236 — multiple selection draws a checkbox in every row and the page checkbox

Given a table asked for multiple selection, with five rows
When it is drawn
Then every row carries a checkbox and the header of the first column carries the page checkbox

Not covered: the selection column does not exist yet.

### SC-UKV-237 — marking a row hands the record to the consumer

Given a table with multiple selection and nothing marked
When a person checks the checkbox of the second row
Then the consumer reads one marked record, and it is the record of the second row

Not covered: the selection column does not exist yet.

### SC-UKV-238 — the page checkbox is indeterminate while some rows of the page are marked

Given a page of five rows, two of them marked
When the table is drawn
Then the page checkbox is indeterminate

Not covered: the selection column does not exist yet.

### SC-UKV-239 — the page checkbox is checked when every row of the page is marked

Given a page of five rows, all five marked
When the table is drawn
Then the page checkbox is checked and not indeterminate

Not covered: the selection column does not exist yet.

### SC-UKV-240 — marks on another page do not make the page checkbox indeterminate

Given two rows marked on the first page and the person unmarked one of them before moving on
When the second page with no marked rows is shown
Then the page checkbox of the second page is empty

Not covered: the selection column does not exist yet.

### SC-UKV-241 — the page checkbox marks the rows of the shown page only

Given two rows marked on the first page and the second page shown
When a person checks the page checkbox and then unchecks it
Then the rows of the second page are unmarked and the two records of the first page stay marked

Not covered: the selection column does not exist yet.

### SC-UKV-242 — marks survive going to another page and back

Given two rows marked on the first page
When a person goes to the second page and back to the first
Then the same two rows are marked and the page checkbox is indeterminate

Not covered: the selection column does not exist yet.

### SC-UKV-243 — clearing the selection leaves nothing behind

Given marks on two pages and the page checkbox checked
When the consumer clears the selection
Then no row is marked, the page checkbox is empty and the consumer reads no marked record

Not covered: the selection column does not exist yet.

### SC-UKV-244 — the selection cell does not activate the row

Given an activatable row with multiple selection
When a person clicks the selection cell next to the checkbox and then double-clicks it
Then the row reports neither an activation nor a double click

Not covered: the selection column does not exist yet.

### SC-UKV-245 — single selection draws radios and no page checkbox or select all

Given a list of records whose table is asked for single selection
When it is drawn
Then every row carries a radio, and neither the header nor the toolbar carries a checkbox

Not covered: single selection does not exist yet.

### SC-UKV-246 — choosing a second row takes the mark off the first

Given single selection with the first row chosen
When a person chooses the third row
Then only the third row is chosen, and the consumer reads that one record

Not covered: single selection does not exist yet.

### SC-UKV-247 — the preset marks are applied to the first rows

Given the consumer names the keys of two records of the first page as preset marks
When the first page arrives
Then those two rows are marked and the page checkbox is indeterminate

Not covered: the preset marks do not exist yet.

### SC-UKV-248 — a later preset does not overwrite what the person marked

Given the preset marks were applied and the person then marked a third row
When the consumer changes the preset marks
Then the marks the person sees are the ones they left

Not covered: the preset marks do not exist yet.

### SC-UKV-249 — a switched-off selection column keeps its marks and changes nothing

Given two rows marked and the selection column switched off
When a person clicks a row checkbox and the page checkbox
Then both stay as they were, the two marks stay visible and the controls read as switched off

Not covered: the selection column does not exist yet.

### SC-UKV-250 — select all marks the loaded rows and every page that arrives after

Given a list of three pages with the first page shown
When a person checks select all and goes to the second page
Then every row of both pages is marked and select all is checked

Not covered: select all across pages does not exist yet.

### SC-UKV-251 — unmarking a row under select all excludes it

Given select all is on
When a person unmarks one row
Then the consumer reads that record among the exclusions, and select all is indeterminate

Not covered: select all across pages does not exist yet.

### SC-UKV-252 — marking the only excluded record again checks select all

Given select all is on and one record is excluded
When a person marks that record again
Then the exclusions are empty and select all is checked

Not covered: select all across pages does not exist yet.

### SC-UKV-253 — an excluded record stays unmarked when its page comes back

Given select all is on and a row of the first page is excluded
When a person goes to the second page and back
Then that row is unmarked and the others of the first page are marked

Not covered: select all across pages does not exist yet.

### SC-UKV-254 — unchecking the page checkbox under select all excludes the page

Given select all is on and the second page shown
When a person unchecks the page checkbox
Then every record of the second page is among the exclusions

Not covered: select all across pages does not exist yet.

### SC-UKV-255 — unchecking select all clears the marks and the exclusions

Given select all is on and one record excluded
When a person unchecks select all
Then no row is marked and the exclusions are empty

Not covered: select all across pages does not exist yet.

### SC-UKV-256 — with the across-pages mode off select all marks the loaded rows only

Given a list whose across-pages mode is switched off, with the first page shown
When a person checks select all, unmarks one row and goes to the second page
Then the rows of the second page are unmarked and the consumer reads no exclusions

Not covered: select all across pages does not exist yet.

### SC-UKV-257 — a double click on an activatable row is reported with the row

Given an activatable row
When a person double-clicks a plain cell of it
Then the table reports a double click with the record of that row

Not covered: the double click does not exist yet.

### SC-UKV-258 — a double click on a button inside the row is not reported

Given an activatable row with a button in one of its cells
When a person double-clicks the button
Then no double click of the row is reported

Not covered: the double click does not exist yet.

### SC-UKV-259 — inline actions stand before the row menu

Given a table with a row menu and two inline actions
When a person hovers a row
Then the two inline actions and then the menu button are revealed in the actions strip of that row

Not covered: inline actions do not exist yet.

### SC-UKV-260 — inline actions without a menu still get the actions strip

Given a table with inline actions and no row menu
When a person hovers a row
Then the inline actions are revealed and no menu button is drawn

Not covered: inline actions do not exist yet.

### SC-UKV-261 — an inline action does not activate the row

Given an activatable row with an inline action
When a person clicks the inline action
Then the action is reported and the row is not activated

Not covered: inline actions do not exist yet.

### SC-UKV-262 — an empty value is drawn as a dash

Given a column without a template of its own and a row whose value there is empty
When the table is drawn
Then the cell shows a dash

Not covered: the ready cell does not exist yet.

### SC-UKV-263 — only a cut value gets a hint with the full value

Given two ready cells, one narrower than its value and one wider
When a person hovers each value in turn
Then the cut value shows an ellipsis and a hint with the whole value, and the other shows no hint

Not covered: the ready cell does not exist yet.

### SC-UKV-264 — the column shapes the shown value

Given a column that turns the raw number 0.25 into "25 %"
When the table is drawn and a person copies the value
Then the cell shows "25 %" and the copied text is "25 %"

Not covered: the ready cell does not exist yet.

### SC-UKV-265 — the icon stands on the declared side in the colour of the row's value

Given a column with an icon after the value whose colour is "danger" for a negative value
When a row with a negative value is drawn
Then the icon stands after the value in the kit's danger colour

Not covered: the ready cell does not exist yet.

### SC-UKV-266 — a copyable ready cell with an empty value has no copy button

Given a copyable column and a row whose value there is empty
When a person hovers the cell
Then no copy button appears

Not covered: the ready cell does not exist yet.

### SC-UKV-267 — a ready cell draws the same in a card

Given a table on a narrow screen and a column with a ready cell
When the cards are drawn
Then the card shows the value shaped the same way as the row does, and no hint

Not covered: the ready cell does not exist yet.

### SC-UKV-268 — the column settings carry the two scrollbar switches

Given a configurable table
When a person opens its column settings
Then the panel carries a switch for the vertical and one for the horizontal scrollbar

Not covered: the switches do not exist yet.

### SC-UKV-269 — a table with no saved choice shows the horizontal bar only

Given a configurable table with nothing saved under its identifier
When it is drawn wider and taller than its place
Then the horizontal scrollbar is shown and the vertical one is not

Not covered: the switches do not exist yet.

### SC-UKV-270 — a hidden scrollbar still lets the content scroll

Given a table wider than its place with the horizontal scrollbar hidden
When a person scrolls sideways
Then the columns move and no bar is drawn

Not covered: the switches do not exist yet.

### SC-UKV-271 — the choice comes back with the column settings

Given a person hid the horizontal scrollbar and saved the settings
When the screen is opened again
Then the horizontal scrollbar stays hidden

Not covered: the switches do not exist yet.

### SC-UKV-272 — settings saved before the switches read as the default choice

Given column settings saved under the table's identifier before the switches existed
When the table is drawn
Then the saved order of columns is applied and the scrollbars follow the default choice

Not covered: the switches do not exist yet.

### SC-UKV-273 — the choice of one table does not touch another

Given two configurable tables on one page
When a person hides the horizontal scrollbar of the first
Then the second keeps its own choice

Not covered: the switches do not exist yet.

### SC-UKV-274 — a click inside an opt-out node does not activate the row

Given an activatable row with a label marked as an opt-out node
When a person clicks the label and then double-clicks it
Then the row reports neither an activation nor a double click

Not covered: the opt-out mark does not exist yet.

### SC-UKV-275 — every new story shows both halves of the styling preset

Given the stories of this work on the showcase
When the check of preset pairs runs
Then each of them carries the base half and the material half

Not covered: the stories do not exist yet.
