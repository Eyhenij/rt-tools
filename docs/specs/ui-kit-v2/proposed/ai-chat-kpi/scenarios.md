# Scenarios — the KPI block of the assistant chat

The numbers continue the numbering of the kit and do not change after the merge. The scenarios of
the tile edits, SC-UKV-1453 to SC-UKV-1456 and SC-UKV-1466 to SC-UKV-1471, merge into the
scenarios of the stat tile. In `ru` the space between a number and its percent sign is U+00A0, the
no-break space `Intl.NumberFormat` writes; a scenario names it where the text is compared.

### SC-UKV-1436 — the kit draws a KPI block without a registration

Given an answer with a `kpi` block and an application that registered a renderer for `kpi`
When the answer is drawn
Then the block is drawn by the kit as a grid of cards, and the registered renderer is not used

### SC-UKV-1437 — four cards stand in two columns in the narrow panel

Given a `kpi` block of four cards with a positive, a negative and a zero delta, in a block 328 wide
When the block is drawn
Then the cards stand in two rows of two, each card 160 wide, with a gap of 8
And the same block 386 wide stands in two rows of two

### SC-UKV-1438 — four cards stand in one row in the full-screen mode

Given the same block of four cards in a block 728 wide
When the block is drawn
Then the four cards stand in one row, each 176 wide, on one top

Not covered: it cannot be closed by a test with an identifier — the width of a card comes from a
container query, and the styles of the component do not reach the test environment. Held by the
play steps of the showcase stories `Widths` (728: four columns of 176, one top) and `FullScreen`.

### SC-UKV-1439 — the block switches to four columns at 664

Given a block of four cards
When it is drawn 663 wide and then 664 wide
Then at 663 it has two columns and at 664 four

### SC-UKV-1440 — a value is written by its format and the locale

Given the items `number` 1250.5, `percent` 0.78 and `currency` 8400 with `EUR`
When the block is drawn in the `en` locale
Then the values read «1,250.5», «78.0%» and «€8,400»

### SC-UKV-1441 — a million and more is written short

Given `currency` items with `RUB` holding 1000000, 1240000, 2500000, -1240000, 999999.999, 999999 and 8400, a `number` item 2500000000 and a `percent` item 12
When the block is drawn in the `ru` locale
Then they read «1 млн ₽», «1,24 млн ₽», «2,5 млн ₽», «-1,24 млн ₽», «1 млн ₽», «999 999 ₽», «8 400 ₽», «2,5 млрд» and «1 200,0 %»
And no short value carries a trailing zero, such as «1,00 млн ₽»
And no value is coloured

### SC-UKV-1442 — a currency item without a valid code writes a number

Given a `currency` item without a code and one with the code `rub`, both holding 1200.5
When the block is drawn in the `en` locale
Then both values read «1,200.5», with no currency sign

### SC-UKV-1443 — a string value stands as given

Given an item of the format `number` whose value is «n/a»
When the block is drawn
Then the card value reads «n/a»

### SC-UKV-1444 — malformed items are dropped

Given a block whose items are: a string, an item without a label, an item with the label «», an item with the label « », and items with the value `null`, `NaN`, `Infinity`, `true`, `{}`, `[]` and `""`
And an item «Выручка» with the value 1200
When the block is drawn
Then one card «Выручка» is drawn

### SC-UKV-1445 — malformed optional parts are absent

Given an item with `delta` «12», `base` «vs LY», `period` 5 and `growthIsGood` «no»
When the block is drawn
Then the card has no delta line, no base caption and no period
And an item with `delta` 12 and `growthIsGood` «no» is coloured as growth that is good

### SC-UKV-1446 — an unknown format writes a number

Given an item of the format `date` and an item with no format, both holding 1250.5
When the block is drawn in the `en` locale
Then both values read «1,250.5»

### SC-UKV-1447 — a broken KPI block is the plate

