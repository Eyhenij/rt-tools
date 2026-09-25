# Plan

**Task:** RT-2348 · **Branch:** RT-2348-table-buttons-first-kit
**Spec:** `docs/specs/ui-kit-v2/table-material-theme/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                        |
| ----- | -------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/table-material-theme/` |
| Laws  | `docs/constitution/frontend-application.md`  |
| Rules | `.claude/skills/rt-tools-styling/`           |
| Code  | `projects/ui-kit-v2/`                        |

## What counts as done

- In the material preset the buttons of the filter row and of the row actions are round and 36 px.
- The fields of the filter row are 52 px outlined Material fields, and the filter row is 60.5 px in
  both kits.
- The copy button of a cell is the first kit's plate and is hidden without hover at 1440 and at
  1000 px.
- The second kit's frames match: 642 of 642.

## Stages

### 1. The look of the table buttons, fields and copy button

- **Steps:**
    1. Round 36 px buttons in the filter row and the row actions
    2. The copy button as the first kit's plate, hidden without hover
    3. The filter fields as 52 px outlined Material fields
    4. Rules in the spec and the retaken frames
- **Readiness sign:** the frames match whole after the retake.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — «642 passed, 642 total».

### 2. Hand-over

- **Steps:**
    1. Merge main into the epic branch
    2. Move the commits onto the task branch
    3. Take the folder apart and open the PR into the epic branch
- **Readiness sign:** the PR is open into the epic branch with a reviewer.
- **Verified by:** `gh pr view --json state,baseRefName` — «OPEN» and «RT-1870-one-kit».

## What this work does not do

- The arrow of the select in the filter row; it goes to a task of its own if the owner asks.
