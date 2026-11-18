# Scenarios — the data table of the chart block

### SC-UKV-1383 — the table is hidden until the switch is pressed

Given a drawn `line` block
When the answer is shown
Then under the chart stands «View data» with `aria-expanded` false and `aria-controls` naming the table id, and no table is in the block

### SC-UKV-1384 — the switch shows and hides the table

Given a drawn `line` block
When «View data» is pressed and then «Hide data»
Then the table appears under the switch with `aria-expanded` true, and after the second press it is gone

### SC-UKV-1385 — the switch is not remembered

Given a block whose table was opened
When the block is drawn anew
Then the table is hidden

### SC-UKV-1386 — no switch without a chart

Given a pending, an invalid and an empty block
When they are drawn
Then none of them has the switch

### SC-UKV-1387 — a cartesian table follows the chart data

Given a `line` spec with two series, the second with no point at «Jan»
When the table is built
Then its rows are the categories of the chart in their order, a column per series, the cell of the second series at «Jan» is empty, and the values are formatted as the chart signs them

### SC-UKV-1388 — negatives and zeros stand in the table

Given a `grouped_bar` currency spec in rubles with the values −10 and 0
When the table is open in the `ru` locale
Then the cells hold exactly what the format of the chart writes for −10 and 0

### SC-UKV-1389 — the other kinds give their rows

Given one spec of `pie`, `histogram` with the bins 0, 10, 20, `heatmap` with two series and `scatter`
When the tables are built
Then `pie` gives a row per sector, `histogram` the rows «0–10», «10–20», «20–30», `heatmap` a row per series and a column per `x`, `scatter` a row per point with series, `x` as given and `y` formatted

### SC-UKV-1390 — trees give their valued paths

Given a `treemap` spec with the paths `["Центр","Апартаменты"]` 120, `["Центр","Виллы"]` 60, `["Побережье","Виллы"]` 90 and `["Центр"]` 30
When the table is built
Then it holds the rows «Центр › Апартаменты» 120, «Центр › Виллы» 60, «Побережье › Виллы» 90 and «Центр» 30, in that order

### SC-UKV-1391 — a wide table scrolls inside the block

Given a `line` spec with six series in a block 328 wide
When the table is open
Then the block keeps its width and the table scrolls sideways inside it

Not covered: held by the frame of the story `DataTable`, six series at 328.

### SC-UKV-1392 — the copy does not change

Given a block with an open table
When the answer is copied
Then the copy holds the same text as with the table hidden

### SC-UKV-1393 — the open table follows the locale

Given a block with an open table in the `en` locale
When the kit locale changes to `ru`
Then the table stays open, and its values, its head labels and the switch name are those of `ru`

### SC-UKV-1394 — the full-screen dialog has no table

Given a drawn block with an open table
When the full-screen dialog opens
Then the dialog holds the chart and neither the switch nor the table

### SC-UKV-1395 — another spec closes the table

Given a block with an open table
When the input `block` brings another spec
Then the table is hidden and `aria-expanded` is false
