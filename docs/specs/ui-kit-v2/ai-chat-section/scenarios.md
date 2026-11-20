# Scenarios — the section block of the assistant chat

The numbers continue the numbering of the kit and do not change after the merge. The numbers up to
SC-UKV-1506 are held by a neighbouring branch, so the numbering starts at 1507.

### SC-UKV-1507 — the kit draws a section without a registration

Given an answer with a `section` block and an application that registered a renderer for `section`
When the answer is drawn
Then the section is drawn by the kit as a title and a grid, and the registered renderer is not used

### SC-UKV-1508 — the overview stands in one column in the narrow panel

Given a section «Обзор ноября» with a summary, a KPI block of four cards, two charts and a table, 386 wide
When it is drawn
Then the five blocks stand one under another in the order of the list, each 386 wide, 16 apart
And the same section 328 wide stands the same way

Not covered: it cannot be closed by a test with an identifier — the columns come from a container
query, and the styles of the component do not reach the test environment. Held by the play steps
of the showcase story of the widths.

### SC-UKV-1509 — the charts stand side by side in the full-screen mode

Given the same section 926 wide
When it is drawn
Then the summary, the KPI block and the table are 926 wide
And the two charts stand in one row on one top, 455 each, 16 apart
And the KPI block holds four columns

Not covered: it cannot be closed by a test with an identifier, for the reason of SC-UKV-1508. Held
by the play steps of the showcase stories of the widths and of the full-screen chat.

### SC-UKV-1510 — the styles declare two equal columns from 600

Given the styles of the section
When they are read
Then the host is a named inline-size container, and the grid asks it by name from 600 for two equal columns
And a cell of the whole row spans both columns, and the gap is `--rt-space-md`

### SC-UKV-1511 — the default span follows the declared type

Given a section with a `markdown`, a `notice`, a `kpi`, a `table`, a `kpi` without cards, a `chart`, an application block, a block of an unknown type and a nested `section`, none with a `span`
When the views of the section are built
Then the first five take the whole row, and the last four one column

### SC-UKV-1512 — a block names its own span

Given a section with a `chart` holding `span: "full"`, a `table` holding `span: "column"` and charts holding `span: "wide"`, `span: 1` and `span: null`
When the views are built
Then the first chart takes the whole row, the table one column and the other charts one column
And each nested block gets its block as given, `span` included
And a `table` block of the feed holding `span: "column"` is drawn as without it

### SC-UKV-1513 — a lone column block keeps the column width

Given a section 926 wide with three charts
When it is drawn
Then the third chart stands alone in the second row, 455 wide, at the start side

Not covered: it cannot be closed by a test with an identifier, for the reason of SC-UKV-1508. Held
by the play step of the showcase story of the lone block.

### SC-UKV-1514 — the order of the list is kept, and a full block starts a new row

Given a section with a chart, a table and a chart
When it is drawn
Then the cells stand in the document in the order of the list, the first and the third of one column, the second of the whole row
And each nested block stands in a cell of the kit that carries its span

### SC-UKV-1515 — a section inside a section is the plate

Given a section whose `blocks` hold a `section` and a `markdown`
When it is drawn
Then the nested section is shown as the plate with the type name `section`, and the text is drawn

### SC-UKV-1516 — a section without a block to draw is the plate

Given `section` blocks with no `blocks`, with `blocks: "text"`, with `blocks: []` and with `blocks: [7, null, {}]`
When the answer is drawn
Then each is shown as the plate with the type name `section`
And a section with `blocks: [7, { type: "markdown", text: "Итог" }]` draws the text alone

### SC-UKV-1517 — the title is optional and trimmed

Given sections with `title: "  Обзор ноября  "`, with `title: "  "`, with `title: 7` and with no title
When they are drawn
Then the first draws the heading «Обзор ноября» of the level 3 and is a group labelled by that heading
And two such sections in one answer carry different heading ids
And the other three draw no heading and carry no role

### SC-UKV-1518 — the answer copy gives the title and the texts of the nested blocks

Given an answer with a section «  Обзор ноября  » holding a summary, a KPI block, a chart with a text function, a block of an unknown type and a nested section with a text
When the reader copies the answer
Then the copy holds «Обзор ноября», the summary, the KPI lines and the chart text in that order, separated by empty lines
And the unknown block and the nested section add nothing
And a section whose blocks give no text adds nothing, its title included

