# Plan

**Task:** RT-2653 · **Branch:** RT-2653-prompt-suggestion
**Spec:** `docs/specs/ui-kit-v2/prompt-suggestion/`
**Behaviour:** changes — a new component

## Task footprint

| What  | Where                                                      |
| ----- | ---------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/prompt-suggestion/`                  |
| Code  | `projects/ui-kit-v2/src/lib/components/prompt-suggestion/` |

## What counts as done

- `rt-prompt-suggestion` emits its label on click, is disabled by input, ships as its own entry point.

## Stages

### 1. The suggestion card

- **Steps:**
    1. Write the spec and the scenarios
    2. Write the component and the entry point
    3. Write the unit spec, the stories, CONTEXT.md and Overview.mdx
    4. Shoot the frames and look at them
- **Readiness sign:** the unit spec and the kit checks pass, the frames match the mockup
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 && node tools/visual-gate.mjs ui-kit-v2` — successful run

## What this work does not do

- The empty state of the chat — task RT-2654.
