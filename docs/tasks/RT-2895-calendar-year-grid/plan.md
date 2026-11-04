# Plan

**Task:** RT-2895 · **Branch:** RT-2895-calendar-year-grid
**Draft:** `docs/specs/ui-kit-v2/proposed/calendar-year-grid/`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                                                     |
| ----- | --------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/date-panel/`, `docs/specs/ui-kit-v2/date-range/`                                    |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/mockups.md`                               |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/testing/`           |
| Code  | `projects/ui-kit-v2/src/lib/components/date-picker/`, `projects/ui-kit-v2/src/lib/components/date-range/` |

## What counts as done

- In the date choice the year in the month grid header opens a grid of twelve years, three in a row,
  paged by twelve; a year outside `min` and `max` is unavailable, the chosen year is marked, a year
  chosen returns to the month grid of that year.
- In the period choice the month title opens a month grid and from it a year grid, four in a row;
  a month chosen returns to the days of that month.
- The showcase shows every new view, and its numbers match the Figma frames `6887:688`, `6887:721`,
  `6887:753`.
- The owner approved the mockup and the showcase; both quotes stand in `approvals.md`.
- The specs of both panels hold the new rules, each with a scenario and a test.

## Stages

### 1. Agreement

- **Steps:**
    1. Write the product agreement in `docs/specs/ui-kit-v2/proposed/calendar-year-grid/`
    2. Record the mockup approval in `approvals.md`
- **Readiness sign:** the agreement passes the spec audit and the approval line holds the owner's quote
- **Verified by:** `npm run check:specs` — the line «no divergences»

### 2. Year grid logic

- **Steps:**
    1. Add the year span, the year cells and their bounds to `rt-date-panel.logic.ts`
    2. Cover them by unit tests with scenario numbers
- **Readiness sign:** the new logic tests are green
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 --testFile=rt-date-panel.logic.spec.ts` — «passed», no «failed»

### 3. Date choice panel

- **Steps:**
    1. Make the year in the month grid header a button that opens the year grid
    2. Draw the year grid by the frame `6887:688` and cover the panel by tests
- **Readiness sign:** the panel tests are green
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 --testFile=rt-date-panel.component.spec.ts` — «passed»

### 4. Period choice panel

- **Steps:**
    1. Give the range calendar a pressable month title opening the month grid
    2. Draw the month and year grids by the frames `6887:721` and `6887:753` and cover them by tests
- **Readiness sign:** the range panel tests are green
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2 --testFile=rt-date-range-panel.component.spec.ts` — «passed»

### 5. Showcase and match

- **Steps:**
    1. Add the new views to the panel matrix stories and take their snapshots
    2. Measure the showcase against the Figma frames and record the match line
    3. Show the showcase to the owner and record the second approval
- **Readiness sign:** the snapshots are green, the match is N of N, the showcase quote is recorded
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — «Tests: … passed», no «failed»

### 6. Closing

- **Steps:**
    1. Merge the agreement into the domain specs
    2. Take the task folder apart into the archive record
- **Readiness sign:** no `proposed/calendar-year-grid` and no task folder in the branch
- **Verified by:** `npm run check:specs` — the line «no divergences»

## What this work does not do

- The time columns, the field text, the narrow-screen sheet layout and new inputs of the panels.
