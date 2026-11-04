# Plan

**Task:** RT-3090 · **Branch:** RT-3090-main-branch-setting
**Spec:** `docs/specs/agent-kit/delivery-tree/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                           |
| ----- | --------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/delivery-tree/`                           |
| Laws  | `docs/constitution/delivery.md`                                 |
| Rules | `.claude/skills/agent-kit/`                                     |
| Code  | `projects/agent-kit/assets/hooks/`, `projects/agent-kit/tests/` |

## What counts as done

- A tree whose profile names `develop` refuses a commit into `develop` and lets one into `main`
  through, with no remote repository.
- A tree whose profile names nothing keeps the former guessing.
- The spec names the rule, the binding and the scenario; the suite is green.

## Stages

### 1. The rule and its scenario

- **Steps:**
    1. Write the rule, the binding and the scenario into the delivery-tree spec
    2. Add the scenario suite of the main-branch guard
- **Readiness sign:** the new lines fail on the old guard
- **Verified by:** `bash projects/agent-kit/tests/git-guard-main.test.sh` — the new lines fail

### 2. The guard

- **Steps:**
    1. Read the main branch from the tree profile in the guard
    2. Build the package and lay it out
- **Readiness sign:** the suite passes whole, the laid-out copy matches the package
- **Verified by:** `bash projects/agent-kit/tests/git-guard-main.test.sh` — no failed line

### 3. Closing

- **Steps:**
    1. Take the task folder apart into the archive record
- **Readiness sign:** no task folder in the branch
- **Verified by:** `git ls-files docs/tasks/RT-3090-main-branch-setting` — empty output

## What this work does not do

- The other guards that already read the setting.
