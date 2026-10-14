# Plan

**Task:** RT-2831 · **Branch:** RT-2831-bottom-sheet-tokens
**Behaviour:** unchanged — the look of the sheet does not change, only where the two values are declared. Подтверждено владельцем: «делай всё сам».

## Task footprint

| What  | Where                                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/`                                                                                                   |
| Laws  | `docs/constitution/reuse-first.md`                                                                                        |
| Rules | `.claude/skills/rt-tools-styling/`                                                                                        |
| Code  | `projects/ui-kit-v2/src/lib/components/bottom-sheet/`, `tools/tokens-handles.json`, `projects/ui-kit-v2/docs/Theming.mdx` |

## What counts as done

- `node tools/check-tokens-graph.mjs` and `node tools/check-tokens-styles.mjs` pass.
- The frames of the bottom sheet do not differ from the references.
- The branch is pushed through the gate.

## Stages

### 1. Declare the two values

- **Steps:**
    1. Add the footer border width as an own property of the block and use it in the footer.
    2. Name the panel height cap as a handle in the handles list and in the table of the theming page.
    3. Run the two token checks.
- **Readiness sign:** both token checks are green.
- **Verified by:** `node tools/check-tokens-graph.mjs` — exits with code 0.

## What this work does not do

- It does not change the footer behaviour or its look.
- It does not touch the dependency tasks of the epic.
