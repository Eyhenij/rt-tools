# Plan

**Task:** RT-2757 · **Branch:** RT-2757-merge-reads-ci
**Spec:** `docs/specs/agent-kit/delivery-gate/`

## Task footprint

| What  | Where                                                                                   |
| ----- | --------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/delivery-gate/`                                                   |
| Rules | `projects/agent-kit/assets/patterns/git-workflow-pr-ready.md`                           |
| Code  | `projects/agent-kit/assets/checks/board.github.mjs`, `projects/agent-kit/assets/hooks/` |
| Tests | `projects/agent-kit/tests/git-guards.test.sh`                                           |

## What counts as done

- A merge command on a PR whose tip run is red or still going is refused; a PR without a run passes.

## Stages

### 1. The merge reads the run

- **Steps:**
    1. Add the run on the tip to the PR state
    2. Refuse the merge command on a red or unfinished run
    3. Add the scenarios to the spec and the tests
    4. Name the reading of the run before a click in the pattern
    5. Build and lay out the package
- **Readiness sign:** the hook scenarios pass, the new ones among them
- **Verified by:** `bash projects/agent-kit/tests/git-guards.test.sh` — `0 провалов`

## What this work does not do

- A click on the hosting's merge button is not seen by any guard; it is held by the pattern.
