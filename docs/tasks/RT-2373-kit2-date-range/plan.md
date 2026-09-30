# Plan

**Task:** RT-2373 · **Branch:** RT-2373-kit2-date-range
**Spec:** `docs/specs/ui-kit-v2/date-range/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                     |
| ----- | ----------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/date-range/`, `docs/specs/ui-kit-v2/scenarios.md`                   |
| Rules | `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/`                |
| Code  | `projects/ui-kit-v2/src/lib/components/date-range/`, `calendar/`, `date-picker/`, `i18n/` |

## What counts as done

- `rt-date-range` is a form field whose value is `{ start, end }` or `null`; the text reads
  «дд.мм.гггг — дд.мм.гггг» in the order of the interface language, and typing works.
- The panel: two months side by side, presets on the left, the first click is the start, hover
  previews the range, the second click is the end; the footer shows the summary with the day count,
  «Сбросить» and «Применить», which is off until the end is chosen.
- Bounds switch off days and presets; the grid keys work.
- On a narrow screen the panel opens in the bottom sheet: one month, presets in a scrolling row on
  top, days 44px.
- Specs, stories and snapshots cover it.

## Stages

### 1. Agreement

- **Steps:**
    1. Write the date-range subdomain spec
    2. Write its scenarios and binding lines
- **Readiness sign:** the spec check names no divergence of the subdomain
- **Verified by:** `npm run check:specs` — the output names no divergence

### 2. Range logic

- **Steps:**
    1. Write the pure module for the range: the order of two days, the month states, the presets, the summary and the text
    2. Cover it by its spec
- **Readiness sign:** the module spec passes
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-date-range.logic` — all tests pass

### 3. The calendar

- **Steps:**
    1. Give `rt-calendar` a hover output for the range preview
    2. Cover it by its spec
- **Readiness sign:** the calendar spec passes
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-calendar` — all tests pass

### 4. The panel and the field

- **Steps:**
    1. Write the range panel with the presets, two months and the footer
    2. Write the range field with the popover and the bottom sheet
    3. Cover the panel and the field by their specs
- **Readiness sign:** the panel and field specs pass
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=date-range` — all tests pass

### 5. Showcase and docs

- **Steps:**
    1. Show the field states, the panel states and the narrow screen in the stories
    2. Write the overview page and the context of the field
    3. Take the snapshots
- **Readiness sign:** the docs check and the snapshot run are green
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — no divergence

### 6. Closing

- **Steps:**
    1. Run the full set of checks
- **Readiness sign:** lint, types, tests, build and the style checks are green
- **Verified by:** `pnpm exec nx run-many -t lint typecheck test build -p @rt-tools/ui-kit-v2` — all targets succeed

## What this work does not do

- Moving the admin's period filter from two date fields to the range field — a task of its own if
  the owner wants it.
- Time in a range: the mockup has dates only.
