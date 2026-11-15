# Scenarios: the task flow as an executable scenario

A subdomain of the domain "The guards of the end of a turn". Here are the scenarios of the engine
that measures the task flow by its description.

### SC-AK-1365 — exit 1 is met by the grill of the branch

Given the grill of the branch in the working copy, the same grill only in the history, and a grill left as the sample wrote it
When exit 1 is measured
Then it is met by the first two and unmet by the sample

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1366 — exit 1 is met by a draft grill

Given a draft folder in the working copy with an answered grill, and one without a grill
When exit 1 is measured on a branch without a task number
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1367 — exit 3 is met by the agreement directory from the history

Given a plan naming a directory under proposed/ that only the main branch holds in its history, and one naming a directory that never existed
When exit 3 is measured
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1368 — exit 3 is met by the reason there is no agreement

Given a plan with `**Behaviour:** unchanged — <reason>`, a grill with `**Описание фичи:** не нужно — <reason>`, and a reason left as the sample wrote it
When exit 3 is measured
Then it is met by the first two and unmet by the sample

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1369 — exit 5 is met when the approval mark lies

Given a plan the branch added with checks of known forms and an approval mark beginning with «Одобряю», and the same plan with a check of an unknown form
When exit 5 is measured
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1370 — exit 5 is unmet without the mark, and the work stays in «задача-взята»

Given a plan the branch added and no approval mark
When exit 5 is measured
Then it is unmet

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1371 — an approval given in another working copy holds

Given an approval mark written in the common directory from one working copy, and then a mark that does not parse
When the marks are read from the second working copy
Then the first is seen, the second reads as absent

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1372 — the answer «переделай» to the approval menu gives no mark

Given an approval mark whose answer asks for rework
When exit 5 is measured
Then it is unmet

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1373 — exit 6 is met by exactly one step going on

Given versions of the progress with one step going on, with two, and with a renamed step
When exit 6 is measured
Then only the first meets it

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1374 — a done step without its mark does not count

Given a progress with every step done, a green mark for one step, then for both
When exit 7 is measured
Then it is unmet with one mark and met with both

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1375 — a plan without check lines is judged by the done marks

Given a plan without a single check line and a progress with every step done
When exit 7 is measured without step marks
Then it is met

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1376 — exit 8 measures only the rows marked edited

Given a footprint with a marked row and an unmarked one, and a change under one of them
When exit 8 is measured
Then it is met when the marked row changed and unmet when only the unmarked one did

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1377 — a plan without marked rows is judged by proposed/ alone

Given a plan whose rows carry no mark and whose rules were not changed, and a plan whose agreement directory under proposed/ still stands in the head
When exit 8 is measured
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1378 — exit 9 is met by a record in the archive

Given a commit that removed the task folder and added a record to the archive, and one that only removed the folder
When exit 9 is measured
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1379 — exit 2 is met by the epic branch on the server

Given the epic branch on the server with the epic card in work, and the same with the card in the first column
When exit 2 is measured
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1380 — exit 2 is met by an epic merged into the main branch after its branch is removed

Given no epic branch on the server and a merged PR of the epic into the main branch, then neither
When exit 2 is measured
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1381 — the memory of exits 2 and 4 survives a commit

Given exit 4 met once, then a commit and a card that cannot be read; exit 2 kept before; a task in the first column; the real source remembering exit 2 before a commit
When the exits are measured
Then the kept exits stay met across the commit, the task in the first column is unmet

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1382 — an answer for exits 10–13 older than sixty seconds is read anew

Given an answer read at a moment, then asked thirty and sixty-one seconds later
When the answer is asked
Then it is read once for the first two and anew for the third

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1383 — a call of the hosting client drops the answers

Given an answer kept by the clock, then a reset
When the answer is asked again
Then it is read anew

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1384 — a read the hosting failed once is repeated

