# Turn map

This is not the rule but its short digest: the rule explains, the map names. The full text is
rule `task-flow`; it also names the pattern that leads each state. What a turn ends with is
rule `turn-conduct` under the same law.

The work state is measured by the engine from the branch; the line in the "Where we stand" section
of the progress mirrors it. Until the mandatory action is done, the work stays in the same state.

## States and mandatory actions

- `просьба-не-разобрана` — explore the tree, then ask; leads `task-flow-start`
- `эпик-заведён` — take the epic branch from the main branch; leads `epic-flow-declare`
- `разбор-закрыт` — the product agreement or the reason there is none; leads `task-flow-start`
- `договорённость-записана` — create the task, the branch from the epic branch, and the folder; leads `task-flow-start`
- `задача-взята` — write the plan; leads `task-flow-start`
- `замысел-записан` — do the first stage; leads `task-flow-start`
- `этап-идёт` — finish the stage and mark it in the progress; leads `task-flow-resume`
- `этапы-кончились` — merge the agreement, bring the texts up to date, run the suite; leads `task-flow-close`
- `разбор-кончился` — take the folder apart by the last commit; leads `task-flow-archive`
- `папка-разобрана` — the queue audit, then open the PR, a draft only where a run is waited for; leads `task-flow-close`
- `работа-отдана` — the rules review in the background, then the next task; leads `task-flow-archive`
- `влито` — the epic plan marks the task merged by the next task's branch; leads `task-flow-resume`
- `задачи-эпика-кончились` — open the PR of the epic into the main branch; leads `task-flow-close`

No state has a mandatory action that sounds like "wait". The run, the owner's review and the
merge go on without the executor and do not get faster from being watched.

## What a turn ends with

- **the end of the scenario** — the engine measured it; under an epic the table of its tasks is shown
- **a stop word of the owner** — their last message begins with it, and nothing after it asks to go on

The exit guard holds every other turn and names the one next move. The task flow description adds
release cases that are not the executor's choice: no write to the tree, a branch outside the
scenario, a role session, a silent host, a menu that did not reach the owner twice.

A question, a guard's refusal, a handover and handed-in work do not end a turn. A step that is the
owner's, or that another guard refuses, goes to them as one menu: «отложить RT-N», «сделаю сам»,
«стоп». The menu waits for the answer inside the turn.

Where the tree has set the compaction threshold below the stop threshold, a filled window does
not end the turn: the context is compacted, the handover arrives as the entry, and the work goes
on in the same session.

A turn does not end with a commit, a written plan, a closed grill, a read agreement, a green check,
a summary of someone else's step, an announced intention or a command named but not run. A transition from state to state even less so: the
mandatory action is done, and the next one is done in the same turn. Only what is done may be
named.
