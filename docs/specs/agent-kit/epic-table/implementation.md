# Binding — the table of the epic's tasks assembled by a command

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The table is assembled by a command, not by the memory of the session.** — `projects/agent-kit/assets/checks/epic-table.github.mjs:epicTable` — the whole answer in one call; the suite is `projects/agent-kit/tests/epic-table.test.sh`
- **The order of the tasks is taken from the epic plan, not from the work queue.** — `projects/agent-kit/assets/checks/epic-table.github.mjs:makeupOf` — the rows of the table with the task column; scenario `SC-AK-971`
- **The epic is taken from the current branch, and the argument names another one.** — `projects/agent-kit/assets/checks/epic-table.github.mjs:epicAsked` — scenarios `SC-AK-969`, `SC-AK-970`
- **What the task is about is taken from the plan, and its name from the card.** — `projects/agent-kit/assets/checks/epic-table.github.mjs:nameOf` — the name comes from the card, what it is about from the makeup
- **A task named by the plan and missing from the queue stands in the table by a row of its own.** — `projects/agent-kit/assets/checks/epic-table.github.mjs:rowOf` — scenario `SC-AK-972`
- **The cell of the state carries a number from the answer of the hosting.** — `projects/agent-kit/assets/checks/epic-table.github.mjs:VERDICT` — the number of the request and the outcome of the run; scenario `SC-AK-973`
- **The run is asked by the head of the request, not by the branch.** — `projects/agent-kit/assets/checks/epic-table.github.mjs:rowOf` — the head of the request goes into the call; scenario `SC-AK-973`
- **A closed task is named merged and asks the hosting for nothing else.** — `projects/agent-kit/assets/checks/epic-table.github.mjs:rowOf` — scenario `SC-AK-974`
- **A refusal names the next move and does not print an empty table.** — `projects/agent-kit/assets/checks/epic-table.github.mjs:epicTable` — scenarios `SC-AK-975`, `SC-AK-976`, `SC-AK-977`
- **The command asks and does not move.** — **Not checked.** The command holds no call that writes; nothing reconciles that with the tree.
