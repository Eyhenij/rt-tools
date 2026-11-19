# Plan

**Task:** RT-3404 · **Branch:** RT-3404-epic-pr-after-last-task
**Behaviour:** changes
**Spec:** `docs/specs/agent-kit/turn-guards/flow-script/spec.md`

## Points

- **A:** exit 12 wants every task not deferred marked «влито» in the epic plan. The mark is set by
  the branch of the next task, and the task merged last has none: after its merge the engine stands
  in `влито`, the turn-exit guard holds the turn, and only the owner's menu lets it go. The task
  merged last need not be the last row: a row of the middle can be merged after the rows below it.
  The word is also read on faith: «влито» on a task whose PR is still open lets the engine demand
  the PR of the epic before its time.
- **This task reaches:** a task counts merged when its PR is merged on the hosting, whatever its
  row; the word «влито» counts for a task whose merged PR the hosting does not show; a row marked
  «влито» whose PR is open keeps exit 12 unmet. The action of `влито` names the merge of the chain.
- **Sign:** an epic whose task merged last has no mark reaches `задачи-эпика-кончились` and the
  demand of the PR of the epic, whichever row it is; a task with neither a merged PR nor the mark
  keeps exit 12 unmet; a mark on a task with an open PR keeps it unmet; a fresh branch with no PR
  counts as not merged.
- **What stays:** the hosting lists the last 300 merged PRs; a task merged earlier counts by its
  mark, as before. All 13 merged tasks of this epic are within that window today.
- **Milestone G of the epic:** a working day with fewer than five refusals per hundred commands and
  no dead end the executor cannot leave by himself. The end of every epic is such a dead end today.
- **Metric:** нет: ремонт — конец эпика доходит до PR эпика без меню владельца.

## Task footprint

| What  | Where |
| ----- | ----- |
| Specs | `docs/specs/agent-kit/turn-guards/flow-script/` |
| Code (правится) | `projects/agent-kit/assets/task-flow/` |
| Code (правится) | `tools/task-flow/` |
| Code  | `projects/agent-kit/assets/patterns/` |
| Code  | `projects/agent-kit/tests/` |

## What counts as done

- Exit 12 holds by the rules of stage 1; SC-AK-1742 keeps its meaning: a task neither merged nor
  marked keeps the exit unmet.
- The action of `влито` and the pattern `task-flow-resume` carry the same words: merge the PRs of
  the chain bottom-up, mark the merged tasks by the branch of the next one.
- The spec article of exit 12 says the same as the code, and the laid-out copies match the package.
- The epic plan of RT-3302 marks RT-3392 «влито»: its PR #3411 is merged into the epic branch.
  RT-3276 stays «идёт»: it has no PR, another working copy leads it, and by the new rule it keeps
  exit 12 unmet until its work is merged — that is the truth, not a dead end.
- `measure` stops at the first unmet exit, so on a task branch it never reaches exit 12; the
  scenarios are the only measure of exit 12 here, and the PR says so.

## Stages

### 1. Exit 12 reads the merge from the hosting

Rules: a task not deferred counts merged when a merged PR of its branch is on the hosting, or its
row says «влито»; a row that says «влито» while a PR of its branch is open keeps the exit unmet;
the second case of SC-AK-1391 changes to a middle task merged last with no mark, which now meets
the exit.

- **Steps:**
    1. The task merged last with no mark meets exit 12, whatever its row
       Check: `VERBOSE=1 bash projects/agent-kit/tests/task-flow-script.test.sh | grep -cE '^  ok +host: SC-AK-1752'` → >= 2
    2. A mark on a task with an open PR keeps exit 12 unmet
       Check: `VERBOSE=1 bash projects/agent-kit/tests/task-flow-script.test.sh | grep -cE '^  ok +host: SC-AK-1753'` → >= 1
    3. A fresh branch with no PR counts as not merged
       Check: `VERBOSE=1 bash projects/agent-kit/tests/task-flow-script.test.sh | grep -cE '^  ok +host: SC-AK-1754'` → >= 1
    4. The epic plan marks RT-3392 merged
       Check: `grep -cE '^\| 11 +\| RT-3392 .*\| влито' docs/plans/checks-rework-3.md` → >= 1
- **Readiness sign:** the engine suite is green, SC-AK-1742 kept.
- **Verified by:** `bash projects/agent-kit/tests/task-flow-script.test.sh` — «0 провалов».

### 2. The action, the pattern, the spec and the layout

- **Steps:**
    1. The action of `влито` names the merge of the chain
       Check: `grep -c 'merge the PRs of the chain bottom-up' projects/agent-kit/assets/task-flow/flow.js` → >= 1
    2. The pattern `task-flow-resume` carries the same words
       Check: `grep -c 'merge the PRs of the chain bottom-up' projects/agent-kit/assets/patterns/task-flow-resume.md` → >= 1
    3. The spec article of exit 12 names the merged PR on the hosting
       Check: `grep -c 'a merged PR of its branch' docs/specs/agent-kit/turn-guards/flow-script/spec.md` → >= 1
    4. The laid-out measure reads the open PR of a marked task
       Check: `grep -c 'openPull' tools/task-flow/measure/epic.mjs` → >= 1
- **Readiness sign:** `npm run check:specs` and `pnpm run agent-kit:check` are green.
- **Verified by:** `NX_DAEMON=false pnpm run -s agent-kit:check` — exit 0.
