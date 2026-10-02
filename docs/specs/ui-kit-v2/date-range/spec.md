# The date range field of the kit

**Status:** in force · **Revision:** 2026-09-30 · **Scenario prefix:** `SC-UKV`
**Depends on:** the calendar, the popover directive, the bottom sheet, the breakpoints service and
the text of the date field of the kit
**Laws:** `frontend-application`, `reuse-first`, `verifiability`
**Procedures:** none

A subdomain of the second kit about `rt-date-range`: a form field that holds a period from one day
to another, what its panel draws, what a click, a hover and a key do, how the presets and the bounds
work, and how it opens on a narrow screen.

## Why

A period was chosen with two separate date fields. The person saw two calendars, one after the
other, and nothing kept the end after the start. The mockup draws one field with a panel of two
months, presets and a summary of the chosen days.

## Terminology

- **The range** — the value: the first and the last day of the period, both included.
- **The draft** — the range picked in the panel and not yet applied.
- **A preset** — a ready range the panel offers by name: today, yesterday, the last 7 and 30 days,
  this and last month.
- **The bounds** — the field's `min` and `max`, days `YYYY-MM-DD`.

### What it is called in the interface

| In the domain | On the screen                                                |
| ------------- | ------------------------------------------------------------ |
| The range     | the period in the field, «12.10.2026 — 15.10.2026»           |
| The draft     | the days marked in the panel before «Применить»              |
| A preset      | the list on the left of the panel, the row on top on a phone |
| The bounds    | days and presets shown pale that cannot be picked            |

## Rules

- **The value is a pair of days `{ start, end }`, or `null` when empty.** Both are `YYYY-MM-DD`
  strings and `start` is never after `end`. A half-picked range never reaches the form.

- **The field shows the range as two dates in the order of the interface language.** Under `ru` it
  reads `12.10.2026 — 15.10.2026`; the hint in the empty field is the same shape in the kit's
  letters. Typed text of two dates becomes the value when both read and lie within the bounds; any
  other text leaves the value and marks the field invalid.

- **The panel opens by the button at the end of the field and closes by Escape or a click outside.**
  A click into the text does not open it: the person may be typing.

- **The panel shows two months side by side, and paging moves both by a month.** The first month is
  the month of the start, or of today when the field is empty.

- **The first click picks the start, and the second picks the end.** Until the second click the days
  between the start and the day under the pointer are marked as the future range. A second click on
  a day before the start puts the two in order; a click on the start itself gives a range of one
  day. A click after a finished range starts a new one.

- **A preset fills the draft with its range and marks itself chosen.** «Этот месяц» runs from the
  first day of the month to today, «Прошлый месяц» is the whole previous month, and the last 7 and
  30 days end today. A preset that does not fit the bounds whole is switched off.

- **The footer shows the summary, «Сбросить» and «Применить».** The summary names the dates and the
  number of days, or asks for the end while only the start is picked. «Сбросить» empties the draft;
  «Применить» is off until the end is picked, and it writes the value and closes the panel. Closing
  the panel otherwise drops the draft.

- **Days outside the bounds are switched off, and paging stops at the months of the bounds.** A
  switched-off day cannot be picked by a click or a key.

- **The keys in the months move the day like a grid, and Enter picks it.** The arrows move by a day
  and a week, PageUp and PageDown by a month, Home and End to the edges of the week; Enter picks the
  start and then the end, as a click does.

- **On a narrow screen the panel opens in the kit's bottom sheet with one month.** The presets stand
  in a row on top that scrolls sideways, the days are 44px under a finger, and the summary shows the
  number of days. The narrow sign is the breakpoints service's, as elsewhere in the kit.

- **The names of months, weekdays and the summary follow the locale of the application.** The number
  of days takes the plural form of that locale; the presets and the buttons carry the kit's labels.

## What is out of scope

- Time inside a range: the mockup has dates only.
- Days of the neighbouring months in the grid: the date panel shows empty cells, and both panels
  stay alike.

## Contract

None: the field is a layout component and serves no procedure.

### Refusal codes

Not applicable: an unreadable text marks the field invalid; nothing is refused.

## Data

None of its own. The draft lives while the panel is open and is dropped when it closes unapplied.

## Screens and states

| state                       | what is drawn                                                     |
| --------------------------- | ----------------------------------------------------------------- |
| the field empty             | the hint `дд.мм.гггг — дд.мм.гггг` and the calendar button        |
| the field filled            | the two dates, the clear button and the calendar button           |
| the field invalid, disabled | the error border; the pale field that does not open               |
| the panel, a range picked   | two months with the range, the summary, «Применить» on            |
| the panel, the end awaited  | the start and the future range under the pointer, «Применить» off |
| a narrow screen             | the bottom sheet: the preset row, one month, the day count        |

## Cross-cutting requirements

### Locales

The names of months and weekdays and the dates of the summary come from the application's locale
by the browser's date formatting. The order of day, month and year in the field comes from the same
locale. The number of days is chosen by the locale's plural rules among the kit's labels for one,
few, many and other; the presets and the buttons carry the kit's labels, English in the package and
translated by the consumer's translator.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

On a narrow screen the panel opens in the bottom sheet with one month, the presets in a row that
scrolls sideways, days of 44px and the day count in the footer.

### Several objects

Not applicable: the field belongs to no owning entity.

## Decisions

- **The range field is a component of its own, not a mode of the date field.** Its value is a pair,
  and a mode would give one component two value types.
- **The grid, the text of a date and the locale are the date field's.** The calendar with its range
  states, the text logic and the kit locale are taken as they are; the calendar gets a hover output
  for the future range.
- **The range logic lives in pure functions.** The order of two days, the month states, the presets,
  the summary and the text are counted without a component and checked by a call.

## Open questions

None.

## History of changes

- 2026-09-30 — written by the task RT-2373 of the epic RT-2370, which gives the kit a range field.
