---
name: task-flow-plan
kind: rule
law: work-conduct
description: Rule under the work-conduct law — the task folder, the plan, its steps and the progress. Load on any edit of a task folder and on a plan refusal. Pattern task-flow-resume.
---

# Work conduct — the folder, the plan and the progress

Rule under the law `docs/constitution/work-conduct.md`. Cold part: `pitfalls.md`; whole — `task-flow`, `pitfalls-2.md`.

**Requires:** `hooks/task-flow-guard.sh`, `hooks/task-flow-draft-guard.sh`, `hooks/task-context-load.sh`, `hooks/window-fill-guard.sh`, `hooks/turn-exit-guard.sh`, `hooks/turn-judge.md`, `hooks/ask-judge.md`, `hooks/main-run-context.sh`

## How the law applies here

- **Editing application code is refused until the work has reached a state in which code is edited.**
- **The guard judges the declared transition, not the presence of files.** Lifted by `этап-идёт`, `этапы-кончились`, `разбор-кончился`, `работа-отдана`, or a taken-apart folder in history.
- **Two requirements — two guards, and one can be lifted without losing the other.** The behaviour line lifts only the agreement.
- **A merged agreement does not lock the branch.**
- **The agreement is required by the edit paths, not by an appraisal of the task.** `apps/**`, `libs/**`; bypass: `**Behaviour:** unchanged — <the owner's reason>`.
- **A task folder is created for any work, no exceptions.**
- **The task folder goes into the branch by a commit, not lives in one working tree.**
- **The plan guard is the lower bound of the requirement, not its limit.**
- **A taken task does not end a turn.**
- **The stages of a plan cover its done-sign whole.**
- **Every rule of the product agreement becomes a step of some stage.**
- **Every step of the plan carries a check whose expected output is taken from a run while the plan is written.**
- **A plan for work that ports a technique from outside is written by a measurement of one's own code.**
- **A claim about a dependency names a file and line of its installed code.**
- **A count that becomes the measure of the work is bounded by the declaration, not by the file.**
- **Waiting for one part of a stage is never a stop of the stage.**
- **A finding made mid-stage is checked against the plan's exit conditions before the first edit.** Outside them it is filed as a task.
- **Done work is marked only in the progress.**
- **The plan names the steps of every stage, and the progress mirrors them with a mark each.**
- **The numbers and the names of the steps are copied from the plan, not reworded.**
- **Exactly one step carries the mark of going on right now, while any step is not done.**
- **The task folder is created as a draft and gets its number by a command.**
- **An abandoned grill is visible.**
- **The plan names the points: the epic its milestone, the task the change a person will see.**
