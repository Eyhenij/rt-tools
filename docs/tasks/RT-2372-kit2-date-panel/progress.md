# Progress

## Where we stand

Rewritten by every session, not appended to.

- **State:** `этап-идёт`
- **Stage:** 6 of 7 — Showcase and docs
- **Done:** branch, folder, plan; the subdomain spec, scenarios `SC-UKV-418`…`SC-UKV-429` and bindings; the pure date module with 8 tests; the calendar with the chosen day, the today mark, the title button and the grid mode; the panel `rt-date-panel` with 11 tests and the kit labels; the field opens it in a popover or the bottom sheet, typing is read by the module
- **Next step:** the stories of the panel for the three types and the narrow screen
- **Uncommitted:** none
- **Waiting for the owner:** no
- **PR:** not open yet

## Steps

- [x] 1.1 Write the date-panel subdomain spec
- [x] 1.2 Write its scenarios and binding lines
- [x] 2.1 Write the pure module for the value strings, the month grid, the bounds and the time columns
- [x] 2.2 Cover it by its spec
- [x] 3.1 Give `rt-calendar` a chosen day, the today mark and the keys of a grid
- [x] 3.2 Cover the new states and keys by its spec
- [x] 4.1 Write the panel component for the three types with the month and year choice and the footer
- [x] 4.2 Cover the panel by its spec
- [x] 5.1 Replace the browser popup in `rt-date-picker` by the panel in a popover or a bottom sheet
- [x] 5.2 Cover typing, bounds and opening by the field spec
- [>] 6.1 Show the panel of the three types and the narrow screen in the stories
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

- **The spec check names the bindings and the scenarios of this subdomain as divergences until the code
  lands** — they point at the module, the panel and the field of stages 2–5. Affected stage of the plan: 1.

- **The calendar keys are opt-in by the input `grid`** — the range calendar of an application keeps
  every day in the Tab order and gets no keys it does not handle. Affected stage of the plan: 3.

## Sessions

### 2026-09-29

- Branch `RT-2372-kit2-date-panel` taken from `RT-2369-kit2-option-tree`; task moved to
  «In progress». Exploration: the field wraps the browser input and stores its string; the calendar
  is a presentational month grid with range states only; no shared date helper in the kit.
