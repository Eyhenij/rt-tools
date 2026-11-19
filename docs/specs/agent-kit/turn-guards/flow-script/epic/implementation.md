# Binding — the end of an epic

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **Exit 11 is met when every unmerged, unblocked task of the epic other than the current one has a branch, and with no such task.** — `projects/agent-kit/assets/task-flow/measure/epic.mjs:nextTaken` — a deferred task and a task waiting for the owner's step are passed over. `projects/agent-kit/assets/task-flow/source/owner.mjs:open` — the messages the owner typed. Scenarios `SC-AK-1388`, `SC-AK-1389`, `SC-AK-1390`, `SC-AK-1741`, `SC-AK-1755`
- **Exit 12 is met when every task not deferred with a merged PR of its branch is marked «влито», except the task merged last and the task of the last row, and no other task is left unmerged.** — `projects/agent-kit/assets/task-flow/measure/epic.mjs:mergedMarked` — merged PRs by time and marks. `projects/agent-kit/assets/task-flow/measure/epic.mjs:openPullOrClosedUnmerged` — the PR not merged. Scenarios `SC-AK-1391`, `SC-AK-1742`, `SC-AK-1752`, `SC-AK-1753`, `SC-AK-1754`
- **Exit 13 is met when the tip of every task not deferred lies in the epic branch or the main branch, and the PR of the epic into the main branch exists.** — `projects/agent-kit/assets/task-flow/measure/epic.mjs:finished` — the tip from the local branch, the server or the head of the merged PR. Scenarios `SC-AK-1392`, `SC-AK-1393`, `SC-AK-1394`, `SC-AK-1466`
