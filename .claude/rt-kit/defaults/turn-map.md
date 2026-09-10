<!-- rt-kit v0.27.0 · defaults/turn-map.md · 891187ca0803 · правится надстройкой, не здесь -->
# Turn map

This is not the rule but its short digest: the rule explains, the map names. The full text is
rule `task-flow`; it also names the pattern that leads each state. What a turn ends with is
rule `turn-conduct` under the same law.

The work state is declared by a line in the "Where we stand" section of the progress. Until the
mandatory action is done, the work stays in the same state.

## States and mandatory actions

- `просьба-не-разобрана` — explore the tree, then ask; leads `task-flow-start`
- `эпик-заведён` — take the epic branch from the main branch; leads `task-flow-start`
- `разбор-закрыт` — the product agreement or the reason there is none; leads `task-flow-start`
- `договорённость-записана` — create the task, the branch from the epic branch, and the folder; leads `task-flow-start`
- `задача-взята` — write the plan; leads `task-flow-start`
- `замысел-записан` — do the first stage; leads `task-flow-start`
- `этап-идёт` — finish the stage and mark it in the progress; leads `task-flow-resume`
- `этапы-кончились` — run the check set and open the PR as a draft; leads `task-flow-close`
- `работа-отдана` — take the next task; leads `task-flow-resume`
- `разбор-кончился` — merge the agreement, bring the texts up to date, take the folder apart; leads `task-flow-close`
- `папка-разобрана` — leave draft and ask for the merge; leads `task-flow-archive`
- `влито` — the rules review of the work and the queue audit; leads `task-flow-archive`
- `задачи-эпика-кончились` — open the PR of the epic into the main branch; leads `task-flow-close`

No state has a mandatory action that sounds like "wait". The run, the owner's review and the
merge go on without the executor and do not get faster from being watched.

## What a turn ends with

There are four ways, and no others.

- **a question to the owner that the rules do not answer** — the question is asked, and the rules were read in the same turn
- **a guard refusal** — the refusal is named to the owner, no workaround was looked for
- **the window filled where there is no compaction** — the progress is written up, the handover is written
- **work handed over, and the next one started** — the PR is open, and an action on the next task is done, not announced

Where the tree has set the compaction threshold below the stop threshold, a filled window does
not end the turn: the context is compacted, the handover arrives as the entry, and the work goes
on in the same session. The stop threshold there is insurance for the case when compaction did
not come.

Everything else is the turn going on. A turn does not end with a commit, a written plan, a
closed grill, a read agreement, a green check, a summary of someone else's step, an announced
intention or a command named but not run. A transition from state to state even less so: the
mandatory action is done, and the next one is done in the same turn. Only what is done may be
named.
