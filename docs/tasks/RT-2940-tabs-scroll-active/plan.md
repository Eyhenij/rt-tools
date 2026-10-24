# Plan

**Task:** RT-2940 · **Branch:** RT-2940-tabs-scroll-active
**Spec:** `docs/specs/ui-kit-v2/tabs-scroll-active/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                         |
| ----- | ------------------------------------------------------------- |
| Specs | `docs/specs/ui-kit-v2/`                                       |
| Laws  | `docs/constitution/frontend-application.md`                   |
| Rules | `.claude/skills/angular-patterns/`, `.claude/skills/testing/` |
| Code  | `projects/ui-kit-v2/src/lib/components/tabs/`                 |

## What counts as done

- A strip opened with `activeId` on the last tab is scrolled to it, and the tab is seen whole.
- An outside change of `activeId` scrolls the strip to the new tab.
- A click scrolls the strip once, as before.
- The component test covers both cases on a narrow strip.

## Stages

### 1. The scroll and its test

- **Steps:**
    1. Write the subdomain spec with its scenarios
    2. Scroll the strip after the first render and on an outside change
    3. Cover both cases in the component test
    4. Run the kit linters, tests and build
- **Readiness sign:** the component spec passes with the two new scenarios.
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testFile=rt-tabs.component.spec.ts` — all tests pass.

## What this work does not do

- The vertical direction: it has no scroll arrows.
- A smooth scroll: the strip moves at once, as on a click.
