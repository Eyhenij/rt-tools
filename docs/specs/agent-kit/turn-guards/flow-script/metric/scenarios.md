# Scenarios: the measures of the executable scenario

A subdomain of the task flow as an executable scenario. Here are the scenarios of the counter that
reads the metric and its counter-conditions from the session records.

### SC-AK-1541 — nudges are counted per hundred calls

Given a session with «ну что там?», «почему ты стоишь?», «не продолжай», «переработай план» and four calls
When the nudges are counted by the pattern of the package description
Then two nudges and four calls are counted, and the line reads 50.00 per hundred calls

Covered: `projects/agent-kit/tests/owner-nudges.test.sh`.

### SC-AK-1542 — only what the owner typed is a typed message

Given a typed line, text in parts, a meta entry, a compaction summary, a menu answer, a tool result, a stop feedback, a reminder, an interrupted turn, a task notification and a subagent entry
When each is read as a typed message
Then only the typed line and the text in parts are messages

Covered: `projects/agent-kit/tests/owner-nudges.test.sh`.

### SC-AK-1543 — every copy of the tree is read, a repeated entry once

Given the records of the main checkout, of its worktree, of a directory with a longer name and of a subagent, with one entry repeated in two copies
When the typed messages are counted
Then the main checkout and the worktree give three messages in two copies, and a window without records gives none

Covered: `projects/agent-kit/tests/owner-nudges.test.sh`.

### SC-AK-1544 — refusals are counted in four groups

Given ten calls, refusals of the exit check, of the guard of the course of work, of `grill-gate`, of `turn-judge` and of another guard, and the mark in a plain output
When the refusals are counted
Then five refusals are counted: one of the exit check, two of the base and two new ones

Covered: `projects/agent-kit/tests/owner-nudges.test.sh`.

### SC-AK-1545 — ten stop refusals in a row with one reason are a deadlock

Given series of stop refusals with calls between them
When the deadlocks are counted
Then ten in a row are a deadlock, nine are not; an owner message does not end the series, a passed stop and another reason do

Covered: `projects/agent-kit/tests/owner-nudges.test.sh`.

### SC-AK-1546 — the window ends with the day the caller names

Given the arguments `--days 7 --until 2026-11-15`, `--since 2026-10-13` and a moment with a time
When the window is built
Then it runs from 9 November to the end of 15 November, from the start of 13 October, and to the moment itself; a window without a length exits 2

Covered: `projects/agent-kit/tests/owner-nudges.test.sh`.

### SC-AK-1552 — a turn ended with open work is a missed stop

Given a session that wrote to a task branch, stopped with no refusal, and later stopped after «стоп»
When the missed stops are counted
Then the first end is missed and the second is not
And a stop refused by a hook, in the summary or in the feedback, ends no turn
And a branch without the engine is not counted
And every stop on a branch with the engine counts among the stops of the line, held or not

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1553 — the window of the last calls

Given three calls and a window of the last two
When the window is built
Then it starts at the second call, and a window larger than the calls starts where the records do
And `--missed` without `--last` exits 2, and a tree without the engine prints `0 of 0`

Covered: `projects/agent-kit/tests/owner-nudges.test.sh`.
