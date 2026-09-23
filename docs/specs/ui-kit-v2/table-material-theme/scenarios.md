# Scenarios — the list and the table under a Material theme

Every scenario is checked by a test, and the test is named by the number. A scenario a test does not
reach carries a `Not covered:` mark saying what closes it instead.

The numbers are issued once and are never reused: a number given to a second scenario leaves the old
reference alive and pointing at something else.

### SC-UKV-356 — the fill search of the list is large, the outline search small

Given the list toolbar with a search in one of the two looks
When the toolbar is drawn
Then the fill search has size `lg` set to 52 px, and the outline search has size `sm`

Covered by the component test of the toolbar.

### SC-UKV-357 — the selection checkbox stands in the middle of its cell

Given a table with a selection column
When the header and the rows are drawn
Then the checkbox centre and the cell centre match, in the header and in every row

Not covered: layout is not computed in the test environment. Closed by the frame
`organisms-dynamiclist-datalist--material-theme`: header checkbox 230.5 against header 230.5, row
checkbox 278.5 against row 278.5.

### SC-UKV-358 — the header and the fill search follow the Material theme of the page

Given a page with the violet Material theme and the list in the material preset
When the list is drawn
Then the header is 44 px filled `#e8e0eb`, the fill search is 51 px filled `#e8e0eb` with a 1 px
`#49454e` underline — the first kit's numbers

Not covered: colours of a theme are not computed in the test environment. Closed by the frame
`organisms-dynamiclist-datalist--material-theme`; the names themselves are held by the preset test of
`SC-UKV-355`.
