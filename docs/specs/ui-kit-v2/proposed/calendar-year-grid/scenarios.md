# Scenarios — the year grid and the period month grid

The numbers continue the numbering of the second kit and do not change after the merge. Until a
scenario is covered it carries the mark «Not covered» with the reason.

### SC-UKV-1146 — the year in the month grid header opens the year grid

Given the date panel shows the month grid of 2026
When the person presses the year in its header
Then twelve years 2024 – 2035 are shown three in a row, and the header shows «2024 – 2035»

Not covered: no code yet.

### SC-UKV-1147 — the arrows page the span by twelve years

Given the year grid shows 2024 – 2035
When the person presses the forward arrow
Then the grid shows 2036 – 2047

Not covered: no code yet.

### SC-UKV-1148 — a year outside the bounds is unavailable

Given the field has `min` 2026-01-01
When the year grid shows 2024 – 2035
Then 2024 and 2025 are unavailable, and the back arrow is switched off

Not covered: no code yet.

### SC-UKV-1149 — the chosen year is filled and the current year is outlined

Given the value is in 2027 and today is in 2026
When the year grid opens
Then 2027 carries the chosen mark and 2026 the current mark

Not covered: no code yet.

### SC-UKV-1150 — a picked year opens the month grid of that year

Given the year grid is open
When the person picks 2030
Then the month grid of 2030 is shown

Not covered: no code yet.

### SC-UKV-1151 — the month title of the period panel opens its month grid

Given the period panel shows October and November 2026
When the person presses the title «Октябрь 2026»
Then twelve months of 2026 are shown four in a row, with the year and arrows above

Not covered: no code yet.

### SC-UKV-1152 — the period year grid shows four years in a row

Given the period month grid shows 2026
When the person presses the year in its header
Then twelve years 2024 – 2035 are shown four in a row

Not covered: no code yet.

### SC-UKV-1153 — a picked month returns to its days

Given a month grid is open in the period panel
When the person picks March 2027
Then the panel shows the days of March 2027 as the first of its two months

Not covered: no code yet.

### SC-UKV-1154 — Escape in a grid returns one view back

Given the year grid is open from the month grid
When the person presses Escape
Then the month grid is shown and the panel stays open

Not covered: no code yet.
