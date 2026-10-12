# Plan

**Task:** RT-2791 · **Branch:** RT-2791-kit2-toolbar-select-width
**Spec:** `docs/specs/ui-kit-v2/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                            |
| ----- | ------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/spec.md`                   |
| Laws  | `docs/constitution/verifiability.md`             |
| Rules | `.claude/skills/ui-component-tests/`             |
| Code  | `projects/ui-kit-v2/src/lib/components/toolbar/` |

## What counts as done

- A select in the left bar of the toolbar sizes by its content; a search input keeps 400px.
- The admin end-to-end suite is green.

## Stages

### 1. The toolbar rule and its checks

- **Steps:**
    1. Limit the field width rule to rt-input
    2. Update the toolbar CONTEXT.md and the spec history
    3. Run the admin end-to-end suite and the showcase frames
    4. Commit the work
- **Readiness sign:** the admin end-to-end suite passes whole
- **Verified by:** `pnpm exec nx run message-bus-admin-e2e:e2e` — no `failed` line

## What this work does not do

- The other branches of the epic go to the host by their own steps after this one.
