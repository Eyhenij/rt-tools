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
- **A cell** — the place of one nested block in the grid; the kit draws it around the block.
- **The span** — how much of a grid row a cell takes: the whole row or one column.

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

- **A nested block may carry `span`: `full` takes the whole row, `column` takes one column.** Any other `span`, a number or `null` included, is absent.

- **Without a `span` the declared type decides, not what is drawn.** A `markdown`, a `notice`, a `kpi` and a `table` block take the whole row, also when shown as the plate. Every other type — a chart, an application block, an unknown type, a nested `section` — takes one column.

- **`span` is read by the section alone: on a block of the feed it has no effect.** A nested block gets its block as given, `span` included; the kit adds no input for it.

- **When the list changes, each cell shows the block now at its place.**

### The schema

- **The kit exports the JSON schema of the section (JSON Schema 2020-12).** It requires `blocks` with at least one item. An item requires a string `type` other than `section` and may hold `span` of `full` or `column`. `title` is optional.

- **The kit exports a function that joins the schemas of the nested types into the schema of the section.** The result is the section schema whose item is one of the named schemas, each with its `type` fixed to its name and with the optional `span`. The schemas of `markdown`, `notice`, `kpi` and `table` are in the result without a word from the application. The application adds the schemas of the other types by their names, and a schema given under the name of a kit type replaces the kit's one. The result shares no node with what it was joined from. An application gives the result to the model as the parameters of a tool: the bare schema names no field of a nested block.

- **The kit exports the JSON schemas of the `markdown` block and of the `notice` block.** The first requires `text`. The second requires `text` and a `severity` of the six the notice draws.

- **The chart entry exports the JSON schema of the chart block.** It requires `spec` and holds the schema of the chart specification there. This schema, not the schema of the specification, is the one named `chart` when the section schema is joined: the chart block reads its specification from `spec`.

- **No item the schema accepts is dropped from the list.** Whether an item is drawn or shown as the plate is decided by the rules of its own block.

### The grid

- **The grid follows the width of the section, not the mode of the chat: one column while the section is narrower than 600, two from 600.** The narrow panel (328, 386) gives one column. A full-screen chat gives two while its feed leaves the section 600 or more: about 926 without the thread column, about 646 with it, 640 with a reading column of `40rem`. Where the scrollbar of the feed takes its 12 from the layout, these are 914, 634 and 628, still two columns.

- **The section is a named query container of its own, and its grid asks that container by name.** A nested block that lays out by its width is its own container, as the KPI block is.

- **Each nested block stands in a cell the kit draws; the span belongs to the cell.** The cell lays its block out as the feed does: as a block-level item with a minimum width of zero, whatever the display of the block's own host.

- **The order of the blocks is the order of the list.** Rows fill from the start side, a block that takes the whole row starts a new row, and a row is not reordered to fill a gap.

- **In one column every block takes the whole row, whatever its span.**

- **In two columns the columns are equal, and a block that stands alone in its row keeps the column width; it is not stretched.**

- **The gap of the grid is 16, `--rt-space-md`, between rows and between columns.** A column is half of the section width less 16: 312 at 640, 455 at 926.

- **The blocks of one row stand on one top; each keeps its own height.**

- **A section stands 16 from the block before it and after it in the feed, not the 8 of the feed.** Two sections 8 apart would read as one, since their own rows are 16 apart. The first block of an answer keeps no gap above it, the last none below.

- **A nested block lays out by the width of its cell, as it does by the width of the feed.** A KPI block in a section 640 wide has two columns, since it is under 664; in a cell narrower than 328 it has one. A table scrolls inside its cell; a chart thins its labels.

- **The section never widens the feed: a cell is never wider than its column.** A kit block and a chart stay inside their cell. An application block wider than its cell overflows it visibly; the kit does not clip a cell, so that a tooltip and a focus ring are not cut.

- **Under `dir="rtl"` the columns mirror: the first block of a row stands at the right.**

### The title

- **The title is 16 SemiBold on a line of 20, in the primary text colour, and stands 12 above the grid.** It wraps between words, a word longer than the section breaks, and the title never goes past the section.

- **A section without a title draws the grid alone, with no gap above it.**

### Copying

- **The answer copy gives a section as its trimmed title, an empty line, and then the texts of its nested blocks in their order, each as the feed would copy it, separated by an empty line.** A line break inside the title becomes a space.

- **A nested block without a text adds nothing; a nested section adds nothing, like the plate it is drawn as.**

- **A section none of whose blocks has a text adds nothing, title included.**

### Accessibility

- **A section with a title is a group labelled by its heading through an id unique per section; a section without a title carries no role.**

