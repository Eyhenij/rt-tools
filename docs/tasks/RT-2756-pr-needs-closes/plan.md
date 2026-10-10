# Plan

**Task:** RT-2756 · **Branch:** RT-2756-pr-needs-closes
**Spec:** `docs/specs/agent-kit/delivery-gate/`

## Task footprint

| What  | Where                                                                                                                                 |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/delivery-gate/`                                                                                                 |
| Rules | `projects/agent-kit/assets/patterns/git-workflow-pr-body.github.md`                                                                   |
| Code  | `projects/agent-kit/assets/hooks/git-guard-delivery.sh`, `projects/agent-kit/assets/defaults/project.sh`, `.claude/rt-kit/project.sh` |
| Tests | `projects/agent-kit/tests/git-guards.test.sh`                                                                                         |

## What counts as done

- Opening a PR whose body lacks the link line with the branch's task number is refused, when the
  tree named the sample; a tree that named none is not judged.

## Stages

### 1. The guard demands the link line

- **Steps:**
    1. Add the sample variable to the package defaults and to this tree's profile
    2. Read the body once and judge the link line in the delivery guard
    3. Add the scenarios to the spec and the tests
    4. Name the requirement in the PR body pattern
    5. Build and lay out the package
- **Readiness sign:** the hook scenarios pass, the new ones among them
- **Verified by:** `bash projects/agent-kit/tests/git-guards.test.sh` — no line with `FAIL`

## What this work does not do

- PR numbers written from memory in an epic body are not checked: nothing reads the body against
  the hosting.
