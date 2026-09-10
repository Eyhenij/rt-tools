# turn-conduct — what is its own here

The names and bindings of this tree, next to the rule `SKILL.md` beside it. The course of work
from the owner request to the merge, the work states and the task folder are the rule `task-flow`,
and its own lies in `implementation.md` beside it; the window thresholds and the guard names are
named there too.

## What it is called here

- **In the rule** — Here
- **the work conduct rule** — `task-flow` — its companion names the window thresholds, the window size and the place of the handover

## Where it lives

- **the turn exit guards** — `.claude/hooks/` — the exit guard, the waiting guard, the conversation guard, the incident guard, the window guard

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section «How the law applies
here» (the bold part of the item). An article without a line and a line without an article are a
divergence.

- **Someone else's step is of two kinds, and the second never ends by itself.** — Not checked: a refused permission is indistinguishable to a guard from an ongoing run. What was not passed is named by a section of the request body — it is refused by `.claude/hooks/git-guard-delivery.sh`.
- **A summary of someone else's step.** — `.claude/hooks/waiting-turn-guard.sh:taken_re` — a turn in which a PR was opened or a red run was read does not close without an action on the next task
- **A declaration of intent.** — `.claude/hooks/waiting-turn-guard.sh:taken_re` — words about a taken task are not counted as an action by the guard; commands are
- **Work named as a command is run in the turn that names it.** — **Not checked.** The guard sees the commands of the turn and does not reconcile the command named in the reply with the one run: an empty turn it refuses, and a turn where something else was run it does not
- **One's own unclosed step is not handed to the owner.** — **Not checked.** The turn exit guard answers the question «was there work», and about a turn where there was work but the handing over was not done it says «yes»; the delivery guard is silent about an uncalled command by design
- **A menu under an assigned order.** — **Not checked.** A question to the owner is not a tool: they are asked more often in prose than by a menu
- **A word about one's own work is judged by what the same turn did.** — **Not checked.** The exit guard sees the commands of the turn and does not read what the turn promised: the promise lives in the reply text, and reconciling it with the work needs understanding of meaning
- **An option offered to the owner is named with its cost to a person.** — **Not checked.** The cost of an option to a person is invisible to a machine altogether: it counts the steps of a command, not the steps of whoever uses it
- **A tree state the owner named is cleared by a call before an explanation.** — **Not checked.** The owner word lives in the correspondence and leaves no trace in the tree: the guard sees what was called, not what was asked of it. It is held by the order of the rule and by the analysis, the record «2026-08-27-conflicts-named-not-checked» in the intake.
- **A retelling of the current order without an appraisal reads as approval.** — **Not checked.** The statement guard judges words about the state of the tree and demands a command; an appraisal of fitness it does not ask for — there is nothing to confirm it with by a command
- **A file path is never an assignment.** — **Not checked.** The guard has nothing to tell a remark without an action from a short order: it judges files and commands, not the text of a request
- **An interruption of work by the owner is named aloud.** — **Not checked.** The guards judge files and commands, not the text of the reply to the owner
- **A stop is named in a message of its own.** — **Not checked.** The guards judge files and commands, not the text of the reply to the owner
- **The waiting guard's refusal is lifted by both actions at once.** — `.claude/hooks/waiting-turn-guard.sh:verdict` — the verdict «neither of the two» names both missing actions
- **Work left in the working tree does not end the turn.** — `.claude/hooks/turn-exit-guard.sh:rt_te_deny` — the tier reads `@{u}..HEAD` locally and stays silent where there is no remote ref
- **Turn exits are watched by a guard, not by the executor's memory.** — `.claude/hooks/turn-exit-guard.sh:verdict` — a turn without an edit and without a command that changes the tree is returned to the executor
- **The end of an epic is a stop, and it is the one lawful waiting for a word.** — `.claude/hooks/epic-stop-guard.sh:rt_epic_over` — taking new work after the end of an epic is refused, and the two guards of the turn end let the stop through by the same reading
- **An epic that goes on forbids a stop, and a turn that did work is no exception.** — `.claude/hooks/turn-exit-guard.sh:rt_te_epic_left` — the count of the unfinished is read right before the refusal; the scenarios are `projects/agent-kit/tests/epic-stop-guard.test.sh`
- **The word about a stop the guard reads from the owner, not from the executor.** — `.claude/hooks/turn-exit-guard.sh:told_stop` — the owner remark is judged, not the reply text
- **The phrase "waiting for your word" is a stop declared by the executor, and the guard refuses it by name.** — `.claude/hooks/turn-exit-guard.sh:awaits_word` — the set of phrase samples is named in the parsing of the turn record; the tier stands before the lawful exits
- **Work without a branch and without a task folder is judged by the same guard by the second sign.** — `.claude/hooks/turn-exit-guard.sh:state` — the branch, the task folder and the state line are taken while they exist; an empty state does not end the turn but moves the judgement to the sign of work
- **A taken task is not yet begun work, and the turn does not end on it.** — `.claude/hooks/turn-exit-guard.sh:task_key` — the task key is taken from `.claude/rt-kit/checks.json`, the branch is matched against the sample `<KEY>-<number>-`, and the sign is the absence of the directory `docs/tasks/<branch>`
- **Exploration does not end a turn, however much of it there is.** — `.claude/hooks/turn-exit-patterns.sh:read_re` — the sample of the reading subcommands of `git` and of the hosting client; `part_re` next to it splits a compound command into parts, and work is the part that matched the work sample and did not match the exploration sample
- **A reply to the owner is not an action and does not stand last in a turn.** — `.claude/hooks/turn-exit-guard.sh:ended_working` — the last action of the turn is judged, and the reply text is not counted as an action at all
- **The last action of a turn is only ever work.** — `.claude/hooks/turn-exit-guard.sh:ended_working` — a file edit or a changing part of the last command; the particular tiers `waited`, `handed_over` and `read_re` only derive a legible refusal from this sign
- **Waiting for someone else's step is never the last action of a turn.** — `.claude/hooks/turn-exit-patterns.sh:wait_re` — the waiting sample is matched against the last command of the turn, not against all of them: waiting in the middle is lawful, only the end is refused
- **The handover is written even where the branch has no name.** — `.claude/hooks/handoff-write.sh:handoff_name` — the file name is taken as a short snapshot of the head when the branch has no name
- **A plan stage is declared closed only after its check command has passed.** — `.claude/hooks/turn-exit-guard.sh:contract` — the command is taken from the line «Verified by» of the plan
- **A statement about the tree's state is watched by the statement guard, not by the executor's memory.** — `.claude/hooks/claim-guard.sh:claims` — each statement word has its own kind of command, and it is looked for in the same turn; the scenarios are `projects/agent-kit/tests/claim-guard.test.sh`
- **The statement guard waits for the reply text rather than judging the record as it found it.** — `.claude/hooks/hook-input.sh:rt_turn_has_text` — the record is reread by short attempts; a turn that did not wait for the text is returned by `.claude/hooks/claim-guard.sh`; the scenarios are `projects/agent-kit/tests/claim-guard.test.sh`
- **The guard catches a statement word, not a wrong conclusion.** — `.claude/hooks/claim-guard.sh:claim-guard` — the guard knows words and commands and does not know whether the conclusion is right; these cases are held by the articles of the rule
- **A session begun from a handover enters the work by the same rule as any other.** — `.claude/hooks/handoff-entry-guard.sh:verdict` — an edit is refused until the work conduct rule has been loaded in the session
- **A turn about someone else's step is watched by the waiting guard, not by the executor's memory.** — `.claude/hooks/waiting-turn-guard.sh:opened_re` — the sign is taken from the commands of the turn and their output; the guard does not touch the network; the scenarios are `projects/agent-kit/tests/waiting-turn-guard.test.sh`
- **A turn that handed work in carries it to a lifted draft.** — `.claude/hooks/waiting-turn-guard.sh:ready_re` — a turn that opened a request does not end until the state of the handed-over work has been asked by a command; the scenario SC-AK-583
- **"Waiting for the run" is a statement about someone else's step, not a work state.** — `.claude/hooks/claim-guard.sh:claims` — words about waiting for a run demand a command that shows it; the scenarios SC-AK-581, SC-AK-582
- **The end of a run is learned from the return of a background command, not from a look at the page.** — **Not checked.** The guard sees the commands of the turn but cannot judge whether the wait was started in the background; it is held by this article
- **A command refused by a gate is repeated whole, not by its tail.** — **Not checked.** The gate refuses a call and knows nothing of the next one: a repeated tail is an ordinary new command to it. It is held by reading the refusal: it names what is missing and does not permit splitting the command
- **A writing call is not appended to an exploration line.** — **Not checked.** The sign of a file write by a shell command in `.claude/rt-kit/defaults/project.sh:rt_shell_writes_default` catches an edit under the guards, but it does not tell a lawful chain from one appended to exploration — both forms are lawful
- **Waiting for one's own measurement is done with one wait, not a notification on every step.** — **Not checked.** How many waits were set on a measurement is invisible to the guard: it judges the last action of the turn. It is held by this article.
- **A guard's refusal ends the turn.** — **Not checked.** A guard knows its own refusal and does not know what happened after it; a bypass is caught by the guards judging a shell command as well — the scenarios of the second door exist for every guard that refuses a file edit: `projects/agent-kit/tests/task-flow-guard.test.sh`, `projects/agent-kit/tests/reuse-guard.test.sh`, `projects/agent-kit/tests/skill-gate.test.sh`
- **The state of unfinished work comes into the context at session start.** — `.claude/hooks/task-context-load.sh:emit` — the plan and the progress are given whole, the grill by its path
- **The session's window fill is watched by a guard, not by the executor's memory.** — `.claude/hooks/window-fill-guard.sh:stop_pct` — the window size `RT_WINDOW_TOKENS` in `.claude/settings.json`, the thresholds 40% and 50%
- **The context compaction threshold the tree sets itself, and it stands BELOW the stop threshold.** — `projects/agent-kit/src/lib/thresholds.ts:thresholdDrift` — here the window `autoCompactWindow` in `.claude/settings.json` equals a million, the compaction share is 45%, the stop share 50%, the margin `RT_WINDOW_MARGIN_PCT` 5%
- **A filled window ends a turn only where there is no compaction.** — `.claude/hooks/window-fill-guard.sh:compact_pct` — here compaction is declared, and the first threshold calls for going on working
- **A session closes with a handover, and it lies as a section of the progress.** — `.claude/hooks/handoff-write.sh:section` — the section «Handover of the session» in `docs/tasks/<branch>/progress.md`; the fallback path for work without a task folder is `.claude/handoff/`, and it is in `.gitignore`
- **A refusal of an irreversible action has a safe part, and it is done.** — **Not checked.** A turn in which part of the work was done instead of all of it is indistinguishable to a machine from a turn in which everything was done; it is held by this article and by the incident analysis
- **The sign of irreversibility is taken from the list, not derived by argument.** — **Not checked.** The guard judges the form of the call, not the argument by which the executor decided to ask the owner; it is held by the article of the rule and by the list in `.claude/skills/task-flow/implementation.md`
- **A turn in which the executor admitted a miss does not end until the incident record exists.** — `.claude/hooks/postmortem-guard.sh:notes_dir` — the drafts directory here is `.claude/rt-kit/postmortems`, it is outside history and named by the key `postmortems` in `.claude/rt-kit.json`; the admission is caught by a set of samples
- **A turn in which a question was put to the owner does not end until laws and rules were read in that same turn.** — `.claude/hooks/grill-gate.sh:verdict` — the reading directories here are `docs/constitution`, `.claude/skills`, `docs/specs`
- **The owner's answer is sought in their own messages before the rules.** — **Not checked.** The conversation guard judges the trace of the tools over the turn — loading a rule, reading a law file, searching through them; an owner remark leaves no trace, and «did he read it» is indistinguishable from «read it attentively»
- **The size of work is never a reason to cut its boundaries.** — **Not checked.** The appraisal «this is too expensive» would be assigned by whoever finds it expensive; the volume is visible to a machine, and the boundaries named by the owner are not
- **The actions the executor does not do without the owner's word are listed in the rule's companion.** — `.claude/hooks/git-guard-delivery.sh:deny` — it judges the push and the opening of a request by form: the branch name, the commit signature, the number in the title, the task column. The guard asks the owner word nowhere: the list itself is the section «What is not done without the owner word» in `.claude/skills/task-flow/implementation.md`, and it is held by the memory of the executor
- **A removed task folder lifts the state requirement and does not end the turn.** — `.claude/hooks/turn-exit-guard.sh:folder_archived` — a folder removed by a commit of the branch moves the judgement to the second sign; the scenarios are `projects/agent-kit/tests/turn-exit-guard.test.sh`
- **An option that silences a check is not put in the menu at all.** — **Not checked.** The menu is assembled by the question tool, and what stood in it leaves no trace: the conversation guard judges whether the rules were read before the question, not what the list of answers is assembled from
