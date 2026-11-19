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

### SC-UKV-1510 — the grid switches to two columns at 640

Given the same section
When it is drawn 639 wide and then 640 wide
Then at 639 the charts stand one under another, and at 640 side by side, 312 each
And at 640 the KPI block holds two columns

### SC-UKV-1511 — the default span follows the kind of the block

Given a section with a `markdown`, a `notice`, a `kpi`, a `table`, a `chart`, an application block and a block of an unknown type, none with a `span`
When the views of the section are built
Then the first four take the whole row, and the last three one column

### SC-UKV-1512 — a block names its own span

Given a section with a `chart` holding `span: "full"`, a `table` holding `span: "column"` and a `chart` holding `span: "wide"`
When the views are built
Then the first chart takes the whole row, the table one column and the second chart one column
And each nested block gets its block as given, `span` included

### SC-UKV-1513 — a lone column block keeps the column width

Given a section 926 wide with three charts
When it is drawn
Then the third chart stands alone in the second row, 455 wide, at the start side

Not covered: it cannot be closed by a test with an identifier, for the reason of SC-UKV-1508. Held
by the play step of the showcase story of the lone block.

### SC-UKV-1514 — the order of the list is kept, and a full block starts a new row

Given a section 926 wide with a chart, a table and a chart
When it is drawn
Then the first chart stands alone in the first row, the table in the second, the second chart in the third
And the document order of the blocks is the order of the list

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
Then the first draws the heading «Обзор ноября» of the level 3 and is a group named «Обзор ноября»
And the other three draw no heading and are groups without a name

### SC-UKV-1518 — the answer copy gives the title and the texts of the nested blocks

Given an answer with a section «Обзор ноября» holding a summary, a KPI block, a chart with a text function and a block of an unknown type
When the reader copies the answer
Then the copy holds «Обзор ноября», the summary, the KPI lines and the chart text in that order, separated by empty lines
And the unknown block adds nothing
And a section whose blocks give no text adds nothing, its title included

### SC-UKV-1519 — the JSON schema requires the blocks and names the span

Given the exported schema of the section
When it is read
Then it requires `blocks`, requires `type` in an item of `blocks`, names `span` as `full` or `column` and keeps `title` optional
And a section the schema accepts is drawn with every block in place

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
