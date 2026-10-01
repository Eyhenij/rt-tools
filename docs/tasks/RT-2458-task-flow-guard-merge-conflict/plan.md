# Plan

**Task:** RT-2458 · **Branch:** RT-2458-task-flow-guard-merge-conflict
**Behaviour:** unchanged — a guard of the rules layer, not application code; the owner chose «Починить сторожа»

## Task footprint

| What  | Where                                                                                                        |
| ----- | ------------------------------------------------------------------------------------------------------------ |
| Specs | `docs/specs/agent-kit/work-guard/`                                                                           |
| Rules | `.claude/skills/git-workflow-merge/` (read only)                                                             |
| Code  | `projects/agent-kit/assets/hooks/task-flow-guard.sh`, `projects/agent-kit/assets/hooks/task-flow-context.sh` |
| Tests | `projects/agent-kit/tests/task-flow-guard.test.sh`                                                           |

## What counts as done

- During a merge with conflicts, an edit of a file in conflict passes the guard on a branch with no
  task folder.
- A code file not in conflict is refused in the same merge, as before.
- With no merge in progress nothing changes.

## Stages

### 1. The exception in the guard

- **Steps:**
    1. Expose all candidate paths from the context and let the guard pass when a merge is in progress and every code path of the call is unmerged
    2. Scenarios SC-AK-1177 and SC-AK-1178 in the spec and in the test suite
- **Readiness sign:** the guard suite is green, the new scenarios included
- **Verified by:** `bash projects/agent-kit/tests/task-flow-guard.test.sh` — the last line names zero failures

### 2. Layout and checks

- **Steps:**
    1. Lay out the package and audit the layout
    2. Run the spec and doc checks
- **Readiness sign:** the laid-out guard matches the source, the checks are green
- **Verified by:** `pnpm run agent-kit:check` — exits 0

## What this work does not do

- The merge of main into the epic itself — it follows in the epic branch once this is merged.
