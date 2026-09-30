# Plan

**Task:** RT-2398 · **Branch:** RT-2398-table-radius
**Spec:** `docs/specs/ui-kit-v2/radius-scale/spec.md`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What     | Where                                                                         |
| -------- | ----------------------------------------------------------------------------- |
| Specs    | `docs/specs/ui-kit-v2/radius-scale/` — the table leaves the out-of-scope list |
| Rules    | `.claude/skills/component-structure/`, `.claude/skills/styling-bem/`          |
| Code     | `projects/ui-kit-v2/src/lib/components/table/` — the split, the input         |
| Tests    | `projects/ui-kit-v2/src/lib/components/radius/` — the contract test           |
| Showcase | `projects/ui-kit-v2/src/showcase/stories/` — the grid of the surfaces         |

## What counts as done

- The table component file is split, and the table specs pass unchanged.
- `<rt-table radius="lg">` rounds the card of the narrow view by the step; the wide view keeps no
  corners.
- The contract test of the input passes with the table in its list; the page of the table names
  the input in its table of inputs.
- The grid of the surfaces in the showcase shows the card of the table at every step.

## Stages

### 1. Agreement

- **Steps:**
    1. Move the table from the out-of-scope list of the radius-scale spec to a rule and a scenario
- **Readiness sign:** the spec check names no divergence of the second kit
- **Verified by:** `npm run check:specs` — the output names no divergence

### 2. The split

- **Steps:**
    1. Move the column settings of the table into a class of their own
- **Readiness sign:** the table specs pass without an edit, the linter is green
- **Verified by:** `pnpm exec nx run-many -t lint typecheck test -p @rt-tools/ui-kit-v2` — all targets succeed

### 3. The input

- **Steps:**
    1. Connect `radius` to the table and give the step to the card of the narrow view
    2. Add the table to the contract test and to the table of inputs on its page
    3. Show the card of the table at every step in the grid of the surfaces and take its frame
- **Readiness sign:** the contract test passes with the table; the frame of the grid shows the card
  at every step
- **Verified by:** `pnpm exec nx run-many -t lint typecheck test build -p @rt-tools/ui-kit-v2` — all targets succeed

### 4. Closing

- **Steps:**
    1. Run the full set of checks
- **Readiness sign:** lint, types, tests and build are green
- **Verified by:** `pnpm run check:all` — all targets succeed

## What this work does not do

- The grid of the showcase that crops a wide table at the frame edge: task RT-2399.
