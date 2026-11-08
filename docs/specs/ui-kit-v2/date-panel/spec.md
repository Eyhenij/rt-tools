# The kit's own panel of the date field

**Status:** in force · **Revision:** 2026-11-07 · **Scenario prefix:** `SC-UKV`
**Depends on:** the popover directive, the bottom sheet, the calendar and the breakpoints service of
the kit
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit about the panel `rt-date-picker` opens for a date, a time and a date
with time: what it draws, what a click and a key do, how the bounds and the minute step work, and
how it opens on a narrow screen.

## Why

The date field wrapped the browser's own input, and the browser drew the calendar and the time
choice. So the field looked different in every browser and unlike the other fields and lists of the
kit. The mockup draws a panel of its own for all three types, the same in every browser.

## Terminology

- **The panel** — what the field opens: a month, time columns, or both, with a footer.
- **The draft** — a time or a date with time chosen in the panel and not yet applied.
- **The bounds** — the field's `min` and `max`, in the same shape as the value.

### What it is called in the interface

| In the domain | On the screen                                                 |
| ------------- | ------------------------------------------------------------- |
| The panel     | the calendar or the clock that opens under the field          |
| The draft     | the time picked in the columns before «Готово» or «Применить» |
| The bounds    | days and times shown pale that cannot be picked               |

## Rules

- **The value keeps its shape: `YYYY-MM-DD`, `HH:mm` or `YYYY-MM-DDTHH:mm`, and `''` when empty.**
  It is the string the browser's input gave, so no consumer moves.

- **The field shows the date in the order of the interface language.** Under `ru` the text is
  `01.08.2026`, under `en-US` it is «08/01/2026»; the time is `HH:mm` in every language. The hint in
  the empty field is the same shape in the kit's letters, `дд.мм.гггг` under the Russian labels.
  Only the text in the field changes: the value of the form stays the ISO string.

- **Typed text becomes the value only when it reads as one within the bounds.** The text is read in
  the order of the interface language, and the value shape is read too, so a pasted `2026-08-01`
  works. Any other text leaves the value as it was and marks the field invalid; nothing is
  corrected silently.

- **The panel opens by the button at the end of the field and closes by Escape or a click outside.**
  A click into the text does not open it: the person may be typing.

- **The date panel shows a month with paging, and its title opens a choice of month and year.** A
  month picked in that choice returns to its days.

- **In the date panel the year in the header of the month grid is a button that opens the year
  grid.** The arrows next to it still page the year one by one.

- **The year grid shows twelve years: three in a row in the date panel, four in a row in the period
  panel.**

- **The span is a block of twelve that holds the shown year.** The spans are laid every twelve years
  from 2024: the year 2026 opens 2024 – 2035, the year 2040 opens 2036 – 2047. The header shows the
  span as «first – last».

- **The arrows of the year grid page the span by twelve years and stop at the bounds.** An arrow is
  switched off when the whole next span lies outside `min` and `max`.

- **A year outside `min` and `max` is unavailable, the chosen year is filled, the current year is
  outlined.** The chosen year is the year of the value; the current year is the year of today.

- **A year picked in the year grid opens the month grid of that year.**

- **A month outside the bounds is unavailable in both panels.**

- **Escape in a month or a year grid returns one view back instead of closing the panel.**

- **Today is outlined and the chosen day is filled.** Both marks stay when the month is paged back to
  them.

- **For a date a click on a day chooses it and closes the panel; «Сегодня» chooses today.** «Сегодня»
  is switched off when today lies outside the bounds.

- **For a time the panel shows an hours column and a minutes column with the minute step.** The step
  is the field's `minuteStep`, 5 by default. A click sets the draft; «Сейчас» sets the current time
  rounded down to the step; «Готово» applies the draft and closes.

- **For a date with time the month and the columns stand side by side, and «Применить» applies.**
  Until then the value stays as it was, and closing the panel drops the draft.

- **Days and times outside the bounds are switched off, and paging stops at the months of the
  bounds.** A switched-off day or time cannot be chosen by a click or a key.

- **The keys in the month move the day like a grid.** The arrows move by a day and a week, PageUp and
  PageDown by a month, Home and End to the edges of the week, Enter chooses, Escape closes.

- **On a narrow screen the panel opens in the kit's bottom sheet, with days of 44px under a finger.**
  For a date with time a switch «Дата | Время» shows the month or the columns. The narrow sign is
  the breakpoints service's, as elsewhere in the kit.

- **In the bottom sheet the panel keeps the 20px side padding of the sheet header and footer.** The
  body of the sheet has no side padding of its own, and without it the days and the arrows touch
  the edge of the screen.

- **The names of months and weekdays follow the locale of the application.** The buttons of the
  panel carry the kit's labels.

