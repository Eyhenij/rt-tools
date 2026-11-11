# epic-flow — what is its own here

The names and bindings of this tree, next to the rule `SKILL.md` beside it.

## What it is called here

- **In the rule** — Here
- **the epic plan** — `docs/plans/<subject>.md` — the directory was started before the rule and is in use
- **the table of assignments** — `.claude/rt-kit/assignments.md` in the main branch; the name of the copy lies in `.claude/rt-kit/tree-name` outside history

## Where it lives

- **The epic plan** — `docs/plans/`, named by the key `plansDir` in `.claude/rt-kit/checks.json`: the creation command lays the draft of a plan there
- **The table of assignments** — `.claude/rt-kit/assignments.md`

## How the law applies here

- **An epic here is a card with the `epic` label and a file in `docs/plans/`.** The card says the
  epic exists, the file holds the order of the tasks and the branch.

## Where the articles are carried out

- **Work begins with the epic, and a task outside one is not taken.** — `tools/task-new.mjs:outsideEpic` — the creation command refuses a task named by no epic and names both ways out: the number of the epic or the word of the owner about work outside one. What is created past the command is named by `tools/board-epics.mjs:checkTasksOutsideEpics`: a card made through the web reaches no guard, and the audit reads it on the board.
- **A task of an epic is linked to the epic card as a sub-issue, not only named in the plan.** — `tools/task-new.mjs:subId` — the numeric id of the created task is asked of the hosting, and the link is posted right after the task lands on the board. The card of the epic is read by `tools/task-new.mjs:epicOfCard`. What is created past the command, and every task created before this order came in, is named by `tools/board-epics.mjs:checkEpicSubIssues`: it reads the makeup from the plan and asks the hosting for the links of the epic card. The list comes in pages of thirty, and it is asked with the paging sign: read by the first page alone, the audit named six linked tasks of the epic «Один кит» unlinked.
- **The epic card moves to in progress by the same turn that takes its first task.** — `tools/board.mjs:moveTask` — the same call as for a task, on the epic number. Nothing reads the epic card's column at branch creation, and the queue audit does not judge it.
- **The epic branch is taken before the first task of the epic, not with it.** — `tools/board-epics.mjs:checkEpicState` — the audit names an epic whose branch shows in no request, neither one from it nor one into it. The delivery guard `.claude/hooks/git-guard-delivery-epic.sh:rt_epic_base` refuses a task branch whose epic has no branch in the remote, except an epic already merged.
- **The PR of the epic opens when its last folder is taken apart, and not a task earlier.** — `.claude/hooks/git-guard-delivery-folder.sh:rt_delivery_open_folder` — the guard refuses opening while the branch carries a task folder. That the tasks of the epic are over is read by `tools/board-epics.mjs:checkEpicState` from the queue: no open task of the epic is left, and no request from its branch is open.
- **The next task is taken from the epic plan, and the queue list is asked only where there is no epic.** — **Not checked.** The epic plan lies in `docs/plans/`, and a call to the work queue is indistinguishable to a machine from a call with the plan open next to it. It is held by the order of the returning-to-work pattern
- **An epic is not closed by a sign confirmed by reading alone.** — **Not checked.** The sign of the end of an epic is prose in its plan; a machine has nothing to tell what was read from what was checked. It is held by naming every sign aloud, together with a command or a measurement, when the epic is closed
- **The tasks of an epic are created all at once, by the same turn as the epic itself.** — **Not checked.** The work queue audit judges the epic label against the plan only by the pair «card and plan», and it does not reconcile the makeup of tasks with the order table. Whether one of ten was created or all ten is invisible to it
- **The epic plan names how the branches of its tasks stand, on a par with their order.** — **Not checked.** The epic plans in `docs/plans/` carry the section «Как стоят ветки», which `tools/task-new.mjs` writes into the draft, and nothing reads it against the base of the task branches. The work queue audit reads the makeup of tasks, not the base of their branches. It is held by the article; the price of the arrangement shows only after the requests are opened — by how many of them the run stalled on.
- **The epic plan lies where it is found without the network and after the merge.** — `tools/task-new.mjs:writeEpicPlan` — the command lays the draft in the directory named by `plansDir` and writes the path to it into the card; a plan moved by hand afterwards nothing checks
- **Which epic this working copy leads is read from the table of assignments, and the owner writes it.** — `tools/tree-assignment.mjs:assignmentFault` — the table is `.claude/rt-kit/assignments.md` in the main branch. The name of the copy lies in `.claude/rt-kit/tree-name` outside history. The refusal comes from `.claude/hooks/tree-assignment-guard.sh` on a created task and a moved card, and from `.claude/hooks/git-guard-delivery.sh` on a branch. The same reading is printed at session start by the `SessionStart` hook in `.claude/settings.local.json`. A closed epic left in the row is refused by `.claude/hooks/git-guard-tree-assignment.sh:rt_assignment_stale`, which asks the board by `rt_task_state`

## What else is worth knowing when reading the code

- **The branch of an epic is read from the header of its plan.** The line `**Ветка эпика:**` with
  the branch name; the queue holds no branch names at all, so the command of creating a task under
  an epic takes the base of the branch from there. A plan without that line leaves the executor to
  name the base by hand — the command says so aloud.
