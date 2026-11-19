# Grill

**Описание фичи:** не нужно — правка двух чтений движка и проверки правок в спеке движка `docs/specs/agent-kit/turn-guards/flow-script/`, правила и сценарии правятся на месте этой задачей.

## The owner request

> продолжай работу по эпику

The owner's standing order for the epic RT-3302; the task is row 10 of the epic plan. The card
(issue #3352) was filed by the role `goal-critic` on the plan of RT-3271: the engine of the course
of work still looks for the owner's words in the session records in two places, and an answer given
in a menu or on another machine is not found, so the step stands.

## What the tree already has

- **The replacement of a step check.** `projects/agent-kit/assets/checks/flow-step.mjs:replacedCheck`
  takes a line `- **Check of step N.M replaced:** \`cmd\` → expected · the owner's word: «quote»` of
  the progress and refuses the step when no message the owner typed holds the quote; `prepareStep`
  searches the records of every working copy (`openRecords().said`).
- **The owner's step in the epic plan.** `projects/agent-kit/assets/task-flow/measure/epic.mjs`:
  `blocked` skips a row «шаг владельца «quote»» only when the owner typed the quote; `ownerStep`
  is met when the row of the current task names such a step and the owner has not typed it, and
  `checks/flow-verdict.mjs:menuCause` then names the owner's menu.
- **The window.** RT-3271 made the epic-stop guard answer `ask` from the decision table
  (`checks/decision-table.json`, `hooks/decide.sh`): the host shows «allow / deny» on the command.
- **Who writes both lines.** The progress and the epic plan are edited only by the edit tool: a
  shell write is refused by `checks/flow-guard.mjs:judgeCall`, and the hook `flow-step-guard.sh`
  hands every edit of them to the engine.

## What the rules already say

`task-flow`: what needs the owner's word is taken from a list, not appraised. The exit article: a
deferral marks the task «отложено», «сделаю сам» marks the owner's step, and the next unblocked
task is taken.

## Questions and answers

None: the owner told the executor to decide himself («делай всё сам»), and the card names the
technique.

## Decisions

- **The owner confirms at the edit, not after it.** An edit of the progress that adds or changes a
  replacement line, and an edit of the epic plan that sets or changes «шаг владельца» on a row, get
  the decision `ask`: the owner sees the window on that edit. An allowed edit is the owner's word,
  so the engine reads no quote. Rejected: a window on the run of `step N.M` — the run before the PR
  (`step --done --pr`) goes inside the hook of `gh pr create` and has no window of its own.
- **A replacement line without a quote is valid.** The old form with «the owner's word: «…»» is
  still read; the quote is ignored.
- **A row naming the owner's step is blocked.** The measurer `ownerStep` is left with no case: a row
  is written only with the owner's yes, and «the owner has not said it» no longer happens. It goes
  away with its menu cause; a refused step still names the menu by `measure.session.forbidden`.
- **The stop word stays.** It is a stop, not a consent, and the owner ordered it apart.
- **«отложено» is not touched.** It is judged by the owner's last word naming the task
  (`judgeDeferral`), not by `owner.said`, and the card does not name it.

## What is left unclear

- Whether the host shows the window in the auto mode on an Edit call — the documentation of the
  hooks says `ask` shows it; a live call is not checked in this tree.
