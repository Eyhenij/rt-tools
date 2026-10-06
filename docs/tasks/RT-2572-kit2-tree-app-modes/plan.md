# Plan

**Task:** RT-2572 · **Branch:** RT-2572-kit2-tree-app-modes
**Spec:** `docs/specs/ui-kit-v2/tree/`
**Behaviour:** changes

The agreement is written straight into the domain specs of `rt-tree` and `rt-tag`: both are in
force, and the task adds rules to them rather than a new feature.

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                                                                       |
| ----- | ------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/tree/`, `docs/specs/ui-kit-v2/tag/`                                   |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/reuse-first.md`             |
| Rules | `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/`                  |
| Code  | `projects/ui-kit-v2/src/lib/components/tree/`, `projects/ui-kit-v2/src/lib/components/tag/` |

## What counts as done

- `rt-tree` has `branchMarks`, `exclusive`, `filter`, node `badges` and the `rtTreeNodeMeta` slot,
  each with a rule and a scenario in its spec and a test.
- `rt-tag` marks the words of its `highlight` input in the label.
- The showcase shows every new axis under both presets, the owner looked at it, the frames are
  taken.

## Stages

### 1. The logic

- **Steps:**
    1. Write `rtTreeChooseAlone` and the word cut of the label, description and badges in `rt-tree.logic.ts`.
    2. Write the rules and the scenarios of the logic into the tree spec, with tests in `rt-tree.logic.spec.ts`.
- **Readiness sign:** the logic tests pass.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-tree.logic` — «Tests:» with no failed.

### 2. The tag marks

- **Steps:**
    1. Add the `highlight` input to `rt-tag` with its rule, scenario and test.
- **Readiness sign:** the tag tests pass.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-tag` — «Tests:» with no failed.

### 3. The component

- **Steps:**
    1. Add `branchMarks`, `exclusive`, `filter`, the badges and the `rtTreeNodeMeta` slot to `rt-tree`.
    2. Write the component scenarios and tests in `rt-tree.component.spec.ts`.
- **Readiness sign:** the tree tests and the typecheck pass.
- **Verified by:** `pnpm exec nx run @rt-tools/ui-kit-v2:typecheck` — «Successfully ran target typecheck».

### 4. The showcase

- **Steps:**
    1. Add the new axes to the tree and tag stories and to both `Overview.mdx`.
    2. Run the story sweep over the raised showcase.
    3. Give the owner the links to the stories on :6007.
    4. Take the snapshots after the owner's look and look at every frame.
- **Readiness sign:** the sweep is green and the frames are taken.
- **Verified by:** `pnpm run test:stories:v2` — «There are no empty showings and no drawing errors».

### 5. Closing

- **Steps:**
    1. Run the spec check and the full set before the push.
- **Readiness sign:** both green.
- **Verified by:** `pnpm run check:all` — «Successfully ran targets».

## What this work does not do

- The application's own move to `value` instead of `checked` on nodes — the application does it.
- Text `info` at the row end and hidden leaf marks — no call site of the application uses them.
- `rt-multiselect`'s browser checkboxes — the first findings part names them as a task of their own.
