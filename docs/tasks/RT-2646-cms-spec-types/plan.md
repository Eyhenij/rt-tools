# Plan

**Task:** RT-2646 · **Branch:** RT-2646-cms-spec-types
**Behaviour:** unchanged — the owner's word «Довести эпик CMS»: only the types of three specs change

## Task footprint

| What  | Where                                |
| ----- | ------------------------------------ |
| Rules | `.claude/skills/ui-component-tests/` |
| Code  | `projects/cms-angular/`              |

## What counts as done

- The typecheck of `@rt-tools/cms-angular` passes, and its tests stay green.

## Stages

### 1. Type the three specs

- **Steps:**
    1. Give the three specs exact types
    2. Run the typecheck and the tests of the package
- **Readiness sign:** the typecheck prints no error
- **Verified by:** `pnpm exec nx run-many -t typecheck test -p @rt-tools/cms-angular --skip-nx-cache` — successful run

## What this work does not do

- The epic PR into main — it is re-run after this task is merged into the epic branch.
