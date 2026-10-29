# Plan

**Task:** RT-2995 · **Branch:** RT-2995-tab-icon-fill-clear-tabbable
**Draft:** `docs/specs/ui-kit-v2/proposed/tab-icon-fill-clear-tabbable/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/tab-additions/`, `docs/specs/ui-kit-v2/field-label-icon-actions/`, `docs/specs/ui-kit-v2/kit-settings-theme/`                                                                                 |
| Laws  | `docs/constitution/mockups.md`, `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`                                                                                                   |
| Rules | `.claude/skills/kit-approval/`, `.claude/skills/component-structure/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/testing/`                                                                              |
| Code  | `projects/ui-kit-v2/src/lib/components/tabs/`, `projects/ui-kit-v2/src/lib/components/form-control/`, `projects/ui-kit-v2/src/lib/config/`, the templates of autocomplete, input-number, date-picker and date-range |

## What counts as done

- A tab with `iconFill` draws its icon filled, for `icon` and for `glyph`.
- `provideRtKit` with `components.formControl.clearTabbable` puts the clearing cross of every field
  of the shared base into the Tab order; the input on the field wins over it.
- The autocomplete, the number field, the date picker and the date range obey `clearTabbable`.
- The Figma frame and the showcase are approved by the owner, and the record holds both quotes.

## Stages

### 1. The mockup

- **Steps:**
    1. Draw the Figma frame: a tab strip with a filled and an outlined icon, and the four fields with the cross in focus.
    2. Show the frame to the owner and write the approval into `approvals.md`.
- **Readiness sign:** the record holds the mockup line with the owner's quote and the link.
- **Verified by:** `grep -c "Макет:" docs/tasks/RT-2995-tab-icon-fill-clear-tabbable/approvals.md` — prints 1.

### 2. The code

- **Steps:**
    1. Add `iconFill` to `rtTab` and pass it to the tab icon as `fill`.
    2. Add the node `formControl` with `clearTabbable` to the kit settings and read it in the shared base.
    3. Bind the cross of the autocomplete, the number field, the date picker and the date range to `clearTabIndex()`.
    4. Write the tests of SC-UKV-1080, SC-UKV-1081 and SC-UKV-1082.
- **Readiness sign:** the kit tests pass, and the three scenarios have tests named by them.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --maxWorkers=2` — no failed suite in the output, found by grep of `failed`.

### 3. The showcase

- **Steps:**
    1. Add the stories: a tab with `iconFill`, the fields with the cross by Tab from the kit setting.
    2. Measure the showcase against the frame and show both to the owner; write the approval.
- **Readiness sign:** the record holds the match line at N of N and the showcase quote.
- **Verified by:** `node tools/check-kit-approval.mjs` — prints no refusal for this branch.

### 4. Closing

- **Steps:**
    1. Merge the agreement into `tab-additions` and `field-label-icon-actions`, bring the Overview pages and `CONTEXT.md` up to date.
    2. Run the push set, take the folder apart, open the PR.
- **Readiness sign:** the push set is green and the PR is open.
- **Verified by:** `pnpm run check:all` — ends with exit code 0.

## What this work does not do

- The list clear of the dynamic selector: it already goes by Tab.
- The badge over the tab icon, asked by the application later: a task of its own if the owner takes it.
- The first kit.
