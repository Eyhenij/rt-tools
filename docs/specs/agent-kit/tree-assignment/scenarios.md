# Scenarios — the epic of a working copy is written down, not chosen

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain.

### SC-AK-1113 — the assignment of a copy is read from one table

Given the table of assignments and the local name of the copy lie in the tree
When the reader is asked about the epic of a piece of work
Then it stays silent about the assigned epic, and about any other one it answers with a refusal
naming both numbers; a nameless copy, a missing row and a dash each get a refusal of their own, and
a tree that declares no table is not judged

Covered: `projects/agent-kit/tests/guard-tree-assignment.test.sh`.

### SC-AK-1114 — the calls that take work past a branch are refused

Given the row of this copy names another epic or holds a dash
When a task is created under an epic, and then a card is moved to the work column
Then both calls are refused, while creating an epic, work under the assigned epic and a move to the
review column go through

Covered: `projects/agent-kit/tests/guard-tree-assignment.test.sh`.

### SC-AK-1115 — an assignment whose epic is closed is refused

Given the row of this copy names an epic, and the queue answers that the epic is closed
When work is taken
Then the refusal says the assignment outlived its epic; a live epic, a silent queue and a row with
a dash give no such refusal

Covered: `projects/agent-kit/tests/guard-tree-assignment.test.sh`.
