# The chart

**Status:** in force · **Revision:** 2026-11-17 · **Scenario prefix:** `SC-UKV`
**Depends on:** the empty state and the theme of the kit
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit about `rt-chart`: a chart drawn by `echarts` in the colours and the
theme of the kit, published by its own entry `@rt-tools/ui-kit-v2/chart`.

## Why

The kit has no chart. An application draws charts by hand from markup blocks, and `rt-bar-list`
forbids a third such drawing. The answer blocks of the assistant chat need a chart too, and they
take it from this entry.

## Terminology

- **The option** — the chart description `echarts` reads: series, axes, legend, tooltip.
- **The kind** — the type of a series: line, bar, pie, heatmap, scatter, treemap, sunburst.
- **The palette** — the series colours of the kit, one set per theme.
- **The empty chart** — an option without a single data point in any series.

### What it is called in the interface

| the label key       | what it says                         |
| ------------------- | ------------------------------------ |
| `chartEmpty`        | there is no data for the chart       |
| `chartEmptyHint`    | when the data will appear            |

## Rules

- **The chart lives in its own entry, and the main entry of the kit does not import `echarts`.**
- **`echarts` and `ngx-echarts` are optional peer dependencies of the kit.**
- **The chart registers only its seven kinds and the parts they use: grid, legend, tooltip, the continuous colour scale.**
- **The chart is drawn by the SVG renderer.**
- **The chart takes an option and draws it; a new option merges into the drawn chart without redrawing it from scratch.**
- **The series take their colours from the palette of the theme the chart stands in, including a dark subtree.**
- **A change of the theme redraws the chart in the colours of the new theme.**
- **An empty chart shows the empty state of the kit with the label `chartEmpty` instead of axes.**
- **The chart saves itself as a PNG file by a public method, with the background of its theme.**
- **A chart in a container of zero width waits for the container to get a size and draws then.**

## What is out of scope

- The chart block of the assistant chat: it registers `rt-chart` as a renderer and is described
  by the assistant chat subdomain.
- A table of the chart data.
- Kinds beyond the seven: a consumer that needs one registers it with `echarts` itself.

## Contract

None: the part is a layout component and serves no procedure.

### Refusal codes

Not applicable.

## Data

None of its own. The option comes in through an input.

### Inputs and outputs

| name       | kind   | what it is                                                  |
| ---------- | ------ | ----------------------------------------------------------- |
| `option`   | input  | the option of `echarts`; the palette and the theme are added by the chart |
| `height`   | input  | the height of the chart, `320px` by default                 |
| `rendered` | output | the chart finished drawing                                   |
| `toPng()`  | method | the data address of the PNG image of the chart               |

## Screens and states

| state          | what is drawn                                   |
| -------------- | ----------------------------------------------- |
| drawn          | the series, the axes, the legend by the option |
| empty          | the empty state with `chartEmpty` and `chartEmptyHint` |
| zero width     | nothing until the container gets a size         |
| dark theme     | the same chart in the dark palette              |

## Cross-cutting requirements

### Locales

The two labels are keys of the kit's labels in the `rtKit` namespace. The kit carries the English
default, and the showcase carries the Russian set. The series names and the axis names come from
the consumer.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The chart takes the width of its container and redraws when it changes.

### Several objects

Not applicable.

## Decisions

- **Its own entry, not the main one.** A chart in the main entry would make `echarts` a dependency
  of every consumer of the kit.
- **SVG, not canvas.** The series and the axes become nodes of the page: the showcase measures their
  colours against the mockup, and the specs run without a canvas.
- **The palette is a set of kit tokens.** `echarts` does not read `light-dark()`, so the chart reads
  the computed values from its own node and passes them as colours.
- **The option of `echarts` itself, not a model of the kit.** The kinds differ too much for one
  model, and a consumer of `echarts` already knows the option.

## Open questions

None.

## History of changes

- 2026-11-17 — written by the task RT-2750 of the epic RT-3346.
