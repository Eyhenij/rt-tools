# task-flow — what is its own here

The names and bindings of this tree, next to the rule `SKILL.md` beside it.

The tree publishes libraries and holds one application — the cargo intake. **A domain here is a
package under `projects/` or an application**: `ui-kit`, `ui-kit-v2`, `core`, `store`, `utils`,
`agent-kit`, `message-bus`. A package spec describes the public surface — what it promises the
consumer; an application spec describes the subject area: what it accepts, what it stores and what
it refuses with.

## What it is called here

- **In the rule** — Here
- **a domain** — a package under `projects/` or an application under `apps/` — a spec directory for each
- **the work queue** — the GitHub issues and the board `Rt-tools`; the task number stands in the branch name
- **the task folder** — `docs/tasks/<branch>/` — the path repeats the branch name literally, the slash included
- **the epic plan** — `docs/plans/<subject>.md` — the directory was started before the rule and is in use
- **the grill** — questions to the owner by the asking tool, the answers verbatim in `grill.md`
- **the plan review by roles** — `.claude/workflows/plan.js`
- **renaming the folder to the number** — done by `npm run task:new`: the draft by slug becomes the folder by branch name
- **assembling the task folder** — done by the same command: it copies `docs/tasks/_template` and strips the layout header from the copies

## Where it lives

- **The task folders** — `docs/tasks/`, the sample is `docs/tasks/_template/`
- **The product agreement before the code** — `docs/specs/<package>/proposed/<feature>/`
- **The package spec** — `docs/specs/<package>/`
- **The epic plan** — `docs/plans/`, named by the key `plansDir` in `.claude/rt-kit/checks.json`: the creation command lays the draft of a plan there
- **The review roles** — `.claude/agents/spec-writer.md`, `.claude/agents/spec-critic.md`
- **The pipeline after the grill** — `.claude/workflows/plan.js`

## What is not done without the owner word

The word is given for an action, not for the work as a whole: «do what the plan needs» permits
what the plan names, and nothing beyond that.

- **The action** — Why it is here
- **merging a PR into the main branch** — it is not rolled back by one motion
- **publishing a package to the registry** — a published version cannot be taken back
- **editing the body of an already created task or PR** — that is the owner text, not a working record
- **removing a branch, a working tree or a task folder** — what is removed is restored only from history, and what is uncommitted by nothing
- **changing the working tree by an edit that is not one own** — checking out a foreign version over the tree and resetting to a foreign tip erase the same
- **editing files outside the root of the working tree** — the plan of this branch does not dispose of them
- **a request to the hosting that changes a field of the board or its options whole** — it recreates the options and erases the column of every card. Before it the full list «card — column» is taken by a command and lies on disk until the end of the turn

A commit into one own branch is not in this list: it does not leave outward and it rolls back.

**Pushing the task branch and opening a PR as a draft are removed from here.** Both stood here,
and together with them stood a ban on what the rule demands outright: a PR opens as a draft by the
turn in which the edit is handed over — and without a push it cannot be opened. Work stood idle
because of that, ready and invisible, waiting for a word the owner was not expecting: the exit
guard demanded opening the request, this list demanded not opening it, and the executor had nothing
to resolve the contradiction with.

Both steps are reversible, and only the merge is not, and it stayed in the list. A branch is
removed, a request is closed, and the merge button of a draft is locked by the hosting itself:
while the draft is not lifted, an open request does not read as an invitation to merge. Lifting the
draft also stays with the executor — by it they say the solution is ready — and it is guarded by a
guard of its own: it looks at the review, the mergeability and the run on the tip of the request.

The line about changing the working tree by an edit that is not one own was started by an analysis,
the record «2026-08-20-diagnostic-command-overwrote-the-tree» in the intake: the list named removal
— of a branch, of a working tree, of a task folder — and checking out a foreign version over the
tree did not get into it, although it erases exactly the same in exactly the same way.

## How the law applies here

