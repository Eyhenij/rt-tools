<!-- rt-kit v0.38.0 · defaults/turn-map.md · 2c8a7ab698ee · правится надстройкой, не здесь -->
# Turn map

This is not the rule but its short digest: the rule explains, the map names. The full text is
rule `task-flow`; it also names the pattern that leads each state. What a turn ends with is
rule `turn-conduct` under the same law.

The work state is measured by the engine from the branch; the line in the "Where we stand" section
of the progress mirrors it. Until the mandatory action is done, the work stays in the same state.

## States and mandatory actions

<!-- flow:map -->
- `просьба-не-разобрана` — explore the tree, then ask the questions; leads `task-flow-start`
- `эпик-заведён` — take the epic branch from the main branch; the epic card moves with the first task; leads `epic-flow-declare`
- `разбор-закрыт` — write the product agreement, or the reason there is none; leads `task-flow-start`
- `договорённость-записана` — create the task, the branch from the epic branch, and the folder; leads `task-flow-start`
- `задача-взята` — write the plan; leads `task-flow-start`
- `замысел-записан` — do the first stage; leads `task-flow-start`
- `этап-идёт` — finish the stage: `step N.M` measures each step and marks it done; leads `task-flow-resume`
- `этапы-кончились` — merge the agreement, bring the texts up to date, run the suite; leads `task-flow-close`
- `разбор-кончился` — take the folder apart by the last commit; leads `task-flow-archive`
- `папка-разобрана` — the work queue audit, then open the PR; leads `task-flow-close`
- `работа-отдана` — send the rules review to the background, then take the next task of the epic; leads `task-flow-archive`
- `влито` — merge the PRs of the chain bottom-up, mark the merged tasks by the branch of the next one; leads `task-flow-resume`
- `задачи-эпика-кончились` — open the PR of the epic into the main branch; leads `task-flow-close`
<!-- /flow:map -->

No state has a mandatory action that sounds like "wait". The run, the owner's review and the
merge go on without the executor and do not get faster from being watched.

## What a turn ends with

- **the end of the scenario** — the engine measured it; under an epic the table of its tasks is shown
- **a stop word of the owner** — their last message begins with it, and nothing after it asks to go on

The exit guard holds every other turn and names the one next move. The task flow description adds
release cases that are not the executor's choice: no write to the tree, a branch outside the
scenario, a role session, a silent host, a menu that did not reach the owner twice.

A question, a guard's refusal, a handover and handed-in work do not end a turn. A step that
another guard refuses twice goes to the owner as one menu: «отложить RT-N», «стоп». The menu waits for the answer inside the turn.

Where the tree has set the compaction threshold below the stop threshold, a filled window does
not end the turn: the context is compacted, the handover arrives as the entry, and the work goes
on in the same session.

A turn does not end with a commit, a written plan, a closed grill, a read agreement, a green check,
a summary of someone else's step, an announced intention or a command named but not run. A transition from state to state even less so: the
mandatory action is done, and the next one is done in the same turn. Only what is done may be
named.
