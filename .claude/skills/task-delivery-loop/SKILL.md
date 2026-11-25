---
name: task-delivery-loop
kind: rule
law: work-conduct
description: This tree's loop of one task, loaded first on every task. A live check, one review round on the light path or a second by risk on the full path, the push set, one PR, the rules review. From request to merge: rule task-flow.
---

# Every task through a live check and a review

Tree rule under `work-conduct`, over `task-flow`. Cold part, steps whole: `pitfalls.md`; guards:
`GUARDS.md`; bindings: `implementation.md`.

| In the law | Here |
| --- | --- |
| work checked before it is given | the live check on the session's own stand or the showcase, with numbers in the progress |
| a reader other than the author | a review round, its roles started in one message: `qa-engineer` and `goal-critic`, on the full path `product-strategist` too |
| a finding | a defect a reviewer names with `file:line`, a failure scenario and a severity |
| the check before delivery | the push set printed by `rt_push_checks` in `.claude/rt-kit/project.sh` |
| the review of the rules | the role `skill-curator`, started in the background after the PR |

## How the law applies here

- **The skill is loaded as the first action of work on a task.** Before `task:new`, the epic, the
  branch; then `task-flow`.
- **Every task goes through the loop.** Texts, configs, hooks and an epic's first task too.
- **The path of a change is named by the command, not by the executor.** `tools/review-path.mjs`: up
  to 150 lines of code without its signs — the light path, anything else — the full one. `--plan`
  before the code, the diff before round one; the plan of the light path is short and read by no role.
- **Every change is checked live before the first review round.** The task's subject is
  reproduced and measured; numbers in the progress.
- **Every change is read by one review round before the push.** Fresh readers get the whole branch
  diff against its base and their inputs, never the executor's conclusions.
- **On the full path the second round is due by risk and reads the fixes of the first.**
  `review-path.mjs --round-two --serious <N>` answers; the answer and N go into the PR body.
- **A light plan with a full diff is refused at the push.** The whole branch is then read by three roles.
- **A finding is checked against the code before it is fixed.** A failing one is written off with
  its reason; a confirmed one, fixed in the branch.
- **A finding about the diff is never parked in a file.** Fixed or written off. One outside the
  plan's exit conditions goes to «not done here» and its own task; a product choice goes to
  the owner by menu first.
- **The fixes of a round go as one commit named by the round.** «… после первого/второго круга
  ревью (RT-N)»: the one place a later commit fixes an earlier one. A round without findings closes
  by a record in the progress under that name.
- **The push set runs beside round two.** It starts in the message of its roles, over closed texts and
  the base merged in once; nobody touches the copy meanwhile. Findings: the run is stopped, the fixes
  land, the set runs again. No fixes: after green only the record of the round and the take-apart
  commit, then the push.
- **The set waits for the round** where a change of look waits for the owner and where a light plan
  has a full diff. With no round two it runs right after the fixes of the first.
- **Unattended work keeps the loop and the night rule both.** By `autonomous-work` the owner's
  screen becomes a measurement; push and PR wait for the owner's return where it keeps all local.

## Duties of the steps

- A PR into `main` is a draft, into an epic branch ready.
- `goal-critic` never gets the plan.
- On the light path the executor fills «Точки» with the output of the signs: the demand of
  `task-flow-close` and `git-workflow-pr-body` for `product-strategist` is lifted there. Beside the set
  the role takes from the executor the signs its frame forbids: step 9.
- Before closing, a kit or admin change of look shows the owner address, screen, width; the turn waits.
  Texts, rules, tools: numbers in PR body.
- After a merge, the next task in the same turn.
- The executor merges only by the owner's word.

## Patterns

- `task-delivery-loop-run` — ready commands.
