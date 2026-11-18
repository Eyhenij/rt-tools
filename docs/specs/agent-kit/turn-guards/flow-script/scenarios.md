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

### SC-AK-1557 — a bare name of a footprint row is found anywhere in the path

Given a marked row that names a directory and then the bare names `flow.js` and `measure/`
When exit 8 is measured after changes of projects/kit/flow.js and tools/kit/measure/a.mjs
Then it is met, and without the change under `measure/` it is not

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

### SC-AK-1403 — a matched step writes its mark

Given a plan whose step checks a file of the task folder that holds the expected line
When the engine measures that step
Then it prints that the step matched, exits 0 and writes the mark of the step with the fingerprint of the plan

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1404 — an unmatched step leaves no mark

Given a step whose check prints another line than the expected one
When the engine measures it
Then it prints that the step did not match, exits 1 and no mark of the step lies

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1405 — a check past its limit does not match

Given a step whose check runs longer than the limit
When the engine measures it
Then the step does not match, and the line names the limit that ran out

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1406 — a command of the work is never a check

Given a step whose check is a push, and a step whose expected result is in no form
When the engine measures them
Then both are refused before anything runs, and the refusal names the command or the expected text

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1407 — a file of the task folder edited after the plan refuses the step

Given a file of the task folder changed after the commit of the plan, and then only the progress changed
When the engine measures a step
Then the first is refused naming the file, and the progress does not refuse it

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1408 — the done steps are measured again

Given a progress that marks two steps done, one matching and one not, with the mark of the first removed
When the engine measures the done steps
Then it prints a line per step led by its number and the line `steps re-measured 2, matched 1`
And it exits 1 and writes the mark of the first again

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1409 — the line of a step ends with its verdict

Given a matched step and an unmatched one
When the engine measures them
Then each line ends with «· совпало» or «· не совпало»

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1410 — a plan with an expected result in no form is not written

Given a plan whose step expects «примерно ноль», and a plan of known forms
When the plan is checked before it is written
Then the first is refused naming the step and the text, and the second passes

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1411 — the approval mark carries the red output

Given a plan whose checks are red and a record with both roles called and then the menu answer «Одобряю план RT-2»
When the approval is asked, then again with the answer «Переделай этап 1», then with no role called
Then the first writes the mark with the answer and the red output of every step, and the other two write none

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1412 — a check green before the work refuses the approval

Given a plan whose first check already matches
When the approval is asked
Then the step is named green before the work, and no mark is written

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1413 — a check is replaced only with the owner's quote

Given a progress that replaces the check of a step and quotes the owner
When the step is measured with the quote in the owner's messages, and without it
Then the replacement is measured in the first case and refused in the second

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1506 — a form of the expected result added to the description is accepted

Given a step expecting «~мир», a form the package description does not know, and a copy of the description with that form added
When the step is measured by the package description and by the copy
Then the first refuses the form, and the second measures the step as matched with no edit of the engine

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1539 — a branch planned before the engine reads its plan from its last edit

Given a plan edited by a later commit, once on a branch of the closed list of branches planned before the engine and once on another branch
When the engine measures a step
Then the first measures the check of the last edit, and the second is refused naming the plan

Covered: `projects/agent-kit/tests/task-flow-script-steps.test.sh`.

### SC-AK-1549 — the forecast counts held stops and refused calls per thousand calls

Given a recorded session that wrote and stopped twice, the owner's «стоп» before the second stop, a session that wrote nothing, and a shell write into the progress
When the forecast replays them
Then the first stop is held and the second released, the quiet session is released, the shell write is refused by the guard, and the count is per thousand calls

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1700 — the owner's menu ends a series of stops in the forecast

Given a held stop whose refusal names the owner's menu, then stops with no call, then a call and a stop
When the forecast replays the session
Then the stops before the call are not counted, and the stop after the call is counted again

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.
