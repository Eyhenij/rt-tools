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
Then its title and weekday names are the Russian ones, the weekday names start with a capital
letter, and the week starts on Monday

Covered by the spec of the date logic module.

### SC-UKV-467 — the field shows and reads the date in the order of the interface language

Given the application's locale `ru` and a date field with the value `2026-08-01`
When the field is drawn, and then the person types `15.08.2026`
Then the text reads `01.08.2026`, the empty field hints `дд.мм.гггг` under the Russian labels, and
the typed text becomes the value `2026-08-15`

Covered by the spec of the date text module and the component spec of the field.

### SC-UKV-1146 — the year in the month grid header opens the year grid

Given the date panel shows the month grid of 2026
When the person presses the year in its header
Then twelve years 2024 – 2035 are shown three in a row, and the header shows «2024 – 2035»

Covered by the spec of the date logic module and the component spec of the panel.

### SC-UKV-1147 — the arrows page the span by twelve years

Given the year grid shows 2024 – 2035
When the person presses the forward arrow
Then the grid shows 2036 – 2047

Covered by the spec of the date logic module and the component spec of the panel.

### SC-UKV-1148 — a year outside the bounds is unavailable

Given the field has `min` 2026-01-01
When the year grid shows 2024 – 2035
Then 2024 and 2025 are unavailable, and the back arrow is switched off

Covered by the spec of the date logic module and the component spec of the panel.

### SC-UKV-1149 — the chosen year is filled and the current year is outlined

Given the value is in 2027 and today is in 2026
When the year grid opens
Then 2027 carries the chosen mark and 2026 the current mark

Covered by the component spec of the panel.

### SC-UKV-1150 — a picked year opens the month grid of that year

Given the year grid is open
When the person picks 2030
Then the month grid of 2030 is shown

Covered by the component spec of the panel.

### SC-UKV-1154 — Escape in a grid returns one view back

Given the year grid is open from the month grid
When the person presses Escape
Then the month grid is shown and the panel stays open

Covered by the component specs of the date panel and the period panel.

### SC-UKV-1155 — in the bottom sheet the panel keeps 20px at the sides

Given a narrow screen and a date field
When the panel opens in the bottom sheet
Then the arrows, the days and the footer stand 20px from the sides of the sheet

Покрытие: частичное — the component spec of the panel checks the rule of the sheet in the panel
styles; the distance on the screen is shown by the frame of the story Sheet.

### SC-UKV-1171 — the entry point gives out the panel

Given a consumer that needs a choice of date without a text field
When it imports `RtDatePanelComponent` from the entry point `date-picker`
Then it gets the same panel the field draws

Covered: `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.spec.ts`.

### SC-UKV-1172 — a date panel without the button «Сегодня»

Given a panel of the type `date` with `isTodayButtonShown` set to false
When it is drawn
Then it has no footer, and a click on a day still chooses and closes

Covered: `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.spec.ts`.

### SC-UKV-1173 — days of the neighbouring months fill the weeks

Given a date panel on September 2026 with `min` set to `2026-09-01`
When it is drawn
Then August 31 and October 1 to 4 stand in the grid, pale, and a click on them chooses nothing;
August 31 is crossed out

Covered: `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.spec.ts`.

### SC-UKV-1174 — a day outside the bounds is crossed out

Given a date panel with `min` set to `2026-09-10`
When September is drawn
Then September 9 is crossed out and switched off, and September 10 can be chosen

Covered: `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.spec.ts`.

### SC-UKV-1175 — the time columns carry titles

Given a panel of the type `time`
When it is drawn
Then the title «Часы» stands above the hours and «Минуты» above the minutes

Covered: `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.spec.ts`.

### SC-UKV-1176 — «Сейчас» and «Сбросить» in the popover of a date with time

Given a popover panel of the type `datetime-local`
When «Сейчас» is pressed
Then today and the current time are chosen in the draft and nothing is applied
And when «Сбросить» is pressed, the value becomes empty and the panel closes

Covered: `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.spec.ts`.

### SC-UKV-1177 — the sheet shows the chosen value in the footer

Given a sheet panel of the type `datetime-local` with the value `2026-09-15T09:00`
When it is drawn
Then the footer shows «15.09.2026, 09:00» on the left and has no «Сейчас» and «Сбросить»

Covered: `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.spec.ts`.

### SC-UKV-1178 — «Сейчас» and «Сбросить» in the action colour

Given a popover panel of the type `datetime-local`
When it is drawn
Then «Сейчас» and «Сбросить» are text buttons in the action colour

Covered: `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.spec.ts`.

### SC-UKV-1179 — the switch of the sheet is narrow

Given a sheet panel of the type `datetime-local`
When it is drawn
Then the switch «Дата | Время» is of the middle size, as wide as its segments and in the centre

Покрытие: частичное — the spec checks the size and the absence of the full width; the centre on
the screen is shown by the frame of the story BottomSheetDateTime.

### SC-UKV-1180 — the month arrows have no backing

Given a date panel
When the month is drawn, and then its title opens the choice of month and year
Then the arrows of the month and of the year are drawn without a backing

Covered: `projects/ui-kit-v2/src/lib/components/date-picker/panel/rt-date-panel.component.spec.ts`.

### SC-UKV-1181 — a time cell is a strip of the column

Given a popover panel of the type `datetime-local` with the hour 09 chosen
When it is drawn
Then the chosen hour is a pale strip over the column with a dark semibold number at its left edge,
and a line sets the time columns off from the month

Покрытие: частичное — the spec checks the rules in the panel styles; the look on the screen is
shown by the frames of the stories Popover and BottomSheetTime.

### SC-UKV-1182 — the number of today is in the action colour

Given a date panel whose month holds today
When it is drawn
Then the number of today is in the action colour and semibold, inside its outline

Покрытие: частичное — the spec checks the rules in the calendar styles; the colour on the screen is
shown by the frames of the date stories.
