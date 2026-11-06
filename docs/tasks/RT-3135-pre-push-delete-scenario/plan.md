# Plan

**Task:** RT-3135 · **Branch:** RT-3135-pre-push-delete-scenario
**Behaviour:** unchanged — владелец: «на ошибку отдельный тикет и в работу»; the subject is a hook scenario, the hook is right

After it is written this file is not edited. A stage revision goes to `progress.md` as a decision
along the way.

## Task footprint

| What  | Where                                 |
| ----- | ------------------------------------- |
| Specs | `docs/specs/agent-kit/pre-push-hook/` |
| Laws  | `docs/constitution/verifiability.md`  |
| Rules | `.claude/skills/testing/`             |
| Code  | `projects/agent-kit/tests/`           |

## What counts as done

- The hook scenarios pass on this machine, whose default branch is `main`.
- The deletion scenario turns red when the hook judges a deletion.

## Stages

### 1. The fix

- **Steps:**
    1. Make the deletion scenario delete a branch that is not the current branch of the remote
    2. Check that the scenario turns red when the hook judges a deletion
- **Readiness sign:** the hook scenarios have no failure
- **Verified by:** `bash projects/agent-kit/tests/pre-push.test.sh` — no line with «FAIL»

### 2. Closing

- **Steps:**
    1. Take the task folder apart into the archive record
- **Readiness sign:** no task folder in the branch
- **Verified by:** `git ls-files docs/tasks/RT-3135-pre-push-delete-scenario` — empty output

## What this work does not do

- The hook itself is not changed: it skips a deletion as the spec says.
