# Plan

**Task:** RT-2550 · **Branch:** RT-2550-kit2-tree-selector
**Spec:** `docs/specs/ui-kit-v2/tree-selector/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                 |
| ----- | --------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/tree-selector/`, `docs/specs/ui-kit-v2/spec.md`, `docs/specs/ui-kit-v2/scenarios.md`            |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`, `docs/constitution/reuse-first.md` |
| Rules | `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/`, `.claude/skills/component-structure/`     |
| Code  | `projects/ui-kit-v2/src/lib/components/tree-selector/`, `projects/ui-kit-v2/src/lib/i18n/`                            |

## What counts as done

- `rt-tree-selector` exported from the kit and doing every rule of its spec, each scenario
  SC-UKV-677…686 covered by a test.
- The showcase has its overview, Playground and matrices, with snapshots taken and looked at.
- The owner saw the stories on :6007 and said «открывай».

## Stages

### 1. Component

- **Steps:**
    1. Write the search and draft logic with its tests
    2. Write the component with its tests
    3. Add the kit labels in eight languages
- **Readiness sign:** the selector tests are green
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=tree-selector` — every test passes

### 2. Showcase

- **Steps:**
    1. Write the wrapper, Playground and the matrices
    2. Write the overview page
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

- The row templates of the tree passed through the selector — out of scope in the spec.
- The hybrid tree of RT-2551.
