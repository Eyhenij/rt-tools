# Binding — a PR asked about before the set

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A run ahead whose PR would not open starts no step.** — `projects/agent-kit/assets/hooks/git-guard-push-ahead.sh:not_started`; scenario `SC-AK-1993`
- **The conditions of the epic and of the tree are judged by the code the opening of a PR is judged by.** — `projects/agent-kit/assets/hooks/git-guard-push-ready.sh:rt_push_ready_unmet`, the functions are `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh:rt_epic_pull_base` and `rt_epic_own_pull` next to it; scenarios `SC-AK-1994`, `SC-AK-1995`
- **The guards a tree opens a PR through are named by its profile.** — `projects/agent-kit/assets/hooks/git-guard-push-ready.sh:rt_push_ready_ask`; scenario `SC-AK-1996`
- **The base of the PR is the branch of the epic where the set is counted against the main branch.** — `projects/agent-kit/assets/hooks/git-guard-push-ready.sh:rt_push_ready_base`; scenario `SC-AK-1996`
- **A moved base holds the run while the task folder lies in the branch.** — `projects/agent-kit/assets/hooks/git-guard-push-ready.sh:rt_push_ready_unmet`; scenario `SC-AK-1995`
- **A folder that cannot be taken apart holds the run, and each reason has a line of its own.** — `projects/agent-kit/assets/checks/flow-ready.mjs:folderReasons`; scenario `SC-AK-1994`
- **The folders of tasks left in the branch of an epic hold its run.** — `projects/agent-kit/assets/hooks/git-guard-delivery-epic.sh:rt_epic_own_pull`; scenario `SC-AK-1994`
- **A branch not going into a PR yet is run with a reason.** — `projects/agent-kit/assets/hooks/git-guard-push-ahead.sh:no_pr`; scenario `SC-AK-1993`
- **What cannot be judged does not hold the run.** — `projects/agent-kit/assets/hooks/git-guard-push-ready.sh:rt_push_ready_unmet`, the engine is `projects/agent-kit/assets/checks/flow-ready.mjs:unjudged`; scenarios `SC-AK-1993`, `SC-AK-1994`, `SC-AK-1995`
- **The question is a step of the run.** — `projects/agent-kit/assets/hooks/git-guard-push-ahead.sh:rt_push_ready_unmet`; scenario `SC-AK-1993`
