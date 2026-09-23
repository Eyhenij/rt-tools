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
for the names; the 52 px are closed by the frame `organisms-data-datalist--presets`.

### SC-UKV-357 — the selection checkbox stands in the middle of its cell

Given a table with a selection column
When the header and the rows are drawn
Then the checkbox centre and the cell centre match, in the header and in every row

Not covered: layout is not computed in the test environment. Closed by the frame
`organisms-data-datalist--material-theme`: header checkbox 230.5 against header 230.5, row
checkbox 278.5 against row 278.5.

### SC-UKV-358 — the header and the fill search follow the Material theme of the page

Given a page with the violet Material theme and the list in the material preset
When the list is drawn
Then the header is 44 px filled `#e8e0eb`, the fill search is 51 px filled `#e8e0eb` with a 1 px
`#49454e` underline — the first kit's numbers

Not covered: colours of a theme are not computed in the test environment. Closed by the frame
`organisms-data-datalist--material-theme`; the names themselves are held by the preset test of
`SC-UKV-355`.

### SC-UKV-359 — the list search is fill when the look is not given

Given a list whose `appearance` is not given
When the list is drawn with records
Then the search is in the `fill` look and the filter fields in the `outline` look

Covered by the component test of the list.
