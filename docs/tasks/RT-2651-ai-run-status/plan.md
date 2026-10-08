# Plan

**Task:** RT-2651 · **Branch:** RT-2651-ai-run-status
**Spec:** `docs/specs/ui-kit-v2/ai-run-status/`
**Behaviour:** changes — a new component

## Task footprint

| What  | Where                                                  |
| ----- | ------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/ai-run-status/`                  |
| Code  | `projects/ui-kit-v2/src/lib/components/ai-run-status/` |

## What counts as done

- `rt-ai-run-status` draws the four states, opens the steps, and ships as its own entry point.

## Stages

### 1. The run status line

- **Steps:**
    1. Write the spec and the scenarios
    2. Write the component, the labels and the entry point
    3. Write the unit spec, the stories, CONTEXT.md and Overview.mdx
    4. Shoot the frames and look at them
- **Readiness sign:** the unit spec and the kit checks pass, the frames match the mockup
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 && node tools/visual-gate.mjs ui-kit-v2` — successful run

## What this work does not do

- The chat organism — task RT-2654.
