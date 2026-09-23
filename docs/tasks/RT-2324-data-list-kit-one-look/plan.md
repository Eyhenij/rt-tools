# Plan

**Task:** RT-2324 · **Branch:** RT-2324-data-list-kit-one-look
**Draft:** `docs/specs/ui-kit-v2/proposed/data-list-kit-one-look/`
**Behaviour:** changes

The branch stands on `RT-1882-kit-settings-theme`: the shared theme wrapper of the showcase was
rewritten there, and its PR #2323 is not merged yet. The PR of this task has that branch as base.

## Task footprint

| What  | Where                                                                                                                                                                               |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/table-full-port/`, `docs/specs/ui-kit-v2/snapshots/`                                                                                                          |
| Laws  | `docs/constitution/verifiability.md`, `docs/constitution/reuse-first.md`                                                                                                            |
| Rules | `rt-tools-storybook`, `ui-component-tests-visual`, `rt-tools-styling`, `styling-bem`                                                                                                |
| Code  | `projects/ui-kit-v2/src/lib/components/data-list/`, `projects/ui-kit-v2/src/lib/components/data-table/`, `projects/ui-kit-v2/src/assets/icons/`, `projects/ui-kit-v2/src/showcase/` |
| Tools | `tools/kit-shot-pairs.json`                                                                                                                                                         |

## What counts as done

- The theme stories of both families are readable on a narrow canvas: nothing of one pane lies over
  another, measured.
- Every icon of the family has the glyph of the first kit, or a reason why not stands in the spec.
- The column settings panel keeps `rt-aside` and draws its content as `rt-table-config-aside` of the
  first kit: heading with a subline, two toggles, a draggable list with an eye button per item.
- `tools/kit-shot-pairs.json` pairs the family with the first kit's table frames, and the pairs are
  shown to the owner.

## Stages

### 1. The divergences measured and the agreement written

- **Steps:**
    1. The overlap in the theme stories measured on a narrow canvas
    2. The icons of both kits listed glyph against glyph
    3. The settings panel of both kits compared element by element
    4. The agreement written in `proposed/data-list-kit-one-look`
- **Readiness sign:** the agreement lies and names every divergence with its decision.
- **Verified by:** `npm run check:specs` — the line `docs/specs/ui-kit-v2/proposed/data-list-kit-one-look` with its scenarios.

### 2. The theme stories do not overlap

- **Steps:**
    1. The pane of the theme wrapper keeps its content inside
    2. The fix measured on a narrow canvas
- **Readiness sign:** on a narrow canvas no node of a pane goes past the pane's right edge.
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — the run passes, the re-taken frames named one by one.

### 3. The icons take the first kit's glyphs

- **Steps:**
    1. Missing glyphs drawn into the kit set
    2. The family's icon mapping switched to them
- **Readiness sign:** the toolbar, the cell and the settings panel draw the first kit's glyphs.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2` — the suite passes.

### 4. The settings panel content looks as in the first kit

- **Steps:**
    1. The panel content rebuilt by the first kit's layout inside `rt-aside`
    2. The tests of the panel brought to the new markup
- **Readiness sign:** the panel draws heading, subline, two toggles and a draggable list with an eye button.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2` — the suite passes.

### 5. The paired frames

- **Steps:**
    1. The family's references re-taken after being looked at
    2. The pairs written into `tools/kit-shot-pairs.json`
- **Readiness sign:** the family has its pairs, and the owner has seen them.
- **Verified by:** `node tools/check-kit-shot-pairs.mjs` — «paired 2».

## What this work does not do

- New functions of the table or the list.
- Anything from material.
- The side menu of the first kit — RT-1883.
- Edits of the first kit itself: the epic plan forbids them.
