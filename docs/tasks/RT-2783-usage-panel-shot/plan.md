# Plan

**Task:** RT-2783 · **Branch:** RT-2783-usage-panel-shot
**Behaviour:** unchanged — a test scenario waits for what it shoots; the admin itself is not touched

## Task footprint

| What  | Where                                                  |
| ----- | ------------------------------------------------------ |
| Code  | `apps/message-bus-admin-e2e/src/usage-section.spec.ts` |
| Rules | `.claude/skills/testing/`                              |

## What counts as done

- SC-MB-350 waits for the digest chart before it clicks a row.
- The admin suite passes whole three runs in a row.

## Stages

### 1. The scenario waits for the chart

- **Steps:**
    1. Add the wait for the 31 digest bars before the row click
    2. Run the admin suite whole three times
- **Readiness sign:** three full runs of the admin suite pass
- **Verified by:** `pnpm exec nx run message-bus-admin-e2e:e2e --skip-nx-cache` — `146 passed`
  three times

## What this work does not do

- It does not retake the baseline frame.
