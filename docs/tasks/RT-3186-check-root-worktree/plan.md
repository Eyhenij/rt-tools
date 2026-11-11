# Plan

**Task:** RT-3186 · **Branch:** RT-3186-check-root-worktree
**Spec:** `docs/specs/agent-kit/work-guard/spec.md`
**Behaviour:** changes

## Points

- **A:** a session started in one tree and working in a second working copy of the same repository
  gets every edit there refused by the plan guard, even after the task folder is taken apart by a
  commit of the branch; resolving a merge conflict there is refused too.
- **This task reaches:** in a second working copy the plan guard judges the history of that copy:
  an edit after the folder is taken apart passes, a conflict of a standing merge is resolved.
- **Sign:** `bash projects/agent-kit/tests/task-flow-guard.test.sh` — the scenarios SC-AK-1336 and
  SC-AK-1337 pass, and they fail on the code before the edit.
- **Milestone G of the epic:** none — work outside an epic by the owner's word.

## Task footprint

| What  | Where                                                                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specs | `docs/specs/agent-kit/work-guard/`                                                                                                                            |
| Laws  | `docs/constitution/work-conduct.md`                                                                                                                           |
| Rules | `.claude/skills/task-flow/`                                                                                                                                   |
| Code  | `projects/agent-kit/assets/defaults/project.sh`, `projects/agent-kit/assets/hooks/task-flow-context.sh`, `projects/agent-kit/assets/hooks/task-flow-guard.sh` |
| Tests | `projects/agent-kit/tests/task-flow-guard.test.sh`                                                                                                            |

## What counts as done

- `rt_is_app_code_default` changes no variable of the guard that calls it.
- A relative path named by a command is resolved against the working copy the command runs in, not
  against the tree the session started in.
- A path in a second working copy of the same repository is judged as application code of that
  copy; a path in another repository or outside any is not.
- In a second working copy an edit after the folder is taken apart passes, and a file in conflict
  of a standing merge is resolved.

## Stages

### 1. Agreement

- **Steps:**
    1. Rule about the second working copy in the work-guard spec
    2. Scenarios SC-AK-1336 and SC-AK-1337 in the work-guard scenarios
- **Readiness sign:** the rule and both scenarios stand in the spec.
- **Verified by:** `npm run check:specs` — no divergences.

### 2. Code and tests

- **Steps:**
    1. Scenarios in the guard test fail on the old code
    2. The profile default keeps its variables to itself and knows a second working copy
    3. The guard context and the merge exception resolve paths against the working copy of the call
    4. The guard test passes whole
- **Readiness sign:** the guard test passes, the two new scenarios included.
- **Verified by:** `bash projects/agent-kit/tests/task-flow-guard.test.sh` — the last line names no
  failure.

### 3. Closing

- **Steps:**
    1. Bindings in the work-guard companion
    2. Layout and the push gate set
    3. The task folder taken apart into the archive
    4. PR into main
- **Readiness sign:** the set is green and the PR is open.
- **Verified by:** `pnpm run agent-kit:check` — the layout matches the package.

## What this work does not do

- Other guards that take `CLAUDE_PROJECT_DIR` as the tree root (the push gate, the skill gate, the
  delivery guard) are not touched: the delivery law says the call goes from the copy the session
  stands in, and the push gate refuses a foreign copy on purpose.
