# Plan

**Task:** RT-2345 · **Branch:** RT-2345-material-icons-optical-size
**Spec:** `docs/specs/ui-kit-v2/table-material-theme/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/table-material-theme/`                                                                                                                             |
| Rules | `.claude/skills/rt-tools-styling/`, `.claude/skills/ui-component-tests/`                                                                                                 |
| Code  | `projects/ui-kit-v2/src/assets/icons-material/`, `projects/ui-kit-v2/src/lib/components/data-table/`, `projects/ui-kit-v2/src/styles/`, `tools/fetch-material-icons.mjs` |

## What counts as done

- The icons of the list's toolbar, filter row and rows match the first kit by stroke, size and colour.
- The row actions strip takes the whole height of its row, as the first kit's.

## Stages

### 1. Icons as the first kit's

- **Steps:**
    1. Fetch the material set at optical size 48
    2. Give the table icons 24 px and the grey of the theme in the material preset
    3. Re-take the diverged frames in the image
- **Readiness sign:** a measurement of the filter row and the row actions gives 24 px and `#49454e` in both kits.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — «Snapshots:» with no failed

### 2. The row actions strip is as high as its row

- **Steps:**
    1. Take the strip's height from the row instead of the ordinary row height
    2. Re-take the diverged frames and write the rule into the spec
    3. Open the PR into the epic branch
- **Readiness sign:** a measurement of a row with a picture gives the strip the row's height.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — «Snapshots:» with no failed

## What this work does not do

- The raised round button of the story's button column: it is the story's own markup, not the kit's.
