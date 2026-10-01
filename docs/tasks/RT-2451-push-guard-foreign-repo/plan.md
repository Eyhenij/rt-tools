# Plan

**Task:** RT-2451 · **Branch:** RT-2451-push-guard-foreign-repo
**Spec:** `docs/specs/agent-kit/delivery-tree/spec.md`
**Behaviour:** changes

## Task footprint

| What  | Where                                                                                                                                                                            |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/delivery-tree/`                                                                                                                                            |
| Laws  | `docs/constitution/delivery.md` — read, not edited                                                                                                                               |
| Rules | `.claude/skills/git-workflow/` — the line about the second copy                                                                                                                  |
| Code  | `projects/agent-kit/assets/hooks/git-guard-push-tests.sh`, `projects/agent-kit/assets/hooks/git-guard-delivery-tree.sh`, `projects/agent-kit/assets/hooks/git-guard-delivery.sh` |
| Tests | `projects/agent-kit/tests/git-guard-push-tests.test.sh`, `projects/agent-kit/tests/git-guards.test.sh`                                                                           |

## What counts as done

- A push from a second copy of the same repository is still refused.
- A push from a directory of another repository passes the push guard.
- Branch creation in another repository asks the task of that repository's profile; in a second
  copy of the same repository — of the session profile, as before.
- Every statement has a scenario in the spec and a test; the three guard suites are green.
- The PR into `main` is open with the reviewer, the task is in review.

## Stages

### 1. The same repository is told by the shared `.git` directory

- **Steps:**
    1. Push guard: a second copy is the same shared `.git` directory with another root; another repository is not judged
    2. Delivery guard: the task state and the branch form are asked of the tree of execution when it is another repository
    3. Tests for both guards: a real second copy refused, another repository passes
- **Readiness sign:** all three suites print `0 провалов`
- **Verified by:** `bash projects/agent-kit/tests/git-guard-push-tests.test.sh && bash projects/agent-kit/tests/git-guards.test.sh && bash projects/agent-kit/tests/git-guards-readiness.test.sh` — each prints `0 провалов`

### 2. Texts, layout and delivery

- **Steps:**
    1. The spec, scenarios and binding of `delivery-tree` brought up to the fix
    2. Changelog line, layout of the package into the tree
    3. Folder taken apart, push, PR into `main`, task moved to review
- **Readiness sign:** the layout audit is green and the PR is open with the reviewer
- **Verified by:** `pnpm run agent-kit:check` — exit code 0

## What this work does not do

- The base and signature checks at branch creation still read the session copy: for another
  repository the base named by the command is unknown there and is not judged.
- The release of the package: it runs after the owner merges both package tasks.