- **The task folder is created together with the branch, not after the first edit.** The path
  repeats the branch name literally: `RT-334-archive-closed-task-folders` →
  `docs/tasks/RT-334-archive-closed-task-folders/`. For a branch of the old form, with a slash, the
  slash is not replaced by a dash — that is how `task-context-load.sh` and `task-flow-guard.sh`
  look for the folder, and a folder named otherwise is found by nothing.
- **The owner request goes into `grill.md` verbatim.** A retelling is fitted to what has already
  been done; the verbatim record is the only thing the result can be reconciled with at acceptance.
- **`plan.md` is not edited after it is written.** A revision of a stage is written into
  `progress.md` as a decision along the way, with an argument.
- **What is done is marked only in `progress.md`.** A second record of the same — in the commit
  body, in the PR description, in the plan — diverges from the first silently.
- **The agreement about the behaviour of a component is written before the code** and lives in
  `docs/specs/<package>/proposed/<feature>/` until the branch is merged.

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section «How the law applies
here». For now the table holds only what guards the taking apart of the task folder: the other
articles of the rule have no bindings — that is the debt that lay here before this table.

- **Editing application code is refused until the work has reached a state in which code is edited.** — `.claude/hooks/task-flow-guard.sh:plan` — the folder by the name of the current branch, the plan in it and a declared state; without any of them a code edit is refused
- **The guard judges the declared transition, not the presence of files.** — `.claude/hooks/task-flow-guard.sh:state` — the state line is read from the progress, and it lifts the refusal, not a file lying on disk
- **A refusal by state names the mandatory action of that state.** — `.claude/hooks/task-flow-guard.sh:state_action` — the mandatory action of every pre-transition state
- **Only a word from the list counts as a state name.** — `.claude/hooks/task-flow-guard.sh:state_action` — a word outside the list is refused with a reason of its own
- **After opening the PR, the executor tells the owner the number, what it waits for and what comes next.** — **Not checked.** The guards judge files and commands, not the text of the reply to the owner; what is said in the correspondence leaves no trace in the tree
- **Editing application code is refused until the work has reached a state in which code is edited.** — `.claude/rt-kit/project.sh:RT_ARCHIVE_PRUNE_CMD` — `node tools/archive-prune.mjs --apply`. This command the guard does not judge: the records age by the calendar, and the retention step turns red without an edit in the branch. The whole command is matched, not an occurrence
- **A refusal by an external limiter removes the way, not the task.** — **Not carried out.** The refusal comes from the runtime environment, not from a guard of the tree: no check sees its text, and the way named by a neighbouring guard cannot be tied to it by a machine. This is held by the article and by the word to the owner about what is left.
- **The plan guard is the lower bound of the requirement, not its limit.** — `.claude/hooks/task-flow-guard.sh:plan` — the guard judges the paths of the application code; the requirement is wider than it and is held by the memory of the executor
- **A request to merge never comes before the work is checked.** — `.claude/hooks/git-guard-draft-ready.sh:run_verdict` — the turn does not end while a branch with its folder taken apart stands as a draft with a green run on the PR tip
- **The task folder goes into the branch by a commit, not lives in one working tree.** — `.claude/hooks/task-flow-guard.sh:in_tree` — a code edit is refused while the task folder is not in the `HEAD` of the branch
- **The task folder is taken apart by the last commit before the PR opens, not after approval.** — `.claude/hooks/git-guard-delivery-folder.sh:rt_delivery_open_folder` — opening a request is refused while the branch carries `docs/tasks/<branch>`; after the tidying the work conduct guard takes the plan from the branch history — `.claude/hooks/task-flow-guard.sh:folder_archived`
- **A state line moved forward is the same declaration of intent, only machine-readable.** — Not checked: there is no source of the state other than this line at all, and the guard `.claude/hooks/turn-exit-guard.sh` is obliged to believe it. This is held by the article itself.
- **Waiting for one part of a stage is never a stop of the stage.** — Not checked: which part of the work depends on what is invisible to a machine. This is held by the article of the rule and by the word to the owner about what is already done.
- **An instruction to work by a rule is an instruction to do its steps, including those that change history.** — Not checked: the owner word lies outside the tree, and there is nothing to tie it to what the executor did next. It is held by this article and by the trap about the waiting line in the cold part of the rule.
- **The stages of a plan cover its done-sign whole.** — **Not checked by anything.** The machine reads both texts and does not know what work stands behind the words. Held by reading two neighbouring sections of one file before the first stage.
- **A stage's readiness sign is taken from the output of a command run while the plan is written.** — **Not checked by anything.** The plan is written before the first tool call of the stage, and nothing ties the minute of a run to the minute the plan was written. Held by the article itself.
- **A plan for work that ports a technique from outside is written by a measurement of one's own code.** — **Not checked by anything.** Whether a plan came from a sample or from a count over one's own files is visible in no artefact. Held by the article itself.
- **A taken task does not end a turn.** — `.claude/hooks/turn-exit-guard.sh:first_stage` — a turn that declared the written plan is refused before the second sign; the scenarios are `projects/agent-kit/tests/turn-exit-guard.test.sh`
- **A finding made mid-stage is checked against the plan's exit conditions before the first edit.** — **Not checked.** Before the first edit the finding is not in the tree at all, and after it the guard sees the edit and does not know whether the plan named it. The files of a neighbouring piece of work differ in nothing from one own. It is held by reconciling with the list of stages, not by a sign.
- **Done work is marked only in the progress.** — **Not checked.** A second record of what is done — in the commit body, in the PR description — has nothing for a machine to reconcile it with
- **The plan names the steps of every stage, and the progress mirrors them with a mark each.** — `tools/check-work-steps.mjs:stepsOfPlan` — the scenarios are `projects/agent-kit/tests/work-steps.test.sh`
- **The numbers and the names of the steps are copied from the plan, not reworded.** — `tools/check-work-steps.mjs:judge` — matched by number and by name
- **Exactly one step carries the mark of going on right now, while any step is not done.** — `tools/check-work-steps.mjs:CURRENT` — the check counts them
- **Work begins with the epic, and a task outside one is not taken.** — `tools/task-new.mjs:outsideEpic` — the creation command refuses a task named by no epic and names both ways out: the number of the epic or the word of the owner about work outside one. What is created past the command is named by `tools/board-epics.mjs:checkTasksOutsideEpics`: a card made through the web reaches no guard, and the audit reads it on the board.
- **A task of an epic is linked to the epic card as a sub-issue, not only named in the plan.** — `tools/task-new.mjs:subId` — the numeric id of the created task is asked of the hosting, and the link is posted right after the task lands on the board. The card of the epic is read by `tools/task-new.mjs:epicOfCard`. What is created past the command, and every task created before this order came in, is named by `tools/board-epics.mjs:checkEpicSubIssues`: it reads the makeup from the plan and asks the hosting for the links of the epic card. The list comes in pages of thirty, and it is asked with the paging sign: read by the first page alone, the audit named six linked tasks of the epic «Один кит» unlinked.
- **The epic card moves to in progress by the same turn that takes its first task.** — `tools/board.mjs:moveTask` — the same call as for a task, on the epic number. Nothing reads the epic card's column at branch creation, and the queue audit does not judge it.
- **The epic branch is taken before the first task of the epic, not with it.** — `tools/board-epics.mjs:checkEpicState` — the audit names an epic whose branch shows in no request, neither one from it nor one into it. The delivery guard judges the base of a task branch against the epic branch, and the branch of the epic itself it does not demand.
- **The PR of the epic opens when its last folder is taken apart, and not a task earlier.** — `.claude/hooks/git-guard-delivery-folder.sh:rt_delivery_open_folder` — the guard refuses opening while the branch carries a task folder. That the tasks of the epic are over is read by `tools/board-epics.mjs:checkEpicState` from the queue: no open task of the epic is left, and no request from its branch is open.
- **The next task is taken from the epic plan, and the queue list is asked only where there is no epic.** — **Not checked.** The epic plan lies in `docs/plans/`, and a call to the work queue is indistinguishable to a machine from a call with the plan open next to it. It is held by the order of the returning-to-work pattern
- **An epic is not closed by a sign confirmed by reading alone.** — **Not checked.** The sign of the end of an epic is prose in its plan; a machine has nothing to tell what was read from what was checked. It is held by naming every sign aloud, together with a command or a measurement, when the epic is closed
- **The tasks of an epic are created all at once, by the same turn as the epic itself.** — **Not checked.** The work queue audit judges the epic label against the plan only by the pair «card and plan», and it does not reconcile the makeup of tasks with the order table. Whether one of ten was created or all ten is invisible to it
- **The epic plan names how the branches of its tasks stand, on a par with their order.** — **Not checked.** The epic plans lie in `docs/plans/`, and they have no line about the arrangement of branches. The work queue audit reads the makeup of tasks, not the base of their branches. It is held by the article; the price of the arrangement shows only after the requests are opened — by how many of them the run stalled on.
- **The epic plan lies where it is found without the network and after the merge.** — `tools/task-new.mjs:writeEpicPlan` — the command lays the draft in the directory named by `plansDir` and writes the path to it into the card; a plan moved by hand afterwards nothing checks
- **Closed work is reviewed by the rules as a closing step, not as a separate request.** — **Not checked.** Starting the review role is a move of the executor, and it leaves no trace in the tree; the technique is the command `/skill-curator`
- **Two requirements — two guards, and one can be lifted without losing the other.** — `.claude/hooks/task-flow-draft-guard.sh:draft` — the agreement is judged by its own guard, and the task folder and the state by `.claude/hooks/task-flow-guard.sh:folder_archived`; the parsing of the call is shared — `.claude/hooks/task-flow-context.sh:rt_task_flow_context`
- **The agreement is required by the edit paths, not by an appraisal of the task.** — `.claude/hooks/task-flow-context.sh:rt_tf_candidates` — the edit paths are judged; the bypass is the line about behaviour in the plan header
- **What needs the owner's word is taken from a list, not appraised on the spot.** — **Not checked.** The list stands in the agent config, `.claude/settings.json`, under the access decisions key. A machine has no executable sign for «appraised on the spot»: it sees the call, not what decided it
- **A reply to the owner's order begins with the result, not with intent or its justification.** — **Not checked.** No gate reads the reply to the owner: the texts rule is called only on `.md`, and the form of a remark is judged by nothing. It is held by the author
- **The last run of the main branch is read first thing in a session and after every known merge.** — `.claude/hooks/main-run-context.sh:reading` — the start hook prints the line of `tools/main-run.mjs`. After a merge the command is called by hand. Here the pipeline wakes on `pull_request` alone, so the line says the run was not read. Scenarios `SC-AK-1105`, `SC-AK-1106`.
- **A session does not start work by itself.** — `.claude/hooks/work-start-guard.sh:kind` — a turn that edited application code after a remark that cannot be a request does not end. The form of the remark is judged, not the meaning: empty, one word, one path; everything else counts as a request
- **An instruction to work by the progress covers all its steps, including those that change history.** — **Not checked.** No guard asks by what exactly a step is permitted
- **A question written by a past session does not become a question to the owner.** — **Not checked.** The conversation guard judges the end of a turn, not the origin of a question
- **The owner's instruction holds until they cancel it, and a new fact against it is a line in the reply about the cost, not a new question.** — `.claude/hooks/grill-gate.sh:seen` — the second sign of the guard. What is judged is the overlap of the meaningful words of the question subject and of the last owner remark, and only when a menu call has already happened
- **An answer in the owner's message counts the same as an answer in a document.** — `.claude/hooks/grill-gate.sh:seen` — the owner remark is taken from the turn record by the same parsing as the first sign
- **The owner's word about the design is a task setting, not a decision.** — **Not checked:** the reading of the word is invisible to a machine. It is held by the grill — the six mandatory questions of the pattern `task-flow-start` ask exactly about what the owner word named, and reconciling the word with the tree costs one search over the specs and the models.
- **A task folder is created for any work, no exceptions.** — `.claude/hooks/task-flow-guard.sh:tasks_dir` — the task directory here is `docs/tasks`, and the folder is looked for by the branch name one to one
- **The task folder is created as a draft and gets its number by a command.** — `tools/task-new.mjs:adoptDraft` — the draft by slug is renamed into the folder by branch name and gets the plan header
- **An abandoned grill is visible.** — `tools/check-board.mjs:checkDrafts` — a draft older than a week is listed by the work queue audit
- **Work ordered in words becomes a task in the queue in the same turn.** — **Not checked:** the owner request sounds as a remark, not as a call, and it has no sign. The queue audit sees a draft folder only after a week — that is the threshold of an abandoned grill, while the work is lost within the same hour
- **The cheap closing step goes before the costly one, and the run — after the merge.** — **Not checked.** The order of steps inside a branch is invisible to a machine: it reads the commits, not the order in which they were made. It is held by the order of the work closing pattern
- **The agreement merges into the domain spec by one of the last commits of the branch, before the PR opens.** — `tools/check-specs.mjs:ripe` — what is ready to merge is listed by `npm run check:specs`
- **The folder of a closed task is taken apart, not moved whole.** — `tools/check-board.mjs:numberFromTaskDir` — a folder left with a closed task is found by the work queue audit
- **Opening the PR and lifting the draft are refused while the branch carries its task folder.** — `.claude/hooks/git-guard-delivery-folder.sh:rt_delivery_open_folder` — the tier on `gh pr create`, the second line on `gh pr merge`; the task directory is `docs/tasks`, the main branch `main`
- **A branch that removed the folder adds a record to the archive.** — `.claude/hooks/git-guard-delivery-folder.sh:rt_folder_was_in_branch` — the archive directory here is `docs/archive/`
- **The bypass is the line `Task-folder-skip: <reason>` in the PR or in the command itself.** — `.claude/hooks/git-guard-delivery.sh:folder_skip_re`, the PR body — `.claude/rt-kit/defaults/project.sh:rt_report_body_default`
- **A merged agreement does not lock the branch.** — `.claude/hooks/task-flow-draft-guard.sh:draft_path` — the branch history tells the merged from the never-created
- **A PR that waits for a run opens as a draft, and one that waits for nothing opens ready.** — Not checked: the guards see the call that opens a PR and do not read the pipeline file, so which bases wake a run is unknown to them. The trigger of this tree lies in `.github/workflows/ci.yml`, and the technique is the pattern `git-workflow-pr`
- **A word for a new notion is looked up in the tree's glossary.** — `.claude/hooks/glossary-load.sh:GLOSSARY` — the glossary `docs/GLOSSARY.md`, its own sections in `.claude/rt-kit/overrides/docs/GLOSSARY.md`
- **The review of closed work goes to the background, and the executor takes the next task.** — Not checked: starting the role is a move of the executor, and it is invisible to a machine whether they waited for it or worked. The technique is the command `/skill-curator`
- **The review's findings wait for the owner, and only the digest of observations leaves for the package.** — `projects/agent-kit/src/lib/proposals.ts:readProposals` — what lies in `.claude/rt-kit/proposals/` leaves, and only by the call `agent-kit propose`
- **Building by a sample begins with reading the sample itself, whole, by walking the directories.** — **Not checked.** What the session opened leaves no trace in the tree: the guards judge an edit, not a read. It is held by this article and by the analysis, the record «2026-08-16-sample-judged-by-one-file» in the intake
- **What acts on the tree, not on the edit, lies outside the index.** — **Not checked.** The record lies in `.claude/handoff/` next to the session handover — the directory is in `.gitignore`, and the audits do not read it. It is printed by the `SessionStart` hook in `.claude/settings.local.json`, which is also outside history. This tree has no permission to work outside an epic at all: it started no epic guard
- **Which epic this working copy leads is read from the table of assignments, and the owner writes it.** — `tools/tree-assignment.mjs:assignmentFault` — the table is `.claude/rt-kit/assignments.md` in the main branch. The name of the copy lies in `.claude/rt-kit/tree-name` outside history. The refusal comes from `.claude/hooks/tree-assignment-guard.sh` on a created task and a moved card, and from `.claude/hooks/git-guard-delivery.sh` on a branch. The same reading is printed at session start by the `SessionStart` hook in `.claude/settings.local.json`. A closed epic left in the row is refused by `.claude/hooks/git-guard-tree-assignment.sh:rt_assignment_stale`, which asks the board by `rt_task_state`

