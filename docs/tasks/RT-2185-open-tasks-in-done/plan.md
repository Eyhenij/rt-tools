# Plan

**Task:** RT-2185 · **Branch:** RT-2185-open-tasks-in-done
**Behaviour:** unchanged — the edit touches the rules package and the board checks; no application code

## Task footprint

| What  | Where                               |
| ----- | ----------------------------------- |
| Specs | `docs/specs/agent-kit/board/`       |
| Rules | `.claude/skills/git-workflow/`      |
| Code  | `projects/agent-kit/assets/checks/` |
| Tests | `projects/agent-kit/tests/`         |

## What counts as done

- The queue audit names an open task standing in a closing column, one line per task, and says
  what closes it.
- A body that mentions an epic mid-sentence is no longer read as a declaration of belonging; the
  shapes the creating command writes still are.
- The seven tasks in «Done» are closed, and the audit no longer names them.

## Stages

### 1. The audit names an open task in a closing column

- **What is done:** the closing columns are read from the settings; the queue audit reports an
  open task whose card stands in one of them.
- **Readiness sign:** the scenario set of the board check passes, the new scenario among it; the
  live audit prints seven such lines.
- **Verified by:** `bash projects/agent-kit/tests/checks-board.test.sh` — «0 провалов»;
  `npm run check:board` — seven lines with the numbers of the stuck tasks.

### 2. The epic declaration is read by the shape of the line

- **What is done:** the declaration is recognised at the start of a line, at most after one word;
  the mention inside a sentence is not.
- **Readiness sign:** the epic-base scenarios pass, including the new one about prose.
- **Verified by:** `bash projects/agent-kit/tests/guard-epic-base.test.sh` — «0 провалов».

### 3. The seven tasks are closed and the tree texts are brought up to date

- **What is done:** the tasks whose work is merged are closed with a comment naming the PR; the
  rule and the spec of the board carry the new article and its binding.
- **Readiness sign:** the audit prints no line about a closing column; `npm run check:specs`
  counts the new scenario.
- **Verified by:** `npm run check:board` — no such lines; `npm run check:specs` — the scenario
  count grew by the added ones.
