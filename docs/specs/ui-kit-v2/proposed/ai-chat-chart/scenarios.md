# Scenarios — the chart block of the assistant chat

The prefix `SC-UKV` is shared across the domain together with the subdomains; the numbers do not
change after the merge. Until the block is written, every scenario carries the mark with a reason.

### SC-UKV-1341 — the ten kinds draw from a spec

Given a chart block for every kind: `line`, `bar`, `grouped_bar`, `stacked_bar`, `pie`, `histogram`, `heatmap`, `scatter`, `treemap`, `sunburst`
When the answer is drawn
Then every block holds `rt-chart` with the shape of the mapping: lines, bars, stacked bars, bins, sectors, cells, points, nested rectangles and rings

Not covered: the block is not written yet.

### SC-UKV-1342 — the series of a cartesian spec become categories and a legend

Given a `line` spec with two series, the first with the `x` «Jan», «Feb», «Mar» and the second with «Feb», «Mar»
When the block is drawn
Then the categories stand «Jan», «Feb», «Mar», the second series has no value at «Jan», and the legend holds both series names

Not covered: the block is not written yet.

### SC-UKV-1343 — negative grouped bars go below zero

Given a `grouped_bar` spec with the values 40 and −25 in one category
When the block is drawn
Then the first bar rises from the zero line and the second goes down from it, and the value axis reaches below zero

A `bar` spec with the same values is drawn the same way.

Not covered: the block is not written yet.

### SC-UKV-1344 — a zero value is kept

Given a `bar` spec with the values 12, 0 and 7
When the block is drawn and its answer is copied
Then the second category holds a bar of zero height, the hint over it shows 0, and the copy holds 0 for it

Not covered: the block is not written yet.

### SC-UKV-1345 — stacked bars share one bar

Given a `stacked_bar` spec with two series of positive values
When the block is drawn
Then in every category the bar of the second series stands on top of the first

Not covered: the block is not written yet.

### SC-UKV-1346 — the trees nest by their paths

Given a `treemap` spec with the paths «Europe / France» 3, «Europe / Spain» 2 and «Asia / Japan» 4
When the block is drawn
Then the chart holds the groups «Europe» and «Asia», with the two leaves inside «Europe» and one inside «Asia»

Not covered: the block is not written yet.

### SC-UKV-1347 — a spec arrives as a JSON string

Given a chart block whose spec is the JSON string of a valid `pie` spec
When the block is drawn
Then the pie stands with one sector per point, and no notice is shown

Not covered: the block is not written yet.

### SC-UKV-1348 — a string that does not parse shows the notice

Given a chart block without `pending` whose spec string breaks off in the middle
When the answer is drawn
Then the notice «The chart could not be drawn» stands in place of the chart, and the markdown block after it is drawn

Not covered: the block is not written yet.

### SC-UKV-1349 — a spec of an unknown kind shows the notice

Given a valid JSON spec with the kind `radar`
When the block is drawn
Then the notice «The chart could not be drawn» stands, and no `rt-chart` is created

Not covered: the block is not written yet.

### SC-UKV-1350 — a pending block shows the placeholder

Given a chart block with `pending` and a spec string that breaks off in the middle
When the block is drawn
Then the placeholder «Drawing the chart…» stands, and the notice is not shown

Not covered: the block is not written yet.

### SC-UKV-1351 — the title, the subtitle and the axis names

Given a `line` spec with a title, a subtitle, `xLabel` «Month» and `yLabel` «Revenue»
When the block is drawn
Then the title and the subtitle stand above the chart, «Month» at the category axis and «Revenue» at the value axis

Not covered: the block is not written yet.

### SC-UKV-1352 — the `number` format groups the digits

Given a `bar` spec with the format `number` and the value 1250000
When the block is drawn and the pointer stands over the bar
Then the hint shows the value with its digits grouped

Not covered: the block is not written yet.

### SC-UKV-1353 — the `percent` format signs the percent

Given a `line` spec with the format `percent`
When the block is drawn
Then every label of the value axis and the hint carry the percent sign

Not covered: the block is not written yet.

### SC-UKV-1354 — the `currency` format signs the currency

Given a `pie` spec with the format `currency` and the currency `EUR`
When the block is drawn and the pointer stands over a sector
Then the hint shows the value with the euro sign

Not covered: the block is not written yet.

### SC-UKV-1355 — the legend does not cover the axis

Given a `line` spec with six series of long names and twelve categories
When the block is drawn in a narrow feed
Then the legend wraps under the plot, and no legend item crosses the labels of the category axis

Not covered: the block is not written yet.

### SC-UKV-1356 — the chart opens full screen

Given a drawn chart block
When the person presses «Open full screen»
Then the kit dialog opens with the title and the same chart, and Escape closes it back to the feed

Not covered: the block is not written yet.

### SC-UKV-1357 — the PNG downloads under the title

Given a drawn chart block with the title «Revenue by month»
When the person presses «Download PNG»
Then a PNG file is downloaded, and its name is made from «Revenue by month»

Not covered: the block is not written yet.

### SC-UKV-1358 — the kit exports the spec schema

Given the entry `ai-chat-chart`
When the application imports the spec schema
Then it gets a JSON schema with the ten kinds, and every sample spec of the showcase passes both the schema and the check of the block

Not covered: the block is not written yet.

### SC-UKV-1359 — the copy carries the chart as text

Given an answer of a markdown block and a `bar` chart block with the title «Sales» and one series
When the answer text is copied
Then the clipboard holds the markdown text, then «Sales» and the points of the series

Not covered: the block is not written yet.
