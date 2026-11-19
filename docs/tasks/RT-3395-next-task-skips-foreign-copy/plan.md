# Plan

**Task:** RT-3395 · **Branch:** RT-3395-next-task-skips-foreign-copy
**Behaviour:** changes
**Spec:** `docs/specs/agent-kit/turn-guards/flow-script/spec.md`

## Points

- **A:** after a task is handed over, the engine stands at state 13 and demands the PR of the epic
  into the main branch while tasks of the epic have no branch yet. The turn-exit guard repeats the
  demand turn after turn; doing it would send a half-done epic to the main branch.
- **This task reaches:** exit 11 is met only when every unmerged, unblocked task of the epic other
  than the current one has a branch, and exit 12 only when every task not deferred is marked merged
  in the epic plan. Until then the engine stands at `работа-отдана`, whose action is the next task
  of the epic, or at `влито`, whose action is to merge the task PRs and mark them; never at the PR
  of the epic.
- **Sign:** the case of the epic plan on 18.11 — a task with a branch before tasks without one — is
  a test that fails today and passes after the change; so is the end of the epic — every task has a
  branch, one is not merged.
- **Milestone G of the epic:** a working day with no dead end the executor cannot leave by itself.
  The demand for the PR of the epic is such a dead end: obeying it is forbidden, ignoring it ends no
  turn.
- **Metric:** нет: ремонт выхода 11.

## Task footprint

| What  | Where |
| ----- | ----- |
| Specs | `docs/specs/agent-kit/turn-guards/flow-script/` |
| Laws  | `docs/constitution/work-conduct.md` |
| Rules | `.claude/skills/task-flow/`, `.claude/skills/epic-flow/` |
| Code (правится) | `projects/agent-kit/assets/task-flow/` |
| Code  | `projects/agent-kit/tests/` |

## What counts as done

- The scenario SC-AK-1741 stands in a test title of `task-flow-script.test.sh`, and the suite is
  green.
- The scenario SC-AK-1742 stands in a test title of the same suite.
- The article of exit 11 in the engine spec says every unmerged, unblocked task has a branch; the
  article of exit 12 says every task not deferred is marked merged.
- The package is laid out.

## Stages

### 1. Exit 11 waits for a branch of every task ahead

Rules: exit 11 is met when every unmerged, unblocked task other than the current one has a branch.

- **Steps:**
    1. The measurer of exit 11 asks a branch of every task ahead, not of the first one
       Check: `bash projects/agent-kit/tests/task-flow-script.test.sh >/dev/null && grep -rhE "^[^#]*SC-AK-1741" projects/agent-kit/tests | grep -oE 'SC-AK-17[0-9]{2}' | sort -u | wc -l | tr -d ' '` → = 1
    2. The article of exit 11 and its scenario say so
       Check: `grep -c 'every unmerged, unblocked task' docs/specs/agent-kit/turn-guards/flow-script/spec.md | tr -d ' '` → = 1
- **Readiness sign:** a task with a branch before a task without one leaves exit 11 unmet.
- **Verified by:** `bash projects/agent-kit/tests/task-flow-script.test.sh` — «0 провалов».

### 2. Exit 12 waits for every task to be merged

Rules: exit 12 is met when every task with a merged PR is marked merged in the epic plan and every
task not deferred is marked merged.

- **Steps:**
    1. The measurer of exit 12 asks every task not deferred to be marked merged
       Check: `bash projects/agent-kit/tests/task-flow-script.test.sh >/dev/null && grep -rhE "^[^#]*SC-AK-1742" projects/agent-kit/tests | grep -oE 'SC-AK-17[0-9]{2}' | sort -u | wc -l | tr -d ' '` → = 1
    2. The article of exit 12 and its scenario say so
       Check: `grep -c 'every task not deferred is marked merged' docs/specs/agent-kit/turn-guards/flow-script/spec.md | tr -d ' '` → = 1
- **Readiness sign:** every task with a branch and one of them not merged leaves exit 12 unmet, so
  the engine never reaches the PR of the epic.
- **Verified by:** `bash projects/agent-kit/tests/task-flow-script.test.sh` — «0 провалов».

### 3. The package is laid out

- **Steps:**
    1. The laid-out measurer is the package one
       Check: `tail -n +2 tools/task-flow/measure/epic.mjs | cmp -s - projects/agent-kit/assets/task-flow/measure/epic.mjs && grep -cE 'const ahead|const open' tools/task-flow/measure/epic.mjs | tr -d ' '` → = 2
- **Readiness sign:** `pnpm run agent-kit:check` is green.
- **Verified by:** `NX_DAEMON=false pnpm run -s agent-kit:check` — exit 0.

## What this work does not do

- A branch another working copy leads is not told from a branch that just exists: the tree has no
  sign of it.
- Exit 13 is not touched: with exit 12 waiting for every merge, the engine reaches it only when the
  PR of the epic is lawful.
- The action texts of `работа-отдана` and `влито` stay as they are: the first names the next task
  of the epic, the second the mark of merged tasks; the number of the next task is found in the
  epic plan.
