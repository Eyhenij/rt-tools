# The section block of the assistant chat

**Status:** proposed · **Revision:** 2026-11-19 · **Scenario prefix:** `SC-UKV`
**Depends on:** the assistant chat (the blocks of an answer, the plate, the answer copy), the KPI
block, the table block and the chart block of the chat (the blocks a section holds)
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

The agreement of task RT-3342: the `section` block of an answer of `rt-ai-chat`, a title and a
grid of nested blocks. The approved mockup is the frame 8375-625 of the second kit file. The rules
merge into a subdomain of their own next to `ai-chat-kpi`. At the merge the rules of
`docs/specs/ui-kit-v2/ai-chat/spec.md` on the kit's own types, on the plate and on the answer copy
name `section`.

## Why

A composed answer — a summary line, a row of KPI cards, a few charts, a table — stands in the feed
as one column. In the full-screen mode the charts do not stand side by side, though there is room.
The kit gets a `section` block: it holds other blocks and lays them out in a grid by its own
width, two columns where they fit and one where they do not.

## Terminology

- **The section** — a block of an answer with the type `section`: an optional title and a list of
  nested blocks.
- **A nested block** — a block inside a section; any block the feed can draw, but not a section.
- **The grid** — the layout of the nested blocks: one or two columns by the width of the section.
- **The span** — how much of a grid row a nested block takes: the whole row or one column.

### What it is called in the interface

| In the domain | On the screen                                              |
| ------------- | ---------------------------------------------------------- |
| The section   | a heading and the blocks under it                          |
| The title     | the heading of the section, larger than a block title      |
| Whole row     | a block as wide as the section                             |
| One column    | a block half as wide as the section, next to its neighbour |

## Rules

### The block and its data

- **`section` is a type the kit draws itself, next to `markdown`, `notice`, `table` and `kpi`; an application gets it without registering anything, and a renderer registered for `section` is not taken.**

- **A section has `blocks`, a list of nested blocks, and the optional `title`.** A `title` that is not a string, or is empty after trimming, is absent; the title is drawn trimmed.

- **A nested block is drawn by the rules of the feed.** A kit type is drawn by the kit and another type by its registered renderer. A type without a renderer and a broken kit block are the plate with the type name.

- **An item of `blocks` that is not an object with a string `type` is dropped; the other blocks stay in their order.**

- **A section inside a section is not drawn: it is shown as the plate with the type name `section`.** One level is enough for a composed answer, and the grid of a nested section would have half the width.

- **A section whose `blocks` is not a list, or holds no block left after the rule above, is shown as the plate with its type name.** A section whose blocks are all plates is still drawn: the plates show what is missing.

- **A nested block may carry `span`: `full` takes the whole row, `column` takes one column.** Any other `span` is absent. Without a `span` a `markdown`, a `notice`, a `kpi` and a `table` block take the whole row. Every other block — a chart, an application block, a plate — takes one column.

- **A nested block gets its block as given, `span` included; the kit adds no input for it.**

- **A new answer with the same section holding other blocks redraws the grid.**

- **The kit exports the JSON schema of the section (JSON Schema 2020-12), so that an application gives it to the model as the parameters of a tool.** It requires `blocks`, a list of objects each with a required string `type` and the optional `span` of `full` or `column`; `title` is optional. It does not describe the fields of the nested blocks: their own schemas do. Its description says that a section does not hold a section.

- **A section the schema accepts is drawn with nothing dropped.** The block is more lenient than the schema: what the schema refuses is still drawn by the rules above.

### The grid

- **The grid follows the width of the section, not the mode of the chat: one column while the section is narrower than 640, two from 640.** The narrow panel (328, 386) gives one column. The full-screen mode gives two: about 926 without the thread column, about 646 with it, 640 with a reading column of `40rem`.

- **The order of the blocks is the order of the list.** Rows fill from the start side, a block that takes the whole row starts a new row, and a row is not reordered to fill a gap.

- **In one column every block takes the whole row, whatever its span.**

- **In two columns the columns are equal, and a block that stands alone in its row keeps the column width; it is not stretched.**

- **The gap of the grid is 16, `--rt-space-md`, between rows and between columns.** At 640 a column is 312, at 926 it is 455.

- **The blocks of one row stand on one top; each keeps its own height.**

- **A nested block lays out by the width of its cell, as it does by the width of the feed.** A KPI block in a section 640 wide has two columns, since it is under 664; in a cell narrower than 328 it has one. A table scrolls inside its cell; a chart thins its labels.