- **The entry point `date-picker` gives out the panel for a choice without a text field.** The
  selector, the inputs and the outputs stay the same: `type`, `value`, `min`, `max`, `minuteStep`,
  `sheet`, `picked` and `closed`. The consumer holds the popover or the bottom sheet, creates the
  panel anew on every opening, closes it on `closed` and gives the popover its surface.

- **The input `isTodayButtonShown` hides «Сегодня» of a date panel.** It is shown by default. Without
  the button a date panel has no footer, and the footers of the other types stay.

- **The month of the panel is filled to whole weeks by days of the neighbouring months.** Such a day
  is pale and cannot be pressed. A neighbouring day outside the bounds is also crossed out.

- **A day of the month outside the bounds is crossed out and switched off.** The weekday names start
  with a capital letter, in this panel and in the period panel.

- **Each time column carries its title above it: «Часы» and «Минуты».**

- **The popover of a date with time has «Сейчас» on the left of the footer and «Сбросить» next to
  «Применить».** «Сейчас» sets today and the current time into the draft. «Сбросить» makes the value
  empty and closes the panel.

- **The bottom sheet of a date with time shows the chosen value on the left of the footer.** It
  shows it instead of «Сейчас» and «Сбросить». The value is written in the order of the interface
  language.

- **«Сейчас» and «Сбросить» are text buttons in the action colour.**

- **The switch «Дата | Время» of the bottom sheet is of the middle size and stands in the centre.**
  Its width follows its segments.

- **The month arrows have no backing.** This holds for every calendar of the kit.

- **The number of today is in the action colour and semibold until the day is chosen.** This holds
  for every calendar of the kit; the outline of today stays.

- **A time cell is a strip of the column with the number at its left edge.** The chosen cell is
  filled with the pale action colour, and its number is dark and semibold. Next to the month the
  time columns are set off by a line over the whole height of the body.

## What is out of scope

- The date range field — the subdomain `date-range` next to this one.
- Seconds: the mockup has none.

## Contract

None: the field is a layout component and serves no procedure.

### Refusal codes

Not applicable: an unreadable text marks the field invalid; nothing is refused.

## Data

None of its own. The draft lives while the panel is open and is dropped when it closes unapplied.

## Screens and states

| state                            | what is drawn                                               |
| -------------------------------- | ----------------------------------------------------------- |
| a date, the panel open           | the month of the value or of today, «Сегодня» below         |
| a date without the button        | the month alone, no footer                                  |
| the choice of month and year     | twelve months and the year with paging                      |
| the year grid                    | twelve years three in a row, the span and arrows above      |
| a cell of the grids              | default, hover, chosen, current, unavailable                |
| a time, the panel open           | the hours and minutes columns, «Сейчас» and «Готово»        |
| a date with time, the panel open | the month and the columns side by side, «Применить»         |
| a narrow screen                  | the same inside the bottom sheet; a date with time switches |
| text that is not a value         | the field marked invalid, the value unchanged               |

## Cross-cutting requirements

### Locales

The names of months and weekdays come from the application's locale by the browser's date
formatting. The order of day, month and year in the text of the field comes from the same
locale; the letters of the hint are the kit's labels. The buttons carry the kit's labels, English
in the package and translated by the consumer's translator.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

On a narrow screen the panel opens in the bottom sheet; days are 44px, and a date with time switches
between the month and the columns. The panel keeps 20px at the sides, and the grids take the rest of
the width.

### Several objects

Not applicable: the field belongs to no owning entity.

## Decisions

- **The month grid is the kit's calendar, extended by a chosen day, the today mark and the keys.** A
  second calendar next to it is what the rule of uniformity forbids.
- **The date logic lives in pure functions.** The month, the bounds, the time columns and the reading
  of text are counted without a component and checked by a call.

## Open questions

None.

## History of changes

- 2026-09-29 — written by the task RT-2372 of the epic RT-2370, which gives the field a panel of its
  own.
- 2026-09-30 — the field shows and reads the date in the order of the interface language, as the
  mockup of the range field shows it.
- 2026-11-04 — the task RT-2895 adds the year grid and the 20px side padding in the bottom sheet.
- 2026-11-07 — the task RT-3159 gives the panel out of the entry point and adds the input
  `isTodayButtonShown`.
- 2026-11-08 — the task RT-3159 adds the days of the neighbouring months, the crossed-out days
  outside the bounds, the titles of the time columns and the footers «Сейчас», «Сбросить» and the
  value in the sheet. The same day it brings the look of the approved frames: «Сейчас» and
  «Сбросить» in the action colour, time cells as strips with a line before them, the narrow switch
  of the sheet, the arrows without a backing and today in the action colour in every calendar.
