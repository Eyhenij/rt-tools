# Scenarios — the list and the table under a Material theme

Every scenario is checked by a test, and the test is named by the number. A scenario a test does not
reach carries a `Not covered:` mark saying what closes it instead.

The numbers are issued once and are never reused: a number given to a second scenario leaves the old
reference alive and pointing at something else.

### SC-UKV-356 — the list search has one size in both looks

Given the list toolbar with a search in one of the two looks
When the toolbar is drawn
Then the search has size `sm` in both looks, and its height comes from the preset: 32 px in the own
preset, 52 px in the material one

Covered by the component test of the toolbar for the size, and by the preset test of `SC-UKV-355`
for the names; the 52 px are closed by the frame `organisms-material-dynamic-list-datalist--presets`.

### SC-UKV-357 — the selection checkbox stands in the middle of its cell

Given a table with a selection column
When the header and the rows are drawn
Then the checkbox centre and the cell centre match, in the header and in every row

Not covered: layout is not computed in the test environment. Closed by the frame
`organisms-material-dynamic-list-datalist--material-theme`: header checkbox 230.5 against header 230.5, row
checkbox 278.5 against row 278.5.

### SC-UKV-358 — the header and the fill search follow the Material theme of the page

Given a page with the violet Material theme and the list in the material preset
When the list is drawn
Then the header is 44 px filled `#e8e0eb`, the fill search is 51 px filled `#e8e0eb` with a 1 px
`#49454e` underline — the first kit's numbers

Not covered: colours of a theme are not computed in the test environment. Closed by the frame
`organisms-material-dynamic-list-datalist--material-theme`; the names themselves are held by the preset test of
`SC-UKV-355`.

### SC-UKV-359 — the list search is fill when the look is not given

Given a list whose `appearance` is not given
When the list is drawn with records
Then the search is in the `fill` look and the filter fields in the `outline` look

Covered by the component test of the list.

### SC-UKV-360 — the family draws the first kit's look unless the settings say otherwise

Given a list whose look is not given
When the list is drawn with no kit settings, and then with `dataTable.look` set to `own`
Then the list and its table carry the material preset in the first case and do not in the second

Covered by the component test of the list.

### SC-UKV-361 — the kit settings give the default look of the search and the filter fields

Given a list whose `appearance` and `filterAppearance` are not given
When the kit settings name `dataList.appearance` `outline` and `dataList.filterAppearance` `fill`
Then the search is in the `outline` look and the filter fields in the `fill` look

Covered by the component test of the list.

### SC-UKV-362 — the column settings panel gets the preset of the list

Given a list whose look is not given
When the column settings panel is opened
Then the panel and the backdrop under it carry the material preset

Covered by the component test of the list.

### SC-UKV-363 — an icon of a column is filled unless it is declared outlined

Given a header icon declared without the outlined flag and another declared with it
When the table is drawn
Then the first icon asks for the filled drawing and the second for the outlined one

Covered by the component test of the header cell.

### SC-UKV-366 — the page strip under the preset counts seven places

Given a list under the material preset
When it has one page, and then thirteen pages with the first one open
Then the strip draws the number 1 between two arrows, and then `1 2 3 … 11 12 13`; the own look draws no numbers on one page and `1 2 … 13` on thirteen

Covered by the pagination test of the list and by the test of the numbering.

### SC-UKV-367 — the dark preset takes the first kit's dark colours

Given the list under the material preset and the dark theme
When it is drawn
Then the filter fields have no fill, the page boxes and the row lines take the first kit's dark palette, and the Material colours of the page resolve dark

Not covered: the promise is about the resolved colours in a look, not about a call. It is held by `tools/check-tokens-theme.mjs` and by the dark preset frames of the list.

### SC-UKV-368 — the panels above the page take the first kit's corners under the preset

Given a page under the material preset where the first kit declares its radius steps on the root
When the row menu, the dropdown list and a tooltip open
Then the menu and the tooltip are rounded by 4 px, the list only at its lower corners, and the menu and the list carry the Material level 2 shadow

Not covered: the promise is about the computed corners and shadows of overlay panels, not about a call. It is held by the preset source and by the showcase frames of the menu, the select and the tooltip.

### SC-UKV-369 — a panel opened under the preset mark carries the preset

Given a button inside a container the application marked with the material preset
When a tooltip, a menu or a dropdown list opens from it
Then its panel at the end of the page carries the preset class, and a panel opened outside such a container does not

Covered by the test of the preset helper and by the tooltip directive test.

### SC-UKV-370 — the dropdown list marks the selected option with a check

Given a dropdown list with a selected option
When the list opens
Then the selected option carries a check mark and the others do not; the own preset hides the mark, the material preset shows it

Covered by the select component test for the mark; its visibility by look is held by the preset source.