Given a read that fails once and then answers, and a read that fails twice
When the source reads
Then the first answers and the hosting is not silent; the second throws `HostSilent` and the hosting is silent

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1385 — with the hosting silent the first unmet local exit is measured

Given every hosting exit unanswered and exit 3 unmet
When the states are measured
Then the measured state is «разбор-закрыт» without a reason

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1386 — with the hosting silent on a hosting exit the turn is released with its reason

Given every hosting exit unanswered and every local exit met
When the states are measured
Then the measured state is the first hosting exit, with the reason that the hosting did not answer twice

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1387 — exit 10 is met by a PR in any state with a reviewer

Given a closed PR with a reviewer and the folder commit on the server, the same without a reviewer, and without the commit on the server
When exit 10 is measured
Then only the first meets it

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1388 — exit 11 is met by the branch of the next unblocked task

Given the next task with a branch on the server, without one, and an epic with no next task
When exit 11 is measured
Then the first and the last meet it, the second does not

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1389 — a task waiting for the owner's step is passed over

Given a next task waiting for the owner's step, with and without the owner's message holding its quote, and a branch of the task after it
When exit 11 is measured
Then it is met when the owner said the step and unmet when the owner did not

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1390 — a deferred task is passed over

Given a deferred task before a task with a local branch
When exit 11 is measured
Then it is met

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1391 — exit 12 is met when the merged tasks are marked

Given a merged task marked merged, and a merged task left unmarked
When exit 12 is measured
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1392 — exit 13 measures the commits of a cascade

Given a task whose PR went into the branch of the previous task, with both tips in the epic branch, and with the previous one not yet there
When exit 13 is measured
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1393 — exit 13 is met when the PR of the epic is merged

Given every tip in the main branch with the PR of the epic merged, and every tip in the epic branch without a PR of the epic
When exit 13 is measured
Then it is met by the first and unmet by the second

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1394 — deferred tasks do not count for exit 13

Given a deferred task whose tip lies nowhere next to tasks that landed
When exit 13 is measured
Then it is met

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1466 — a task branch removed after its merge gives its tip from the PR

Given a task without a local or server branch whose merged PR names its head
When exit 13 is measured
Then the tip comes from the PR and the exit is met

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1395 — a branch without a task number reads the epic of the copy

Given the epic branch and the main branch of a copy the assignment table gives a live epic
When the copy and exit 2 are measured
Then the work has an epic, and exit 2 is met by the epic of the copy

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1396 — the main branch assigned to a merged epic is outside the scenario

Given the main branch of a copy assigned an epic whose PR into the main branch is merged
When the copy is measured
Then it is outside the scenario

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1397 — an epic with a closed card counts as absent

Given the main branch of a copy assigned an epic whose card is closed
When the copy is measured
Then the work has no epic

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1398 — a draft is measured by states 1–4

Given the main branch without an epic and a draft folder with an answered grill
When the copy and the states are measured
Then the copy stays in the scenario, and the measured state is «эпик-заведён»

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1399 — a branch without a task number and without an epic is outside the scenario

Given a branch without a task number, a copy without an epic and no draft, and a task branch
When the copy is measured
Then the first is outside the scenario, the task branch is not

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1400 — a branch whose folder is taken apart is not measured below state 10

Given a task branch whose history holds the grill, the plan, the done progress and the commit that took the folder apart, with no folder in the working copy
When the engine measures the branch
Then exits 1–9 are met from the history, and the measured state is «папка-разобрана»

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1401 — the scenario is over after the epic merges into the main branch

Given the same branch, its PR merged into the epic branch, the epic merged into the main branch and both cards closed
When the engine measures the branch
Then every exit is met, and the reason is the end of the scenario

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1402 — an epic branch removed on the server keeps exit 2 by memory

Given the same branch with the epic branch removed on the server, once with exit 2 kept before and once without
When the engine measures the branch
Then with the memory the measured state stays «папка-разобрана», and without it the branch would be measured at «эпик-заведён»

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.
