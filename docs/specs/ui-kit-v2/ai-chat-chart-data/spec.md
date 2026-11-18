# The data table of the chart block

**Status:** in force · **Revision:** 2026-11-18 · **Scenario prefix:** `SC-UKV`
**Depends on:** the chart block of the assistant chat (its data mapping, its format)
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

An addition to the subdomain `ai-chat-chart`: a switch under the chart that shows and hides the
table of the chart data. It stands as a subdomain of its own next to the block: together with the
block spec it is longer than the document limit.

## Why

A chart gives the shape and hides the exact numbers. For the numbers the assistant repeats the
chart data as a markdown table in the text of the answer, and the answer says the same twice. The
block itself can give the numbers on demand.

## Terminology

- **The data table** — the table of the points the chart draws, under the chart of a block.
- **The switch** — the text button under the chart that shows and hides the data table.

### What it is called in the interface

| In the domain  | On the screen                                          |
| -------------- | ------------------------------------------------------ |
| The switch     | «View data» with a chevron down; «Hide data» with up   |
| Head words     | «Category», «Bin», «Value», «Series», «X», «Y», «Path» |
| The data table | a table with a head row, under the switch              |

## Rules

- **The switch stands under the chart as soon as the block is in the drawn state; the data table is hidden until it is pressed.**

- **The table is closed when the block is created; it stays open across a locale change and a re-render of the same block, and closes when the input `block` brings another spec.**

- **The pending, the invalid and the empty block have no switch; a block that turns one of them while its table is open loses the switch and the table.** "Empty" is the empty state of the block spec; a cartesian, heatmap or scatter spec of all zeros is drawn and has a table of zeros.

- **The data table is built from the data the chart gets (`rtAiChatChartData`), not from the spec anew: the same categories in the same order, the same labels, the same values.**

- **A value is written exactly as the format of the chart writes it for the kit locale, its sign included; the table adds no sign and no spacing of its own.**

- **The head row per kind:**

    | Kind                                        | First column                              | Other columns                                            |
    | ------------------------------------------- | ----------------------------------------- | -------------------------------------------------------- |
    | `line`, `bar`, `grouped_bar`, `stacked_bar` | the `x` axis name, else «Category»        | a column per series, named by the series                 |
    | `histogram`                                 | the `x` axis name, else «Bin»             | the series name                                          |
    | `pie`                                       | «Category»                                | «Value»; the axis names are ignored, as on the chart     |
    | `heatmap`                                   | the corner: the `y` axis name, else empty | a column per `x` in the order of the chart columns       |
    | `scatter`                                   | «Series»                                  | the `x` axis name, else «X»; the `y` axis name, else «Y» |
    | `treemap`, `sunburst`                       | «Path»                                    | «Value»                                                  |

    A series with an empty name gives an empty head cell.

- **The rows per kind.** A cartesian kind gives a row per category; `stacked_bar` cells hold the value of their series, not the running sum. `histogram` gives a row per bin named `low–high` from the category bounds the chart gets, written as given and not signed by the format. `pie` gives a row per sector. `heatmap` gives a row per series named by the series, a cell per `x`. `scatter` gives a row per point, series by series in the spec order; `x` is written as given, `y` is signed by the format. There is no total row or column.

- **`treemap` and `sunburst` give a row per path that carries a value after equal paths are summed: every leaf, and an inner node whose own path was given, holding only its own value.** The path is joined by « › », and the rows follow the chart's tree: a node before its children, the children in the order their name first appears.

- **A missing point is an empty cell; a zero is written as a zero.**

- **Value columns — `y` values, cells and the `scatter` `x` — are aligned right; names, categories, bins and paths left. A number never wraps; a long name wraps inside its cell.**

- **A table wider than the block scrolls inside the block and never widens the feed; its height is not limited, the block grows with it.**

- **The open table follows a change of the kit label locale: its values, its head labels and the switch name change with it.**

- **The full-screen dialog has no switch and no table.**

- **The copy button of an answer gives the same text with the table open or hidden.** Selecting text by hand is outside this rule.

- **The switch is a button with `aria-expanded`; while hidden the table is absent, and the switch keeps `aria-controls` with the table id, unique per block instance.** The table is named by the spec title, else «Chart»; head cells are `th` with `scope`.

- **Every fixed text of the switch and the head — «View data», «Hide data», «Category», «Bin», «Value», «Series», «X», «Y», «Path», «Chart» — is a kit label in the `rtKit` namespace, English in the package.**

## What is out of scope

- Sorting, filtering and copying the table.
- The table block of the chat — RT-3337 takes the markup of this table.
- Making the assistant stop writing the data table in its text — the prompt of the application.

## Contract

None: the table is a part of the layout component and serves no procedure.

### Refusal codes

Not applicable.

## Data

The table reads the data `rtAiChatChartData` gives the chart and the format the chart signs values
with; it keeps no data of its own. The only state is the open flag of one block instance, held in
memory and never stored.

## Screens and states

| state      | what is drawn                                                       |
| ---------- | ------------------------------------------------------------------- |
| closed     | the drawn block and «View data» with a chevron down under the chart |
| open       | «Hide data» with a chevron up and the table under it                |
| wide       | the open table scrolls sideways inside the block                    |
| dark theme | the same block and table in the dark palette                        |

## Cross-cutting requirements

### Locales

The switch names and the head words are kit labels in the `rtKit` namespace, English in the package.
Values follow the locale of the kit labels, as the chart does.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The table takes the width of the block; on a narrow block it scrolls sideways inside it, and the
feed keeps its width.

### Several objects

Several chart blocks in one feed keep their own open flag and their own table id.

## Decisions

- **Plain markup, not `rt-table`.** By the owner's word «Простая разметка»: `rt-table` brings the
  CDK table, column settings in IndexedDB and narrow-screen cards, and a read-only table of at
  most sixty rows needs none of it. The `<table>` carries the `native-ok` marker naming `rt-table`.
- **A row per category.** By the owner's word «Строка на категорию»: the table reads like the
  chart.
- **Only in the block.** By the owner's word «Только в блоке»: the dialog shows the chart larger.

## Open questions

None.

## History of changes

- 2026-11-18 — the agreement written for RT-3336 from the grill, reviewed by spec-critic.
- 2026-11-18 — merged as a subdomain of the kit with its bindings; the showcase found that a cell
  broke words anywhere and that a row was 29 high, both fixed before the merge.
