# Grill

**Описание фичи:** не нужно — правка одного правила выхода 11 в спеке движка `docs/specs/agent-kit/turn-guards/flow-script/`, правило и сценарий правятся на месте этой задачей.

## The owner request

> продолжай работу по эпику

The owner's standing order for the epic RT-3302. The task card (issue #3395) was filed from the
session on 18.11.2026: the turn-exit guard demanded the PR of the epic into the main branch eight
times in a row while three tasks of the epic plan stood «впереди».

## What the tree already has

- **The measurer.** `projects/agent-kit/assets/task-flow/measure/epic.mjs:nextTaken` takes the first
  row of the epic plan that is not merged, not the current task and not blocked, and meets exit 11
  when that row has a branch, local or on the server.
- **What went wrong.** On the branch of RT-3283, and again on RT-3332, the first such row was
  RT-3276. Its branch exists locally and on the server, so exit 11 was met, exit 12 too, and the
  engine stood at state 13, whose only action is the PR of the epic. RT-3352, RT-3392 and RT-3401
  had no branch at all.
- **The card's premise does not hold.** The card says the branch of RT-3276 is led by another
  working copy. `git worktree list` on 19.11.2026 names no copy on that branch: a branch led
  elsewhere cannot be told from a branch that just exists.
- **Specs and tests.** Exit 11 is the article «Exit 11 is met by the branch of the next unblocked
  task of the epic, and with no such task» in `docs/specs/agent-kit/turn-guards/flow-script/`,
  scenarios SC-AK-1388…1390 in `projects/agent-kit/tests/task-flow-script.test.sh`.

## What the rules already say

The rule `task-flow`: in `работа-отдана` the mandatory action is the next task of the epic, and the
next is taken from the epic plan. The rule `epic-flow`: the PR of the epic opens after all its tasks
are merged.

## Questions and answers

None: the owner told the executor to decide himself («делай всё сам»), and the data answer the
question.

## Decisions

- **Exit 11 is met when every unmerged, unblocked task other than the current one has a branch.** A
  row with a branch before a row without one no longer meets it. Rejected: skipping a task whose
  branch another copy leads — the tree cannot tell such a branch, and RT-3276 is led by none now.

- **Exit 12 is met only when every task not deferred is marked merged in the epic plan.** The roles
  `product-strategist` and `goal-critic` showed that the fix of exit 11 alone moves the dead end to
  the end of the epic: once every task has a branch, exits 11 and 12 are met while tasks are not
  merged, and state 13 demands the PR of the epic again. No delivery guard refuses that PR.
  Rejected: an edit of exit 13 — state 13 is the last one, and its action is the PR of the epic.

## What is left unclear

None.
