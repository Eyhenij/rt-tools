# Plan

**Task:** RT-2372 · **Branch:** RT-2372-kit2-date-panel
**Spec:** `docs/specs/ui-kit-v2/date-panel/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                      |
| ----- | -------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/date-panel/`, `docs/specs/ui-kit-v2/spec.md`         |
| Rules | `.claude/skills/rt-tools-storybook/`, `.claude/skills/rt-tools-styling/`   |
| Code  | `projects/ui-kit-v2/src/lib/components/date-picker/`, `calendar/`, `i18n/` |

## What counts as done

- `rt-date-picker` opens the kit's own panel for `date`, `time` and `datetime-local`; the browser's
  popup is gone.
- Date: a month with paging, a month and year choice, today outlined, a day click chooses and
  closes, «Сегодня» below. Time: hours and minutes columns with the minute step, «Сейчас» and
  «Готово». Date with time: the month and the columns side by side, «Применить».
- The value keeps its present string shape; typing into the field works; `min` and `max` disable
  what lies outside.
- On a narrow screen the panel opens in the kit's bottom sheet, days 44px, date with time switches
  «Дата | Время».
- Specs, stories and snapshots cover it.

## Stages

### 1. Agreement

- **Steps:**
    1. Write the date-panel subdomain spec
    2. Write its scenarios and binding lines
- **Readiness sign:** the spec check names no divergence of the subdomain
- **Verified by:** `npm run check:specs` — the output names no divergence

### 2. Date logic

- **Steps:**
    1. Write the pure module for the value strings, the month grid, the bounds and the time columns
    2. Cover it by its spec
- **Readiness sign:** the module spec passes
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-date-panel.logic` — all tests pass

### 3. The calendar

- **Steps:**
    1. Give `rt-calendar` a chosen day, the today mark and the keys of a grid
    2. Cover the new states and keys by its spec
- **Readiness sign:** the calendar spec passes and its present snapshots match
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-calendar` — all tests pass

### 4. The panel

- **Steps:**
    1. Write the panel component for the three types with the month and year choice and the footer
    2. Cover the panel by its spec
- **Readiness sign:** the panel spec passes
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-date-panel.component` — all tests pass

### 5. The field

- **Steps:**
    1. Replace the browser popup in `rt-date-picker` by the panel in a popover or a bottom sheet
    2. Cover typing, bounds and opening by the field spec
- **Readiness sign:** the field spec passes
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-date-picker` — all tests pass

### 6. Showcase and docs

- **Steps:**
    1. Show the panel of the three types and the narrow screen in the stories
    2. Rewrite the overview page and the context of the field and the calendar
    3. Re-take the snapshots
- **Readiness sign:** the docs check and the snapshot run are green
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — no divergence

### 7. Closing

- **Steps:**
    1. Run the full set of checks
- **Readiness sign:** lint, types, tests, build and the style checks are green
- **Verified by:** `pnpm exec nx run-many -t lint typecheck test build -p @rt-tools/ui-kit-v2` — all targets succeed

## What this work does not do

- The date range field — task RT-2373.
- Seconds in the time columns: the mockup has none.
