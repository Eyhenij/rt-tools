# Scenarios — the date range field of the kit

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-468 — the value is a pair of days in order, or null

Given a range field
When the person picks 15 October and then 12 October, then clears the field
Then the value is `{ start: '2026-10-12', end: '2026-10-15' }`, and after the clearing `null`

Covered by the spec of the range logic module and the component spec of the field.

### SC-UKV-469 — the field shows and reads two dates in the order of the language

Given a range field under `ru` with the bounds of the year 2026
When the field holds a range, then the person types `01.08.2026 — 15.08.2026`, then text that is no
range, then a range past `max`
Then the text reads `12.10.2026 — 15.10.2026`, the typed range becomes the value; after the other
two the value stays and the field is invalid

Covered by the spec of the range logic module and the component spec of the field.

### SC-UKV-470 — the panel opens by the button, not by a click into the text

Given a closed range field
When the person clicks into the text, then presses the button at the end of the field
Then the panel stays closed after the first click and opens after the second; Escape closes it

Covered by the component spec of the field.

### SC-UKV-471 — two months side by side page together

Given a range field with the value in October 2026
When the panel opens and the person pages forward
Then October and November are shown first, and November and December after the paging

Covered by the component spec of the panel.

### SC-UKV-472 — the first click is the start, the hover previews, the second click is the end

Given an open panel with nothing picked
When the person clicks 12 October, holds the pointer over 19 October, then clicks 15 October
Then after the first click 12 is the start; under the pointer 13 to 19 are the future range; after
the second click 12 to 15 are the range

Covered by the spec of the range logic module and the component spec of the panel.

### SC-UKV-473 — a preset fills the draft and marks itself chosen

Given an open panel on 30 September 2026 with `min` of 1 September 2026
When the person picks «Последние 7 дней»
Then the draft runs from 24 to 30 September, the preset is chosen, and «Прошлый месяц» is switched
off

Covered by the spec of the range logic module and the component spec of the panel.

### SC-UKV-474 — the footer sums the range, resets and applies

Given an open panel
When the person picks the start, then the end, then presses «Применить»
Then with the start alone the summary asks for the end and «Применить» is off; with both it names
the dates and the days, «Применить» writes the value and closes; «Сбросить» empties the draft

Covered by the spec of the range logic module and the component spec of the panel.

### SC-UKV-475 — days outside the bounds are off, and paging stops at them

Given a panel with `min` and `max` inside one year
When the months of the bounds are shown
Then the days outside are switched off and ignore a click, and the paging button past the bound is
off

Covered by the component spec of the panel.

### SC-UKV-476 — the keys move the day, and Enter picks it

Given an open panel with the focus on a day
When the person presses the right arrow, then Enter twice with a move between
Then the focus moves to the next day, the first Enter picks the start and the second the end

Covered by the component spec of the panel.

### SC-UKV-477 — a narrow screen opens the bottom sheet with one month

Given the narrow sign of the breakpoints service
When the person opens the field
Then the panel stands in the bottom sheet with the preset row on top and one month

Covered by the component spec of the field.

### SC-UKV-478 — the summary follows the locale and its plural rules

Given the range from 12 to 15 October 2026
When the summary is counted under `ru` and under `en`
Then it reads «12–15 октября» with the label for few days under `ru`, and «October 12 – 15» with the
label for other under `en`

Covered by the spec of the range logic module.
