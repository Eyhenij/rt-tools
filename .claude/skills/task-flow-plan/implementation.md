# task-flow-plan — what is its own here

The bindings of this tree for the part `task-flow-plan` of the work-conduct rule, next to its `SKILL.md`.
The names of the course of work and the rest of what is its own here are in the companion of
`task-flow`.

## Where the articles are carried out

The first column is the article verbatim, as it is written in the section «How the law applies
here».

- **Editing application code is refused until the work has reached a state in which code is edited.** — `.claude/hooks/task-flow-guard.sh:plan` — the folder by the name of the current branch, the plan in it and a declared state; without any of them a code edit is refused
- **The guard judges the declared transition, not the presence of files.** — `.claude/hooks/task-flow-guard.sh:state` — the state line is read from the progress, and it lifts the refusal, not a file lying on disk
- **Editing application code is refused until the work has reached a state in which code is edited.** — `.claude/rt-kit/project.sh:RT_ARCHIVE_PRUNE_CMD` — `node tools/archive-prune.mjs --apply`. This command the guard does not judge: the records age by the calendar, and the retention step turns red without an edit in the branch. The whole command is matched, not an occurrence
- **The plan guard is the lower bound of the requirement, not its limit.** — `.claude/hooks/task-flow-guard.sh:plan` — the guard judges the paths of the application code; the requirement is wider than it and is held by the memory of the executor
- **The task folder goes into the branch by a commit, not lives in one working tree.** — `.claude/hooks/facts-flow.sh:rt_flow_in_tree` — a code edit is refused while the task folder is not in the `HEAD` of the branch; a numbered folder holding no file of the git index is named by the work queue audit — `tools/board-folders.mjs:checkUntrackedFolders`, scenario SC-AK-1185 in `docs/specs/agent-kit/work/queue-check/`; a draft `_draft-<slug>` is lawful and is not named
- **A count that becomes the measure of the work is bounded by the declaration, not by the file.** — **Not checked.** A count is a command of the executor, and nothing reads what it was taken over. It is held by whoever writes the measure into the plan
- **Waiting for one part of a stage is never a stop of the stage.** — Not checked: which part of the work depends on what is invisible to a machine. This is held by the article of the rule and by the word to the owner about what is already done.
- **The stages of a plan cover its done-sign whole.** — **Not checked by anything.** The machine reads both texts and does not know what work stands behind the words. Held by reading two neighbouring sections of one file before the first stage.
- **Every rule of the product agreement becomes a step of some stage.** — **Not checked by anything.** The machine does not read the rules of the agreement against the steps of the plan. It is held by the comparison before the first stage and by the merge review.
- **Every step of the plan carries a check whose expected output is taken from a run while the plan is written.** — `tools/flow-guard.mjs:judgeProgress` — a step marked done without the mark written by `tools/task-flow-script.mjs step` is refused. That the expected output came from a run is not checked: nothing ties the minute of a run to the minute the plan was written
- **A plan for work that ports a technique from outside is written by a measurement of one's own code.** — **Not checked by anything.** Whether a plan came from a sample or from a count over one's own files is visible in no artefact. Held by the article itself.
- **A taken task does not end a turn.** — `tools/task-flow/measure/task.mjs:taken` — a taken task is a state whose exit is the plan, and the exit guard holds the turn in it; the scenarios are `projects/agent-kit/tests/task-flow-script.test.sh`
- **A finding made mid-stage is checked against the plan's exit conditions before the first edit.** — **Not checked.** Before the first edit the finding is not in the tree at all, and after it the guard sees the edit and does not know whether the plan named it. The files of a neighbouring piece of work differ in nothing from one own. It is held by reconciling with the list of stages, not by a sign.
- **Done work is marked only in the progress.** — **Not checked.** A second record of what is done — in the commit body, in the PR description — has nothing for a machine to reconcile it with
- **The plan names the steps of every stage, and the progress mirrors them with a mark each.** — `tools/work-steps-lib.mjs:stepsOfPlan` — the scenarios are `projects/agent-kit/tests/work-steps.test.sh`
- **The numbers and the names of the steps are copied from the plan, not reworded.** — `tools/check-work-steps.mjs:judge` — matched by number and by name
- **Exactly one step carries the mark of going on right now, while any step is not done.** — `tools/work-steps-lib.mjs:CURRENT` — the check counts them
- **The plan names the points: the epic its milestone, the task the change a person will see.** — `.claude/workflows/plan.js:points` — the planning call of the role `.claude/agents/product-strategist.md`, and `.claude/workflows/feature.js:points` — its review call; neither has been run yet, so both are called unverified. The review call before the PR is held by the pattern `task-flow-close`, and the heading of the table of points in the PR body by `.claude/hooks/git-guard-delivery-body.sh:rt_delivery_pull_body` when the PR opens. **Not checked:** the section in `docs/tasks/_template/plan.md` is filled by hand, and no guard knows whether the signs in the table were run.
- **Two requirements — two guards, and one can be lifted without losing the other.** — `.claude/hooks/task-flow-draft-guard.sh:draft` — the agreement is judged by its own guard, and the task folder and the state by `.claude/hooks/facts-flow.sh:rt_flow_folder_archived`; the parsing of the call is shared — `.claude/hooks/task-flow-context.sh:rt_task_flow_context`
- **The agreement is required by the edit paths, not by an appraisal of the task.** — `.claude/hooks/task-flow-context.sh:rt_tf_candidates` — the edit paths are judged; the bypass is the line about behaviour in the plan header
- **A task folder is created for any work, no exceptions.** — `.claude/hooks/task-flow-guard.sh:tasks_dir` — the task directory here is `docs/tasks`, and the folder is looked for by the branch name one to one
- **The task folder is created as a draft and gets its number by a command.** — `tools/task-new.mjs:adoptDraft` — the draft by slug is renamed into the folder by branch name and gets the plan header
- **An abandoned grill is visible.** — `tools/check-board.mjs:checkDrafts` — a draft older than a week is listed by the work queue audit
- **A merged agreement does not lock the branch.** — `.claude/hooks/facts-flow.sh:rt_fact_agreement` — the branch history tells the merged from the never-created
