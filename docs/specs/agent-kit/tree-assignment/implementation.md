# Binding — the epic of a working copy is written down, not chosen

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The epic of a working copy is read from the table, not chosen from the list of open ones.** — `projects/agent-kit/assets/checks/tree-assignment.mjs:assignmentOf` — the row of this copy, or nothing; scenario `SC-AK-1113`
- **The table lies in the main branch, and the name of the copy outside the history.** — `projects/agent-kit/assets/checks/rt-kit-checks.config.mjs:treeNameFile` — the address of the local name, the address of the table next to it
- **A copy that names itself in no way is refused by that, not by the absence of a row.** — `projects/agent-kit/assets/checks/tree-assignment.mjs:treeName` — no file, no name — the refusal names the file to write it into; scenario `SC-AK-1113`
- **A row with a dash and a missing row are two different answers.** — `projects/agent-kit/assets/checks/tree-assignment.mjs:assignments` — a dash gives a row with an empty epic, not the absence of a row; scenario `SC-AK-1113`
- **The refusal names both epics: the assigned one and the one being taken.** — `projects/agent-kit/assets/checks/tree-assignment.mjs:assignmentFault` — the assigned number and the taken one in one line; scenario `SC-AK-1113`
- **Every call that takes work is judged, not only the branch.** — `projects/agent-kit/assets/hooks/tree-assignment-guard.sh:takes_work` — a created task and a card moved to the work column; scenario `SC-AK-1114`
- **Creating an epic is not taking work.** — `projects/agent-kit/assets/hooks/tree-assignment-guard.sh:creates_epic` — the call goes through before the table is read; scenario `SC-AK-1114`
- **Work that names no epic is not judged by the assignment.** — `projects/agent-kit/assets/hooks/git-guard-tree-assignment.sh:rt_assignment_fault` — an empty epic in the call gives no refusal; scenario `SC-AK-1113`
- **An assignment whose epic is closed is refused on a par with a foreign one.** — `projects/agent-kit/assets/hooks/git-guard-tree-assignment.sh:rt_assignment_stale` — the refusal says the assignment outlived its epic; scenario `SC-AK-1115`
- **The state of the epic is asked of the queue, and its silence is not a refusal.** — `projects/agent-kit/assets/hooks/git-guard-tree-assignment.sh:rt_task_state` — no answer, no refusal; scenario `SC-AK-1115`
- **A tree that declares no table is not judged.** — `projects/agent-kit/assets/checks/rt-kit-checks.config.mjs:assignmentsFile` — an empty address by default; scenario `SC-AK-1113`
- **The reader is one for the audit and for the guards.** — `projects/agent-kit/assets/hooks/git-guard-tree-assignment.sh:rt_assignment_cmd` — the address of the reader is taken from the settings of the tree, not written twice
