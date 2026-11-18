# The chart

**Status:** in force · **Revision:** 2026-11-17 · **Scenario prefix:** `SC-UKV`
**Depends on:** the empty state and the theme of the kit
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit about `rt-chart`: a chart the kit draws itself as SVG from a model of
its own, in the colour tokens of the theme, published by its own entry `@rt-tools/ui-kit-v2/chart`.

## Why

The kit has no chart. An application draws charts by hand from markup blocks, and `rt-bar-list`
forbids a third such drawing. The answer blocks of the assistant chat need a chart too, and they
take it from this entry.

## Terminology

- **The data** — the description of a chart in the kit's model: one of five shapes, told apart by
  the field `kind`.
- **The kind** — what the chart draws: line, area, bar, pie, heatmap, scatter, treemap, sunburst.
  Line, area and bar share one shape, the cartesian one, and may stand in one chart.
- **The panel** — one plot of a cartesian chart; two panels share the category axis.
- **The slot** — the number of a series colour, from 1 to 8; the palette gives each theme its own
  value for every slot.
- **The empty chart** — data without a single value.

### What it is called in the interface

| the label key       | what it says                         |
| ------------------- | ------------------------------------ |
| `chartEmpty`        | there is no data for the chart       |
| `chartEmptyHint`    | when the data will appear            |

## Rules

- **The chart lives in its own entry, and the main entry of the kit does not import d3.**
- **`d3-shape` and `d3-hierarchy` are optional peer dependencies of the kit.**
- **The chart draws the seven kinds of the mockup from the kit's model: cartesian lines, areas and bars, pie, heatmap, scatter, treemap and sunburst.**
- **The chart is SVG markup of the kit's own template.**
- **New data updates the drawn chart in place: the SVG node stays the same.**
- **The series take their colours from the palette tokens, so a dark subtree and a change of the theme need no redraw.**
- **The legend stands under the plot, one item per series or leaf, with the mark of its colour.**
- **A pointer over the plot shows a hint with the values of the place under it.**
- **An empty chart shows the empty state of the kit with the label `chartEmpty` instead of axes.**
- **The chart saves itself as a PNG file by a public method, with the background of its theme and its legend.**
- **A chart in a container of zero width waits for the container to get a size and draws then.**

## What is out of scope

- The chart block of the assistant chat: it registers `rt-chart` as a renderer and is described
  by the assistant chat subdomain.
- A table of the chart data.
- Kinds beyond the seven, animation, zoom and selection of a range.

## Contract

None: the part is a layout component and serves no procedure.

### Refusal codes

Not applicable.

## Data

None of its own storage. The data comes in through an input, in one of five shapes.

- **Cartesian** — the categories and the series. A series is a line, an area or a bar, with an
  optional stack, a dashed stroke, points on the line, a band between a low and a high bound, and a
  panel number. Bars without a stack stand side by side. The categories stand in the middle of
  their band, at the band edges for areas, or at the boundaries of the bins for a histogram.
- **Scatter** — series of points `[x, y]` on two value axes.
- **Pie** — items with a value, a hole in the middle and an optional text in it.
- **Heatmap** — the columns, the rows and a value for every cell; the value sets the density of
  the first colour, from zero to the round top of the values. Under the plot stands a density
  scale with both ends signed instead of a legend.
- **Treemap and sunburst** — a tree of named nodes with a value at every leaf. The treemap groups
  stand side by side, each no narrower than its label; in a group the first leaf takes the top row
  and the rest stand side by side under it.

Every series, item and leaf takes the slot of its order by default; an explicit slot overrides it.
A value axis has four intervals with a step from the row 1, 2, 2.5, 5 times a power of ten, unless
the data names its own bounds.

### Inputs and outputs

| name       | kind   | what it is                                                     |
| ---------- | ------ | -------------------------------------------------------------- |
| `data`     | input  | the chart in the kit's model                                   |
| `height`   | input  | the height of the plot without the legend, `188px` by default |
| `label`    | input  | the accessible name of the chart                               |
| `toPng()`  | method | the data address of the PNG image of the chart                 |

## Screens and states

| state          | what is drawn                                          |
| -------------- | ------------------------------------------------------ |
| drawn          | the plot, the axes and the legend by the data          |
| hint           | the values of the category or the item under the pointer |
| empty          | the empty state with `chartEmpty` and `chartEmptyHint` |
| zero width     | nothing until the container gets a size                |
| dark theme     | the same chart in the dark palette                     |

## Cross-cutting requirements

### Locales

The two labels are keys of the kit's labels in the `rtKit` namespace. The kit carries the English
default, and the showcase carries the Russian set. The series names, the categories and the value
format come from the consumer.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The chart takes the width of its container and lays out again when it changes; the legend wraps.

### Several objects

Not applicable.

## Decisions

- **Its own entry, not the main one.** A chart in the main entry would make d3 a dependency of
  every consumer of the kit.
- **d3 counts, the template draws.** `echarts` with the same seven kinds weighed 229 KB in gzip,
  could not read the colour tokens and drew the dark theme only by recreating the chart. d3 gives
  only the shapes and the tree layout; the scales are the kit's own functions.
- **The kit's model, not the option of a library.** The model names what the mockup draws and
  nothing more, and the consumer does not learn a library to draw a chart.

## Open questions

None.

## History of changes

- 2026-11-17 — written by the task RT-2750 of the epic RT-3346.
- 2026-11-17 — `echarts` replaced by d3 and the kit's own SVG by the owner's word: lightness and
  flexibility.
