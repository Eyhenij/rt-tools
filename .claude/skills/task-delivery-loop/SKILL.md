---
name: task-delivery-loop
kind: rule
law: work-conduct
description: This tree's loop of one task, loaded first on every task. A live check on the stand or the showcase, two review rounds by three roles with the fixes, the push set, then one PR and the rules review. The course from request to merge is rule task-flow.
---

# Every task through a live check and two review rounds

A rule of this tree under the law `docs/constitution/work-conduct.md`, on top of `task-flow`.
Cold part: `pitfalls.md` — the steps, the moves after the owner's answer, what never happens.
Ready commands are in the pattern `task-delivery-loop-run`, guards in `GUARDS.md`, bindings in
`implementation.md`.

## What it is called here

| In the law | Here |
| --- | --- |
| work checked before it is given | the live check on the session's own stand or the showcase, with numbers in the progress |
| a reader other than the author | a review round: `qa-engineer`, `product-strategist` and `goal-critic`, started in one message |
| a finding | a defect a reviewer names with `file:line`, a failure scenario and a severity |
| the check before delivery | the push set printed by `rt_push_checks` in `.claude/rt-kit/project.sh` |
| the review of the rules | the role `skill-curator`, started in the background after the PR |

## How the law applies here

- **The skill is loaded as the first action of work on a task.** Before `task:new`, the epic and
  the branch; then `task-flow`.
- **The loop has no exceptions.** Texts, configs, hooks and the task that opens an epic too.
- **Every change is checked live before the first review round.** Reproduced, measured, numbers
  in the progress.
- **Every change passes two review rounds before the push.** Fresh readers of the whole branch
  diff, without the executor's conclusions.
- **A finding is checked against the code before it is fixed.** One that fails is written off with
  its reason.
- **A finding about the diff is never parked in a file.** Fixed or written off; one beside the
  subject gets its own task, a product choice goes to the owner by menu.
- **The fixes of a round go as one commit named by the round.** «… после первого круга ревью
  (RT-N)», then «второго круга».
- **The push set runs once per branch, after round two.** Nothing is touched until the push; a fix
  after the PR runs it again.
- **Unattended work keeps the loop and the night rule both.** The show becomes a measurement; push
  and PR wait where `autonomous-work` keeps work local.
- **No guard counts the rounds.** The round commits and the PR body show them.

## Duties of the steps

- A PR into `main` opens as a draft, one into an epic branch ready.
- `goal-critic` never gets the plan.
- `skill-curator` runs in the background after the PR.
- A screen is shown to the owner before closing; a text change puts numbers in the PR body.
- After a merge the next task is taken in the same turn.

## Patterns

- `task-delivery-loop-run` — the calls of every step.
