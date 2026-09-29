# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 1 of 7 — Agreement
- **Done:** branch from `RT-2369-kit2-option-tree`, task in «In progress», folder, plan
- **Next step:** the date-panel subdomain spec
- **Uncommitted:** the task folder
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [>] 1.1 Write the date-panel subdomain spec
- [ ] 1.2 Write its scenarios and binding lines
- [ ] 2.1 Write the pure module for the value strings, the month grid, the bounds and the time columns
- [ ] 2.2 Cover it by its spec
- [ ] 3.1 Give `rt-calendar` a chosen day, the today mark and the keys of a grid
- [ ] 3.2 Cover the new states and keys by its spec
- [ ] 4.1 Write the panel component for the three types with the month and year choice and the footer
- [ ] 4.2 Cover the panel by its spec
- [ ] 5.1 Replace the browser popup in `rt-date-picker` by the panel in a popover or a bottom sheet
- [ ] 5.2 Cover typing, bounds and opening by the field spec
- [ ] 6.1 Show the panel of the three types and the narrow screen in the stories
- [ ] 6.2 Rewrite the overview page and the context of the field and the calendar
- [ ] 6.3 Re-take the snapshots
- [ ] 7.1 Run the full set of checks

## Decisions along the way

- **The month grid is `rt-calendar` extended, not a second calendar** — it draws the month, the
  paging and the day buttons already; it lacks a chosen day, the today mark and the keys, and gets
  them. Affected stage of the plan: 3.
- **No component of the kit switches a popover to a bottom sheet yet** — the field is the first;
  the narrow sign comes from `BreakpointsService.narrow`, as the filter control and the table read
  it. Affected stage of the plan: 5.
- **The labels «Сегодня», «Сейчас», «Готово», «Применить», «Дата», «Время», month and year paging are
  new kit labels** — none exists in the English set. Affected stage of the plan: 4.

## Sessions

### 2026-09-29

- Branch `RT-2372-kit2-date-panel` taken from `RT-2369-kit2-option-tree`; task moved to
  «In progress». Exploration: the field wraps the browser input and stores its string; the calendar
  is a presentational month grid with range states only; no shared date helper in the kit.
