# Scenarios — the end of an epic is a stop, not the next task

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain.

### SC-AK-979 — taking new work after the end of an epic is refused

Given every task of the epic is merged or handed over by a request
When a branch by a task number is created
Then the guard refuses, and the exit code is two

Covered: `projects/agent-kit/tests/epic-stop-guard.test.sh`.

### SC-AK-980 — an unfinished task of the epic lets the work through

Given one task of the epic is created and not taken
When a branch by a task number is created
Then the guard lets the call through

Covered: `projects/agent-kit/tests/epic-stop-guard.test.sh`.

### SC-AK-981 — the refusal names the stop

Given the epic is over
When the guard refuses
Then the refusal names the command that prints the table and the line saying the session waits for
orders

Covered: `projects/agent-kit/tests/epic-stop-guard.test.sh`.

### SC-AK-982 — creating a task and moving a column are judged on a par with a branch

Given the epic is over
When a task is created, and then a task is moved to the work column
Then both calls are refused

Covered: `projects/agent-kit/tests/epic-stop-guard.test.sh`.

### SC-AK-983 — the order named in the call lets the work through

Given the epic is over, and the owner said to take the next piece of work
When the call carries the line of the order with the reason
Then the guard lets it through; a line with an empty reason is refused

Covered: `projects/agent-kit/tests/epic-stop-guard.test.sh`.

### SC-AK-984 — a branch without a task number is not judged

Given the current branch carries no task number
When a branch by a task number is created
Then the guard lets the call through: there is no epic behind such work

Covered: `projects/agent-kit/tests/epic-stop-guard.test.sh`.

### SC-AK-985 — an unreachable hosting lets the work through

Given the state of the epic cannot be asked
When a branch by a task number is created
Then the guard lets the call through

Covered: `projects/agent-kit/tests/epic-stop-guard.test.sh`.

### SC-AK-986 — a call that is not about taking work is not judged

Given the epic is over
When a call that starts no work is made — reading the history, a commit, a push
Then the guard lets it through

Covered: `projects/agent-kit/tests/epic-stop-guard.test.sh`.

### SC-AK-987 — the next task is not demanded when the epic is over

Given the work is handed over by a request, its state is asked in the same turn, and the epic has no
unfinished task left
When the turn ends without the next task taken
Then the guard of waiting lets the turn through; with an unfinished task of the epic it refuses

Covered: `projects/agent-kit/tests/epic-stop-guard.test.sh`.

### SC-AK-988 — a turn that waits for orders is not refused when the epic is over

Given the reply says the session waits for the word of the owner, and the epic has no unfinished
task left
When the turn ends
Then the guard of the turn exit lets it through; with an unfinished task of the epic it refuses

Covered: `projects/agent-kit/tests/epic-stop-guard.test.sh`.

### SC-AK-1007 — an epic that goes on does not release a turn that worked and then reported

Given the epic holds unfinished tasks and the owner announced no stop in the turn
When the turn did work, ended with a changing command and then a report to the owner
Then the guard of the turn exit refuses it and names how many tasks are left

Covered: `projects/agent-kit/tests/epic-stop-guard.test.sh`.
