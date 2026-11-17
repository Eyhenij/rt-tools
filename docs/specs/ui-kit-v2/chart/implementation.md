# What it is carried out by — the chart

The first column is the rule of the spec next to it verbatim. The second is where it is carried out
in the tree, and the scenario it is checked by.

- **The chart lives in its own entry, and the main entry of the kit does not import `echarts`.** — `projects/ui-kit-v2/chart/ng-package.json:entryFile`; scenario `SC-UKV-1337`
- **`echarts` and `ngx-echarts` are optional peer dependencies of the kit.** — `projects/ui-kit-v2/package.json:peerDependenciesMeta`; scenario `SC-UKV-1337`
- **The chart registers only its seven kinds and the parts they use: grid, legend, tooltip, the continuous colour scale.** — `projects/ui-kit-v2/src/lib/components/chart/rt-chart.registry.ts:RT_CHART_KINDS`; scenario `SC-UKV-1337`
- **The chart is drawn by the SVG renderer.** — `projects/ui-kit-v2/src/lib/components/chart/rt-chart.component.ts:INIT_OPTS`; scenario `SC-UKV-1331`
- **The chart takes an option and draws it; a new option merges into the drawn chart without redrawing it from scratch.** — `projects/ui-kit-v2/src/lib/components/chart/rt-chart.component.ts:BASE_OPTION`; scenarios `SC-UKV-1331`, `SC-UKV-1332`
- **The series take their colours from the palette of the theme the chart stands in, including a dark subtree.** — `projects/ui-kit-v2/src/lib/components/chart/rt-chart.theme.ts:rtChartReadColors`; scenario `SC-UKV-1336`
- **A change of the theme redraws the chart in the colours of the new theme.** — `projects/ui-kit-v2/src/lib/components/chart/rt-chart.component.ts:chartTheme`; scenario `SC-UKV-1336`
- **An empty chart shows the empty state of the kit with the label `chartEmpty` instead of axes.** — `projects/ui-kit-v2/src/lib/components/chart/rt-chart.empty.ts:rtChartIsEmpty`; scenario `SC-UKV-1333`
- **The chart saves itself as a PNG file by a public method, with the background of its theme.** — `projects/ui-kit-v2/src/lib/components/chart/rt-chart.png.ts:rtChartSvgToPng`; scenario `SC-UKV-1334`
- **A chart in a container of zero width waits for the container to get a size and draws then.** — `projects/ui-kit-v2/src/lib/components/chart/rt-chart.component.ts:ready`; scenario `SC-UKV-1335`
