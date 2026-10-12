# Plan

**Task:** RT-2788 · **Branch:** RT-2788-kit2-tooltip-keep-on-click
**Spec:** `docs/specs/ui-kit-v2/tooltip-keep-on-click/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/ui-kit-v2/tooltip-keep-on-click/`, `docs/specs/ui-kit-v2/spec.md`                          |
| Laws  | `docs/constitution/frontend-application.md`, `docs/constitution/verifiability.md`                      |
| Rules | `.claude/skills/angular-patterns/`, `.claude/skills/testing/`                                          |
| Code  | `projects/ui-kit-v2/src/lib/components/tooltip/`, `projects/ui-kit-v2/src/lib/components/icon-button/` |

## What counts as done

- With `rtTooltipHideOnClick` false a click leaves an open tooltip open; by default it hides it.
- A new `[rtTooltip]` text shows in an open panel without a new hover.
- A tap (mouseenter and click together) shows no tooltip with either value.
- `rt-icon-button` passes `tooltipHideOnClick` through.

## Stages

### 1. The spec and the directive

- **Steps:**
    1. Write the subdomain spec with scenarios from SC-UKV-850
    2. Add the input, the click handler and the text effect to the directive
    3. Pass the input through rt-icon-button
    4. Write the tests by the scenarios
- **Readiness sign:** the tooltip and icon-button specs pass, the scenarios are covered
- **Verified by:** `pnpm exec nx test @rt-tools/ui-kit-v2 --testPathPattern='tooltip|icon-button'` — `Tests:` line without `failed`

### 2. Texts, showcase and checks

- **Steps:**
    1. Update CONTEXT.md and Overview.mdx of the tooltip and the icon button
    2. Add a story of a toggle that keeps its tooltip
    3. Run typecheck, lint and the spec audit
    4. Commit the work
- **Readiness sign:** typecheck, lint and check:specs are green
- **Verified by:** `pnpm exec nx run @rt-tools/ui-kit-v2:typecheck` — exit code 0

## What this work does not do

- `rt-menu-item` gets no passthrough: a menu closes on a click of its item.
- No push and no PR before the owner's «открывай».
