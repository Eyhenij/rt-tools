# Scenarios — the table of the epic's tasks assembled by a command

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain.

### SC-AK-969 — the epic is taken from the current branch

Given the current branch is named by the number of a task, and the body of that task declares the
epic
When the command is called without an argument
Then it prints the paragraph about that epic and the table of its tasks, and the exit code is zero

Covered: `projects/agent-kit/tests/epic-table.test.sh`.

### SC-AK-970 — the argument names another epic

Given the current branch belongs to one epic, and the argument names the number of another
When the command is called with that number
Then the table is about the named epic, and the branch is not asked about at all

Covered: `projects/agent-kit/tests/epic-table.test.sh`.

### SC-AK-971 — the rows go in the order of the plan

Given the plan of the epic lists the tasks in an order that does not match their numbers
When the table is printed
Then the rows stand in the order of the plan, and the ordinal number of every row is the one the
plan assigned

Covered: `projects/agent-kit/tests/epic-table.test.sh`.

### SC-AK-972 — a task named by the plan and missing from the queue stands by a row of its own

Given the plan names a task the hosting has no card for
When the table is printed
Then the row of that task is in place, and its state cell says it is not created

Covered: `projects/agent-kit/tests/epic-table.test.sh`.

### SC-AK-973 — the state carries the number of the request and the outcome of the run on its head

Given the task is handed over by a request, and a run has ended on the head of that request
When the table is printed
Then the state cell names the number of the request, whether it is a draft, and the outcome of the
run — and the run is asked by the head of the request, not by the branch

Covered: `projects/agent-kit/tests/epic-table.test.sh`.

### SC-AK-974 — a closed task is named merged

Given the card of the task is closed
When the table is printed
Then the state cell says it is merged, and neither the request nor the run is asked about it

Covered: `projects/agent-kit/tests/epic-table.test.sh`.

### SC-AK-975 — a branch without a task ends with a refusal

Given the current branch carries no task number, and no argument is given
When the command is called
Then it refuses with the exit code one and names how to give the number of the epic by an argument

Covered: `projects/agent-kit/tests/epic-table.test.sh`.

### SC-AK-976 — a card of the epic without a plan ends with a refusal

Given the body of the card of the epic names no plan
When the command is called with the number of that epic
Then it refuses with the exit code one, names the card and says that the card must name the plan

Covered: `projects/agent-kit/tests/epic-table.test.sh`.

### SC-AK-977 — an unreachable hosting is not an empty table

Given the hosting cannot be asked
When the command is called
Then it refuses with the exit code one and says that the state is unknown, and prints no table

Covered: `projects/agent-kit/tests/epic-table.test.sh`.

### SC-AK-1139 — on the branch of the epic the number comes from its own card

Given the current branch carries the number of an epic card
When the command is called with no argument
Then it assembles the table of that epic, and the refusal about a task declaring no epic does not
come

Covered: `projects/agent-kit/tests/epic-table.test.sh`.
