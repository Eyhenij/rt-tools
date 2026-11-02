# Scenarios — a pinned column of the second kit's table

The numbers continue the numbering of the second kit. Until a scenario is covered it carries a
`Not covered:` mark with the reason.

### SC-UKV-1114 — a pinned body cell hides the column scrolled under it

Given a table of nine columns in a container narrower than the table, the first column pinned left
When the container is scrolled sideways by 200 pixels
Then the computed background of every pinned body cell is not transparent
Not covered: the code is not written yet.

### SC-UKV-1115 — a pinned cell takes the background of a hovered row

Given the same table
When the pointer is over the second body row
Then the pinned cell of that row has the hover colour of the row
Not covered: the code is not written yet.

### SC-UKV-1116 — a pinned cell keeps the colour of a problem row and of the total row

Given the same table with the third row marked as a problem and a total row
When it is drawn
Then the pinned cell of the third row has the problem colour, and the pinned cell of the total row
has the colour of the total row
Not covered: the code is not written yet.

### SC-UKV-1117 — the left pin carries a shadow only while content is hidden behind it

Given the same table scrolled to the start
When it is drawn, and then scrolled sideways by 200 pixels
Then at the start the pinned edge has no shadow, and after the scroll it has one
Covered: `projects/ui-kit-v2/src/lib/components/table/rt-table-pinned-edges.spec.ts`.
Покрытие: частичное — the spec checks which edge is hidden; the shadow on screen is checked by the story snapshot.

### SC-UKV-1118 — the right pin carries a shadow until the scroll reaches the end

Given a table of nine columns, the last column pinned right, scrolled to the start
When it is drawn, and then scrolled to the end
Then at the start the pinned edge has a shadow, and at the end it has none
Covered: `projects/ui-kit-v2/src/lib/components/table/rt-table-pinned-edges.spec.ts`.
Покрытие: частичное — the spec checks which edge is hidden; the shadow on screen is checked by the story snapshot.

### SC-UKV-1119 — a table that fits shows no shadow

Given a table whose columns fit in the container, one column pinned left
When it is drawn
Then the pinned edge has no shadow
Covered: `projects/ui-kit-v2/src/lib/components/table/rt-table-pinned-edges.spec.ts`.
Покрытие: частичное — the spec checks which edge is hidden; the shadow on screen is checked by the story snapshot.

### SC-UKV-1120 — the application changes the background and the shadow by tokens

Given the same table, and the application sets new values of the pinned cell tokens
When it is drawn and scrolled
Then the pinned cell and its shadow take the new values
Not covered: the code is not written yet.

### SC-UKV-1121 — the dark theme gives a solid background and a visible shadow

Given the same table in the dark theme, scrolled sideways
When it is drawn
Then the pinned cell is not transparent, and the shadow differs from the surface colour
Not covered: the code is not written yet.
