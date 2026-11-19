# Grill

**Описание фичи:** не нужно — правка движка хода работы; статьи спеки `docs/specs/agent-kit/turn-guards/flow-script/` правятся на месте этой задачей.

## The owner request

> продолжай работу по эпику

The owner's standing order for the epic RT-3302; the task is row 13 of the epic plan. The card
(issue #3401) was filed in RT-3332: when the plan commit of a task is rebuilt after the owner's
approval, the engine cannot write the approval mark again. `plan-red` wants every check of the plan
red now, and after the work they are green. The branch stands on «plan not approved», and the
engine itself cannot be fixed, since an engine edit needs the same mark.

## What the tree already has

- **The command.** `projects/agent-kit/assets/checks/flow-plan.mjs:runPlanRed` takes the plan by
  `planOfBranch` (the commit that added `plan.md`), runs every check by `runCheck` in the current
  directory and refuses when any check matches. A mark of the same plan commit and fingerprint is
  reused without a run (SC-AK-1738).
- **The run.** `projects/agent-kit/assets/checks/flow-step.mjs:runCheck` spawns `bash -c` with no
  working directory of its own: the check sees the tree as it is now.
- **The fixed case.** SC-AK-1738 says a mark of another commit makes the checks run and be refused
  green — that is exactly the dead end of the card.
- **The manual way out.** On RT-3332 and RT-3395 the mark was written by running the engine on the
  tree of the plan commit in a temporary worktree.

## What the rules already say

`task-flow-plan`: every step of the plan carries a check whose expected output is taken from a run
while the plan is written. A check green before the work measures nothing — that is why `plan-red`
wants them red; red is a statement about the tree of the plan commit, not about the current tree.

## Questions and answers

None: the owner told the executor to decide himself («делай всё сам»), and the card names the
technique and the sign of readiness.

## Decisions

- **`plan-red` runs the checks on the tree of the plan commit**, in a temporary worktree it makes
  and removes itself; the dependencies directory of the repository is linked into it, so a check
  that calls a tool finds it. The result does not depend on when the command runs.
- **The reuse of a prior mark stays**: the same plan commit and fingerprint give the stored red
  output without a run.
- **A worktree that cannot be made is a refusal with its reason**, not a run on the current tree.

## What is left unclear

- Whether a check that needs a built output (`dist/`) stays red on the plan tree for the reason it
  names — the plan of such a step is judged by the run itself.
