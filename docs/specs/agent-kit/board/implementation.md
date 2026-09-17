# The binding — the audit of the work queue

A statement of the spec and the place where it is carried out. The link goes by the text of the
statement: a removed statement is removed together with its line.

- **A request whose base is not the main branch is not counted as lacking a run.** — `projects/agent-kit/assets/checks/board-pull-state.github.mjs:baseRefName` — the base arrives by the same request as the other fields of the request; scenario SC-AK-845
- **What such a base means is named once, by one line with both consequences.** — `projects/agent-kit/assets/checks/check-board.github.mjs:offBase` — the count is gathered over the open requests and printed after them; scenario SC-AK-1107
- **The answer of the work queue helper says whose eyes the state was taken by.** — `projects/agent-kit/assets/checks/board.github.mjs:viewerOf` — the field is set by `taskState` and `pullState`; scenario SC-AK-873
- **The creating command and the audit read the path to the plan by one and the same move.** — `projects/agent-kit/assets/checks/board-epic-plan.github.mjs:planPathOf` — one module, called by the audit `board-epics.github.mjs` and by the creating command `task-new.github.mjs`; the makeup is demanded by the argument `makeupRequired`; scenario SC-AK-1089
- **The plan of an epic is the document that carries the makeup, not the first path in the card.** — `projects/agent-kit/assets/checks/board-epics.github.mjs:checkEpicLinks` — the table is read by `planRows`; scenario SC-AK-919
- **Belonging to an epic is declared by a word about the task, not by a mention of the number.** — `projects/agent-kit/assets/checks/board-epics.github.mjs:declaredEpicOf` — both sides call it; scenario SC-AK-920
- **A task naming neither an epic nor the word of the owner is a divergence.** — `projects/agent-kit/assets/checks/board-epics.github.mjs:checkTasksOutsideEpics` — scenario SC-AK-996
- **The cargo of the trees is not judged by this line.** — `projects/agent-kit/assets/checks/board-epics.github.mjs:CARGO_LABELS`
- **The base of an open request about a task of an epic is judged by the audit.** — `projects/agent-kit/assets/checks/board-epics.github.mjs:checkEpicPullBase` — scenario SC-AK-997
- **The branch of an epic is recognised by its number in the name of the base.** — `projects/agent-kit/assets/checks/board-epics.github.mjs:checkEpicPullBase`
- **An epic with no branch in the requests is a divergence.** — `projects/agent-kit/assets/checks/board-epics.github.mjs:checkEpicState` — scenario SC-AK-998
- **An epic whose tasks are over and whose request is not open is a divergence.** — `projects/agent-kit/assets/checks/board-epics.github.mjs:checkEpicState`
- **A list the hosting gives in pages is read whole, not by its first page.** — `projects/agent-kit/assets/checks/board-epics.github.mjs:checkEpicSubIssues` — the call of the list carries the paging sign. The helper of the hosting in the suite answers differently with it and without it. Otherwise the scenario is green on a code that reads one page of two. Scenario SC-AK-1093
- **An open task whose card stands in a closing column is a divergence.** — `projects/agent-kit/assets/checks/check-board.github.mjs:CLOSING_STATUSES` — the closing columns are taken from the named options of the queue; scenario SC-AK-1112
- **A branch carrying no task folder is a divergence, and the branch of an epic is not.** — `projects/agent-kit/assets/checks/board-folders.mjs:checkBranchFolders` — the branch history is judged, not its tip: the folder is taken apart by the last commit before the PR opens. Scenarios SC-AK-1125 and SC-AK-1127
- **A branch is recognised as an epic's by the plan inside that branch, not by the plan on disk.** — `projects/agent-kit/assets/checks/board-folders.mjs:namesItselfEpic` — the plans of the branch are listed by their raw paths and read out of it; the header pattern is the one the creating command writes with. Scenario SC-AK-1126