Given a `kpi` block whose `items` is not a list, and one whose every item is dropped
When the answer is drawn
Then each is the plate with the type name «kpi», and the blocks around them stay in place

### SC-UKV-1448 — growth of a figure whose growth is bad is in the danger colour

Given an item with `delta` 8 and `growthIsGood` false, and an item with `delta` -8 and `growthIsGood` false
When the block is drawn
Then the first delta has the danger colour and an up arrow
And the second has the success colour and a down arrow

### SC-UKV-1449 — a delta carries its sign and its colour

Given items with `delta` 12.5, -4, 0, 0.04 and -0.04 and no `growthIsGood`
When the block is drawn in the `ru` locale
Then the first reads «+12,5 %» in the success colour with an up arrow, and the second «-4 %» in the danger colour with a down arrow
And the last three read «0 %» with no sign, muted, with a flat arrow
And each text has U+00A0 before the percent sign

### SC-UKV-1450 — a card without a delta keeps its other lines

Given an item with a label, a value, `base` «vs LY» and `period` «ноябрь 2026», and no `delta`
When the block is drawn
Then the card shows the label, the value and the period, and no delta line and no base caption

### SC-UKV-1451 — the base caption is visible after the delta

Given an item with `delta` 12.5 and `base` «vs LY»
When the block is drawn
Then the delta line reads «+12,5 % vs LY», the base caption in 12 Regular muted text
And the delta carries no `title`

### SC-UKV-1452 — a drawn block follows the kit locale

Given a drawn block with a `currency` item 1240000 with `RUB` and a `delta` 12.5, in the `ru` locale
When the kit locale changes to `en`
Then the value reads «RUB 1.24M» and the delta «+12.5%»

### SC-UKV-1453 — a tile without the new options keeps its look

Given a tile with a value, a primary delta 12.5 with the label «к прошлой неделе», and no option set
When the tile is drawn in the `ru` locale
Then the value is 32/32, the delta reads «+12,5 %» with U+00A0 before the sign, the label is the `title` of the delta and is not visible

### SC-UKV-1454 — the compact tile writes its value at 24

Given a tile with the compact value size
When the tile is drawn
Then the value is 24/24 Bold and the delta 14 Bold

### SC-UKV-1455 — the tile writes the delta by the kit locale

Given a tile with a primary delta 12.5 and a delta in points 2.5
When the tile is drawn in the `en` locale and then in the `ru` locale
Then in `en` the deltas read «+12.5%» and «+2.5 pp»
And in `ru` they read «+12,5 %», with U+00A0 before the sign, and «+2,5 п.п.»

### SC-UKV-1456 — a delta written as zero is flat

Given a tile with a primary delta -0.04, and one with 0.04
When the tiles are drawn in the `ru` locale
Then each delta reads «0 %» with no sign, muted, with a flat arrow

### SC-UKV-1457 — the answer copy writes a card per line

Given an answer with a markdown block and a `kpi` block of two cards, the first with a delta, a base and a period, the second with a label and a value only
When the answer is copied in the `ru` locale
Then the block gives two lines joined by LF: «Выручка», «1,24 млн ₽», «+12,5 % vs LY», «ноябрь 2026» separated by tabs, and «Гости», «312» with two empty fields after them

### SC-UKV-1458 — the copy drops what the card drops

Given a `kpi` block with an item without a label and an item whose label holds a tab
When the answer is copied
Then the first gives no line, and the tab in the second label is a space

### SC-UKV-1459 — a block the schema accepts is drawn whole

Given the exported KPI schema and a block of four items with every optional field that the schema accepts
When the block data is read
Then no item and no field is dropped or emptied
And a block with an item that is a string is refused by the schema and still drawn without that item

### SC-UKV-1460 — every card is drawn, and a short last row keeps the column width

Given a block of nine cards in a block 728 wide, and a block of three cards in a block 328 wide
When both are drawn
Then the first has nine cards in three rows, the last row holding one card at the column width
And in the second the third card stands alone in its row, 160 wide

