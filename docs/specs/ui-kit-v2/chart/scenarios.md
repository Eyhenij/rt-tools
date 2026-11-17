# Scenarios — the chart

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-1331 — the chart draws its option

Given an option with a line series
When the chart is drawn
Then the series stands as an SVG path in the first colour of the palette

Covered by the component spec and the frame `Line`.

### SC-UKV-1332 — a new option merges into the drawn chart

Given a drawn chart
When the option gets new data
Then the chart updates its series without being created anew

Covered by the component spec.

### SC-UKV-1333 — an empty chart shows the empty state

Given an option without a single data point
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
Then the series take the dark palette, and after the change the palette of the new theme

Covered by the component spec and the frame `Themes`.

### SC-UKV-1337 — seven kinds are registered

Given the chart entry
When it is loaded
Then line, bar, pie, heatmap, scatter, treemap and sunburst draw, with the grid, the legend, the tooltip and the continuous colour scale

Covered by the component spec and the frames of the seven kinds.
