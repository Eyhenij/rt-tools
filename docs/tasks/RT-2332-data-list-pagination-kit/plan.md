# Plan

**Task:** RT-2332 · **Branch:** RT-2332-data-list-pagination-kit
**Spec:** `docs/specs/ui-kit-v2/table-material-theme/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                     |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/table-material-theme/`                                                                                              |
| Rules | `.claude/skills/reuse-first/`, `.claude/skills/rt-tools-styling/`, `.claude/skills/rt-tools-storybook/`                                   |
| Code  | `projects/ui-kit-v2/src/lib/components/pagination/`, `projects/ui-kit-v2/src/lib/components/data-list/`, `projects/ui-kit-v2/src/styles/` |

## What counts as done

- The list of the first kit draws the kit's `rt-pagination`; `rt-data-list-pagination` is gone from the tree.
- In the material preset the page strip matches the first kit by measurement. The boxes are 34 px with a 1 px border and a 12 px radius. The current page is filled grey with white text. There is no range label, and the page size field is 48 × 32.
- In the kit's own look `rt-pagination` draws as before: its frames outside the material preset do not move.

## Stages

### 1. The kit's page strip learns the first kit's look

- **Steps:**
    1. Give `rt-pagination` its own properties for the page box, the current page, the arrows, the range label and the page size field, defaults equal to today's values
    2. Give the material preset `--rt-pagination-*` values measured from the first kit
    3. Show the pair of presets in the page strip's stories
- **Readiness sign:** the material half of the page strip matches the first kit by measurement, the own half is unchanged.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/components/pagination` — «Tests:» with no failed

### 2. The list draws the kit's page strip

- **Steps:**
    1. Put `rt-pagination` into the list in place of its own strip, with the list's page sizes and the first kit's page after a size change
    2. Remove `rt-data-list-pagination` with its spec and the logic nothing calls any more
    3. Move the list's specs to the kit strip's anchors
- **Readiness sign:** the list's specs pass on `rt-pagination`, and a search for `rt-data-list-pagination` finds nothing.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/components/data-list` — «Tests:» with no failed

### 3. Frames, texts and handing over

- **Steps:**
    1. Look at the diverged frames and re-take them in the image
    2. Move the page strip from «out of scope» to the rules of the spec, with its binding
    3. Open the PR into RT-2330 as a draft
- **Readiness sign:** the image run matches all frames on the second pass, the spec check is green, the PR is open.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — «Snapshots:» with no failed

## What this work does not do

- The filter fields, the row «+» button, the font and the table heights — they wait for the owner's answer in RT-2330.
