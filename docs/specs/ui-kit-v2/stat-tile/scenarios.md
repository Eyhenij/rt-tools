# Scenarios — delta unit and «growth is worse» on the stat tile

The numbers continue the numbering of the second kit and do not change after the merge.

### SC-UKV-1125 — a row without a unit is written in percent

Given a delta row with the value 12 and no unit
When the tile draws the row
Then the row reads «+12 %»

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
