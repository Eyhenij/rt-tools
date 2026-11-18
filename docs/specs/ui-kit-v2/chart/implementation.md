# What it is carried out by — the chart

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenario it is checked by.

- **The chart lives in its own entry, and the main entry of the kit does not import d3.** — `projects/ui-kit-v2/chart/ng-package.json:entryFile`; scenario `SC-UKV-1337`
- **`d3-shape` and `d3-hierarchy` are optional peer dependencies of the kit.** — `projects/ui-kit-v2/package.json:peerDependenciesMeta`; scenario `SC-UKV-1337`
- **The chart draws the seven kinds of the mockup from the kit's model: cartesian lines, areas and bars, pie, heatmap, scatter, treemap and sunburst.** — `projects/ui-kit-v2/src/lib/components/chart/rt-chart.layout.ts:rtChartScene`, the value axis — `projects/ui-kit-v2/src/lib/components/chart/rt-chart.scene.ts:rtChartAxis`; scenarios `SC-UKV-1337`, `SC-UKV-1340`
- **The chart is SVG markup of the kit's own template.** — `projects/ui-kit-v2/src/lib/components/chart/rt-chart.component.ts:scene`; scenario `SC-UKV-1331`
- **New data updates the drawn chart in place: the SVG node stays the same.** — `projects/ui-kit-v2/src/lib/components/chart/rt-chart.component.ts:scene`; scenario `SC-UKV-1332`
- **The series take their colours from the palette tokens, so a dark subtree and a change of the theme need no redraw.** — `projects/ui-kit-v2/src/lib/components/chart/rt-chart.scene.ts:rtChartSlot`; scenario `SC-UKV-1336`
- **The legend stands under the plot, one item per series or leaf, with the mark of its colour.** — `projects/ui-kit-v2/src/lib/components/chart/rt-chart.cartesian.ts:legendOf`; scenario `SC-UKV-1339`
- **A pointer over the plot shows a hint with the values of the place under it.** — `projects/ui-kit-v2/src/lib/components/chart/rt-chart.component.ts:showTip`; scenario `SC-UKV-1338`
- **An empty chart shows the empty state of the kit with the label `chartEmpty` instead of axes.** — `projects/ui-kit-v2/src/lib/components/chart/rt-chart.empty.ts:rtChartIsEmpty`; scenario `SC-UKV-1333`
- **The chart saves itself as a PNG file by a public method, with the background of its theme and its legend.** — `projects/ui-kit-v2/src/lib/components/chart/rt-chart.png.ts:rtChartToPng`; scenario `SC-UKV-1334`
- **A chart in a container of zero width waits for the container to get a size and draws then.** — `projects/ui-kit-v2/src/lib/components/chart/rt-chart.component.ts:#observeSize`; scenario `SC-UKV-1335`
- **A bar is never wider than its category column: many categories narrow the bars instead of laying them over each other.** — `projects/ui-kit-v2/src/lib/components/chart/rt-chart.cartesian.ts:barWidth`; scenario `SC-UKV-1382`
