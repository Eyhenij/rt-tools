# Plan

**Task:** RT-2316 · **Branch:** RT-2316-table-full-port
**Draft:** `docs/specs/ui-kit-v2/proposed/table-full-port/`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

Measured while the plan was written: the first kit's table folder holds 4 301 lines of code,
templates and styles in about twenty parts — the table, the list around it, the cells, the filter
cell, the pagination bar, the column settings panel, the row press directives, the selector
directives and the column model.

| What   | Where                                                                                                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Specs  | `docs/specs/ui-kit-v2/proposed/table-full-port/` — merges into the kit spec as a subdomain                                                                                           |
| Laws   | `docs/constitution/frontend-application.md`, `docs/constitution/reuse-first.md`, `docs/constitution/verifiability.md`                                                                |
| Rules  | `.claude/skills/styling-bem/`, `.claude/skills/rt-tools-styling/`, `.claude/skills/component-structure/`, `.claude/skills/ui-component-tests/`, `.claude/skills/rt-tools-storybook/` |
| Code   | `projects/ui-kit-v2/src/lib/components/` — the new families `data-table` and `data-list`                                                                                             |
| Sample | `projects/ui-kit/src/lib/ui-kit/table/` — read, not edited                                                                                                                           |

## What counts as done

- The second kit has `rt-data-table` and `rt-data-list`: everything the first kit's table does,
  with the first kit's look, and nothing from Material — no library, no font, no field-look inputs.
- An application moves a first-kit screen onto them without editing its column declarations,
  bindings or saved settings; only tag and directive names change, and the Material field-look
  inputs are dropped.
- `rt-table` and `rt-dynamic-list` are not edited.
- Every scenario of the agreement is closed by a test or carries a reason; the stories of both
  families are shown in both presets and both themes, with frames taken.
- The agreement is merged into the kit spec, and the branch is on the host behind a green gate.

## Stages

### 1. Model and pure parts

- **Steps:**
    1. Column model, settings model and the first kit's field set carried over as declared
    2. Settings storage under the first kit's key and shape, with its spec
    3. Row press and "ignore row press" directives with their spec
- **Readiness sign:** the specs of the stage pass, lint and types are clean.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=data-table` — the report
  names the stage's spec files and zero failures.

### 2. The table `rt-data-table`

- **Steps:**
    1. Ready cell by column type, the copy button and the icons through the kit's map
    2. Header cell with sorting and the header icon
    3. Filter cell with the operator menu on the kit's input, select and date picker
    4. The table: rows, actions area, single choice by `rt-radio-button`, multiple by `rt-checkbox`
    5. Spec of the table on its scenarios
- **Readiness sign:** the table's scenarios are closed by tests; no import of `@angular/material`.
- **Verified by:** `npm run -s check:specs` — no line about `table-full-port` other than the
  scenarios of stage 3.

### 3. The list `rt-data-list`

- **Steps:**
    1. Toolbar with search, clear-filters and refresh, and the application's selectors
    2. Own pagination bar ported from the first kit
    3. Own column settings panel ported from the first kit
    4. Selection across pages, the empty placeholder and the loading look
    5. Words of both families in the kit's eight-language dictionary
    6. Spec of the list on its scenarios
- **Readiness sign:** every scenario of the agreement is closed by a test or carries a reason.
- **Verified by:** `npm run -s check:specs` — no "no test" line about `table-full-port`.

### 4. Showcase

- **Steps:**
    1. Stories and `Overview` of `rt-data-table` by the coverage contract
    2. Stories and `Overview` of `rt-data-list` by the coverage contract
    3. Sweep over the stories and a look at the frames by eye
    4. Frames in the image and a second run in a row
- **Readiness sign:** the frames of both families are taken and confirmed by a second run.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — "passed" equals the total, no orphans.

### 5. Merge and hand-over

- **Steps:**
    1. The agreement merged into the kit spec
    2. The gate before the push and the push of the branch
    3. The stories shown to the owner
- **Readiness sign:** `check:specs` green without `proposed/table-full-port`, the branch on the host.
- **Verified by:** `npm run -s check:specs` — exit zero and no line about the agreement.

## What this work does not do

- The first kit's oddities are ported as is; their discussion is the owner's later word, listed in
  the agreement.
- `rt-table` and `rt-dynamic-list` are not edited; Q-DL-1 about selection in `rt-dynamic-list`
  stays open outside this family.
- Icons that the kit's map does not pair are not drawn here; extending the set is the drawer's work.
