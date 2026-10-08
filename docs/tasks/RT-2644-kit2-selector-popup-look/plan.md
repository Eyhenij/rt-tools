# Plan

**Task:** RT-2644 · **Branch:** RT-2644-kit2-selector-popup-look
**Spec:** `docs/specs/ui-kit-v2/dynamic-selectors/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                          |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/dynamic-selectors/`                                                                                                      |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`                                                              |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/styling-bem/`, `.claude/skills/rt-tools-styling/`, `.claude/skills/ui-component-tests/` |
| Code  | `projects/ui-kit-v2/src/lib/components/dynamic-selector/`, `projects/ui-kit-v2/src/lib/config/`                                                |

## What counts as done

- Without wrapping a popup option stands on one line with a tooltip when cut (row 92).
- The popup search takes a radius step from the selector and the kit settings (row 93).
- The characters matching the search are highlighted in an option label when the caller asks, and
  the highlight works with the ellipsis (row 94).
- The apply button takes the caller's label and letter case (row 95).
- Every new input defaults to today's look, and the kit settings set it; an input at the place wins.

## Stages

### 1. Option labels on one line

- **Steps:**
    1. Settle the lint finding of the single-choice label
    2. Retake the Popup frame after looking at it
- **Readiness sign:** the kit linter is clean and the Popup frame matches on a second run
- **Verified by:** `pnpm exec nx lint @rt-tools/ui-kit-v2` — exit code 0

### 2. Search radius

- **Steps:**
    1. Add `searchRadius` to the popup, the selector and the kit settings
    2. Write its spec scenario and test
- **Readiness sign:** the radius reaches the search field from the input and from the settings
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-dynamic-selector-popup` — every test passed

### 3. Search highlight

- **Steps:**
    1. Split an option label into matched and plain parts by a pure function
    2. Draw the matched parts with the highlight properties and keep the ellipsis
    3. Write its spec scenario and tests
- **Readiness sign:** matched characters are marked, the default draws no mark
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-dynamic-selector` — every test passed

### 4. Apply button label

- **Steps:**
    1. Add `applyLabel` and `applyLabelCase` to the popup, the selector and the kit settings
    2. Write its spec scenario and test
- **Readiness sign:** the button shows the caller's label in the chosen case, the default is unchanged
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-dynamic-selector` — every test passed

### 5. Delivery

- **Steps:**
    1. Run the whole set and the snapshots, measure on :6007
    2. Build the package to the desktop and open the PR into main
- **Readiness sign:** all checks green, the PR is open with a reviewer
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — every snapshot passed

## What this work does not do

- Rows the owner adds later are recorded in the progress as decisions along the way.
- The breadcrumbs of the epic RT-2542 go on in their own branch.
