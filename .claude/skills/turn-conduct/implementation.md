# turn-conduct — what is its own here

The names and bindings of this tree, next to the rule `SKILL.md` beside it. The course of work
from the owner request to the merge, the work states and the task folder are the rule `task-flow`,
and its own lies in `implementation.md` beside it; the window thresholds and the guard names are
named there too.

## What it is called here

- **In the rule** — Here
- **the work conduct rule** — `task-flow` — its companion names the window thresholds, the window size and the place of the handover

## Where it lives

- **the turn exit guards** — `.claude/hooks/` — the exit guard and the window guard
- **the model hooks on the words of a turn** — `.claude/hooks/turn-judge.md` at the end of a turn, `.claude/hooks/ask-judge.md` before a question to the owner
- **the verdict at the end of a turn** — `tools/flow-verdict.mjs` — the exit guard asks it through `tools/task-flow-script.mjs verdict`; the epic, the task and the steps are measured by the description `tools/task-flow/flow.js`

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section «How the law applies
here» (the bold part of the item). An article without a line and a line without an article are a
divergence.

- **Someone else's step is of two kinds, and the second never ends by itself.** — Not checked: a refused permission is indistinguishable to a guard from an ongoing run. What was not passed is named by a section of the request body — it is refused by `.claude/hooks/git-guard-delivery.sh`.
- **A summary of someone else's step.** — `tools/task-flow/measure/epic.mjs:nextTaken` — handed-in work is a state whose exit is the next task taken; the exit guard holds the turn until it is measured
- **A promise to do the work in the next turn is an announcement of intent.** — `.claude/hooks/turn-judge.md:announcement` — the model hook judges it: a turn that ends with a promise or an announcement while the owner's latest word orders work it has not done is refused.
- **An order named by a number or by the word "all" is counted aloud before the turn ends.** — **Not checked by anything.** The size of the order is written nowhere in the tree.
- **The owner's word to work without stops holds until they cancel it themselves.** — `tools/flow-verdict.mjs:releaseCase` — the exit guard holds a turn whose scenario is not over whatever the owner said before; only the owner's stop word or Esc, as the last entry of the record, releases it.
- **A declaration of intent.** — `.claude/hooks/turn-judge.md:announcement` — the model hook judges it: a turn that ends ordered work with an announcement instead of the work is refused
- **Work named as a command is run in the turn that names it.** — **Not checked.** The exit guard measures the branch and does not reconcile the command named in the reply with the one run
- **One's own unclosed step is not handed to the owner.** — **Not checked.** The exit guard holds a turn whose scenario is not over, but a list of leftovers in the reply it does not read; the delivery guard is silent about an uncalled command by design
- **A menu under an assigned order.** — **Not checked.** A question to the owner is not a tool: they are asked more often in prose than by a menu
- **No order at all is a lawful state, and it is said, not filled.** — `.claude/hooks/tree-assignment-guard.sh:takes_work` — refuses creating a task and moving a card while `.claude/rt-kit/assignments.md` assigns no epic to the copy, and names asking the owner as the move
- **A standing order is written into the progress in the owner's words.** — **Not checked.** No guard reads an order from the progress: the exit guard measures the branch, and the owner's words are read from the record of the session
- **Done work is shown on the running application built from it.** — **Not checked.** What the owner is shown leaves no trace in the tree; the stands are named in the companion of `browser-verification`
- **A word about one's own work is judged by what the same turn did.** — **Not checked.** The exit guard measures the branch and does not read what the turn promised: the promise lives in the reply text, and reconciling it with the work needs understanding of meaning
- **An option offered to the owner is named with its cost to a person.** — **Not checked.** The cost of an option to a person is invisible to a machine altogether: it counts the steps of a command, not the steps of whoever uses it
- **A tree state the owner named is cleared by a call before an explanation.** — **Not checked.** The owner word lives in the correspondence and leaves no trace in the tree: the guard sees what was called, not what was asked of it. It is held by the order of the rule and by the analysis, the record «2026-08-27-conflicts-named-not-checked» in the intake.
- **A retelling of the current order without an appraisal reads as approval.** — **Not checked.** The statement guard judges words about the state of the tree and demands a command; an appraisal of fitness it does not ask for — there is nothing to confirm it with by a command
- **A file path is never an assignment.** — **Not checked.** The model hook no longer judges edits under `apps/` or `libs/`; the plan guard `.claude/hooks/task-flow-guard.sh` refuses an edit of application code without a task folder. A message that is only a path orders nothing
- **An interruption of work by the owner is named aloud.** — **Not checked.** The guards judge files and commands, not the text of the reply to the owner
- **A stop is named in a message of its own.** — **Not checked.** The guards judge files and commands, not the text of the reply to the owner
- **Work left in the working tree does not end the turn.** — `tools/task-flow/measure/pr.mjs:handed` — commits left unpushed do not change the measured state, and the scenario goes on until the PR is open
- **Turn exits are watched by a guard, not by the executor's memory.** — `.claude/hooks/turn-exit-guard.sh:verdict` — the engine measures the branch, and a turn whose scenario is not over is returned to the executor
- **The end of an epic is the end of the scenario, and the turn ends there.** — `.claude/hooks/epic-stop-guard.sh:rt_epic_over` — taking new work after the end of an epic is refused; the exit guard releases the turn by the case of the end of the scenario, `tools/task-flow/measure/epic.mjs:finished`
- **The stop is read from the owner's words, not from the executor.** — `tools/task-flow/measure/owner.mjs:stopStands` — the owner's words in order: a stop word or Esc stands until a working order of `words.resume` or a complaint of `words.stopComplaint`, and a question, swearing or an incident record does not lift it; `tools/task-flow/measure/owner.mjs:saidStop` and `tools/task-flow/measure/owner.mjs:interrupted` read it. No text of the reply releases a turn
- **Until the scenario is over a turn ends only by the owner's stop word, their Esc or a release case.** — `tools/flow-verdict.mjs:releaseCase` — a turn whose scenario is not over is held until a release case of the description is met. Scenarios: `projects/agent-kit/tests/turn-exit-guard.test.sh`.
- **The owner's stop is read from the record of the session, not from the progress.** — `tools/task-flow/source/owner.mjs:wordsOf` — the owner's entries of the record in order with their time: typed, queued, Esc, a menu answer, the text of a refused call. A notice of a background task and a message of another session carry no word. `.claude/hooks/owner-stop-call-guard.sh:owner_stop_call` — while the stop stands, every call of a turn a notice, a line of `Monitor` or a message of another session opened is refused, the take-down of own background excepted; scenarios `projects/agent-kit/tests/owner-stop-call-guard.test.sh`
- **The session is ended by the owner and by nobody else.** — `.claude/hooks/end-conversation-guard.sh:tool` — the closing tool is refused always; the scenarios are `projects/agent-kit/tests/end-conversation-guard.test.sh`
- **A refusal of a guard never ends the turn.** — `tools/flow-verdict.mjs:releaseCase` — no release case names a refusal: the exit guard holds the turn until a case of the description is met
- **A step of the plan that is not done forbids a stop, and a report about the done is not an exception.** — `tools/flow-verdict.mjs:holdReason` — in a running stage the refusal names the steps not done, the current step and the command that measures it
- **The phrase "waiting for your word" is a stop declared by the executor.** — `.claude/hooks/turn-judge.md:ordered` — the model hook judges it by meaning, not by the phrase: a turn that ends by waiting for a word of the owner while ordered work remains and nothing blocks it is refused. The phrase itself is no longer looked for
- **A taken task is not yet begun work, and the turn does not end on it.** — `tools/task-flow/measure/task.mjs:taken` — a taken task is a state of the scenario whose exit is the plan; the held turn names the action of that state
- **Exploration does not end a turn, however much of it there is.** — **Not checked.** A session that wrote nothing is released by the case of the description, `tools/task-flow/measure/session.mjs:wrote`, unless the owner's last word pushes the work on
- **A reply to the owner is not an action and does not stand last in a turn.** — `tools/task-flow/measure/session.mjs:wrote` — the sign of work is an edit or a command of the work; the reply text is not counted as an action at all
- **The last action of a turn is only ever work.** — **Not checked.** The exit guard judges the measured state of the branch, not the last call of the turn
- **Waiting for someone else's step is never the last action of a turn.** — `tools/flow-verdict.mjs:releaseCase` — no release case names waiting: a turn whose scenario is not over is held whatever its last call
- **The handover is written even where the branch has no name.** — `.claude/hooks/handoff-write.sh:handoff_name` — the file name is taken as a short snapshot of the head when the branch has no name
- **A next step written into the progress is begun by the same turn.** — `tools/flow-verdict.mjs:currentStep` — the held turn names the step marked current in the progress and the command that measures it
- **A plan stage is declared closed only after its check command has passed.** — `tools/flow-guard.mjs:judgeProgress` — a step marked done without its measured mark is refused; the mark is written by `tools/task-flow-script.mjs step`
- **A statement about the tree's state is watched by the agent hook, not by the executor's memory.** — `.claude/hooks/turn-judge.md:merged` — the model hook judges it: a reply that states a fact about the tree or a service, such as merged, pushed or green, with no tool result of the same turn that shows it, is refused
- **A session begun from a handover enters the work by the same rule as any other.** — `.claude/hooks/handoff-entry-guard.sh:from_handoff` — the fact is handed to the decider, and an edit is refused until the work conduct rule has been loaded in the session
- **A turn that handed work in does not end before the next task is begun.** — `tools/task-flow/measure/epic.mjs:nextTaken` — handed-in work is a state whose exit is the next task of the epic taken; the exit guard holds the turn until it is measured
- **A turn that handed work in carries it to a lifted draft.** — `.claude/hooks/git-guard-draft-ready.sh:judge_current` — a turn does not end while the draft's run on the tip is green and the folder is taken apart. The demand to ask the state of the handed-over work by a command left with the waiting guard
- **"Waiting for the run" is a statement about someone else's step, not a work state.** — `.claude/hooks/turn-judge.md:green` — the model hook judges it: a word about a run, such as green, with no tool result of the turn that shows the run, is refused
- **The end of a run is learned from the return of a background command, not from a look at the page.** — **Not checked.** The exit guard measures the branch and does not see how a wait was started. The waiting guard, which refused a run started without a wait for its end, was removed, and the model hook does not judge how the end of a run is learned. It is held by this article
- **A run nobody started by hand is watched the same as a rerun, and the opened PR starts it.** — **Not checked.** The waiting guard read the pair "a request opened in the turn" and "its run read as going", and it was removed. Neither the exit guard nor the model hook reads the state of a run from the output of the turn
- **A green run is carried to a lifted draft by the one who handed the work over, a red one is fixed in the same branch.** — **Not checked.** The guard demands the wait. What was done with its answer it does not judge. The green half is held by `.claude/hooks/git-guard-draft-ready.sh:judge_current`: a turn does not end while the draft's run on the tip is green and the folder is taken apart. Fixing a red run in the same branch is not checked.
- **A command refused by a gate is repeated whole, not by its tail.** — **Not checked.** The gate refuses a call and knows nothing of the next one: a repeated tail is an ordinary new command to it. It is held by reading the refusal: it names what is missing and does not permit splitting the command
- **A writing call is not appended to an exploration line.** — **Not checked.** The sign of a file write by a shell command in `.claude/rt-kit/defaults/project.sh:rt_shell_writes_default` catches an edit under the guards, but it does not tell a lawful chain from one appended to exploration — both forms are lawful
- **Waiting for one's own measurement is done with one wait, not a notification on every step.** — `.claude/hooks/monitor-stream-guard.sh:monitor_stream` — a `Monitor` that prints a line on every step of a live own background task is refused: its end comes as a notice. How many waits were set on a measurement in other forms the guards do not see; that part is held by this article.
- **A guard's refusal closes every other road to the refused edit.** — **Not checked.** A guard knows its own refusal and does not know what happened after it; a bypass is caught by the guards judging a shell command as well — the scenarios of the second door exist for every guard that refuses a file edit: `projects/agent-kit/tests/task-flow-guard.test.sh`, `projects/agent-kit/tests/reuse-guard.test.sh`, `projects/agent-kit/tests/skill-gate.test.sh`
- **The state of unfinished work comes into the context at session start.** — `.claude/hooks/task-context-load.sh:emit` — the plan and the progress are given whole, the grill by its path
- **The session's window fill is watched by a guard, not by the executor's memory.** — `.claude/hooks/window-fill-guard.sh:stop_pct` — the window size `RT_WINDOW_TOKENS` in `.claude/settings.json`, the thresholds 40% and 50%
- **The context compaction threshold the tree sets itself, and it stands BELOW the stop threshold.** — `projects/agent-kit/src/lib/thresholds.ts:thresholdDrift` — here the window `autoCompactWindow` in `.claude/settings.json` equals a million, the margin `RT_WINDOW_MARGIN_PCT` 5%. Both shares stand at 50% — `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` and `RT_WINDOW_STOP_PCT` — so the article is broken here until task RT-3217 sets the compaction share below the stop share
- **A filled window ends a turn only where there is no compaction.** — `.claude/hooks/window-fill-guard.sh:compact_pct` — here compaction is declared, and the first threshold calls for going on working
- **A session closes with a handover, and it lies as a section of the progress.** — `.claude/hooks/handoff-write.sh:section` — the section «Handover of the session» in `docs/tasks/<branch>/progress.md`; the fallback path for work without a task folder is `.claude/handoff/`, and it is in `.gitignore`
- **What the host's automatic mode refuses is listed in the companion and read before the step.** — **Not checked.** The list is the section «What the automatic mode refuses here» below; the classifier is not a guard of the tree, and its refusal comes only mid-turn
- **Red in the way of one's own task is one's own work, whoever wrote it.** — **Not checked.** The push gate names what is red and does not tell the mechanical part from a decision; no hook asks for the line of what was done without the answer
- **A refusal of an irreversible action has a safe part, and it is done.** — **Not checked.** A turn in which part of the work was done instead of all of it is indistinguishable to a machine from a turn in which everything was done; it is held by this article and by the incident analysis
- **The sign of irreversibility is taken from the list, not derived by argument.** — **Not checked.** The guard judges the form of the call, not the argument by which the executor decided to ask the owner; it is held by the article of the rule and by the list in `.claude/skills/task-flow/implementation.md`
- **A turn in which the executor admitted a miss does not end until the incident record exists.** — `.claude/hooks/turn-judge.md:postmortems` — the model hook judges it: a reply that admits a miss with no incident record written in the turn is refused, and so is a turn that wrote the record and did not send it by `node dist/agent-kit/bin/agent-kit.js propose`. The drafts directory here is `.claude/rt-kit/postmortems`, outside history, named by the key `postmortems` in `.claude/rt-kit.json`; the admission is judged by meaning, not by a set of samples
- **A turn in which a question was put to the owner does not end until laws and rules were read in that same turn.** — `.claude/hooks/ask-judge.md:constitution` — the model hook before a question reads `docs/constitution`, `.claude/skills` and `docs/specs` itself and holds a question a rule answers plainly. Whether the executor read them in the same turn is not judged any more
- **The owner's answer is sought in their own messages before the rules.** — **Not checked.** The model hook before a question, `.claude/hooks/ask-judge.md`, reads the owner's messages itself and holds a question they already answered; whether the executor searched them before the rules leaves no trace and is not judged
- **The size of work is never a reason to cut its boundaries.** — **Not checked.** The appraisal «this is too expensive» would be assigned by whoever finds it expensive; the volume is visible to a machine, and the boundaries named by the owner are not
- **The actions the executor does not do without the owner's word are listed in the rule's companion.** — `.claude/hooks/git-guard-delivery.sh:deny` — it judges the push and the opening of a request by form: the branch name, the commit signature, the number in the title, the task column. The guard asks the owner word nowhere: the list itself is the section «What is not done without the owner word» in `.claude/skills/task-flow/implementation.md`, and it is held by the memory of the executor
- **A removed task folder lifts the state requirement.** — `tools/task-flow/measure/folder.mjs:archived` — a folder removed by a commit of the branch is measured as a state after the stages; the scenarios are `projects/agent-kit/tests/task-flow-script.test.sh`
- **An option that silences a check is not put in the menu at all.** — `.claude/hooks/ask-judge.md:walk` — the model hook before a question reads the menu with its options and holds a question that offers to walk around a check or a rule. A bypass offered in a question in prose is not judged.

## What the automatic mode refuses here

The classifier of the host judges every call by itself, and a refusal of it is a refused
permission, not a guard of the tree: no line in the command lifts it. What it refused in this
tree:

- **Approving and merging one's own PR.** The PR is opened by the machine account, and the click on
  the merge button in the owner's browser is read as approving oneself. The step is named to the
  owner in one line, and the next task is taken.
- **A script on the page and a batch of clicks.** One call makes one click; the result is read from
  the page by the next call.
- **Commands on the shared node that touch the production settings.** A read over `ssh` with the
  production settings file, a copy by `scp` and closing an issue by `gh issue close` were refused;
  files reach the node only by the rollout.
