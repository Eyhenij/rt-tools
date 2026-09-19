# Scenarios — the audit of the work queue

The identifier stands at the start of the test title, followed by a dash. The prefix is shared
by the domain, and the numbers were not recounted at the move into the subdomain: the number
ties a scenario to a test title.

### SC-AK-733 — open tasks with matching titles are listed by a digest

Given the work queue holds two open tasks about one and the same thing, named by different words
When the work queue audit reads it
Then it names them by one digest line and counts it as no divergence: matching words are a reason to
look, not a sign of a duplicate, and a refusal would refuse the work at every series of similar
tasks

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-751 — the link of a task with an epic is read both ways

Given the label of an epic card is named by the setting of the tree, and the epic card names the
path to its plan
When the work queue audit reads the open tasks
Then it names as a divergence both one-sided links — a task the epic plan names while the body of
the epic does not, and a task the epic named in its body while the epic plan does not know it; a card
without a path to a plan and a path without a file on the disk are each named by a line of their own.
The label is not named — the link is not judged at all: there is nothing to tell an epic card from an
ordinary task by

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-919 — the plan of an epic is the document that carries the makeup

Given the card of an epic names its decision before its plan, and the decision has no table of tasks
When the work queue audit reads the makeup of the epic
Then it reads the plan and judges the link as before: none of the named documents on disk, and none
of those on disk carrying the makeup, are named by lines of their own

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-920 — belonging to an epic is declared by a word about the task

Given the body of a task names the number of an epic in its reasoning, not as a declaration
When the work queue audit reads the link of the task with the epic
Then it counts the task as belonging to no epic, and a body that declares belonging is judged from
both sides as before

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-752 — a branch of an open request lagging behind main is named by the audit

Given the branch of an open request has fallen several commits behind the main branch
When the work queue audit reads the open requests
Then it names the number of the lag and says the run went from a base that is no longer in the main
branch; on a branch without a lag and where there is nothing to compare with, it stays silent

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-774 — a call refused by the unavailability of the hosting is repeated

Given the hosting answers with an unavailability code — a five hundredth, a gateway one or its
timeout When the call goes from the work queue module Then it is repeated up to three times with a
growing pause and passes as soon as the hosting answered; a refusal by right and by a non-existent
record is not repeated at all, and unavailability longer than three attempts refuses — but exactly
after three

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-845 — a request whose base is not the main branch is not counted as lacking a run

Given a request is opened into a branch other than the main one
When the work queue audit checks its tip
Then it says nothing about that request: the pipeline sees no event with such a base, and having
no run there is the order of handing in. A request into the main branch is still judged by the
line about a lost event

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-873 — the answer of the work queue helper says whose eyes the state was taken by

Given a tree with the token of the machine record and a tree without it
When the helper reads a task and a request
Then a task with the token arrives with `viewer: machine`, without the token with `client`; a request
in both trees is `client`, because it is read without the token

Covered: `projects/agent-kit/tests/checks-board-pull.test.sh`.

### SC-AK-996 — a task naming neither an epic nor the word of the owner

Given an open task whose body names no epic and carries no word of the owner about work outside one
When the work queue audit runs
Then it names the task by a line of its own and names both lines that fix it

Given the body carries the word of the owner about work outside an epic
When the same audit runs
Then it stays silent: work outside an epic is lawful, and only the owner names it as such

Given the card carries the label of an epic
When the same audit runs
Then it gets no such line: an epic has no epic of its own

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-997 — the base of an open request about a task of an epic

Given an open request about a task whose body names an epic, and its base is the main branch
When the work queue audit runs
Then it names the request by a line of its own

Given the base carries the number of the epic — that is, it is the branch of the epic
When the same audit runs
Then it stays silent

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-1107 — one line names both consequences of a base other than the main branch

Given open requests whose base is not the main branch
When the work queue audit goes
Then one line counts them and names both consequences at once — the pipeline gives them no run,
and the host closes no task on their merge — with how the task closes then; the line is not a
divergence, and without such requests there is no line

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-998 — an epic without a branch and an epic whose tasks are over

Given a card with the label of an epic, and no open request either from its branch or into it
When the work queue audit runs
Then it names the epic by a line of its own: without a branch every task of it stands on the main
branch

Given a request into the branch of the epic is open
When the same audit runs
Then it stays silent about the branch

Given no open task of the epic is left, and no request from its branch is open
When the same audit runs
Then it names the epic by a line of its own: the work of the whole epic lies outside the main branch
while looking finished

Given a request from the branch of the epic is open
When the same audit runs
Then it stays silent

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-1089 — the creating command and the audit read the path to the plan alike

Given the card of an epic names two documents — a law and the plan — and the law stands first
When a task of that epic is created
Then its body carries the document that holds the makeup, not the law, and the branch of the epic
is read from that same document: read by its own way, the command wrote the law into every task of
the epic while both sides answered as usual

Covered: `projects/agent-kit/tests/task-new-epic.test.sh`.

### SC-AK-1093 — a list given in pages is read whole

Given an epic whose linked tasks do not fit one page of the hosting's answer
When the audit of the work queue runs
Then a task lying past the first page is not named unlinked

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-1112 — an open task in a closing column

Given an open task whose card stands in a column named as a closing one
When the work queue audit goes
Then it names the task by a line of its own and counts it into the divergences; the line names both
ways out — close the task, or move the card back

Given the card of the same task stands in the column of review
When the same audit goes
Then it stays silent about the column

Given the tree names no closing columns
When the same audit goes
Then no such line is printed

Covered: `projects/agent-kit/tests/checks-board-columns.test.sh`.

### SC-AK-1153 — a task branch that never carried its folder is named

Given a task branch with a contribution of its own and no task folder in its history
When the audit goes
Then it names the branch by a line of its own and counts it into the divergences

Covered: `projects/agent-kit/tests/checks-board-folders.test.sh`.

### SC-AK-1154 — the branch of an epic is due no task folder

Given a branch whose plan inside it names that same branch as the branch of an epic
When the same audit goes
Then it stays silent about that branch: an epic branch carries no task folder at all

Covered: `projects/agent-kit/tests/checks-board-folders.test.sh`.

### SC-AK-1127 — a task branch with its folder is no divergence

Given the same task branch after the folder has travelled in by a commit
When the same audit goes
Then it stays silent about the branch

Covered: `projects/agent-kit/tests/checks-board-folders.test.sh`.
