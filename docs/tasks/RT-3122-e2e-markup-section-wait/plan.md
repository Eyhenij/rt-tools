# Plan

**Task:** RT-3122 · **Branch:** RT-3122-e2e-markup-section-wait
**Behaviour:** unchanged — владелец: «исправляй тест»; the subject is the end-to-end suite

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                |
| ----- | ------------------------------------ |
| Specs | `docs/specs/message-bus/`            |
| Laws  | `docs/constitution/verifiability.md` |
| Rules | `.claude/skills/testing/`            |
| Code  | `apps/message-bus-admin-e2e/`        |

## What counts as done

- The cause of the fall is named by a trace of a reproduced fall, not by a guess.
- The markup suite repeated many times on the stand passes without a fall.

## Stages

### 1. Reproduction

- **Steps:**
    1. Run the markup suite repeated on the stand until it falls
    2. Read the trace of the fall and name the cause
- **Readiness sign:** the cause is written in the progress with the trace that shows it
- **Verified by:** `pnpm exec nx run message-bus-admin-e2e:e2e -- src/markup-text.spec.ts --repeat-each=10` — a fall with a trace in `apps/message-bus-admin-e2e/test-results/`

### 2. The fix

- **Steps:**
    1. Fix the cause
    2. Run the markup suite repeated on the stand
- **Readiness sign:** the repeated suite passes without a fall
- **Verified by:** `pnpm exec nx run message-bus-admin-e2e:e2e -- src/markup-text.spec.ts --repeat-each=10` — «passed», no «failed»

### 3. Closing

- **Steps:**
    1. Take the task folder apart into the archive record
- **Readiness sign:** no task folder in the branch
- **Verified by:** `git ls-files docs/tasks/RT-3122-e2e-markup-section-wait` — empty output

## What this work does not do

- The visual difference of the first kit in run 42031108766 — another step and another cause.
