# The chart block of the assistant chat

**Status:** proposed · **Revision:** 2026-11-18 · **Scenario prefix:** `SC-UKV`
**Depends on:** the assistant chat (the block token, the copy of an answer), the chart (`rt-chart`
and its five data shapes), the dialog of the kit (full screen)
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

The product agreement of the task RT-3335, written before the code. It merges into the assistant
chat subdomain by the last commit of the PR, with the scenario numbers unchanged.

## Why

A model draws a chart by a tool call: the arguments of the call are the chart spec. Today the
application parses the spec, checks it and builds the chart with its own code, and `rt-ai-chat`
cannot draw such a block at all. Every application that talks to a model would repeat that code,
and every copy would drift from the kit.

## Terminology

- **The chart spec** — the arguments of the chart tool call: a kind, the texts, the format and the
  data, as a JSON string or as the same object already parsed (Q-1).
- **The chart block** — a block of the type `chart` in an answer; it carries the spec and may say
  that the spec is still coming.
- **The kind** — what the spec asks to draw: one of ten names listed in the data section.
- **The invalid spec** — a spec that does not parse as JSON, breaks the schema or breaks a rule the
  schema cannot express: an unknown kind, a missing field, a wrong type, a limit crossed.
- **The category kinds** — `line`, `bar`, `grouped_bar`, `stacked_bar`, `pie` and `heatmap`: their
  `x` is a name, not a number.
- **The pending spec** — the arguments of the call are still streaming; the block says so itself.
- **The spec schema** — the JSON schema of the chart spec, exported by the kit so that the
  application gives it to the model without a copy.

### What it is called in the interface

| In the domain       | On the screen                                          |
| ------------------- | ------------------------------------------------------ |
| The pending spec    | a placeholder «Drawing the chart…»                     |
| The invalid spec    | a notice «The chart could not be drawn»                |
| Open full screen    | the button «Open full screen» in the title row         |
| Download PNG        | the button «Download PNG» in the title row             |
| The full-screen view | the dialog with the title, the chart and «Close»      |

## Rules

- **The chart block lives in its own entry `ai-chat-chart`: the `rich-editor` entry never imports d3, and the `chart` entry never imports the editor.**

- **The application connects the block by one provider of the entry, registered at the same level as its other renderers.**

- **The block draws the ten kinds of the spec through `rt-chart`, by the mapping of the data section.**

- **`bar` and `grouped_bar` bars with a negative value go below zero, from the zero line down.**

- **A zero value is a value: in the cartesian kinds, scatter and heatmap it stands at zero and in the hint; in every kind it stands in the copy and is never taken for a missing point.**

- **`x` is a string for the category kinds and a number for `scatter` and `histogram`; any other type makes the spec invalid.**

- **A category is drawn as given and never signed by the format; in `scatter` the format signs only `y`.**

- **The categories are the `x` in their first appearance, series by series; a series that repeats an `x` makes the spec invalid.**

- **A `histogram` is one series whose `x` strictly ascend with equal steps; anything else is invalid.**

- **The block parses a spec given as a JSON string, takes a parsed one as is, and checks both against the spec schema before drawing.**

- **A spec that does not parse or breaks the schema shows the notice «The chart could not be drawn» in place of the chart, and the blocks around it stay in place.**

- **A block marked pending shows the placeholder «Drawing the chart…», never the notice, whatever its spec string holds.**

- **A spec with no point, or with all values zero in `pie`, `treemap` or `sunburst`, shows the empty state of `rt-chart` under the title row, and that row shows neither «Download PNG» nor «Open full screen».**

- **Without a title the title row holds only the two buttons at its end; without a subtitle no subtitle line is drawn.**

- **`yLabel` stands above the plot at its left edge, and `xLabel` under the chart, after the legend, at the right edge.**

- **`pie`, `treemap` and `sunburst` ignore both axis names; in `heatmap` `xLabel` names the columns and `yLabel` the rows.**

- **The format of the spec signs every value of the chart the same way: on the value axis, in the hint, in the pie, the heatmap and the tree.**

- **`percent` signs a value with the percent sign, `currency` with the currency of the spec, `number` with the grouping of digits.**

- **`number` keeps up to 2 fraction digits, `percent` up to 1, `currency` the digits of its currency.**

- **A currency code that is not three capital letters accepted by `Intl.NumberFormat` makes the spec invalid.**

- **The formats take the locale of the kit labels: a drawn chart follows a change of that locale, and the copy reads it at the moment of the copy.**

- **The category labels never overlap: the block shows every n-th label so that each fits its width.**

- **The legend stands under the plot and never covers the axis labels, at any number of series and any length of category names.**

