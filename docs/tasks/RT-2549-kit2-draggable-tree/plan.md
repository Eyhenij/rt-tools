# Plan

**Task:** RT-2549 · **Branch:** RT-2549-kit2-draggable-tree
**Draft:** `docs/specs/ui-kit-v2/proposed/draggable-tree/`
**Behaviour:** changes

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                                             |
| ----- | ------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/proposed/draggable-tree/`, `docs/specs/ui-kit-v2/tree/` (read)              |
| Laws  | `docs/constitution/frontend-application.md`, `reuse-first.md`, `verifiability.md`                 |
| Rules | `rt-tools-storybook`, `rt-tools-styling`, `styling-bem`, `angular-patterns`, `ui-component-tests` |
| Code  | `projects/ui-kit-v2/src/lib/components/draggable-tree/`                                           |

## What counts as done

- `rt-draggable-tree` orders nodes of `IRtTree.Node` by dragging and by Alt with an arrow, never
  changes the nodes passed in, and every scenario SC-UKV-654 … SC-UKV-663 has its test.
- The showcase shows it by `Playground` and matrices in the preset pair; the owner looked and said
  «открывай».

## Stages

### 1. The logic

- **Steps:**
    1. Write `rt-draggable-tree.logic.ts`: `rtDragPlace`, `rtDragAllowed`, `rtDragMove`, `rtDragKeyPlace`.
    2. Write `rt-draggable-tree.logic.spec.ts` for SC-UKV-654 … SC-UKV-658.
- **Readiness sign:** the logic tests pass.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=src/lib/components/draggable-tree --skip-nx-cache` — «Tests:» with no failed.

### 2. The component

- **Steps:**
    1. Write `rt-draggable-tree.component.ts`, `.html`, `.scss` and the row template directive.
    2. Export the folder from the components barrel and write `CONTEXT.md`.
    3. Write `rt-draggable-tree.component.spec.ts` for SC-UKV-659 … SC-UKV-663.
- **Readiness sign:** the component tests pass and the package types check.
- **Verified by:** `pnpm exec nx run @rt-tools/ui-kit-v2:typecheck --skip-nx-cache` — «Successfully ran target typecheck».

### 3. The showcase

- **Steps:**
    1. Write the stories with `Playground` and the matrices, and `Overview.mdx`.
    2. Run the story sweep over the raised showcase.
    3. Give the owner the links to the stories on :6007.
    4. Take the snapshots after the owner's look and look at every frame.
- **Readiness sign:** the sweep finds no empty showing; the owner said «открывай».
- **Verified by:** `pnpm run test:stories:v2` — «There are no empty showings».

### 4. Closing

- **Steps:**
    1. Merge the agreement into `docs/specs/ui-kit-v2/draggable-tree/` and name it in the domain index.
    2. Run the spec check and the full set before the push.
- **Readiness sign:** the spec check is green and the push gate lets the branch through.
- **Verified by:** `npm run check:specs` — exit code 0.

## What this work does not do

- Marks and a choice in the draggable tree — the owner's «Нет».
- Dragging between two trees, a search term.
- The native checkbox of `rt-multiselect` — a finding of RT-2548, its own task.
