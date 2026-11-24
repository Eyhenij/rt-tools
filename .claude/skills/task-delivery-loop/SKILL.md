---
name: task-delivery-loop
kind: rule
law: work-conduct
description: This tree's loop of one task, loaded first on every task. A live check, two review rounds, the push set, one PR, the rules review. From request to merge: rule task-flow.
---

# Every task through a live check and two review rounds

Tree rule under `work-conduct`, over `task-flow`. Cold part, steps whole: `pitfalls.md`; guards:
`GUARDS.md`; bindings: `implementation.md`.

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
- **Every change is checked live before the first review round.** The task's subject is
  reproduced and measured; numbers in the progress.
- **Every change passes two review rounds before the push.** Fresh readers get the whole branch
  diff against its base and their inputs, never the executor's conclusions.
- **A finding is checked against the code before it is fixed.** A failing one is written off with
  its reason; a confirmed one, fixed in the branch.
- **A finding about the diff is never parked in a file.** Fixed or written off. One outside the
  plan's exit conditions goes to «not done here» and its own task; a product choice goes to
  the owner by menu first.
- **The fixes of a round go as one commit named by the round.** «… после первого/второго круга
  ревью (RT-N)»: the one place a later commit fixes an earlier one.
- **The push set runs once per branch, after round two.** Base merged in once; after green only the
  take-apart commit, then the push; a fix after the PR reruns it.
- **Unattended work keeps the loop and the night rule both.** By `autonomous-work` the owner's
  screen becomes a measurement; push and PR wait for the owner's return where it keeps all local.

## Duties of the steps

- A PR into `main` is a draft, into an epic branch ready.
- `goal-critic` never gets the plan.
- Before closing, a kit or admin change of look shows the owner address, screen, width; the turn waits.
  Texts, rules, tools: numbers in PR body.
- After a merge, the next task in the same turn.
- The executor merges only by the owner's word.

## Patterns

- `task-delivery-loop-run` — ready commands.
