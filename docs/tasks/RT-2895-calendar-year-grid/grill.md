# Grill

## The owner request

> Да, бери RT-2895

The task RT-2895 «Календарь не даёт выбрать год сеткой» names what is wanted:

- in the month grid of the date choice, the year in the header is pressed and opens a grid of years;
- the year grid holds twelve years, three in a row, the header shows the span of years and arrows
  that page by twelve years;
- a year outside `min` and `max` is unavailable, the chosen year is marked;
- in the period choice, the month title opens the same grids of months and years, four in a row;
- choosing a month returns to the days of that month.

## What the tree already has

- `rt-date-panel` (date choice) already has a month grid: the month title opens it, the year is
  paged by arrows one at a time (`openMonths`, `pageYear`, `canPrevYear`). There is no year grid.
- `rt-date-range-panel` (period choice) has no month grid and no year grid: its calendar is shown
  without `titleAction`, so the month title is plain text.
- `rt-calendar` already gives a pressable title (`titleAction`, `titleClick`) — both panels can use
  it.
- The domain spec is `docs/specs/ui-kit-v2/date-panel/`; it promises «twelve months and the year with
  paging» and says nothing about a year grid. The range panel spec is `docs/specs/ui-kit-v2/date-range/`.
- Figma, Design System V2, page Calendar: the set `Calendar` (`6887:785`) already holds the frames
  `Mode=date, View=years` (`6887:688`), `Mode=range, View=months` (`6887:721`) and
  `Mode=range, View=years` (`6887:753`), and the cell `Calendar Period Cell` (`6887:524`) with six
  states. No approval of these frames is recorded anywhere in the tree.

## What the rules already say

- The rule `kit-approval`: a visible kit edit starts from an approved mockup; the code goes after the
  approval, the showcase is shown and approved by a second answer, and only then the push and the PR.
- The rule `task-flow`: work outside an epic goes by the owner's word about this very work — «Да,
  бери RT-2895».

## Questions and answers

The owner took the recommended answer twice in a row before this task («Да, отправляй», «Да, бери
RT-2895»), so the six questions are closed by assumption:

- **Does the task change the behaviour** — yes: both panels gain new views. Taken from the task body.
- **Does it need an edit of a law or a rule** — no. Question closed by assumption: the work stays
  inside the kit components and their specs.
- **One task or several** — one: the year grid of the date choice and the grids of the period choice
  share one cell and one paging logic, and roll back together.
- **What is not part of the task** — the time columns, the field text, the narrow-screen sheet layout
  and new inputs of the panels.
- **What shows the task is closed** — both panels open the grids from the title in the showcase, the
  showcase matches the frames by numbers, and the specs list the new rules with scenarios and tests.
- **The sample** — the mockup frames named above; the logic sample is the existing month grid of
  `rt-date-panel`.

## Decisions

- **The year span is a block of twelve aligned so that the shown year stands in it** — the mockup
  shows 2024–2035 around 2026. Rejected: a span starting at the shown year — the mockup does not draw
  it so.

## What is left unclear

- The mockup frames were never approved by the owner; the approval is asked before the code.
