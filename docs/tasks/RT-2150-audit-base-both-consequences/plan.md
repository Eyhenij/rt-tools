# Plan

**Task:** RT-2150 · **Branch:** RT-2150-audit-base-both-consequences
**Behaviour:** unchanged — владелец: правка проверки пакета и её описания, кода приложений нет

## Task footprint

| What  | Where                                                           |
| ----- | --------------------------------------------------------------- |
| Code  | `projects/agent-kit/assets/checks/check-board.github.mjs`       |
| Tests | `projects/agent-kit/tests/checks-board.test.sh`                 |
| Specs | `docs/specs/agent-kit/board/{spec,scenarios,implementation}.md` |

## What counts as done

- The audit prints one line for the open PRs whose base is not the main branch, with their
  count and both consequences — no run, no closing by the host — and how the task closes then;
  the line is not a divergence, and a tree without such PRs gets no line.
- The silence per request of SC-AK-845 stays; a new scenario covers the line.

## Stages

### 1. The line, the scenario and the binding

- **What is done:** the counter and the line in `check-board.github.mjs`; scenario SC-AK-1107 in
  the board suite; the rule, the scenario and the binding in `docs/specs/agent-kit/board/`.
- **Readiness sign:** the board suite is green with more probes, the specs check counts one more
  covered scenario.
- **Verified by:** `bash projects/agent-kit/tests/checks-board.test.sh | tail -1` — «0 провалов» with the count above 81 (before: 81 ok); `npm run check:specs | grep check-specs:` — «scenarios 1588 — covered 1440» (before: 1587 — 1439).

## What this work does not do

- It does not bring back a line per request: RT-2066 removed it for a reason that still holds.