Not covered: it cannot be closed by a test with an identifier — the rows and the column width are
computed by the browser. Held by the play step of the showcase story `Odd`: three cards at 328 in
columns of 160, nine at 728 in columns of 176, every card of a row on one top.

### SC-UKV-1461 — no text goes past its card

Given a block 328 wide with a card whose label is six words, base caption «vs the same month last year» and period «за период с 1 по 30 ноября 2026»
And a card whose label is one word of 30 letters and whose value is the string «1 240 000 000 ₽» with U+00A0 between the groups
When the block is drawn
Then the label, the base caption and the period of the first card wrap between words
And the label and the value of the second card break inside the word
And no text of either card goes past its frame

Not covered: it cannot be closed by a test with an identifier — wrapping is a computed value. Held
by the play step of the showcase story `Long`, which measures the line boxes of every text node of
every card against the card's frame and the block's width against its scroll width.

### SC-UKV-1462 — the block is a list for a screen reader

Given a block of four cards
When it is read by a screen reader
Then it is a list of four items, and the delta arrows are hidden from it

### SC-UKV-1463 — a new block input redraws the cards

Given a drawn block of two cards
When the same block instance gets a block of three cards
Then three cards are drawn

### SC-UKV-1464 — the cards of a row share a top and a height

Given a row of two cards at 328, one with a delta, a base caption and a period, one with a label, a value and a period only
When the block is drawn in the light and then in the dark theme
Then both frames start on the same top and are as high as the taller one
And the period of each card stands at the bottom of its frame
And in the dark theme the frames take `--rt-color-border-default` and `--rt-color-bg-surface` of the dark set

Not covered: it cannot be closed by a test with an identifier — the height of a row is computed by
the browser. Held by the play steps of the showcase stories `Widths`, `Panel`, `FullScreen` and
`ReadingColumn` (one top and one height per row) and by the snapshot of the story `Themes`.

### SC-UKV-1465 — the showcase holds both widths and both themes

Given the stories of the KPI block
When the showcase snapshots are taken
Then the block of four cards with a positive, a negative and a zero delta is shot at 328 and at 728, in the light and the dark theme

Not covered: it is a statement about the showcase references, not about code. Held by the snapshot
gate: the references `organisms-chat-aichatkpi--themes` and `--widths` are matched on every push.

### SC-UKV-1466 — a tile without a set kit locale writes the delta as `en`

Given an application that sets no kit locale and a tile with a primary delta 12.5
When the tile is drawn
Then the delta reads «+12.5%»

### SC-UKV-1467 — the compact tile wraps its lower lines, the default one cuts them

Given a tile 136 wide with a primary delta, a visible base caption «vs the same month last year» and the secondary line «за период с 1 по 30 ноября 2026»
When it is drawn in the compact size and then in the default size
Then in the compact size the base caption and the secondary line wrap between words
And in the default size the secondary line stays on one line ending with an ellipsis

### SC-UKV-1468 — the compact tile puts the delta line under the value

Given a tile 300 wide in the compact size, with the value «8 400 ₽» and a primary delta 12.5
When the tile is drawn
Then the delta line stands on its own line under the value although it fits beside it
And the gap between the lines of the tile and between the value and the delta line is 6

### SC-UKV-1469 — a tile delta keeps one fraction digit

Given a tile with a primary delta 3.75, and one with -4
When the tiles are drawn in the `ru` locale
Then the first delta reads «+3,8 %» and the second «-4 %», with U+00A0 before the sign

### SC-UKV-1470 — the year chip is written by the same rule

Given a tile with a year delta 3.75, and one with a year delta -0.04
When the tiles are drawn in the `en` locale
Then the first chip reads «YoY +3.8%» in the success colour, and the second «YoY 0%», flat and muted

### SC-UKV-1471 — a refused locale writes the tile delta as `en`

Given a kit locale `Intl.NumberFormat` refuses and a tile with a primary delta 12.5
When the tile is drawn
Then the delta reads «+12.5%»