- **No block goes past its cell, and the section never widens the feed.**

- **Under `dir="rtl"` the columns mirror: the first block of a row stands at the right.**

### The title

- **The title is 16/20 SemiBold in the primary text colour and stands 12 above the grid.** It wraps between words and never goes past the section.

- **A section without a title draws the grid alone, with no gap above it.**

### Copying

- **The answer copy gives a section as its title and then the texts of its nested blocks in their order, each as the feed would copy it, separated by an empty line.**

- **A nested block without a text adds nothing, and a section none of whose blocks has a text adds nothing, title included.**

### Accessibility

- **The section is a group named by its title; a section without a title is a group without a name.**

- **The title is a heading of the level 3.**

- **The order a screen reader and the keyboard meet the blocks in is the order of the list.**

- **The block has no fixed text of its own and adds no kit label.**

## What is out of scope

- A section inside a section, a collapsible section, a section frame or background.
- More than two columns, a column count set by the consumer, a span of a share of a row.
- Stretching the blocks of a row to one height.
- Passing the full-screen mode of the chat to a block: the section reads its own width.
- The link card (RT-3339) and the sources block (RT-3340).
- A joint schema of all blocks: each block exports its own.

## Contract

None: the block is a part of the layout component and serves no procedure.

### Refusal codes

Not applicable.

## Data

The block reads the fields of its own answer block and keeps no data of its own. Of a block, as
the consumer gives it:

- `type` — `section`;
- `title` — the heading text;
- `blocks` — the nested blocks, each a block of the answer with the optional `span` of `full` or
  `column`.

## Screens and states

| state              | what is drawn                                                             |
| ------------------ | ------------------------------------------------------------------------- |
| narrow 328, 386    | the overview in one column: summary, KPI, chart, chart, table             |
| reading column 640 | the two charts side by side, 312 each; the KPI block in two columns       |
| full screen 926    | the two charts side by side, 455 each; the KPI block in four columns      |
| below 640          | at 639 one column, at 640 two                                             |
| lone column block  | three charts: the third alone in its row at the column width              |
| span set           | a chart with `span: "full"` as wide as the section; a table with `column` |
| no title           | the grid alone                                                            |
| long title         | the title on two lines inside the section                                 |
| nested section     | the plate with the type name `section` in the grid                        |
| unknown block      | the plate of the unknown type in one column                               |
| right to left      | the columns mirrored                                                      |
| invalid            | the plate with the type name                                              |
| dark theme         | the overview at 386 and 926 in the dark palette                           |

## Cross-cutting requirements

### Locales

The section adds no kit label and writes no number: the title comes from the consumer as given, and
each nested block follows the kit locale by its own rules.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

The narrow panel is the mobile width of the chat: under 640 the section is one column, and every
nested block is as wide as the feed.

### Several objects

Several sections in one answer and in one feed each lay out by their own width; blocks outside a
section stand in the feed as before.

## Decisions

- **The threshold is 640** — the approved mockup: two charts of 312 read at 640, the width a
  `40rem` reading column gives; the narrow panel is 386 at most. Closed by assumption, shown on the
  mockup.
- **The width decides the columns, not `fullScreen`** — a block gets only its `block` input, and
  the KPI block already lays out by a container query of its own.
- **The default span follows the kind of the block** — a model writes an overview without naming a
  span: a text, a KPI row and a table read at full width, a chart reads at half. `span` overrides.
- **The gap is 16, not the 8 of the feed** — two charts 8 apart read as one; the mockup.
- **The title is 16 SemiBold** — one step above the 14 of a chart and a table title; the mockup.
- **A section does not hold a section** — the answer the task card names needs one level. Closed by
  assumption.
- **A row is not reordered to fill a gap** — the task card: «Порядок блоков в сетке как в
  массиве».
- **The blocks of a row keep their own heights** — a chart with a subtitle and a chart without one
  differ, and stretching a chart would change its plot. The mockup draws them on one top.
- **The schema names only `type` and `span` of a nested block** — the chart schema lives in a
  separate entry, and the main entry cannot take it without the chart code.

## Open questions

None: the six questions of the draft are closed by assumption in the grill, and the mockup is
approved.

## History of changes

- 2026-11-19 — the agreement written for RT-3342 from the grill and the approved mockup 8375-625.
