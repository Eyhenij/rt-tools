<!-- rt-kit v0.37.0 · defaults/turn-map.md · d5d1f1d0988d · правится надстройкой, не здесь -->
# Turn map

This is not the rule but its short digest: the rule explains, the map names. The full text is
rule `task-flow`; it also names the pattern that leads each state. What a turn ends with is
rule `turn-conduct` under the same law.

The work state is declared by a line in the "Where we stand" section of the progress. Until the
mandatory action is done, the work stays in the same state.

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

There are four ways, and no others. While the epic runs the fourth does not end a turn: the next
task goes on in it.

- **a question to the owner that the rules do not answer** — the question is asked, and the rules were read in the same turn
- **a guard refusal** — the refusal is named to the owner, no workaround was looked for
- **the window filled where there is no compaction** — the progress is written up, the handover is written
- **work handed over, and the next one started** — the PR is open, and an action on the next task is done, not announced

The end of the epic is a fifth way, and only it waits: the table of the epic's tasks is shown, and
the session waits for the owner's word.

Where the tree has set the compaction threshold below the stop threshold, a filled window does
not end the turn: the context is compacted, the handover arrives as the entry, and the work goes
on in the same session. The stop threshold there is insurance for the case when compaction did
not come.

Everything else is the turn going on. A turn does not end with a commit, a written plan, a
closed grill, a read agreement, a green check, a summary of someone else's step, an announced
intention or a command named but not run. A transition from state to state even less so: the
mandatory action is done, and the next one is done in the same turn. Only what is done may be
named.
