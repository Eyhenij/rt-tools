# Leading the work by commands — where the rules are carried out

The first column is the rule verbatim, as it is written in the "Rules" section of the spec next to
it. A rule without a line and a line without a rule is a divergence: the spec promises what is not
in the code, or the code holds what the spec is silent about.

The anchor here is the word that holds the statement up. The check looks for it across the whole
file and is satisfied by any word, so a field name from a foreign line passes it the same as the
needed sentence — and the statement stays green when the text of the role itself is rewritten whole.

- **The task folder does not go away into the main branch.** — `projects/agent-kit/assets/hooks/git-guard-delivery-folder.sh:rt_folder_in_branch`
- **What is checked is what will go into the main branch, not what lies on the machine.** — `projects/agent-kit/assets/hooks/git-guard-delivery-folder.sh:rt_folder_in_branch`
- **A branch that took the folder apart adds a record to the directory of the archive.** — `projects/agent-kit/assets/hooks/git-guard-delivery-folder.sh:rt_folder_was_in_branch`
- **The tidying stands before the opening of the request, not after the approval.** — `projects/agent-kit/assets/hooks/git-guard-delivery-folder.sh:rt_delivery_open_folder`
- **The bypass of the requirement is written with a reason, and it is read without a network.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:folder_skip_re`
- **An open PR whose branch carries the folder of its task is a divergence of the check.** — `projects/agent-kit/assets/checks/check-board.github.mjs:folderInBranch`
- **The line of the bypass begins the line and accepts no substitutions.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:folder_skip_re`
- **The bypass lifts the refusal, but does not remove the line from the check.** — `projects/agent-kit/assets/checks/check-board.github.mjs:taskDirs`
- **The folder is looked for by the name of the branch whole, together with the slash.** — `projects/agent-kit/assets/hooks/git-guard-delivery-folder.sh:rt_folder_in_branch`
- **A tree that set no directory of tasks gets no requirement.** — `projects/agent-kit/assets/defaults/project.sh:RT_TASKS_DIR`
- **A task left in the first column of the work queue is not ready for delivery.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:backlog_column`
- **The column is asked about where it should already have been moved.** — `projects/agent-kit/assets/hooks/git-guard-delivery.sh:judge_column`
- **The name of the first column is named by the tree, and without it the column is not judged.** — `projects/agent-kit/assets/defaults/project.sh:RT_BOARD_BACKLOG`
- **The draft is not lifted while the PR has no review.** — `projects/agent-kit/assets/hooks/git-guard-delivery-draft.sh:pull_ref`
- **The draft is not lifted from a PR that does not merge either.** — `projects/agent-kit/assets/hooks/git-guard-delivery-draft.sh:conflicting`
- **Silence about mergeability does not hold up the lifting.** — `projects/agent-kit/assets/checks/board.github.mjs:conflicting`
- **A reference to the PR at the lifting of the draft is not mandatory.** — `projects/agent-kit/assets/checks/board.github.mjs:target`
- **Returning a PR into a draft gets no requirement.** — `projects/agent-kit/assets/hooks/git-guard-delivery-draft.sh:undo`
- **The number of the PR in the refusal is taken from the answer of the work queue, not from the command.** — `projects/agent-kit/assets/hooks/git-guard-delivery-draft.sh:pull_name`
- **The author does not count as a review of their own PR.** — `projects/agent-kit/assets/checks/board.github.mjs:reviewed`
- **The state of a PR is asked of the same helper of the work queue as the state of a task.** — `projects/agent-kit/assets/defaults/project.sh:rt_pull_state_default`
- **An answer with the mark "there was no network" is not a state.** — `projects/agent-kit/assets/defaults/project.sh:offline`
- **A tier that needs an answer of the work queue stays silent without an answer.** — `projects/agent-kit/assets/hooks/git-guard-delivery-draft.sh:rt_pull_state`
- **A session is closed by one command.** — `projects/agent-kit/assets/commands/next-session.md:ARGUMENTS`
- **The command of closing a session first finds out whether the work is led by the rule.** — `projects/agent-kit/assets/commands/next-session.md:rt_task_branch_ok`
- **At work by the rule with a merged PR the local main is moved to the remote one without a switch to it.** — `projects/agent-kit/assets/commands/next-session.md:fetch`
- **The merged state of a branch is judged from the remote reference, not from the local main.** — `projects/agent-kit/assets/commands/next-session.md:merged` — both calls of the count, of the merged and of the unmerged, take `origin/<main>`
- **In all the other cases the main branch is merged into the current one.** — `projects/agent-kit/assets/commands/next-session.md:merge`
- **An uncommitted edit stops the closing of the session before the first action.** — `projects/agent-kit/assets/commands/next-session.md:status`
- **Only merged local branches are removed.** — `projects/agent-kit/assets/commands/next-session.md:merged`
- **The dead trackings are removed by the same call.** — `projects/agent-kit/assets/commands/next-session.md:prune`
- **The handover is written last and put outside the tree.** — `projects/agent-kit/assets/commands/next-session.md:RT_HANDOFF_DIR`
- **The name of the main branch and the directory of the handover the command takes from the profile of the tree.** — `projects/agent-kit/assets/defaults/project.sh:RT_HANDOFF_DIR`
- **The closing of a session does not touch the delivery.** — `projects/agent-kit/assets/commands/next-session.md:ARGUMENTS`
- **The creating of a task ends with an answer of the work queue, not with the output of the command.** — `projects/agent-kit/assets/checks/task-new.github.mjs:describeTaskState`
- **A task that is not in the work queue ends the command of creating with a non-zero code.** — `projects/agent-kit/assets/checks/board.github.mjs:describeTaskState`
- **A task without an executor is named by a line of its own.** — `projects/agent-kit/assets/checks/board.github.mjs:assignees`
- **A work queue that was not asked is no confirmation.** — `projects/agent-kit/assets/checks/task-new.github.mjs:OfflineError`
- **The answer of the queue is put together into lines by a pure function.** — `projects/agent-kit/assets/checks/board.github.mjs:describeTaskState`
- **Every state of the work has a section in the pattern that leads it.** — `projects/agent-kit/assets/checks/check-states.mjs:sectionsOf`
- **A section about a state outside the list is the same divergence as a state without a section.** — `projects/agent-kit/assets/checks/check-states.mjs:known`
- **A run at the tip of an open request pushed out of the queue of the pipeline is a divergence of the check.** — `projects/agent-kit/assets/checks/check-board.github.mjs:checkEvicted`
- **The pushing out is recognised by the number of the jobs of the run, not by the word of the cancellation.** — `projects/agent-kit/assets/checks/board-runs.github.mjs:evictedOnHead`
- **The number of the jobs is asked only of the cancelled runs of the tip.** — `projects/agent-kit/assets/checks/board-runs.github.mjs:jobCount`
- **The line of the pushing out names both commands and in the order they are called** — `projects/agent-kit/assets/checks/check-board.github.mjs:checkEvicted`
- **The pushing out is judged before the colour and before the absence of a run.** — `projects/agent-kit/assets/checks/check-board.github.mjs:checkHeadRun`
- **The mark of multi-session work is checked against the record in the line of the works both ways.** — `projects/agent-kit/assets/checks/board-long-work.github.mjs:checkLongWork` — scenario SC-AK-823
- **What counts as a record in the line is a row where both the word of the mark and the number of the task stand.** — `projects/agent-kit/assets/checks/board-long-work.github.mjs:markedRows`
- **A rollout that fell is named apart from a production that lags.** — `projects/agent-kit/assets/checks/board-runs.github.mjs:lastDeploy` — scenario SC-AK-824
- **A rollout in progress does not count as a divergence.** — `projects/agent-kit/assets/checks/board-runs.github.mjs:lastDeploy` — an unfinished run gives back the verdict "running", and there is no line about it
- **A tree that named no mark or no directory of the lines gets silence, not a refusal.** — `projects/agent-kit/assets/checks/board-long-work.github.mjs:LONG_LABEL`
