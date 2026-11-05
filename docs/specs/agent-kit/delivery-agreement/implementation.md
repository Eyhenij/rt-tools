# Binding — an unmerged agreement at opening a PR

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A PR does not open while the draft named by the plan of the branch lies in the branch.** — `projects/agent-kit/assets/hooks/git-guard-delivery-folder.sh:rt_branch_plan_draft` — the last plan of the branch from its history, the `**Draft:**` line, the directory looked up in the tree of the head. Scenario SC-AK-1249.