### SC-UKV-1519 — the JSON schema requires the blocks and names the span

Given the exported schema of the section
When it is read
Then it requires `blocks` with at least one item, requires in an item a `type` other than `section`, names `span` as `full` or `column` and keeps `title` optional
And a section the schema accepts keeps every item of its list as a cell

### SC-UKV-1520 — nothing goes past the section, and the feed is not widened

Given the overview section in a chat in the narrow panel and in the full-screen mode, with a title longer than the section
When it is drawn
Then the title wraps inside the section, no block goes past its cell, and the feed is as wide as without the section

Not covered: it cannot be closed by a test with an identifier — widths come from the styles. Held
by the play steps of the chat stories in both modes.

### SC-UKV-1521 — right to left mirrors the columns

Given the overview section 926 wide under `dir="rtl"`
When it is drawn
Then the first chart stands at the right of the second

Not covered: it cannot be closed by a test with an identifier — the order comes from the styles.
Held by the play step of the showcase story right to left.

### SC-UKV-1522 — a KPI block in a narrow cell falls to fewer columns

Given a section 640 wide with a KPI block holding `span: "column"`
When it is drawn
Then the KPI block is 312 wide and holds one column of cards

Not covered: it cannot be closed by a test with an identifier, for the reason of SC-UKV-1508. Held
by the play step of the showcase story of the narrow cell.

### SC-UKV-1523 — a new answer redraws the grid

Given a chat whose message holds a section with one chart
When `messages` is replaced by a copy where that section holds two charts and a table
Then the section draws the three blocks in their order

### SC-UKV-1524 — the schemas of the nested types are joined into the schema of the section

Given the joining function called without a schema
When its result is read
Then the item of `blocks` is one of the schemas of `markdown`, `notice`, `kpi` and `table`, each with its `type` fixed to its name and the optional `span`

Given the schema of the chart block under the name `chart` and the answer «обзор месяца»
When the joining function is called with it
Then the result accepts the section and each of its five blocks, and both charts are ready to be drawn
And it rejects a chart whose specification lies in the root of the block

Given a schema under the name of an application type and a schema under the name `markdown`
When the joining function is called with them
Then the first is added as one more schema and the second replaces the kit's one
And the result shares no node with the given schemas or with the schema of the section

### SC-UKV-1525 — a nested block is drawn by the rules of the feed

Given a section with a `kpi` block, a block of a registered application type, a `table` without columns and a block of an unknown type
When it is drawn
Then the KPI block is drawn by the kit, the application block by its renderer with its block as given, and the last two as plates with their type names
And a section whose blocks are all plates is drawn as a grid of plates, not as one plate

### SC-UKV-1526 — in one column a block of one column takes the whole row

Given a section 386 wide with a table holding `span: "column"` and two charts
When it is drawn
Then the three blocks stand one under another, each 386 wide

Not covered: it cannot be closed by a test with an identifier, for the reason of SC-UKV-1508. Held
by the play step of the showcase story of the span.

### SC-UKV-1527 — a scrolling full-screen chat still draws two columns

Given a full-screen chat with the thread column and a full-screen chat with a `40rem` reading column, each with the overview answer taller than its feed
When they are drawn
Then in both the two charts stand side by side on one top

Not covered: it cannot be closed by a test with an identifier, for the reason of SC-UKV-1508. Held
by the play steps of the chat stories with the thread column and with the reading column.

### SC-UKV-1528 — a section stands 16 from its neighbours

Given an answer with a section, a text and a section, and a section without a title
When they are drawn
Then the text stands 16 under the first section and 16 above the second, and the rows inside a section are 16 apart
And the section without a title has no gap above its grid

Coverage: partial — the test reads the two style rules that give the gap, not the drawn distance.
The distance is measured by the play step of the showcase story of two sections: between a section
and a text, another section, a chart and a plate.

### SC-UKV-1529 — the dark theme draws the overview in the dark palette

Given the overview section at 386 and at 926 in the dark theme
When it is drawn
Then the title and the blocks take the dark values of their tokens

Not covered: it cannot be closed by a test with an identifier — the colours come from the styles.
Held by the dark story snapshots and the match with the dark column of the mockup.
