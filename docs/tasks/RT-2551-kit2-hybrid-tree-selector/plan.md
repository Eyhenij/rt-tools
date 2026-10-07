# Plan

**Task:** RT-2551 · **Branch:** RT-2551-kit2-hybrid-tree-selector
**Spec:** `docs/specs/ui-kit-v2/hybrid-tree-selector/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                       |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/hybrid-tree-selector/`, `docs/specs/ui-kit-v2/spec.md`                                                                                |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`, `docs/constitution/reuse-first.md`                                       |
| Rules | `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/`, `.claude/skills/component-structure/`                                           |
| Code  | `projects/ui-kit-v2/src/lib/components/hybrid-tree/`, `projects/ui-kit-v2/src/lib/components/tree/`, `projects/ui-kit-v2/src/lib/components/tree-selector/` |

## What counts as done

- `rt-hybrid-tree` and `rt-hybrid-tree-selector` exported from the kit and doing every rule of their
  spec, each scenario from SC-UKV-691 on covered by a test.
- `rt-tree` and `rt-tree-selector` keep their look: their snapshots match without a re-take.
- The showcase has an overview, Playground and matrices of both, with snapshots taken and looked at.
- The owner saw the stories on :6007 and said «открывай».

## Stages

### 1. Components

- **Steps:**
    1. Write the single-group logic with its tests
    2. Open the tree and the selector to heirs without changing them
    3. Write both components with their tests
- **Readiness sign:** the tests of both trees and both selectors are green
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=tree` — every test passes

### 2. Showcase

- **Steps:**
    1. Write the wrappers, Playground and the matrices
    2. Write the overview pages
    3. Take the snapshots and look at them
- **Readiness sign:** the showcase checks are green
- **Verified by:** `node tools/verify-ui-kit-v2-docs.cjs` — exit code 0

### 3. Agreement and checks

- **Steps:**
    1. Bind the spec rules in the companion and the indexes
    2. Run the full check set
    3. Show the stories to the owner
- **Readiness sign:** the spec check is green and the owner said «открывай»
- **Verified by:** `npm run check:specs` — exit code 0

## What this work does not do

- The report builder's field order by click and its domain groups — the application keeps them.
- A group selectable as a whole inside a single group — the application has none.
