# Plan

**Task:** RT-3273 · **Branch:** RT-3273-push-checks-leave-session
**Behaviour:** unchanged — «исправляй флоу проверок чтобы не гонять лишнее»: the work moves checks of the rules package, no application code is touched

Rewritten on 13.11.2026 by the owner's word: «Исключи пункт выноса в раннер проверок. Ты … должен
проверять это все в течение сессии … должен укладываться в лимиты». The first version moved the heavy
steps to the pipeline; the owner rejected it before any of its steps was done.

## Points

- **A:** the push set runs 25–40 minutes inside the session and runs steps the change does not need.
- **This task reaches:** the set runs only the steps a changed file needs, each within its measured
  time, and refuses when a step goes over.
- **Sign:** the set on a branch with a real change: every step it ran has a file reason, and no step
  went over its limit. The owner reads the step list and the seconds in its output.
- **Milestone G of the epic:** an epic of several tasks reaches `main` with no repeated questions to
  the owner and no false refusals.
- **Metric:** minutes of the push set — down, baseline 34 minutes on RT-3280.

## Task footprint

| What  | Where                                                               |
| ----- | ------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/push-gate-ahead/`                             |
| Laws  | `docs/constitution/delivery.md`, `docs/constitution/verifiability.md` |
| Rules | `.claude/skills/git-workflow/`, `.claude/skills/testing/`           |
| Code  | `projects/agent-kit/assets/hooks/`, `.claude/rt-kit/`               |

## What counts as done

- The builder steps count what changed from the base of the branch, not from `main`.
- A change of the snapshot harness or of kit specs runs no snapshots and no application suite.
- A change of scenario files alone runs those files alone.
- A step that passed over its measured limit refuses the push.
- One set on this branch ran only steps with a file reason, each within its limit.

## Stages

### 1. Only the steps a change needs

- **Steps:**
    1. Bring the base of the builder steps, the step selection by subject and the narrowed scenario run onto this branch
    2. Commit the time limit of a set step with its scenarios
- **Readiness sign:** the scenarios of the step selection and of the time limit are green
- **Verified by:** `bash projects/agent-kit/tests/tree-push-checks.test.sh` — the last line reads «0 расхождений»

### 2. One set within its limit

- **Steps:**
    1. Run the set on this branch and read every step and its seconds
- **Readiness sign:** the set is green, and its output names no step over its limit
- **Verified by:** `bash .claude/hooks/git-guard-push-ahead.sh` — the last line reads «the set is green»

## What this work does not do

- Moving the heavy steps to the pipeline: rejected by the owner.
- Snapshots of touched stories only, scenarios of a changed hook only, scenarios in parallel: next
  tasks of the epic, each measured on its own.
