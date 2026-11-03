# Plan

**Task:** RT-2890 · **Branch:** RT-2890-rt-input-number-stepper
**Draft:** `docs/specs/ui-kit-v2/proposed/input-number-stepper/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                           |
| ----- | ----------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/proposed/input-number-stepper/`, `docs/specs/ui-kit-v2/number-grouping/`  |
| Laws  | `docs/constitution/verifiability.md`, `docs/constitution/frontend-application.md`               |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/testing/` |
| Code  | `projects/ui-kit-v2/src/lib/components/input-number/`, `projects/ui-kit-v2/src/lib/i18n/`       |

## What counts as done

- The number field shows two step arrows after the clear button, switched off by `stepper`.
- The arrows and the Up and Down keys step the value by `step`, held inside `min` and `max`.
- The arrow towards a reached edge, and both arrows of a disabled field, are disabled.
- Scenarios SC-UKV-1133…1143 are covered by unit tests.
- The owner approved the mockup and the showcase.

## Stages

### 1. Code and tests

Rules 1, 9, 11 and 12 of the agreement are the arrows in the template; rules 2–8 the step logic;
rule 10 the disabled state. Every rule is checked by a scenario of step 1.5.

- **Steps:**
    1. Add the step labels to the kit labels
    2. Add the `step` and `stepper` inputs and the step logic
    3. Draw the arrows in the field after the clear button
    4. Handle the Up and Down keys in the field
    5. Cover SC-UKV-1133…1143 by unit tests
- **Readiness sign:** the spec file of the field passes, and every scenario number stands in a test title.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-input-number.component.spec.ts --maxWorkers=2` — the line `Tests:` with no failed tests.

### 2. Showcase

- **Steps:**
    1. Add the arrows to the field stories
    2. Check the stories by eye and by measurement against the mockup
    3. Get the owner's word on the showcase
- **Readiness sign:** the approvals file holds the owner's showcase line.
- **Verified by:** `node tools/check-kit-approval.mjs` — no missing line named.

### 3. Hand-in

- **Steps:**
    1. Merge the agreement into the kit spec
    2. Run the push gate set
    3. Take the task folder apart and open the PR
- **Readiness sign:** the PR is open on the RT-2927 branch as its base.
- **Verified by:** `gh pr view --json number,baseRefName` — the base is `RT-2927-rt-stat-tile-delta-unit`.

## What this work does not do

- Repeating the step while a mouse button is held, and the mouse wheel.
- The first kit's number field.
