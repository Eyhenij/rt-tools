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

### SC-AK-845 — a request on top of a neighbouring one gets no run, and the audit names the reason

Given a request is opened into the branch of a neighbouring request, not into main
When the work queue audit checks its tip
Then it names the base, reports that there will be no run and that this is fixed by moving the base
after the lower request is merged; there is no advice to reopen the request. A request into the main
branch is checked by the former line about a lost event

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-873 — the answer of the work queue helper says whose eyes the state was taken by

Given a tree with the token of the machine record and a tree without it
When the helper reads a task and a request
Then a task with the token arrives with `viewer: machine`, without the token with `client`; a request
in both trees is `client`, because it is read without the token

Covered: `projects/agent-kit/tests/checks-board-pull.test.sh`.

### SC-AK-945 — a task naming neither an epic nor the word of the owner

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

### SC-AK-946 — the base of an open request about a task of an epic

Given an open request about a task whose body names an epic, and its base is the main branch
When the work queue audit runs
Then it names the request by a line of its own

Given the base carries the number of the epic — that is, it is the branch of the epic
When the same audit runs
Then it stays silent

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-947 — an epic without a branch and an epic whose tasks are over

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
