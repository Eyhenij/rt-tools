# Plan

**Task:** RT-3087 · **Branch:** RT-3087-pr-unmerged-agreement
**Spec:** `docs/specs/agent-kit/delivery-agreement/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                           |
| ----- | --------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/delivery-agreement/`                      |
| Laws  | `docs/constitution/work-conduct.md`                             |
| Rules | `.claude/skills/task-flow/`                                     |
| Code  | `projects/agent-kit/assets/hooks/`, `projects/agent-kit/tests/` |

## What counts as done

- Opening a PR from a branch whose plan named a draft agreement that still lies in the branch is
  refused, and the refusal names the directory.
- A merged draft, a plan without a draft and the folder-skip bypass pass as before.
- The spec names the rule, the binding and the scenario; the guard suite is green.

## Stages

### 1. The rule and its scenario

- **Steps:**
    1. Write the subdomain spec with the rule, the binding and the scenario
    2. Add the scenario lines to the delivery guard suite
- **Readiness sign:** the new lines fail on the old guard
- **Verified by:** `bash projects/agent-kit/tests/git-guards.test.sh` — the new lines fail

### 2. The guard

- **Steps:**
    1. Refuse opening the PR while the plan's draft lies in the branch
    2. Build the package and lay it out
- **Readiness sign:** the guard suite passes whole, the laid-out copy matches the package
- **Verified by:** `bash projects/agent-kit/tests/git-guards.test.sh` — no failed line

### 3. Closing

- **Steps:**
    1. Take the task folder apart into the archive record
- **Readiness sign:** no task folder in the branch
- **Verified by:** `git ls-files docs/tasks/RT-3087-pr-unmerged-agreement` — empty output

## What this work does not do

- The merge and lifting-draft conditions.
- Agreements that no plan names.