## What of the law is not here

- **Abandoned drafts and folders of closed tasks are found by a check.** — **Carried out by half.** `npm run check:board` is in the tree, but the machine account does not see the owner board and the check refuses aloud. The folders are for now taken apart by eye at closing.
- **The readiness of an agreement to merge is checked by a command.** — **There is nothing to check.** `npm run check:specs` works, but there is not a single package spec yet.

Two other articles of the law — the state of unfinished work in the context and the ban on writing
code before the plan — have been carried out since edition 0.4.0 of the package: it ships
`task-context-load.sh` and `task-flow-guard.sh` itself.

## What else is worth knowing when reading the code

- **`docs/plans/` is older than this rule.** There lie the epic plans — works each of which is
  wider than one branch; the task folder neither cancels nor duplicates them — it is about one
  branch. The plan of a new epic goes there too, and the creation command lays a draft there itself:
  a card with the `epic` label in the work queue says the epic exists, and the task order is held by
  that record.
- **The branch of an epic is read from the header of its plan.** The line `**Ветка эпика:**` with
  the branch name; the queue holds no branch names at all, so the command of creating a task under
  an epic takes the base of the branch from there. A plan without that line leaves the executor to
  name the base by hand — the command says so aloud.
- **The task number comes from GitHub, not from the folder name.** Until the task is created, the
  folder is called `docs/tasks/_draft-<slug>/` and does not travel into history.

