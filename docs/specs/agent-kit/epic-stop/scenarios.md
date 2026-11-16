# Scenarios — the end of an epic is a stop, not the next task

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain.

### SC-AK-979 — taking new work after the end of an epic asks the owner

Given every task of the epic is merged or handed over by a request
When a branch by a task number is created
Then the guard answers `ask`: the host shows the owner a window to allow or forbid this command

Covered: `projects/agent-kit/tests/epic-stop-guard.test.sh`.

### SC-AK-980 — an unfinished task of the epic lets the work through

Given one task of the epic is created and not taken
When a branch by a task number is created
Then the guard lets the call through

Covered: `projects/agent-kit/tests/epic-stop-guard.test.sh`.

### SC-AK-981 — the window names the end of the epic and the table

Given the epic is over
When the guard asks the owner
Then the reason says the epic is over and names the command that prints the table

Covered: `projects/agent-kit/tests/epic-stop-guard.test.sh`.

### SC-AK-982 — creating a task is judged on a par with a branch, a column move is not

Given the epic is over
When a task is created, a branch is created by `switch`, and a task is moved to the work column
Then the first two calls get the window, and the column move passes: it follows the branch of the
same work

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

### SC-AK-1558 — a new epic is taken through the same window

Given the epic is over, and the owner declares a new one
When the calls create the card of the new epic, its tasks and its branch
Then each of them gets the window; no line in the call lets it past the owner

Covered: `projects/agent-kit/tests/epic-stop-guard.test.sh`.

### SC-AK-1559 — the guard reads no record of the conversation

Given the epic is over, and the record of the conversation holds the owner's message or a menu
answer naming the number of the work or agreeing to a task
When the branch of that work is created or the task is created
Then the guard answers `ask` all the same: the decision is given in the window, not guessed from the
words of the record

Covered: `projects/agent-kit/tests/epic-stop-guard.test.sh`.

### SC-AK-1560 — the name of the command in a text is not judged

Given the epic is over
When the command only reads the file of the creating command, or carries its name in the body of a
heredoc, or in a commit message
Then the guard lets it through; the same command run after a variable assignment or `cd … &&` gets
the window

Covered: `projects/agent-kit/tests/epic-stop-guard.test.sh`.

### SC-AK-1561 — a window is written to the journal apart from the refusals

Given the epic is over
When the guard asks the owner
Then the journal of observations gets a record `guard-ask` with the name of the guard

Covered: `projects/agent-kit/tests/epic-stop-guard.test.sh`.
