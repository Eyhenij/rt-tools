# Binding — an unmerged agreement at opening a PR

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A PR into the main branch does not open while a draft named by a plan of the branch lies in the branch.** — `projects/agent-kit/assets/hooks/git-guard-delivery-folder.sh:rt_branch_plan_draft` — every plan the branch touched from its history, the `**Draft:**` line, the directory looked up in the tree of the head. Scenario SC-AK-1249.
- **A PR into an epic or into a lower branch of a stack does not wait for the draft.** — `projects/agent-kit/assets/hooks/git-guard-delivery-folder.sh:rt_delivery_open_base` — the base the command names; absent, the main branch. Scenario SC-AK-1296.
