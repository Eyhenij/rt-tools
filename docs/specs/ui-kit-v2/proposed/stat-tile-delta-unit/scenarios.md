# Scenarios — delta unit and «growth is worse» on the stat tile

The numbers continue the numbering of the second kit and do not change after the merge. Until a
scenario is covered, it carries the mark «Not covered» with a reason.

### SC-UKV-1125 — a row without a unit is written in percent

Given a delta row with the value 12 and no unit
When the tile draws the row
Then the row reads «+12 %»

Not covered: no code yet.

### SC-UKV-1126 — a row in points is written by the kit label

Given a delta row with the value 10 in points
When the tile draws the row in Russian
Then the row reads «+10 п.п.»

Not covered: no code yet.

### SC-UKV-1127 — the two rows of a tile are written each in its own unit

Given the primary row in points and the year row in percent
When the tile draws both rows
Then the primary row is written in points and the year row in percent

Not covered: no code yet.

### SC-UKV-1128 — an empty base is drawn as a dash in any unit

Given a delta row in points without a value
When the tile draws the row
Then a dash without colour and without a unit stands in place of the delta

Not covered: no code yet.

### SC-UKV-1129 — «growth is worse» paints growth red and keeps the up arrow

Given a tile with the «growth is worse» sign and a delta row with the value 40
When the tile draws the row
Then the row is red and the arrow points up

Not covered: no code yet.

### SC-UKV-1130 — «growth is worse» paints a fall green and keeps the down arrow

Given a tile with the «growth is worse» sign and a delta row with the value −35
When the tile draws the row
Then the row is green and the arrow points down

Not covered: no code yet.

### SC-UKV-1131 — «growth is worse» paints both rows of the tile

Given a tile with the «growth is worse» sign, a primary row and a year row both growing
When the tile draws both rows
Then both rows are red

Not covered: no code yet.

### SC-UKV-1132 — a tile without the sign paints its rows as before

Given a tile without the «growth is worse» sign and a growing delta row
When the tile draws the row
Then the row is green and the arrow points up

Not covered: no code yet.
