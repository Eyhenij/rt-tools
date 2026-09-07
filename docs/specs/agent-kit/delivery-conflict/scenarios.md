# Scenarios — a conflicting request of one's own

The spec is `spec.md` next to it. The scenarios check the mechanics of the guard helper: what counts
as taking work, what counts as a conflict and when the tier stays silent.

### SC-AK-786 — a branch for a task is not created while a request of one's own conflicts

Given at least one open request of the machine record is marked conflicting by the hosting
When the executor creates a branch for a task
Then the delivery guard refuses the call and names both what is being taken and the number with the
branch of every conflicting request: a refusal without the name of a request is unfixable

Covered: `projects/agent-kit/tests/git-guard-conflict.test.sh`.

### SC-AK-787 — a task is not created while a request of one's own conflicts

Given the same conflicting request
When the executor calls the task creation command
Then the guard refuses the call: a created task adds to the queue one more branch that will have to
be caught up by the same main

Covered: `projects/agent-kit/tests/git-guard-conflict.test.sh`.

### SC-AK-788 — the column is not moved into work, and into review it is

Given the same conflicting request
When the executor moves the column of a task
Then the move into the work column is refused, and the move into the review column passes: it is the
end of work, not its start

Covered: `projects/agent-kit/tests/git-guard-conflict.test.sh`.

### SC-AK-789 — a request is not opened while a request of one's own conflicts

Given the same conflicting request
When the executor opens a new request
Then the guard refuses the call and names opening a request as taking work

Covered: `projects/agent-kit/tests/git-guard-conflict.test.sh`.

### SC-AK-790 — fixing a conflict goes as before

Given the same conflicting request
When the executor pulls main, merges it, moves to the conflicting branch or sends it
Then the guard stays silent: a guard refusing the fix would lock the tree tight

Covered: `projects/agent-kit/tests/git-guard-conflict.test.sh`.

### SC-AK-791 — a branch without a number does not count as work for a task

Given the same conflicting request
When the executor creates a local branch for a trial, without a task number
Then the guard stays silent: it will not go into main, because no request will be opened from it

Covered: `projects/agent-kit/tests/git-guard-conflict.test.sh`.

### SC-AK-792 — without conflicting requests work is taken as before

Given not one open request of one's own is marked conflicting
When the executor creates a task or moves the column into work
Then the guard stays silent

Covered: `projects/agent-kit/tests/git-guard-conflict.test.sh`.

### SC-AK-793 — silence of the poll refuses no work

Given the poll of one's own requests refused — no network, no machine record — or the tree did not
declare it at all
When the executor takes new work
Then the guard lets the call through: refusing work on the silence of the network would mean
stopping it every time there is nothing to check it against

Covered: `projects/agent-kit/tests/git-guard-conflict.test.sh`.
