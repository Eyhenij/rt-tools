# Plan

**Task:** RT-2295 · **Branch:** RT-2295-epic-base-guard-local-branch
**Behaviour:** unchanged — the edit touches the rules layer, not the application

## Task footprint

| What  | Where                                                        |
| ----- | ------------------------------------------------------------ |
| Specs | `docs/specs/agent-kit/delivery-gate/`                        |
| Rules | `.claude/skills/git-workflow/`                               |
| Code  | `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh` |
| Tests | `projects/agent-kit/tests/guard-epic-base.test.sh`           |

## What counts as done

- A task branch is created from a local epic branch that already carries the tip of the main
  branch, while the remote copy of that epic branch does not carry it yet.
- A base that carries the tip of neither is refused as before.
- The suite of the epic base runs green, and the specs audit exits with zero.

## Stages

### 1. The guard reads the base, not only the remote copy of the epic branch

- **Steps:**
    1. Read `rt_epic_base` and the two ancestor checks in it.
    2. Let the lag refusal stand down when the base named by the command already carries the tip
       of the main branch.
- **Readiness sign:** the refusal about the lag does not fire on such a base.
- **Verified by:** `bash projects/agent-kit/tests/guard-epic-base.test.sh` — the line of results
  ends with «0 провалов».

### 2. The case and the scenario

- **Steps:**
    1. Write the case into the suite: the remote epic branch lags, the base carries the main tip.
    2. Add the scenario to `docs/specs/agent-kit/delivery-gate/scenarios.md` and bind it.
- **Readiness sign:** the new scenario is bound to the case by its number.
- **Verified by:** `node tools/check-specs.mjs` — it exits with zero and names no divergence.

## What this work does not do

- The list of the uniformity check stays untouched: the row of the talks list is rewritten by
  task RT-2293.
- The refusal of the push gate is not edited: it is right, and the code behind it is fixed by
  that same task.
