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
Then the second category has no bar above the zero line, the hint of its column shows 0, and the copy holds 0 for it

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
Then the title and the subtitle stand above the chart, «Revenue» above the plot at its left edge, and «Month» under the legend at the right edge

A `pie` spec with the same axis names draws neither of them; a `heatmap` spec draws «Month» over its columns and «Revenue» over its rows.

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
Then the kit dialog opens with the title, «Download PNG» and the same chart filling the dialog height
And pressing «Close» closes it, and focus stands on «Open full screen» again

Escape closes the dialog the same way.

Not covered: the block is not written yet.

### SC-UKV-1357 — the PNG downloads under the title

Given a drawn chart block with the title «Revenue by month»
When the person presses «Download PNG»
Then the file «Revenue-by-month.png» is downloaded

A title of only punctuation gives the file «chart.png».

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

### SC-UKV-1360 — a tree over 200 distinct leaves is refused

Given a `treemap` spec the schema accepts, whose hierarchy holds 201 distinct leaves after equal paths are summed
When the block is drawn
Then the notice «The chart could not be drawn» stands, and no `rt-chart` is created

Not covered: the block is not written yet.

### SC-UKV-1361 — a later series adds its new categories at the end

Given a `line` spec whose first series has the `x` «Jan», «Feb», «Mar» and the second «Feb», «Apr»
When the block is drawn
Then the categories stand «Jan», «Feb», «Mar», «Apr», and the first series has no value at «Apr»

Not covered: the block is not written yet.

### SC-UKV-1362 — a histogram of one point is invalid

Given a `histogram` spec with one series of a single point
When the block is drawn
Then the notice «The chart could not be drawn» stands

Not covered: the block is not written yet.

### SC-UKV-1363 — a spec without values shows the empty state

Given a `bar` spec with the title «Sales» and one series without points
When the block is drawn
Then the empty state of `rt-chart` stands under the title row with «Sales», and the row holds neither «Download PNG» nor «Open full screen»

A `pie` spec whose values are all zero is drawn the same way.

Not covered: the block is not written yet.

### SC-UKV-1364 — no title and no subtitle leave no empty line

Given a `bar` spec without a title and without a subtitle
When the block is drawn
Then the title row holds only «Download PNG» and «Open full screen» at its end, and no subtitle line stands between the row and the chart

Not covered: the block is not written yet.

### SC-UKV-1365 — the PNG waits for the drawing

Given a valid chart block whose chart is not drawn yet
When the title row is shown
Then «Download PNG» is disabled, and it becomes enabled once the chart is drawn

Not covered: the block is not written yet.

### SC-UKV-1366 — the copy of a tree

Given a `treemap` spec with the title «Sales» and the paths «Europe / France» 3 and «Asia / Japan» 4
When the answer text is copied
Then the clipboard holds «Sales», then the lines «Europe / France — 3» and «Asia / Japan — 4»

Not covered: the block is not written yet.

### SC-UKV-1367 — a pending block gives nothing to the copy

Given an answer of a markdown block and a chart block with `pending`
When the answer text is copied
Then the clipboard holds the markdown text and nothing of the chart

Not covered: the block is not written yet.

### SC-UKV-1368 — the category labels do not overlap

Given a `bar` spec with 60 categories
When the block is drawn in a narrow feed
Then the category axis shows every n-th label, and no two labels overlap

Not covered: the block is not written yet.

### SC-UKV-1369 — the colours in the dark theme

Given a `pie` spec with nine points in the dark theme
When the block is drawn
Then the sectors take the eight series tokens of the dark palette in turn, and the ninth sector has the colour of the first

Not covered: the block is not written yet.

### SC-UKV-1370 — the formats follow the kit locale

Given a drawn `bar` spec with the format `number` and the value 1250000
When the kit locale changes from English to German
Then the hint and the value axis group the digits the German way, and a copy made after the change does too

Not covered: the block is not written yet.

### SC-UKV-1371 — the accessible name of the chart

Given a `line` spec with the title «Revenue by month» and a second one without a title
When both blocks are drawn
Then the first chart is named «Revenue by month» for assistive technology, and the second takes the kit label «Chart»

Not covered: the block is not written yet.

### SC-UKV-1372 — the entries do not import each other

Given the built kit
When the imports of the `rich-editor`, `chart` and `ai-chat-chart` entries are read
Then `rich-editor` imports no d3, and `chart` imports no editor

Not covered: the block is not written yet.

### SC-UKV-1373 — one provider connects the block

Given an application that registers the provider of `ai-chat-chart` at the root level, next to its other renderers
When an answer with a chart block is drawn
Then the block is drawn through `rt-chart`, and no other setup is needed

Not covered: the block is not written yet.

### SC-UKV-1374 — the specs the block refuses

Given a chart block for each of these specs: a series of 61 points, a `pie` with a negative value, a `stacked_bar` with a negative value
And a `currency` spec without a code, a `currency` spec with the code «eur»
And a `scatter` spec with a string `x`, a `line` series that repeats an `x`
When the blocks are drawn
Then every block shows the notice «The chart could not be drawn»

Not covered: the block is not written yet.

### SC-UKV-1375 — unknown fields are ignored

Given a valid `bar` spec with an extra field `theme`
When the block is drawn
Then the chart stands as without the field, and no notice is shown

Not covered: the block is not written yet.

### SC-UKV-1376 — a narrow title row keeps both buttons

Given a `line` spec with a title of 120 characters
When the block is drawn in a narrow feed
Then «Download PNG» and «Open full screen» both stay visible in the title row, and the title gives way to them by Q-17

Not covered: the block is not written yet.

### SC-UKV-1377 — the format signs no category

Given a `scatter` spec with the format `percent`, and a `bar` spec with the format `currency` and the categories «2024», «2025»
When the blocks are drawn
Then the scatter puts the percent sign on `y` only, and the bar categories stand «2024», «2025» without a currency sign

Not covered: the block is not written yet.
