# Plan

**Task:** RT-2548 · **Branch:** RT-2548-kit2-tree
**Draft:** `docs/specs/ui-kit-v2/proposed/tree/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                                                                           |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/proposed/tree/`, `docs/specs/ui-kit-v2/option-tree/` (read, shared logic)                                                                                                                 |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/reuse-first.md`, `docs/constitution/verifiability.md`                                                                                           |
| Rules | `.claude/skills/component-structure/`, `.claude/skills/styling-bem/`, `.claude/skills/rt-tools-styling/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/`, `.claude/skills/testing/` |
| Code  | `projects/ui-kit-v2/src/lib/components/tree/` (new), `projects/ui-kit-v2/src/lib/components/index.ts`, `projects/ui-kit-v2/src/lib/components/select/rt-select-tree.ts` (read only)                             |

## What counts as done

- `rt-tree` is exported from the public entry of the second kit and keeps every rule of the agreement.
- Every scenario SC-UKV-639 … SC-UKV-651 has a test with its id in the title, and the tests pass.
- The stories show every axis — mode, cascade, select-all, disabled, search, empty, row template —
  on :6007, the story sweep finds no empty frame, and the snapshots of the new stories are taken.
- The owner looked at the stories and said «открывай».

## Stages

### 1. Model and pure logic

- **Steps:**
    1. Declare `IRtTree` in `rt-tree.model.ts`: the node, the mode, the mark.
    2. Write `rt-tree.logic.ts`: `rtTreeChoose`, `rtTreeMark`, `rtTreeSelectAll`, `rtTreeLabelParts` over the select tree module.
    3. Write `rt-tree.logic.spec.ts` for SC-UKV-639 … SC-UKV-643, SC-UKV-645, SC-UKV-647 by the logic.
- **Readiness sign:** the logic tests pass.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-tree.logic.spec.ts --skip-nx-cache` — the line `Tests:` with only `passed`.

### 2. The component

- **Steps:**
    1. Write `rt-tree.component.ts`, `.html`, `.scss` and `rt-tree.directives.ts` with the row template directive.
    2. Export the folder from the components barrel.
    3. Write `rt-tree.component.spec.ts` for every scenario through the drawn component.
    4. Write `CONTEXT.md` and `Overview.mdx` next to the component.
- **Readiness sign:** the component tests pass, the docs check of the kit is green, lint and types are green.
- **Verified by:** `pnpm exec nx run-many -t test lint typecheck verify -p @rt-tools/ui-kit-v2 --skip-nx-cache` — every target `Successfully ran`.

### 3. Showcase

- **Steps:**
    1. Write the stories of `rt-tree` with a matrix per axis.
    2. Run the story sweep over the raised showcase.
    3. Take the snapshots of the new stories and look at every frame.
    4. Give the owner the links to the stories on :6007.
- **Readiness sign:** the sweep is green and the new snapshots are taken; the owner answered.
- **Verified by:** `pnpm run test:stories:v2` — no story named as empty or broken.

### 4. Closing

- **Steps:**
    1. Merge the agreement into `docs/specs/ui-kit-v2/tree/` and name it in the domain index.
    2. Run the spec check and the full set before the push.
- **Readiness sign:** the spec check is green.
- **Verified by:** `npm run check:specs` — no divergence line.

## What this work does not do

- The dragging tree, the multiselect «Apply» mode and the rest of the epic — their own tasks.
- No change to `rt-select` and `rt-multiselect`: their tree module is used as it is.
