# Plan

**Task:** RT-3097 · **Branch:** RT-3097-turn-exit-own-notification
**Spec:** `docs/specs/agent-kit/turn-guards/exit/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                           |
| ----- | --------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/turn-guards/exit/`                        |
| Laws  | `docs/constitution/work-conduct.md`                             |
| Rules | `.claude/skills/turn-conduct/`                                  |
| Code  | `projects/agent-kit/assets/hooks/`, `projects/agent-kit/tests/` |

## What counts as done

- An empty turn woken by a notification about the session's own background task passes the guard
  while another own background task still runs.
- The same turn after the last own background task finished is refused as before.
- The spec names the rule, the binding and the scenario; the guard suite is green.

## Stages

### 1. The rule and its scenario

- **Steps:**
    1. Write the rule, the binding and the scenario SC-AK-1247 into the spec of the guard
    2. Add the scenarios of the waking notification to the guard suite
- **Readiness sign:** the new scenarios fail on the old guard
- **Verified by:** `bash projects/agent-kit/tests/turn-exit-guard.test.sh` — the new SC-AK-1247 lines fail

### 2. The guard

- **Steps:**
    1. Teach the parser the waking notification and the own background tasks still running
    2. Release the empty turn in the guard by that sign, build the package and lay it out
- **Readiness sign:** the guard suite passes whole, the laid-out copy matches the package
- **Verified by:** `bash projects/agent-kit/tests/turn-exit-guard.test.sh` — no failed line

### 3. Closing

- **Steps:**
    1. Take the task folder apart into the archive record
- **Readiness sign:** no task folder in the branch
- **Verified by:** `git ls-files docs/tasks/RT-3097-turn-exit-own-notification` — empty output

## What this work does not do

- The case «a question to the owner, and the guard refuses again» — it has no reproduction yet.
- RT-3067, where the guard drives to the next task while the plan says to wait.
