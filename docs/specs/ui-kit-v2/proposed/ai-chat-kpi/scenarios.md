# Scenarios — the KPI block of the assistant chat

The numbers continue the numbering of the kit and do not change after the merge. The scenarios of
the tile edits, SC-UKV-1453 to SC-UKV-1456, merge into the scenarios of the stat tile.

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

### SC-UKV-1439 — the block switches to four columns at 664

Given a block of four cards
When it is drawn 663 wide and then 664 wide
Then at 663 it has two columns and at 664 four

### SC-UKV-1440 — a value is written by its format and the locale

Given the items `number` 1250.5, `percent` 0.78 and `currency` 8400 with `EUR`
When the block is drawn in the `en` locale
Then the values read «1,250.5», «78.0%» and «€8,400»

### SC-UKV-1441 — a million and more is written short

Given `currency` items with `RUB` holding 1240000, -1240000, 999999 and 8400, a `number` item 2500000000 and a `percent` item 12
When the block is drawn in the `ru` locale
Then they read «1,24 млн ₽», «-1,24 млн ₽», «999 999 ₽», «8 400 ₽», «2,5 млрд» and «1 200,0 %»
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

Given a block of six items: a string, an item without a label, an item with the label «» , an item with a `null` value, an item with a `NaN` value, and an item «Выручка» with a value
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

Given items with `delta` 12.5, -4 and 0 and no `growthIsGood`
When the block is drawn in the `ru` locale
Then the deltas read «+12,5 %» in the success colour with an up arrow, «-4 %» in the danger colour with a down arrow, and «0 %» muted with a flat arrow

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
Then the value is 32/32, the delta reads «+12,5 %», the label is the `title` of the delta and is not visible

### SC-UKV-1454 — the compact tile writes its value at 24

Given a tile with the compact value size
When the tile is drawn
Then the value is 24/24 Bold and the delta 14 Bold

### SC-UKV-1455 — the tile writes the delta by the kit locale

Given a tile with a primary delta 12.5 and a delta in points 2.5
When the tile is drawn in the `en` locale and then in the `ru` locale
Then in `en` the deltas read «+12.5%» and «+2.5 pp»
And in `ru` they read «+12,5 %» and «+2,5 п.п.»

### SC-UKV-1456 — a delta written as zero is flat

Given a tile with a primary delta -0.04
When the tile is drawn in the `ru` locale
Then the delta reads «0 %», muted, with a flat arrow

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

### SC-UKV-1461 — no text goes past its card

Given a card at 328 with a label of six words, a base caption «vs the same month last year» and a value «1 240 000 ₽» given as a string
When the block is drawn
Then the label and the base caption wrap between words, and no text of the card goes past its frame

### SC-UKV-1462 — the block is a list for a screen reader

Given a block of four cards
When it is read by a screen reader
Then it is a list of four items, and the delta arrows are hidden from it

### SC-UKV-1463 — a new block input redraws the cards

Given a drawn block of two cards
When the same block instance gets a block of three cards
Then three cards are drawn

### SC-UKV-1464 — the cards of a row share a top

Given a row of two cards at 328, one with a delta and a period, one with neither
When the block is drawn
Then both cards start on the same top

### SC-UKV-1465 — the showcase holds both widths and both themes

Given the stories of the KPI block
When the showcase snapshots are taken
Then the block of four cards with a positive, a negative and a zero delta is shot at 328 and at 728, in the light and the dark theme
