# The year grid and the period month grid of the kit's date panels

**Status:** proposed · **Revision:** 2026-11-04 · **Scenario prefix:** `SC-UKV`
**Depends on:** the date panel `rt-date-panel`, the period panel `rt-date-range-panel` and the
calendar `rt-calendar` of the kit
**Laws:** `frontend-application`, `mockups`, `verifiability`
**Procedures:** none

An agreement of the task RT-2895 about the choice of a far year and a far month: the date panel
gains a grid of years, the period panel gains a grid of months and a grid of years. It merges into the
specs `date-panel` and `date-range` when the work closes.

## Why

In the date panel the year changes only by arrows, one year a click: a date five years back costs five
clicks. The period panel has no month grid at all, and a far month is reached by paging month by
month.

## Terminology

- **The month grid** — twelve months of one year to choose from.
- **The year grid** — twelve years to choose from, paged by twelve.
- **The span** — the twelve years the year grid shows.

### What it is called in the interface

| In the domain  | On the screen                                   |
| -------------- | ----------------------------------------------- |
| The month grid | the months that open from the month title       |
| The year grid  | the years that open from the year in the header |
| The span       | «2024 – 2035» in the header of the year grid    |

## Rules

- **In the date panel the year in the header of the month grid is a button that opens the year
  grid.** The arrows next to it still page the year one by one.
- **The year grid shows twelve years: three in a row in the date panel, four in a row in the period
  panel.**
- **The span is a block of twelve that holds the shown year.** The spans are laid every twelve years
  from 2024, as the mockup draws 2024 – 2035 around 2026: the year 2026 opens 2024 – 2035, the year
  2040 opens 2036 – 2047. The header shows the span as «first – last».
- **The arrows of the year grid page the span by twelve years and stop at the bounds.** An arrow is
  switched off when the whole next span lies outside `min` and `max`.
- **A year outside `min` and `max` is unavailable, the chosen year is filled, the current year is
  outlined.** The chosen year is the year of the value; the current year is the year of today.
- **A year picked in the year grid opens the month grid of that year.**
- **In the period panel the month title of each calendar is a button that opens the month grid.**
  The month grid shows four months in a row with the year and paging by year in the header; the
  year in the header opens the year grid.
- **A month picked in a month grid returns to the days of that month.** In the period panel the
  picked month becomes the first of the two shown months.
- **A month outside the bounds is unavailable in both panels.**
- **Escape in a month or a year grid returns one view back instead of closing the panel.**

## What is out of scope

- The time columns, the text of the field, the layout of the bottom sheet on a narrow screen and new
  inputs of the panels.

## Contract

No new inputs or outputs: the grids are views inside the panels.

### Refusal codes

Not applicable: the panels refuse nothing.

## Data

Not applicable: the grids keep no data of their own.

## Screens and states

| state                            | what is drawn                                               |
| -------------------------------- | ----------------------------------------------------------- |
| the date panel, the year grid    | twelve years three in a row, the span and arrows above      |
| the period panel, the month grid | twelve months four in a row, the year and arrows above      |
| the period panel, the year grid  | twelve years four in a row, the span and arrows above       |
| a cell                           | default, hover, chosen, current, in the period, unavailable |

## Cross-cutting requirements

### Locales

Month names come from the application's locale, as in the month grid of the date panel; years are
digits. The labels of the arrows are the kit's labels.

### SEO

Not applicable: the kit is not indexed.

### Mobile layout

On a narrow screen the grids take the width of the bottom sheet; the cell keeps the height of the
mockup.

### Several objects

Not applicable: the panels belong to no owning entity.

## Decisions

- **The grids are views of the panels, not a new component.** The month grid of the date panel
  already lives there, and the period panel takes the same technique.
- **The span and the year cells are counted by pure functions next to the month logic.**

## Open questions

None.

## History of changes

- 2026-11-04 — written by the task RT-2895.
