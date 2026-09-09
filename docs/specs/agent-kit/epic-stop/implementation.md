# Binding — the end of an epic is a stop, not the next task

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **The end of an epic is judged by a guard, not by the memory of the session.** — `projects/agent-kit/assets/hooks/epic-stop-guard.sh:RT_GUARD_NAME` — the guard itself; the suite is `projects/agent-kit/tests/epic-stop-guard.test.sh`
- **The guard stands on taking new work, not on the end of a turn.** — `projects/agent-kit/assets/hooks/epic-stop-guard.sh:takes_work` — a branch by a number, a created task, a column moved to the working one; scenarios `SC-AK-979`, `SC-AK-982`, `SC-AK-986`
- **The epic is over when no task of it is left unfinished.** — `projects/agent-kit/assets/checks/epic-table.github.mjs:unfinished` — the numbers of the unfinished ones, one per line; scenario `SC-AK-980`
- **The refusal names the stop, not only the ban.** — `projects/agent-kit/assets/hooks/epic-stop-guard.sh:reason` — the table command and the line about waiting; scenario `SC-AK-981`
- **The order to go on is carried in the call itself.** — `projects/agent-kit/assets/hooks/epic-stop-guard.sh:Epic-stop-skip` — an empty reason is not a bypass; scenario `SC-AK-983`
- **The state of the epic is asked by the same command that prints the table.** — `projects/agent-kit/assets/checks/epic-table.github.mjs:gathered` — one reading for both answers of the command
- **The guards of the stop and of the turn agree on one reading.** — `projects/agent-kit/assets/hooks/epic-over.sh:rt_epic_over` — one reading for the three guards; scenarios `SC-AK-987`, `SC-AK-988`
- **The reading is asked right before a refusal, not on every turn.** — `projects/agent-kit/assets/hooks/waiting-turn-guard.sh:rt_epic_over` — the call stands after the verdict, before the refusal text
- **A branch without a task number and a tree without epics are not judged.** — `projects/agent-kit/assets/hooks/epic-stop-guard.sh:table` — no command laid out, no number in the branch — the call goes through; scenario `SC-AK-984`
- **An inability to ask the hosting lets the work through.** — `projects/agent-kit/assets/hooks/epic-stop-guard.sh:asked` — a non-zero code of the command; scenario `SC-AK-985`