- **The title carries the heading role with the level 3, as the markdown text of an answer marks its headings.** A markdown heading inside a section keeps its own level.

- **The order a screen reader and the keyboard meet the blocks in is the order of the list.**

- **The block has no fixed text of its own and adds no kit label.**

## What is out of scope

- A section inside a section, a collapsible section, a section frame or background.
- More than two columns, a column count set by the consumer, a span of a share of a row.
- Stretching the blocks of a row to one height.
- Passing the full-screen mode of the chat to a block: the section reads its own width.
- A state of a section in an answer that is still being written.
- The link card (RT-3339) and the sources block (RT-3340).

## Contract

None: the block is a part of the layout component and serves no procedure.

### Refusal codes

Not applicable.

## Data

The block reads the fields of its own answer block and keeps no data of its own. Of a block, as
the consumer gives it:

- `type` — `section`;
- `title` — the heading text;
- `blocks` — the nested blocks. The type of a nested block is the type of a block of the answer
  with the optional `span` of `full` or `column`.

## Screens and states

| state              | what is drawn                                                             |
| ------------------ | ------------------------------------------------------------------------- |
| narrow 328, 386    | the overview in one column: summary, KPI, chart, chart, table             |
| reading column 640 | the two charts side by side, 312 each; the KPI block in two columns       |
| full screen 926    | the two charts side by side, 455 each; the KPI block in four columns      |
| the threshold      | at 599 one column, at 600 two                                             |
| lone column block  | three charts: the third alone in its row at the column width              |
| span set           | a chart with `span: "full"` as wide as the section; a table with `column` |
| no title           | the grid alone                                                            |
| long title         | the title on two lines inside the section                                 |
| nested section     | the plate with the type name `section` in one column                      |
| unknown block      | the plate of the unknown type in one column                               |
| two sections       | two sections and a text between them, 16 apart                            |
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

The narrow panel is the mobile width of the chat: under 600 the section is one column, and every
nested block is as wide as the section.

### Several objects

Several sections in one answer and in one feed each lay out by their own width; blocks outside a
section stand in the feed as before.

## Decisions

- **The threshold is 600, under the 640 the mockup draws** — the mockup shows two charts of 312 at
  640, the width a `40rem` reading column gives. The feed scrolls, and a scrollbar that takes its
  12 from the layout leaves the section 628 there and 634 next to the thread column: a threshold of
  640 would give one column in the full-screen mode on such a machine, against the task card. At
  600 a column is 292 at the least; the narrow panel is 386 at most.
- **The width decides the columns, not `fullScreen`** — a block gets only its `block` input, and
  the KPI block already lays out by a container query of its own.
- **The default span follows the declared type** — a model writes an overview without naming a
  span: a text, a KPI row and a table read at full width, a chart reads at half. `span` overrides.
- **The gap is 16, not the 8 of the feed** — two charts 8 apart read as one; the mockup.
- **The title is 16 SemiBold with the heading level 3** — one step above the 14 of a chart and a
  table title; the mockup. The kit cannot know the outline of the page: 3 leaves 1 for the page and
  2 for the panel. A markdown heading inside keeps its own level, and the mismatch is accepted.
- **A section does not hold a section** — the answer the task card names needs one level. Closed by
  assumption.
- **A row is not reordered to fill a gap** — the task card: «Порядок блоков в сетке как в
  массиве».
- **The blocks of a row keep their own heights** — a chart with a subtitle and a chart without one
  differ, and stretching a chart would change its plot. The mockup draws them on one top.
- **The schema of the section is joined from the schemas of the nested types by a function** — the
  chart schema lives in a separate entry the main one cannot take, and the schemas of the blocks
  name no `type`. The application has all of them and joins them by one call.
- **An empty section in an answer still being written is the plate** — the kit does not tell a
  block the answer is unfinished; an application adds the section once it has a block.
- **`section` as a kit type takes the place of an application renderer registered for `section`** —
  as every kit type does; the release note names it.
- **A section whose blocks give no text leaves the copy empty, title included** — the rule of the
  chat: a heading alone is not the answer.

## Open questions

None: the six questions of the draft are closed by assumption in the grill, and the mockup is
approved.

## History of changes

- 2026-11-19 — the agreement written for RT-3342 from the grill and the approved mockup 8375-625.
- 2026-11-19 — the review by spec-critic, goal-critic and product-strategist: the threshold 600
  for the scrollbar, the cell and the named container, the default span by the declared type, the
  schema joined by a function, the gap around a section, the group and the heading, the copy of
  the title and of a nested section.
