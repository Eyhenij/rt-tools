# Grill

**Описание фичи:** не нужно — правка движка хода работы; статьи спеки `docs/specs/agent-kit/turn-guards/flow-script/` правятся на месте этой задачей.

## The owner request

> продолжай работу по эпику

The owner's standing order for the epic RT-3302; the task is row 14 of the epic plan. The card
(issue #3404) was filed by the role `product-strategist` while it checked RT-3395: when the last
task of an epic is merged, the engine does not reach the PR of the epic. Exit 12 wants every task
not deferred marked «влито» in the epic plan; the mark is set by the branch of the next task, and
the last task has none. The engine stands in `влито`, and the turn-exit guard holds the turn.

## What the tree already has

- **The exit.** `projects/agent-kit/assets/task-flow/measure/epic.mjs:mergedMarked` — every task with
  a merged PR is marked merged in the plan, and every row not deferred is marked merged.
- **The merged PRs.** `host.mergedPulls()` gives the merged PRs of the epic by their head branch;
  `taskOfBranch` takes the task number from it.
- **The rows.** `epic-text.mjs` reads the plan table: `merged` is the word «влито», `deferred` is
  «отложено».
- **The scenarios.** SC-AK-1391 (marked tasks meet the exit; an unmarked merged task does not) and
  SC-AK-1742 (a task not merged keeps the exit unmet), in `projects/agent-kit/tests/task-flow-script.test.sh`.
- **The action.** The state `влито` in `projects/agent-kit/assets/task-flow/flow.js` says «mark the
  task merged in the epic plan by the branch of the next task».

## What the rules already say

`task-flow-resume`: a merged task is marked «влито» in the epic plan by the branch of the next
task. The epic branch carries no edits of its own, so the last task has nowhere to be marked.

## Questions and answers

None: the owner told the executor to decide himself («делай всё сам»), and the card names the
technique and the scenarios.

## Decisions

- **A task counts merged when its PR is merged on the hosting.** The word in the plan is required
  only of a task that has a next task not deferred; the last one is judged by the hosting alone.
- **A row marked «влито» whose PR is not merged keeps the exit unmet.** The word in the plan does
  not stand ahead of the hosting.
- **The action of `влито` names the merge:** merge the PRs of the chain bottom-up, mark the merged
  tasks by the branch of the next one. The same text goes into `task-flow-resume`.

## What is left unclear

- A task closed without a PR of its own (folded into another) — whether its row is deferred or
  marked otherwise; the plan of the epic today has none such.
