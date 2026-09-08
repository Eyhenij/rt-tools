# The binding — the audit of the work queue

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A request opened not into the main branch is named by a line of its own.** — `projects/agent-kit/assets/checks/check-board.github.mjs:baseRefName` — the base arrives by the same request as the other fields of the request; scenario SC-AK-845
- **The answer of the work queue helper says whose eyes the state was taken by.** — `projects/agent-kit/assets/checks/board.github.mjs:viewerOf` — the field is set by `taskState` and `pullState`; scenario SC-AK-873
- **The plan of an epic is the document that carries the makeup, not the first path in the card.** — `projects/agent-kit/assets/checks/board-epics.github.mjs:checkEpicLinks` — the table is read by `planRows`; scenario SC-AK-919
- **Belonging to an epic is declared by a word about the task, not by a mention of the number.** — `projects/agent-kit/assets/checks/board-epics.github.mjs:declaredEpicOf` — both sides call it; scenario SC-AK-920