## What this is checked by

- `.claude/hooks/task-flow-guard.sh` — refuses a code edit without `plan.md`, once per branch per
  session.
- `.claude/hooks/task-context-load.sh` — the state of unfinished work travels into the context at
  session start.
- `.claude/hooks/git-guard-draft-ready.sh` — the turn does not end while ready work stands as a
  draft. A guard of this tree, not a package one. The shared conditions: the PR of the current
  branch is open as a draft and the run **on the PR tip** finished with success. Beyond that there
  are two grounds for a refusal — the task folder is not in the branch, so one call `gh pr ready` is
  left; the folder lies there, but the progress says the stages are closed, so the work stands at
  the tidying, and the refusal names its order. The stages are open — the guard is silent: a draft
  during ongoing work is lawful. The hosting answer is cached for a minute.
- `npm run check:hooks` — the guard scenarios, ten outcomes, without the network: the hosting
  helper is substituted, and each scenario raises a temporary repository of its own. It stands in
  the push gate set and as a pipeline step. It is set upon a deliberately broken copy of the guard
  through `RT_GUARD_PATH`: a suite that does not turn red on a breakage checks nothing.
- `npm run check:board` — abandoned drafts and folders of closed tasks; right now it refuses aloud,
  because the board is not visible to the machine account.
- By eye at the closing of the work: the task folder is taken apart, `progress.md` is written up,
  the agreement is merged into the package spec.
- `pnpm run agent-kit:check` — the rule is laid out and its companion is filled in.
