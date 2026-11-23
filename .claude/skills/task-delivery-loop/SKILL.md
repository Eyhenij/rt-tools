---
name: task-delivery-loop
kind: rule
law: work-conduct
description: This tree's loop of one task, loaded first on every task. A live check on the stand or the showcase, two review rounds by three roles with the fixes, the push set, then one PR and the rules review. The course from request to merge is rule task-flow.
---

# Every task through a live check and two review rounds

A tree rule under `work-conduct`, on top of `task-flow`. Cold part, the steps whole: `pitfalls.md`;
guards: `GUARDS.md`; bindings: `implementation.md`.

| In the law | Here |
| --- | --- |
| work checked before it is given | the live check on the session's own stand or the showcase, with numbers in the progress |
| a reader other than the author | a review round: `qa-engineer`, `product-strategist` and `goal-critic`, started in one message |
| a finding | a defect a reviewer names with `file:line`, a failure scenario and a severity |
| the check before delivery | the push set printed by `rt_push_checks` in `.claude/rt-kit/project.sh` |
| the review of the rules | the role `skill-curator`, started in the background after the PR |

## How the law applies here

- **The skill is loaded as the first action of work on a task.** Before `task:new`, the epic, the
  branch; then `task-flow`.
- **The loop has no exceptions.** Texts, configs, hooks and an epic's first task too.
- **Every change is checked live before the first review round.** The task's subject is reproduced and measured; numbers
  in the progress.
- **Every change passes two review rounds before the push.** Fresh readers get the branch diff,
  their inputs, never the executor's conclusions.
- **A finding is checked against the code before it is fixed.** One that fails is written off with
  its reason; a confirmed one, fixed in the branch.
- **A finding about the diff is never parked in a file.** Fixed or written off. One named by no
  exit condition of the plan goes to «not done here» and its own task; a product choice
  goes to the owner by menu before the fix.
- **The fixes of a round go as one commit named by the round.** «… после первого/второго круга
  ревью (RT-N)»: the one place a later commit of a branch corrects an earlier one.
- **The push set runs once per branch, after round two.** Base merged in once, nothing touched
  until the push; a fix after the PR reruns it.
- **Unattended work keeps the loop and the night rule both.** The owner's screen becomes the
  session's measurement; push and PR wait for the owner.
- **No guard counts the rounds.** Nor the live check: the gate demands the loop loaded; round
  commits and PR body words show the rest.

## Duties of the steps

- A PR into `main` is a draft, into an epic branch ready.
- `goal-critic` never gets the plan.
- The owner sees a screen before closing; texts, numbers in the PR body.
- After a merge, the next task in the same turn.
- The executor merges only what the owner said to merge.

## Patterns

- `task-delivery-loop-run` — ready commands.
