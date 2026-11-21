# Binding — the end of an epic is a stop, not the next task

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The end of an epic is judged by a guard, not by the memory of the session.** — `projects/agent-kit/assets/hooks/epic-stop-guard.sh:RT_GUARD_NAME` — the guard itself; the suite is `projects/agent-kit/tests/epic-stop-guard.test.sh`
- **The guard stands on taking new work, not on the end of a turn.** — `projects/agent-kit/assets/hooks/epic-stop-guard.sh:takes_work` — a created task or a branch by a number; a column move is not judged; scenarios `SC-AK-979`, `SC-AK-982`, `SC-AK-986`
- **The epic is over when no task of it is left unfinished.** — `projects/agent-kit/assets/checks/epic-table.github.mjs:unfinished` — the numbers of the unfinished ones, one per line; scenario `SC-AK-980`
- **The decision is the owner's, and the guard asks them by a window.** — `projects/agent-kit/assets/hooks/epic-stop-guard.sh:reason` — the decision `ask` with this reason; scenarios `SC-AK-979`, `SC-AK-1558`
- **The window names the end of the epic and the command of the table.** — `projects/agent-kit/assets/hooks/epic-stop-guard.sh:reason` — the table command and the words about the end of the epic; scenario `SC-AK-981`
- **The guard reads no record of the conversation.** — **Not carried out by a machine:** an absence has no place in code to point at; the suite holds it by scenario `SC-AK-1559`, where the record carries consent, a refusal and a number, and the answer stays `ask`
- **Only the command that is run is judged.** — `projects/agent-kit/assets/hooks/epic-stop-guard.sh:heads` — heredoc bodies dropped, the command cut by the shell separators, assignments of variables stripped; scenario `SC-AK-1560`
- **A window is written to the journal apart from the refusals.** — `projects/agent-kit/assets/hooks/epic-stop-guard.sh:rt_note` — the record `guard-ask` with the name of the guard; scenario `SC-AK-1561`
- **The state of the epic is asked by the same command that prints the table.** — `projects/agent-kit/assets/checks/epic-table.github.mjs:gathered` — one reading for both answers of the command
- **The guards of the stop and of the turn agree on one reading.** — `projects/agent-kit/assets/hooks/epic-over.sh:rt_epic_over` — the reading of the guard of the stop; the exit guard measures the same end through `projects/agent-kit/assets/task-flow/measure/epic.mjs:finished`; scenarios `SC-AK-987`, `SC-AK-988`
- **The reading is asked right before a window, not on every turn.** — **Not carried out by a machine:** the exit guard measures the end of the epic on every turn through the engine, `projects/agent-kit/assets/task-flow/measure/epic.mjs:finished`
- **A branch without a task number and a tree without epics are not judged.** — `projects/agent-kit/assets/hooks/epic-stop-guard.sh:takes_work` — no number in the branch name, no command laid out — the call goes through; scenario `SC-AK-984`
- **An inability to ask the hosting lets the work through.** — `projects/agent-kit/assets/hooks/epic-over.sh:rt_epic_over` — a non-zero code of the command; scenario `SC-AK-985`

`guard-ask` is the name of the window record in the journal of observations.
