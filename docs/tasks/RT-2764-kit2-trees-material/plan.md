# Plan

**Task:** RT-2764 · **Branch:** RT-2764-kit2-trees-material
**Spec:** `docs/specs/ui-kit-v2/tree/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                                                |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/tree/`, `docs/specs/ui-kit-v2/tree-selector/`, `docs/specs/ui-kit-v2/draggable-tree/`, `docs/specs/ui-kit-v2/hybrid-tree-selector/`                            |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`                                                                                                    |
| Rules | `.claude/skills/styling-bem/`, `.claude/skills/rt-tools-styling/`, `.claude/skills/rt-tools-storybook/`, `.claude/skills/ui-component-tests/`, `.claude/skills/component-structure/` |
| Code  | `projects/ui-kit-v2/src/lib/components/tree/`, `tree-selector/`, `draggable-tree/`, `hybrid-tree/`, `hybrid-tree-selector/`, `checkbox/`, `projects/ui-kit-v2/src/styles/`           |

## What counts as done

- Every visual value of the five trees is a `--rt-<block>-*` property whose default is today's
  value, and every existing kit frame of the showcase matches its reference.
- Under the material preset the trees draw the application's look: 32px rows with a 6px radius and
  5px between them, a 46px indent with a line, the arrow and the checkbox in the primary colour, a
  16px checkbox, 10px between the mark and the name, the match on #ffeb3b in semibold, a count pill,
  «Select all» in 14px/500; the draggable tree with an 8px radius, a shadow on hover, a handle on
  hover and 2px drop lines.
- `rt-tree` and `rt-draggable-tree` take `emptyIcon`; `rt-tree` takes `nodeEndTemplate` and
  `nodeMetaTemplate`; the selector takes a template under the search, passes `rtTreeNodeEnd` and
  `rtTreeNodeMeta` to the inner tree, and switches the match highlight by `matchHighlight`.
- The material look and the new inputs are shown in stories, and the whole snapshot set passes.

## Stages

### 1. Agreement

- **Steps:**
    1. Write the rules and scenarios for the new inputs, the slot and the material look
    2. Bind every new rule to code in the companion files
- **Readiness sign:** the spec check passes with the new scenarios in it
- **Verified by:** `pnpm run -s check:specs` — exit code 0

### 2. Properties with today's values

- **Steps:**
    1. Move every visual value of the trees into block properties with today's values
    2. Run the whole snapshot set against the existing references
- **Readiness sign:** every frame of the set matches, the kit look has not moved
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — no failed snapshot

### 3. Inputs and slots

- **Steps:**
    1. Add the empty icon, the node template inputs, the slot under the search, the pass-through and the highlight flag
    2. Write the specs on them by the scenario numbers
- **Readiness sign:** the new specs pass, the types and the linter are clean
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=tree` — every test passed

### 4. Material look

- **Steps:**
    1. Add the material blocks to the trees and the missing scale step
    2. Run the token and style checks
- **Readiness sign:** the token checks and the style linter pass
- **Verified by:** `pnpm run check:tokens-styles` — no divergence

### 5. Showcase and snapshots

- **Steps:**
    1. Write the material and preset stories and update the overview input tables
    2. Re-take the material halves and take the new references after reading them
    3. Run the whole snapshot set
- **Readiness sign:** the overview tables match the inputs, every snapshot passes
- **Verified by:** `node tools/visual-gate.mjs ui-kit-v2` — no failed snapshot

## What this work does not do

- The checkbox and the radio get no material look of their own: only the tree sets the box size.
- The search field and the buttons of the selector keep the look of the kit's input and button.
- The live check in the browser — the main session does it with the owner.
- The push and the PR — the owner's step.
