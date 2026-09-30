# Scenarios — the kit's own panel of the date field

The prefix `SC-UKV` is shared across the domain together with the subdomains. What a scenario is
covered by is said under it.

### SC-UKV-418 — the value keeps the shape of the browser's input

Given a field of each type
When a day, a time or both are chosen in the panel
Then the value is `YYYY-MM-DD`, `HH:mm` or `YYYY-MM-DDTHH:mm`, and a cleared field gives `''`

Covered by the spec of the date logic module and the component spec of the field.

### SC-UKV-419 — typed text becomes the value only when it reads as one

Given a date field with a value and bounds
When the person types a date within the bounds, then text that is no date, then a date past `max`
Then the first becomes the value; after the other two the value stays and the field is invalid

Covered by the spec of the date logic module and the component spec of the field.

### SC-UKV-420 — the panel opens by the button, not by a click into the text

Given a closed date field
When the person clicks into the text, then presses the button at the end of the field
Then the panel stays closed after the first click and opens after the second; Escape closes it

Covered by the component spec of the field.

### SC-UKV-421 — the month pages, and its title opens a choice of month and year

Given an open date panel on a month
When the person pages forward, then presses the title and picks a month of another year
Then the next month is shown, then the choice of months, then the picked month with its days

Covered by the component spec of the panel.

### SC-UKV-422 — today is outlined and the chosen day is filled

Given a month holding today and the chosen day
When it is drawn, paged away and paged back
Then today carries the outline and the chosen day the fill, both again after paging back

Covered by the component spec of the calendar.

### SC-UKV-423 — a day click chooses and closes; «Сегодня» chooses today

Given an open date panel
When the person clicks a day
Then the value becomes that day and the panel closes; «Сегодня» does the same with today and is
switched off when today lies outside the bounds

Covered by the component spec of the panel.

### SC-UKV-424 — the time columns follow the minute step

Given a time field with `minuteStep` 15
When the panel opens and the person picks an hour and a minute, then presses «Готово»
Then the minutes column holds 00, 15, 30 and 45; the value changes only at «Готово», and «Сейчас»
sets the current time rounded down to the step

Covered by the spec of the date logic module and the component spec of the panel.

### SC-UKV-425 — a date with time applies by «Применить», and closing drops the draft

Given a date-with-time field with a value
When the person picks another day and hour and closes the panel, then picks them again and presses
«Применить»
Then the value stays after the closing and becomes the picked moment after «Применить»

Covered by the component spec of the panel.

### SC-UKV-426 — the bounds switch off days and times and stop the paging

Given a field with `min` and `max`
When the month of `min` is shown and the time columns are counted for the day of `max`
Then the days before `min` and the times after `max` are switched off, and paging back from the
month of `min` is switched off

Covered by the spec of the date logic module.

### SC-UKV-427 — the keys move the day like a grid

Given a focused day in the month
When the person presses ArrowRight, ArrowDown, PageDown, Home, End and Enter
Then the focus moves a day, a week, a month, to the start and the end of the week, and Enter
chooses; a switched-off day is skipped

Covered by the spec of the date logic module and the component spec of the calendar.

### SC-UKV-428 — on a narrow screen the panel opens in the bottom sheet

Given a narrow screen and a date-with-time field
When the person opens the panel
Then it opens in the bottom sheet with a switch «Дата | Время», and the switch shows the month or
the columns

Covered by the component spec of the field.

### SC-UKV-429 — month and weekday names follow the locale

Given the application's locale `ru`
When the month is counted
Then its title and weekday names are the Russian ones and the week starts on Monday

Covered by the spec of the date logic module.

### SC-UKV-467 — the field shows and reads the date in the order of the interface language

Given the application's locale `ru` and a date field with the value `2026-08-01`
When the field is drawn, and then the person types `15.08.2026`
Then the text reads `01.08.2026`, the empty field hints `дд.мм.гггг` under the Russian labels, and
the typed text becomes the value `2026-08-15`

Covered by the spec of the date text module and the component spec of the field.
