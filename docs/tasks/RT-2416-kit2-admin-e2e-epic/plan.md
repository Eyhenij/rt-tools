# Plan

**Task:** RT-2416 · **Branch:** RT-2416-kit2-admin-e2e-epic
**Behaviour:** unchanged — only an end-to-end test and a reference change; the owner gave the epic whole: «выполняй задачи друг за другом»

## Task footprint

| What  | Where                             |
| ----- | --------------------------------- |
| Specs | `docs/specs/message-bus/`         |
| Rules | `.claude/skills/testing/`         |
| Code  | `apps/message-bus-admin-e2e/src/` |

## What counts as done

- SC-MB-359 and SC-MB-148 are green on the epic branch.
- The whole admin end-to-end suite is green.

## Stages

### 1. The option is measured by its label

- **Steps:**
    1. Measure lines and width by the option label
    2. Run the filter test
- **Readiness sign:** SC-MB-359 is green.

### 2. The sign-in reference

- **Steps:**
    1. Re-take the dark sign-in reference and look at it
    2. Run the whole end-to-end suite
- **Readiness sign:** the suite is green.
