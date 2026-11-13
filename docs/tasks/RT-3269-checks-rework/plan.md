# Plan

**Task:** RT-3282 · **Branch:** RT-3269-checks-rework
**Behaviour:** unchanged — «Делай эти правки сейчас, без задачи»: the edit touches the push guard and the set of checks, not application code

## Points

- **A:** the full set before a push runs on every branch, 25–40 minutes, a branch equal to `main`
  included.
- **This task reaches:** a branch that adds nothing to its base is pushed with no set; a text
  commit runs the checks of texts and of the tree only; a heavy step runs when its paths changed.
- **Sign:** the scenarios of the push guard and the time of the set on a text commit.
- **Milestone G of the epic:** an epic of several tasks reaches `main` with no false refusals.
- **Metric:** нет: набор шёл целиком на ветке без изменений кода.

## Task footprint

| What  | Where                                              |
| ----- | -------------------------------------------------- |
| Rules | `.claude/skills/git-workflow/`                     |
| Code  | `projects/agent-kit/assets/hooks/`                 |
| Code  | `.claude/rt-kit/project.sh`                        |
| Code  | `projects/agent-kit/tests/`                        |

## What counts as done

- A push of a branch with no commit over the base on the server passes with no check run.
- The run ahead on such a branch prints one line and ends.
- The set on a commit of texts alone holds no end-to-end suite, no frames and no image build.

## Stages

### 1. A branch that adds nothing is pushed with no set

- **Steps:**
    1. Read the push guard and the run ahead
    2. Add the early exit to both and its scenarios
    3. Lay the hooks out
- **Readiness sign:** the scenarios of the push guard end with no failed line.
- **Verified by:** `bash projects/agent-kit/tests/git-guard-push-tests.test.sh` — the last line names zero failures.

### 2. The heavy steps are chosen by the changed paths

- **Steps:**
    1. Read the profile function of the set
    2. Choose the heavy steps by the changed paths and print the skipped ones
    3. Run the set on a commit of texts alone
- **Readiness sign:** the set on a commit of texts alone ends in under two minutes.
- **Verified by:** `bash .claude/hooks/git-guard-push-ahead.sh` — the verdict line is green and no heavy step is named.

## What this work does not do

- Moving the set out of the session into the pipeline: task RT-3273.
