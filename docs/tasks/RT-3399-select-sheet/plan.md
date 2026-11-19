# Plan

**Task:** RT-3399 · **Branch:** RT-3399-select-sheet
**Spec:** `docs/specs/ui-kit-v2/select/spec.md`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Points

- **A:** on a phone `rt-select` and `rt-multiselect` open a small list next to the field; the date
  fields of the kit already open the bottom sheet there.
- **This task reaches:** on a narrow screen a tap on a select opens its list in the kit's bottom
  sheet, sized for a finger; an application switches it off per field by one input.
- **Sign:** the showcase on port 6007 at width 375 — a tap on the field opens the sheet; at 1440
  the list opens next to the field; the unit tests of both components.
- **Milestone G of the epic:** none — work outside an epic by the owner's word.
- **Metric:** нет: a feature, not an improvement of a rule.

## Task footprint

| What  | Where                                                         |
| ----- | ------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/select/`                                |
| Laws  | `docs/constitution/mockups.md`, `docs/constitution/frontend-application.md` |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/` |
| Code  | `projects/ui-kit-v2/src/lib/components/select/`, `projects/ui-kit-v2/src/lib/components/multiselect/` |

Sample to follow: `projects/ui-kit-v2/src/lib/components/date-range/` — the narrow sign from the
breakpoints service picks `rt-bottom-sheet` in the template.

## What counts as done

- At width 375 a tap on `rt-select` opens the bottom sheet; a choice closes it and sets the value.
- At width 375 a tap on `rt-multiselect` opens the bottom sheet; choices keep it open until it is
  closed.
- The search of the field is in the sheet when the field has it switched on.
- An input switches the sheet off, and then the list opens next to the field as before.
- At width 1440 both fields behave as before.
- Applications get the sheet without editing their templates.
- Unit tests of both components cover the five lines above; the showcase shows both looks; the
  owner approved the mockup and the showcase.

## Stages

### 1. Mockup

- **Steps:**
    1. Draw the frames of both fields in the sheet at 375 in the kit's Figma file: single choice,
       multiple choice, with search.
    2. Measure the frames by the pattern `mockups-measure`.
    3. Show the frames to the owner and write the approval into `approvals.md`.
- **Readiness sign:** `approvals.md` holds the line of the mockup with the owner's words.
- **Verified by:** `grep -c 'Макет:' docs/tasks/RT-3399-select-sheet/approvals.md` — prints 1.

### 2. Agreement in the spec

- **Steps:**
    1. Write the rules and scenarios of the sheet and of the input that switches it off into the
       select spec.
- **Readiness sign:** the spec names the narrow-screen sheet, the switch-off input and their
  scenario numbers.
- **Verified by:** `grep -c 'bottom sheet' docs/specs/ui-kit-v2/select/spec.md` — more than 0.

### 3. Code and unit tests

- **Steps:**
    1. `rt-select`: the narrow sign, the sheet in the template, the switch-off input, the choice
       closes the sheet.
    2. `rt-multiselect`: the same; the sheet stays open on a choice.
    3. Unit tests by the scenarios of stage 2.
- **Readiness sign:** the tests of both components are green.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testPathPattern='(select|multiselect)' --maxWorkers=2` — no failed tests.

### 4. Showcase

- **Steps:**
    1. Stories of both fields at the narrow width with the sheet open and with the sheet off.
    2. Measure the showcase against the mockup with `node tools/kit-match.mjs numbers`.
    3. Show the showcase to the owner and write the approval into `approvals.md`.
- **Readiness sign:** `approvals.md` holds the match line and the showcase line.
- **Verified by:** `grep -c 'Витрина:' docs/tasks/RT-3399-select-sheet/approvals.md` — prints 1.

## What this work does not do

- The menu `rt-menu` in the sheet — a task of its own, to be filed on the owner's word.
- The select with a toggles panel — a task of its own, to be filed on the owner's word.
- `rt-autocomplete` and `rt-tabs` in the sheet — not asked yet.
