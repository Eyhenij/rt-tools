# Scenarios — the sources block of the assistant chat

The numbers continue the numbering of the kit, from SC-UKV-1541.

### SC-UKV-1541 — the kit draws a sources block without a registration

Given an answer with a `sources` block and an application that registered a renderer for `sources`
When the answer is drawn
Then the block is drawn by the kit as a collapsed list, and the registered renderer is not used

### SC-UKV-1542 — one source gives the number 1 and a collapsed list

Given a `sources` block with one source titled «Отчёт «Продажи»» with the detail «Страница 3»
When the block is drawn
Then the header holds the label «Sources» and the number 1
And the list is collapsed and its rows are not shown

### SC-UKV-1543 — five sources give the number 5

Given a `sources` block with five sources
When the block is drawn
Then the header holds the number 5, and the list is collapsed
And after the header is opened the five rows stand in the order given

### SC-UKV-1544 — the list opens and closes from the keyboard

Given a drawn, collapsed `sources` block and the focus on its header
When the reader presses Enter, then Enter again, then Space, then Space again
Then the list expands, collapses, expands and collapses
And the header reports its state to the assistive means each time

### SC-UKV-1545 — the kit keeps the opened state and gives it to nobody

Given an expanded `sources` block in the message `m1`
When `messages` is replaced by a copy holding the same block
Then the list stays expanded
And the chat emits no event about the opening or the closing

### SC-UKV-1546 — a press on a source with an address leaves the chat in the same call

Given a chat with an answer `m1` holding an expanded `sources` block with a source titled «Отчёт «Продажи»» and `url: "/reports/sales?month=11"`
When the reader presses that source
Then the chat emits `sourceOpen` with `{ messageId: "m1", url: "/reports/sales?month=11", title: "Отчёт «Продажи»" }` before the click handler returns
And the same press from the keyboard with Enter gives the same event
And a second press emits a second event

### SC-UKV-1547 — a source without an address is plain text

Given an expanded `sources` block with a source that has no `url`
When the block is drawn and the reader presses that source
Then the row is drawn as text, not as a button, and the chat emits no `sourceOpen`

### SC-UKV-1548 — a source without a title is dropped

Given a `sources` block with four sources: one with no `title`, one with `title: "  "`, one with `title: 7` and one valid
When the block is drawn
Then one row is drawn, and the header holds the number 1

### SC-UKV-1549 — a block without sources is the plate

Given `sources` blocks with no `items`, with `items: "a"`, with `items: []` and with sources that all have no title
When the answer is drawn
Then each is shown as the plate with the type name `sources`

### SC-UKV-1550 — a malformed optional part is absent, and the text is trimmed

Given a source with `detail: 5`, `url: ""` and `icon: 3`, and a source with `detail: "  "` and `url: "   "`
When the block is drawn
Then each row has no detail line, is not pressable and has the icon `file`
And a source with `title: "  Продажи  "`, `detail: " Ноябрь "` and `url: " /r "` draws «Продажи» and «Ноябрь», and a press emits `url: "/r"` and `title: "Продажи"`

### SC-UKV-1551 — an icon name outside the kit set is the fallback

Given sources with `icon: "chart-bar"`, `icon: "report"` and `icon: "file-text"`
When the block is drawn
Then the first row draws `chart-bar`, the other two draw `file`
And the kit asks for no drawing by the foreign names

### SC-UKV-1552 — the answer copy gives a header line and a line per source

Given an answer with a `sources` block of two sources: «Отчёт «Продажи»», «Ноябрь, фильтр: Москва», «/reports/sales», and «Заказы» with no detail and no address
When the reader copies the answer
Then the copy holds the line «Sources», TAB, «2»
And the line «Отчёт «Продажи»», TAB, «Ноябрь, фильтр: Москва», TAB, «/reports/sales»
And the line «Заказы», TAB, an empty field, TAB, an empty field
And a title with a tab and a line break inside writes both as spaces

### SC-UKV-1553 — the JSON schema holds what the model writes

Given the exported schema of the sources block
When a block with `items` of sources with `title`, `detail`, `icon` and `url`, a block without `items` and a block with a source without `title` are validated
Then the first is accepted, the other two are refused
And the section schema holds this schema among its own schemas
And the accepted block is drawn with every source in it

### SC-UKV-1554 — the region is named by the header, the rows are a list, the icons are hidden

Given an expanded `sources` block with a pressable source and a plain one, each with a detail
When a screen reader reads it
Then the body is a region named by the header button, and the rows are the items of a list
And the icon of each source is hidden from the reader
And a pressable source is a button named by its title, its detail is the description of the button, and a plain source reads title and detail as text

### SC-UKV-1555 — the label comes from the kit translator

Given a kit translator that gives «Источники»
When the block is drawn and copied
Then the label of the header reads «Источники»

### SC-UKV-1556 — a section of a composed answer holds a sources block

Given a composed answer `m1` with a section that holds a `sources` block
When the block is drawn and the reader presses a source with an address
Then the section draws the list by the same rules
And the chat emits `sourceOpen` with the message `m1`

### SC-UKV-1557 — several blocks keep their own state and message

Given an answer `m1` with two `sources` blocks and an answer `m2` with one
When the reader expands the first block of `m1` and presses a source in each of the three
Then the second block of `m1` stays collapsed
And the three events name `m1`, `m1` and `m2` with their own addresses

### SC-UKV-1558 — a long title and detail are cut

Given a source with a title and a detail longer than the row, in a block 328 wide
When the block is drawn and opened
Then each text ends with an ellipsis, nothing goes past the block or widens the feed
And the whole texts stay in the markup

Not covered: it cannot be closed by a test with an identifier — the cut comes from the styles, and
the styles of the component do not reach the test environment. Held by the play steps of the showcase
story of the widths.

### SC-UKV-1559 — right to left mirrors the row and the arrow

Given an expanded block under `dir="rtl"`
When it is drawn
Then the icon stands at the right of the text and the arrow of the header at the left

Not covered: it cannot be closed by a test with an identifier — the order comes from the styles.
Held by the play step of the showcase story right to left.

### SC-UKV-1560 — a stream that adds sources keeps the opened list

Given an expanded `sources` block with two sources in the message `m1`
When `messages` is replaced by a copy where that block holds five sources
Then the list stays expanded and the header holds the number 5
And a message with another id starts collapsed

### SC-UKV-1561 — equal sources are not merged

Given a `sources` block with two equal sources
When the block is drawn
Then two rows are drawn and the header holds the number 2

### SC-UKV-1562 — the copy does not depend on the opened list

Given an answer with a `sources` block in a section, and the list collapsed
When the reader copies the answer
Then the copy holds the header line and one line per source
And an opened list gives the same lines
