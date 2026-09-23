# Plan

**Task:** RT-2330 · **Branch:** RT-2330-data-list-table-kit-one-look-rest
**Spec:** `docs/specs/ui-kit-v2/table-full-port/spec.md`
**Behaviour:** changes

The work starts in the local branch `data-list-table-kit-one-look-rest`: the board listing on the
host does not show #2330, and the delivery guard refuses a numbered branch until it does. The
branch is renamed to the name above once the board lists the task; nothing leaves for the host
before that.

## Task footprint

| What  | Where                                                                                                                                                                                                                                                    |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/table-full-port/`, `docs/specs/ui-kit-v2/proposed/material-preset/`                                                                                                                                                                |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/lists.md`                                                                                                                                                                                |
| Rules | `.claude/skills/styling-bem/`, `.claude/skills/rt-tools-styling/`, `.claude/skills/ui-component-tests/`, `.claude/skills/rt-tools-storybook/`                                                                                                            |
| Code  | `projects/ui-kit-v2/src/styles/`, `projects/ui-kit-v2/src/lib/components/data-table/`, `projects/ui-kit-v2/src/lib/components/data-list/`, `projects/ui-kit-v2/src/lib/components/input/`, `projects/ui-kit-v2/.storybook/`, `tools/build-tokens-v2.mjs` |

## What counts as done

- The material preset of the second kit takes the brand, error and surface colours from a Material
  theme present on the page, with the current values as the fallback, and the kit gains no
  dependency on Material.
- The second kit showcase shows the table and the list under the same violet Material theme the
  first kit showcase uses.
- The header checkbox of the selection column stands on the same vertical centre as the header
  titles, within 1 px.
- Header fill, row height, font and search field of the list in the material preset match the
  first kit by measurement, within 2 px for sizes and by colour for fills.
- The toolbar buttons, the row selection look, the paginator and the floating bar of selected
  records are each either brought to the first kit's look by measurement, or filed as a task of
  their own with the owner told the measured difference.

## Stages

### 1. Measurement against the first kit

- **Steps:**
    1. Write a measurement script over both showcases: header fill colour, header and row height, font family, search field height and fill, header checkbox centre against title centre
    2. Run it over the first kit dynamic list story and the second kit data list story in the material preset
    3. Record the table of numbers in the progress
- **Readiness sign:** the progress holds a table with a first-kit and a second-kit value for every measured property
- **Verified by:** `node tools/build-tokens-v2.mjs --check` — «what is built matches the source»; the measurement table is read in the progress

### 2. Material theme colours in the material preset

- **Steps:**
    1. Wrap the brand, error and surface steps of the material preset in the tokens source as `var(--mat-sys-<name>, <current value>)`, the same names the first kit reads
    2. Rebuild the tokens and cover the wrapping with a spec
    3. Give the second kit showcase a violet Material theme declared as plain properties, no Material package
    4. Rewrite the Material rule of the proposed material preset spec by the owner's decision
- **Readiness sign:** the built preset holds `var(--mat-sys-primary,` and the tokens check is green
- **Verified by:** `node tools/build-tokens-v2.mjs --check` — «what is built matches the source»

### 3. Table header, rows and header checkbox

- **Steps:**
    1. Put the header checkbox on the vertical centre of its cell
    2. Bring the header fill, the row height and the font of the table in the material preset to the measured first-kit values
    3. Cover the checkbox centre and the row height with specs
- **Readiness sign:** the measurement script shows the checkbox centre within 1 px of the title centre and the row height within 2 px of the first kit
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2` — «Tests: … passed», no failed

### 4. Search field of the list

- **Steps:**
    1. Bring the fill look of the field to the first kit Material fill field by measurement: height, fill, underline, search icon
    2. Re-take the field and list references
- **Readiness sign:** the measurement script shows the search field height within 2 px of the first kit
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — every frame matches

### 5. Toolbar buttons, row selection, paginator, floating bar

- **Steps:**
    1. Measure each of the four against the first kit and size the edit
    2. Bring those that fit this task, file the rest as tasks of epic 1870 and tell the owner the numbers
- **Readiness sign:** every one of the four is either matched by measurement or stands as a task on the board
- **Verified by:** `npm run check:board` — no line about the filed tasks

### 6. Spec and references

- **Steps:**
    1. Write the new rules and scenarios into the table family spec
    2. Re-take the references changed by stages 2–5 and run the whole check set
- **Readiness sign:** the check set is green
- **Verified by:** `pnpm run check:all` — ends without a failed target

## What this work does not do

- The first kit is not touched.
- The board listing on the host is not repaired here: that is GitHub's side.
