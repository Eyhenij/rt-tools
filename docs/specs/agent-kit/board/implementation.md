# The binding — the audit of the work queue

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A request opened not into the main branch is named by a line of its own.** — `projects/agent-kit/assets/checks/board-pull-state.github.mjs:baseRefName` — the base arrives by the same request as the other fields of the request; scenario SC-AK-845
- **The answer of the work queue helper says whose eyes the state was taken by.** — `projects/agent-kit/assets/checks/board.github.mjs:viewerOf` — the field is set by `taskState` and `pullState`; scenario SC-AK-873
- **The plan of an epic is the document that carries the makeup, not the first path in the card.** — `projects/agent-kit/assets/checks/board-epics.github.mjs:checkEpicLinks` — the table is read by `planRows`; scenario SC-AK-919
- **Belonging to an epic is declared by a word about the task, not by a mention of the number.** — `projects/agent-kit/assets/checks/board-epics.github.mjs:declaredEpicOf` — both sides call it; scenario SC-AK-920
- **A task naming neither an epic nor the word of the owner is a divergence.** — `projects/agent-kit/assets/checks/board-epics.github.mjs:checkTasksOutsideEpics` — scenario SC-AK-945
- **The cargo of the trees is not judged by this line.** — `projects/agent-kit/assets/checks/board-epics.github.mjs:CARGO_LABELS`
- **The base of an open request about a task of an epic is judged by the audit.** — `projects/agent-kit/assets/checks/board-epics.github.mjs:checkEpicPullBase` — scenario SC-AK-946
- **The branch of an epic is recognised by its number in the name of the base.** — `projects/agent-kit/assets/checks/board-epics.github.mjs:checkEpicPullBase`
- **An epic with no branch in the requests is a divergence.** — `projects/agent-kit/assets/checks/board-epics.github.mjs:checkEpicState` — scenario SC-AK-947
- **An epic whose tasks are over and whose request is not open is a divergence.** — `projects/agent-kit/assets/checks/board-epics.github.mjs:checkEpicState`