- **The colours of the series are the eight series tokens of the chart, in the light and the dark theme.**

- **Sectors and top-level tree groups take the eight tokens in turn; a ninth item repeats the first.**

- **«Open full screen» opens the kit dialog whose chart fills the dialog height, with «Download PNG» there too.**

- **«Close» or Escape closes the full-screen dialog, and focus returns to «Open full screen».**

- **«Download PNG» saves the chart as a PNG file named by the title of the spec, by the name rule of Q-12.**

- **When the chart is not drawn yet, «Download PNG» is disabled.**

- **The chart's accessible name is the title of the spec; without a title it is the kit label «Chart».**

- **The kit exports the spec schema from the entry.**

- **Every spec the block accepts, the schema accepts. The schema also accepts a spec the block refuses only when it holds more than 200 distinct leaves after equal paths are summed.**

- **The copy is the title, the subtitle, then one line per series `name: x — y; x — y`.**

- **In the copy the trees give one line per leaf, the path joined by « / », then « — » and the value; a histogram writes `x` as the bin `low–high`.**

- **A pending or an invalid block gives nothing to the copy.**

## What is out of scope

- Calling the model, the server tool and the transport of the call: the application owns them, the
  block gets a ready block.
- A stack of negative values in `stacked_bar`: `rt-chart` does not handle it, and the block makes
  no promise about it.
- The sign that the arguments of a call are complete. The application sets `pending` while the
  call is open; the chat protocol package does not mark the end of a call today, and that mark is a
  task of the protocol, not of this block.
- Clearing `pending` when a run stops or fails is the application's; the block shows the
  placeholder for as long as `pending` is set.
- The data table under «View data»: the task RT-3336.
- The table block: the task RT-3337.
- New drawing in `rt-chart`: the title row, the subtitle and the axis names are the block's, and
  the chart is used as it is.

## Contract

None: the block is a layout component and serves no procedure. The spec schema is exported as a
value of the entry; its shape is the data section.

### Refusal codes

Not applicable.

## Data

None of its own storage. The block comes in through the input `block` of a renderer.

### The chart block

- `type` — `chart`.
- `spec` — the arguments of the tool call as a JSON string, or the same spec already parsed (Q-1).
- `pending` — the arguments are still coming; without it the spec is final.

### The chart spec

- `kind` — one of `line`, `bar`, `grouped_bar`, `stacked_bar`, `pie`, `histogram`, `heatmap`,
  `scatter`, `treemap`, `sunburst`.
- `title`, `subtitle` — the texts above the chart.
- `xLabel`, `yLabel` — the names of the category axis and the value axis.
- `format` — `number`, `percent` or `currency`; `currency` — the currency code for `currency`.
- `series` — a list of `{ name, points }`, a point is `{ x, y }`; for every kind but the two trees.
- `hierarchy` — a list of `{ path, value }`, a path is a list of names from the root to the leaf;
  for `treemap` and `sunburst`.

The limits: up to 6 series, up to 60 points in a series, up to 200 distinct leaves after equal
paths are summed, a path up to 4 names. A spec over a limit is refused whole, by Q-2.

### The mapping onto `rt-chart`

| kind          | shape of `rt-chart` | how the spec becomes it                                                       |
| ------------- | ------------------- | ----------------------------------------------------------------------------- |
| `line`        | cartesian           | a `line` series per spec series; the categories are the `x` in their order    |
| `bar`         | cartesian           | a `bar` series per spec series                                                |
| `grouped_bar` | cartesian           | `bar` series without a stack, side by side; a negative bar goes below zero    |
| `stacked_bar` | cartesian           | `bar` series with one shared stack                                            |
| `histogram`   | cartesian           | one `bar` series, a category per bin `low–high`, by Q-4                       |
| `pie`         | pie                 | one item per point: the name is `x`, the value is `y`                         |
| `heatmap`     | heatmap             | the rows are the series, the columns are the `x`, the cells are the `y`       |
| `scatter`     | scatter             | the points `[x, y]` of every series on two value axes                         |
| `treemap`     | tree                | the paths become nested nodes, the leaf takes the value                       |
| `sunburst`    | tree                | the same nesting, drawn as rings                                              |

A category that one series has and another lacks stands as a missing value of the second, not as
zero.

## Screens and states

| state        | what is drawn                                                          |
| ------------ | ---------------------------------------------------------------------- |
| pending      | the placeholder «Drawing the chart…» in the size of the chart          |
| drawn        | the title row with its buttons, the subtitle, `yLabel`, the chart, the legend, `xLabel` |
| invalid      | the notice «The chart could not be drawn»                              |
| empty        | the empty state of `rt-chart` under a title row without buttons        |
| full screen  | the kit dialog with the title, the chart, «Download PNG» and «Close»   |
| dark theme   | the same block in the dark palette                                     |

