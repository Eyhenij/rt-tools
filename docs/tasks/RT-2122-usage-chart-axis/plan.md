# Plan

**Task:** RT-2122 · **Branch:** RT-2122-usage-chart-axis
**Spec:** `docs/specs/message-bus/usage/`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                   |
| ----- | ------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/message-bus/usage/` — the rule about the digest's chart names the axis                      |
| Laws  | `docs/constitution/lists.md`, `docs/constitution/verifiability.md`                                      |
| Rules | `.claude/skills/styling-bem/`, `.claude/skills/testing/`                                                |
| Code  | `libs/message-bus-admin/usage/ui/`, `apps/message-bus-admin/src/styles/`, `apps/message-bus-admin-e2e/` |

## What counts as done

- Under the chart stand the first and the last day of the period as `ДД.ММ`; the frame `list-usage` shows them.

## Stages

### 1. The axis under the chart

- **What is done:** the digest component draws an axis row with two labels from the first and the last bar; the block `admin-digest` gets the `axis` and `axis-label` elements; the spec rule about the chart names the axis; the end-to-end scenario SC-MB-357 asserts the two labels; the frame `list-usage` re-taken.
- **Readiness sign:** the usage spec of the end-to-end suite is green with the frame re-taken; stylelint green.
- **Verified by:** `npx playwright test usage-section --update-snapshots` in `apps/message-bus-admin-e2e` — `passed`; `pnpm run lint:styles` — exit 0.

## What this work does not do

- A label per bar — thirty-one labels crowd on a narrow screen.
- A value axis — the height is a share of the highest day, and the number stands in the hint.
