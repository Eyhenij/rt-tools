# The binding — the guards of the progress of the work

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **Application code is not edited while there is no task folder, no plan in it and no declared state.** — `projects/agent-kit/assets/hooks/task-flow-guard.sh:progress`
- **What is judged is the declared transition, not the presence of files.** — `projects/agent-kit/assets/hooks/task-flow-guard.sh:state`
- **The refusal names the mandatory action of the state that is declared.** — `projects/agent-kit/assets/hooks/task-flow-guard.sh:state_action`
- **A folder taken apart by a commit of the branch lifts the requirement of the plan.** — `projects/agent-kit/assets/hooks/task-flow-guard.sh:folder_archived`
- **The task folder goes into the branch by a commit, it does not live in one working tree.** — `projects/agent-kit/assets/hooks/task-flow-guard.sh:in_tree`
- **The agreement is demanded by the paths of the edit, not by an appraisal of the task.** — `projects/agent-kit/assets/hooks/task-flow-context.sh:rt_tf_candidates`
- **The agreement is named by one of two kinds — a draft in the "proposed" directory or a domain spec.** — `projects/agent-kit/assets/hooks/task-flow-draft-guard.sh:draft`
- **A named agreement must exist on the disk or in the history of the branch.** — `projects/agent-kit/assets/hooks/task-flow-draft-guard.sh:draft_path`
- **The bypass of the requirement of the agreement is the line about unchanged behaviour with the reason of the owner.** — `projects/agent-kit/assets/hooks/task-flow-draft-guard.sh:plan`
- **An edit put by a shell command is judged on a par with an edit by a tool.** — `projects/agent-kit/assets/hooks/task-flow-context.sh:rt_tf_cmd`
- **Removing a path that is not in the history does not count as an edit of the product.** — `projects/agent-kit/assets/hooks/task-flow-context.sh:rt_tf_removes`
- **The keys of the task folder are read under two names, English and Russian.** — `projects/agent-kit/assets/hooks/task-flow-guard.sh:state` — the state; the agreement and the unchanged behaviour — `projects/agent-kit/assets/hooks/task-flow-draft-guard.sh:draft`; scenario SC-AK-908
- **A laid-out rules layer is judged on a par with application code.** — `projects/agent-kit/assets/hooks/task-flow-context.sh:rt_tf_laid_out`