## Cross-cutting requirements

### Locales

The placeholder, the notice and the button names are kit labels in the `rtKit` namespace, English
in the package. The texts of the spec come from the model and are drawn as they are. The format of
numbers follows the locale of the kit labels, by Q-10.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The block takes the width of the feed, and the chart lays out again when it changes. The title
row keeps both buttons on a narrow screen.

### Several objects

Not applicable.

## Decisions

- **Its own entry, not `rich-editor` and not `chart`.** In `rich-editor` d3 would become a
  dependency of every editor consumer; in `chart` the editor and Quill would become a dependency of
  every chart consumer.
- **The schema, the types and the check live in the entry, written by hand.** The tree has no
  schema library, and the protocol package stays free of chart knowledge; the kit does not depend
  on it.
- **The block says itself that it is pending.** The streaming state belongs to the whole message
  and does not reach a renderer; guessing by an unparsable string would show an unfinished spec
  and an invalid one alike.
- **The formats are built by the block.** `rt-chart` takes a format as a function, so `number`,
  `percent` and `currency` become functions over `Intl.NumberFormat`.
- **The block decides that a pie or a tree is empty.** `rtChartIsEmpty` counts a sector or a leaf
  of zero as a value, so a spec of all zeros in those kinds would draw an empty plot.
- **A visible edit of the kit goes by the rule `kit-approval`.** The mockup of the block and its
  showcase are approved by the owner before the push.

## Open questions

None. Q-16 and Q-17 below are closed by assumption with the rest.

- Q-16. The schema caps `hierarchy` at 400 entries; the block refuses more than 200 distinct
  leaves after equal paths are summed, so SC-UKV-1360 can happen.
- Q-17. A long title stays on one line and is cut with an ellipsis; the full title is its
  tooltip, and both buttons keep their place.
- The category labels are thinned through the `labelEvery` input `rt-chart` already has; the block
  counts it from the width, so the rule needs no new drawing in `rt-chart`.

## Questions closed by assumption

The owner took the recommended option in every menu of the previous task, so these are closed by
assumption and go to the owner as a list with the plan. A wrong one costs an edit of this section.

- Q-1. The field is `spec`: a JSON string or an already parsed object, checked the same way.
- Q-2. A spec over a limit is refused whole with the notice; the limits stand in the schema as
  `maxItems` and the depth check, but for the distinct leaves: the schema cannot sum equal paths,
  so the block counts them.
- Q-3. `bar` with several series is valid and drawn side by side, like `grouped_bar`.
- Q-4. A `histogram` point names the lower bound of its bin in `x`, a number; the last upper bound
  is the last `x` plus the last step. Fewer than two points is an invalid histogram.
- Q-5. A negative value is accepted by `bar`, `grouped_bar`, `line`, `scatter` and `heatmap`; in
  any other kind it makes the spec invalid. `pie` with more than one series is invalid.
- Q-6. `stacked_bar` with a negative value is invalid, by Q-5.
- Q-7. Equal paths sum their values; a path that ends on a node another path passes through keeps
  its value on that node, next to the values of its children. No hierarchy the schema accepts is
  refused for its shape; the one refusal the schema cannot see is the count of distinct leaves.
- Q-8. `percent` reads `y` 0.25 as 25 %.
- Q-9. `currency` without a currency code makes the spec invalid, and so does a code that is not
  three capital letters accepted by `Intl.NumberFormat`. `number` keeps up to 2 fraction digits,
  `percent` up to 1, `currency` the digits of its currency.
- Q-10. The formats use the locale of the kit labels; a drawn chart follows its change, and the
  copy reads it at the moment of the copy.
- Q-11. The full-screen view shows the title, the subtitle and the axis names; the PNG holds what
  `rt-chart` gives, the plot and the legend.
- Q-12. The file is named by the title: Unicode letters and digits are kept, runs of other
  characters become one dash, edge dashes are dropped, the name is cut to 80 characters. An empty
  result, a missing title included, is «chart.png».
- Q-13. The copy gives the title, the subtitle, then one line per series `name: x — y; x — y`
  signed by the format. The trees give one line per leaf: the path joined by « / », then « — »
  and the value. A histogram writes `x` as the bin `low–high`. A pending or an invalid block
  gives nothing.
- Q-14. Unknown fields are ignored.
- Q-15. The export follows JSON Schema draft 2020-12.

## History of changes

- 2026-11-18 — written by the task RT-3335 of the epic RT-3346.
