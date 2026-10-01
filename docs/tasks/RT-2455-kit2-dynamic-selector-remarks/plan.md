# Plan

**Task:** RT-2455 · **Branch:** RT-2455-kit2-dynamic-selector-remarks
**Spec:** `docs/specs/ui-kit-v2/dynamic-selectors/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                     |
| ----- | --------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/dynamic-selectors/`                 |
| Code  | `projects/ui-kit-v2/src/lib/components/dynamic-selector/` |

## What counts as done

- A row in flight is drawn on a background.
- The selector's icon buttons are round by default and take another step by an input.
- The popup opens from the add button pressed.
- The owner looked at the showcase before the PR.

## Stages

### 1. The three remarks in code

- **Steps:**
    1. Draw the row in flight on a background layer inside the preview
    2. Add the button rounding input with the full step by default and pass it to every icon button of the list
    3. Anchor the popup to the add button pressed
- **Readiness sign:** the selector's specs are green with the new scenarios
- **Verified by:** `pnpm exec jest -c projects/ui-kit-v2/jest.config.ts projects/ui-kit-v2/src/lib/components/dynamic-selector` — no failed tests

### 2. Texts, showcase and snapshots

- **Steps:**
    1. Rules and scenarios in the spec, the input in the overview and the component context
    2. A story axis for the button rounding and retaken snapshots of the selector
    3. Show the owner the showcase
- **Readiness sign:** the spec check and the docs audit are green, the snapshots match
- **Verified by:** `npm run check:specs` — exits 0

## What this work does not do

- The first kit's selector — it is not touched.