### SC-UKV-1472 — the full-screen mode narrower than 664 keeps two columns

Given the chat in the full-screen mode on a screen whose answer block is 600 wide, with a block of four cards
When the block is drawn
Then the cards stand in two rows of two

Not covered: it cannot be closed by a test with an identifier — the width of the answer comes from
the chat's reading column. Held by the play step of the showcase story `ReadingColumn`: the block is
narrower than 664 and has two columns.

### SC-UKV-1473 — a block narrower than 328 has one column

Given a block of four cards 300 wide
When the block is drawn
Then the four cards stand one under another, each as wide as the block

### SC-UKV-1474 — the block mirrors under right to left, the numbers keep their order

Given a block of two cards, the first with the value -1240000 in `RUB` and the delta -4.2, in the `ru` locale
When the block is drawn under `dir="ltr"` and then under `dir="rtl"`
Then under `rtl` the first card stands on the right and the arrow of its delta line on the right of the number
And the value reads «-1,24 млн ₽» and the delta «-4,2 %» in their own order under both directions

### SC-UKV-1475 — the card frame takes kit tokens

Given a block of four cards at 328
When the block is drawn
Then each frame has a 1 px border of `--rt-color-border-default`, the background `--rt-color-bg-surface`, padding 12 and radius 12
And the grid gap is 8

### SC-UKV-1476 — a delta in points, and an unknown unit counts as percent

Given an item with `delta` 10 and `deltaUnit` «points», and an item with `delta` 10 and `deltaUnit` «pct»
When the block is drawn in the `ru` locale
Then the first delta reads «+10 п.п.» and the second «+10 %»

### SC-UKV-1477 — a refused locale writes the block as `en`

Given a kit locale `Intl.NumberFormat` refuses and an item `currency` 8400 with `EUR` and `delta` 12.5
When the block is drawn
Then the value reads «€8,400» and the delta «+12.5%»

### SC-UKV-1478 — a KPI card has no year chip and no «was» line

Given an item with a delta, a base and a period
When the block is drawn
Then the card has one delta line, no «YoY» chip and no «was …» line

### SC-UKV-1479 — the block never widens the feed

Given a feed 328 wide with a block of four cards whose values are long strings without spaces
When the answer is drawn
Then the feed stays 328 wide and has no sideways scroll

### SC-UKV-1480 — a line break inside a text becomes a space in the copy

Given a `kpi` block with an item whose period holds a line break: «ноябрь↵2026»
When the answer is copied
Then the card line reads «ноябрь 2026» in its period field, and the block gives one line

### SC-UKV-1481 — several KPI blocks stand apart in one feed

Given two answers in one feed, the first with two `kpi` blocks of two and four cards, the second with one of three cards
When the feed is drawn and the first answer is copied
Then each block draws its own cards in its own grid
And the copy of the first answer holds two lines and then four, a block after a block

### SC-UKV-1482 — an empty list of items is the plate

Given a `kpi` block with `items: []`
When the answer is drawn
Then it is the plate with the type name «kpi»

### SC-UKV-1483 — the schema requires the label and the value only

Given the exported KPI schema
When it validates a block whose item has a `label` and a `value` and no `format`, and a block whose item has no `value`
Then the first is accepted and the second refused
And the schema names `deltaUnit` as `percent` or `points`, and its descriptions call a `percent` value a fraction and `delta` a change in percent

### SC-UKV-1484 — a value fits the card: whole from 100 000, three digits in the short form

Given `currency` items with `RUB` holding 99999.99, 999999.4, -999999.4, 999999.99, 12345678 and -123450000000, in the `ru` locale
When the block is drawn
Then they read «99 999,99 ₽», «999 999 ₽», «-999 999 ₽», «1 млн ₽», «12,3 млн ₽» and «-123 млрд ₽»
And the only ordinary space of a value stands between the number and its unit, so a value wider than a card 160 wide wraps there and never inside the number
