# Plan

**Task:** RT-2812 · **Branch:** RT-2812-kit2-field-label-icon-actions
**Draft:** `docs/specs/ui-kit-v2/proposed/field-label-icon-actions/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/input/`, `docs/specs/ui-kit-v2/select/`, the draft above                                                                                            |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`, `docs/constitution/reuse-first.md`                                                     |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/styling-bem/`, `.claude/skills/rt-tools-styling/`, `.claude/skills/testing/`, `.claude/skills/rt-tools-storybook/` |
| Code  | `projects/ui-kit-v2/src/lib/components/form-control/`, `.../input/`, `.../select/`, `projects/ui-kit-v2/src/styles/_preset-material.scss`                                 |

## What counts as done

- Scenarios SC-UKV-856…866 are covered by unit tests, and the specs of the input and the select pass.
- Each of the five items is visible in the showcase on :6007, and the owner has seen it before the
  first code commit.
- The label on the border has the kit look and the material look.
- The version of the package is 0.24.0, and `pnpm run check:all` is green.

## Stages

### 1. The clearing cross and the clearing event

- **Steps:**
    1. `clearTabbable` and `cleared` in the shared base of the fields
    2. the input and the select take `clearTabbable` into the cross
    3. tests for SC-UKV-865 and SC-UKV-866
- **Readiness sign:** the specs of the input and the select pass with the new scenarios.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts` — «Tests: N passed», no «failed»

### 2. Actionable icons of the input

- **Steps:**
    1. the icon inputs, outputs and tooltips of the input
    2. the template draws an actionable icon as a button with the tooltip
    3. tests for SC-UKV-862, SC-UKV-863, SC-UKV-864
- **Readiness sign:** the input spec passes with the new scenarios.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=projects/ui-kit-v2/src/lib/components/input/rt-input.component.spec.ts` — «Tests: N passed», no «failed»

### 3. The option template of the select

- **Steps:**
    1. the marker directive and its context type
    2. the select draws the template in the row
    3. tests for SC-UKV-856 and SC-UKV-857
- **Readiness sign:** the select spec passes with the new scenarios.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=projects/ui-kit-v2/src/lib/components/select/rt-select.component.spec.ts` — «Tests: N passed», no «failed»

### 4. The label on the border

- **Steps:**
    1. the input draws the label on the border
    2. the select draws the label on the border
    3. the properties of the label and their material values
    4. tests for SC-UKV-858, SC-UKV-859, SC-UKV-860, SC-UKV-861
- **Readiness sign:** both specs pass; the label measured in the browser does not change the field height.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2` — «Tests: N passed», no «failed»

### 5. The showcase and the owner's look

- **Steps:**
    1. stories of the five items in both looks
    2. the owner looks at the showcase on :6007
- **Readiness sign:** the owner's word on the showcase is written in the progress.
- **Verified by:** `pnpm run lint` — no errors

### 6. Docs, version and the check suite

- **Steps:**
    1. the Overview of the input and the select, the default of the cross named
    2. the version 0.24.0 and the changelog line
    3. the agreement merged into the domain specs
- **Readiness sign:** the suite is green.
- **Verified by:** `pnpm run check:all` — exit code 0

## What this work does not do

- Does not change the default of `clearable`.
- Does not make the cross tabbable on the fields other than the input and the select.
- Does not give an option template to the multiselect.
