# Plan

**Task:** RT-2946 · **Branch:** RT-2946-tabs-scroll-resize
**Spec:** `docs/specs/ui-kit-v2/tabs-scroll-active/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                         |
| ----- | --------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/tabs-scroll-active/`    |
| Laws  | `docs/constitution/frontend-application.md`   |
| Rules | `.claude/skills/angular-patterns/`            |
| Code  | `projects/ui-kit-v2/src/lib/components/tabs/` |

## What counts as done

- With the last tab selected, tabs that grow after the first render leave the selected tab seen
  whole.
- After a person scrolls the strip by wheel, touch or an arrow, a change of tab sizes does not
  move the strip until the next selection.

## Stages

### 1. The strip follows the tab sizes

- **Steps:**
    1. Add the rules and scenarios to the subdomain spec
    2. Watch the tab sizes and put the strip back to the selected tab
    3. Cover both cases in the component test
    4. Run the kit linters, tests and build
- **Readiness sign:** the scroll spec passes with the new scenarios.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-tabs-scroll-active.spec.ts` — all tests pass.

## What this work does not do

- The vertical strip: it has no arrows.
- The `--invalid` modifier on `rt-tab-item`: the application already adapted its test.
