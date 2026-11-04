# Plan

**Task:** RT-3098 · **Branch:** RT-3098-push-gate-hooks-run-missing
**Spec:** `docs/specs/agent-kit/push-gate-ahead/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                              |
| ----- | ------------------------------------------------------------------ |
| Specs | `docs/specs/agent-kit/push-gate-ahead/`                            |
| Laws  | `docs/constitution/delivery.md`                                    |
| Rules | `.claude/skills/git-workflow/`                                     |
| Code  | `projects/agent-kit/assets/defaults/`, `projects/agent-kit/tests/` |

## What counts as done

- A push against a base that edits the guards, in a tree with no guard scenario run file, gets a
  line of the set naming the missing file.
- A push without guard edits, and a tree with the run file, get the set as before.
- The spec names the rule, the binding and the scenario; the defaults suite is green.

## Stages

### 1. The rule and its scenario

- **Steps:**
    1. Write the rule, the binding and the scenario into the push-gate-ahead spec
    2. Add the scenario lines to the defaults suite
- **Readiness sign:** the new lines fail on the old set
- **Verified by:** `bash projects/agent-kit/tests/defaults.test.sh` — the new lines fail

### 2. The set

- **Steps:**
    1. Print the line naming the missing run file when the branch edits the guards
    2. Build the package and lay it out
- **Readiness sign:** the defaults suite passes whole, the laid-out copy matches the package
- **Verified by:** `bash projects/agent-kit/tests/defaults.test.sh` — no failed line

### 3. Closing

- **Steps:**
    1. Take the task folder apart into the archive record
- **Readiness sign:** no task folder in the branch
- **Verified by:** `git ls-files docs/tasks/RT-3098-push-gate-hooks-run-missing` — empty output

## What this work does not do

- Creating a run file for the trees that lack one.
- How this tree runs its own guard suites.
