# Scenarios — the chart

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-1331 — the chart draws its data

Given cartesian data with a line series
When the chart is drawn
Then the series stands as an SVG path in the colour of the first slot

Covered by the component spec and the frame `Kinds`.

### SC-UKV-1332 — new data updates the drawn chart in place

Given a drawn chart
When the data gets new values
Then the series path takes the new shape, and the SVG node of the chart stays the same

Covered by the component spec.

### SC-UKV-1333 — an empty chart shows the empty state

Given data without a single value
When the chart is drawn
Then the empty state with the label `chartEmpty` stands in place of the axes

Covered by the component spec and the frame `Empty`.

### SC-UKV-1334 — the chart saves itself as PNG

Given a drawn chart
When `toPng()` is called
Then it returns a data address of a PNG image

Covered by the component spec.

### SC-UKV-1335 — a container of zero width

Given a chart in a container of zero width
When the container gets a width
Then the chart draws

Covered by the component spec.

### SC-UKV-1336 — the theme of the subtree

Given a chart inside a dark subtree
When the chart is drawn, and when the theme changes
Then the series take the dark palette, and after the change the palette of the new theme, while the SVG node stays the same

Covered by the component spec and the frame `Themes`.

### SC-UKV-1337 — seven kinds draw from the kit's model

Given the chart entry
When cartesian, pie, heatmap, scatter, treemap and sunburst data are drawn
Then each draws its shapes: lines, areas and bars, sectors, cells, points, nested rectangles and rings

Covered by the scene spec and the frame `Kinds`.

### SC-UKV-1338 — the hint under the pointer

Given a drawn cartesian chart
When the pointer stands over a category
Then a hint shows the category and the value of every series in it

Covered by the component spec.

### SC-UKV-1339 — the legend

Given data with three series
When the chart is drawn
Then the legend under the plot holds three items with the series names and marks of their colours

Covered by the component spec and the frame `Kinds`.

### SC-UKV-1340 — the steps of the value axis

Given the largest value 90
When the value axis is laid out
Then it stands from 0 to 100 with the step 25

Covered by the scene spec.

### SC-UKV-1382 — sixty bars fit a narrow plot

Given cartesian data of one bar series over 60 categories
When the chart is drawn 328 points wide
Then every bar stands inside its own column: no bar covers its neighbour or crosses the right edge of the plot, and two categories keep the bar width of the mockup

Covered by the scene spec and the frame `States` of the chart block, the case «60 categories».
