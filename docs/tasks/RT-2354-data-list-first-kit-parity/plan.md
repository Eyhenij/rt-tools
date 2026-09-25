# Plan

**Task:** RT-2354 · **Branch:** RT-2354-data-list-first-kit-parity
**Spec:** `docs/specs/ui-kit-v2/table-full-port/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                       |
| ----- | ------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/table-full-port/`     |
| Laws  | `docs/constitution/frontend-application.md` |
| Rules | `.claude/skills/rt-tools-styling/`          |
| Code  | `projects/ui-kit-v2/`                       |

## What counts as done

- Each of the nine items is measured against the first kit, and every confirmed difference is fixed.
- An item the measurement does not confirm is named in the PR with the numbers.
- The second kit's frames match after the retake.

## Stages

### 1. Measure and fix

- **Steps:**
    1. The list takes the width of its column
    2. The header class reaches the cell as in the first kit
    3. The header text colour, font weight and filter row background are own properties
    4. The filter fields take the look of the search by default
    5. The page strip label reads as in the first kit
    6. The row menu item takes a green tone and a Material glyph
    7. The select of the filter row takes the whole cell
- **Readiness sign:** every item has a measurement before and after.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2` — no failed tests.

### 2. Frames, texts and hand-over

- **Steps:**
    1. Specs and overview pages carry the new inputs and properties
    2. Frames retaken, the second pass whole
    3. Take the folder apart and open the PR into the epic branch
- **Readiness sign:** the frames match whole and the PR is open.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — «642 passed, 642 total».

## What this work does not do

- The first kit is not edited.
