# Scenarios — delta unit and «growth is worse» on the stat tile

The numbers continue the numbering of the second kit and do not change after the merge.

### SC-UKV-1125 — a row without a unit is written in percent of the kit locale

Given a delta row with the value 12 and no unit
When the tile draws the row in the `ru` locale
Then the row reads «+12 %», with U+00A0 before the percent sign

### SC-UKV-1126 — a row in points is written by the kit label

Given a delta row with the value 10 in points
When the tile draws the row in Russian
Then the row reads «+10 п.п.»

### SC-UKV-1127 — the two rows of a tile are written each in its own unit

Given the primary row in points and the year row in percent
When the tile draws both rows
Then the primary row is written in points and the year row in percent

### SC-UKV-1128 — a row with an unknown base is not drawn in any unit

Given a delta row in points without a value
When the tile draws the row
Then neither the delta next to the value nor the year chip is drawn

### SC-UKV-1129 — «growth is worse» paints growth red and keeps the up arrow

Given a tile with the «growth is worse» sign and a delta row with the value 40
When the tile draws the row
Then the row is red and the arrow points up

Coverage: partial — the spec checks the tile modifier, the direction and the arrow; the colour is held
by the styles and is seen on the showcase frame.

### SC-UKV-1130 — «growth is worse» paints a fall green and keeps the down arrow

Given a tile with the «growth is worse» sign and a delta row with the value −35
When the tile draws the row
Then the row is green and the arrow points down

Coverage: partial — the spec checks the tile modifier, the direction and the arrow; the colour is held
by the styles and is seen on the showcase frame.

### SC-UKV-1131 — «growth is worse» paints both rows of the tile

Given a tile with the «growth is worse» sign, a primary row and a year row both growing
When the tile draws both rows
Then both rows are red

Coverage: partial — the spec checks that the modifier stands on the whole tile over both rows; the
colour is seen on the showcase frame.

### SC-UKV-1132 — a tile without the sign paints its rows as before

Given a tile without the «growth is worse» sign and a growing delta row
When the tile draws the row
Then the row is green and the arrow points up

Coverage: partial — the spec checks the absent modifier and the up direction; the colour is seen on
the showcase frame.

### SC-UKV-1453 — a tile without the new options keeps its look

Given a tile with a value, a primary delta 12.5 with the label «к прошлой неделе», and no option set
When the tile is drawn in the `ru` locale
Then the value is 32/32, the delta reads «+12,5 %» with U+00A0 before the sign, the label is the `title` of the delta and is not visible

### SC-UKV-1454 — the compact tile writes its value at 24

Given a tile with the compact value size
When the tile is drawn
Then the value is 24/24 Bold and the delta 14 Bold on a line 16 high

### SC-UKV-1455 — the tile writes the delta by the kit locale

Given a tile with a primary delta 12.5 and a delta in points 2.5
When the tile is drawn in the `en` locale and then in the `ru` locale
Then in `en` the deltas read «+12.5%» and «+2.5 pp»
And in `ru` they read «+12,5 %», with U+00A0 before the sign, and «+2,5 п.п.»

### SC-UKV-1456 — a delta written as zero is flat

Given a tile with a primary delta -0.04, and one with 0.04
When the tiles are drawn in the `ru` locale
Then each delta reads «0 %» with no sign, muted, with a flat arrow

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
