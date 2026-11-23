# Scenarios: the CI hold at the end of a turn

The scenarios of the CI hold. They carry the prefix `SC-AK` of the domain and keep the numbers they
had in `docs/specs/agent-kit/turn-guards/flow-script/exit/`.

### SC-AK-1799 — the host adapter gives the runs of the pipeline file and the bases it wakes for

Given the runs of a head of three workflow files and the `on` blocks of pipeline files
When the adapter reads them
Then only the runs of the pipeline file come back, with number, attempt, conclusion and end
And a running run has no end, and a tree that names no pipeline file judges no run
And the bases are the list of `pull_request.branches`, null for every base, and none for a pipeline that does not listen to PRs
And a list at the indent of its key and a comment after a name are read as YAML reads them
And an `on` written as a one-line mapping that names `pull_request` gives every base

Covered: `projects/agent-kit/tests/task-flow-script.test.sh`.

### SC-AK-1800 — a call carries its time and branch, a background task its command

Given a record with a call sent to the background and the result that names its task
When the session source reads the record
Then the call carries the time and the branch of its entry, and the background event the command of the call
And an entry without a branch gives the branch null
And a notice of the end of a task attached to the record as a queued command ends the task with its time

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1801 — a running run with no watch holds the stop with its number

Given an open PR into main whose head has a running CI run, and no background task of the session
When the turn ends
Then the stop is held, and the refusal names the run and `gh run watch <id> --exit-status`

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1802 — a background watch lifts the hold, and the scenario decides the stop

Given a running run and a background task of the session that names the run or the PR and has not ended
When the turn ends, also forty minutes after the watch started
Then the CI holds nothing
And a session in «работа-отдана» is not released by the watch: the scenario holds it
And a background task with no call of the hosting client, a log file named after the PR, is no watch
And a call of the client with no watch, a comment on the PR, is no watch
And a watch that finds the run by the branch of the PR is a watch

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1803 — an unread red run holds the stop with its number

Given an open PR into main whose head has a failed run, and no call after its end
When the turn ends
Then the stop is held, and the refusal names the run and `gh run view <id> --log-failed | tail -n 200`

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1804 — a red run read after its end lifts the hold

Given a failed run and an unrefused call after its end that names it, or a read of the output of its watch
When the turn ends
Then the CI holds nothing
And a call with the number that a hook refused or that failed reads nothing
And an edit of a text that names the run reads nothing
And a command that prints the output of the watch reads it

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1805 — a watch call before the end of the run is no read

Given a failed run whose watch was started before its end, and no call after the end
When the turn ends
Then the stop is held by the red run
And a number inside another number does not name the run
And a command with the number and no call of the hosting client reads nothing

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1806 — a green run, a skipped run and a pipeline without PRs hold nothing

Given a head with a green run, a head with a skipped run, and a pipeline that does not listen to PRs
When the turn ends
Then the CI holds nothing

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1807 — a silent hosting holds nothing

Given a hosting that does not answer about the open PRs
When the turn ends at the end of the scenario
Then the measurer throws the silence, the verdict reads no hold, and the end of the scenario releases the turn

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1808 — the end of the epic does not release a running run of its PR

Given a finished epic, or a task outside an epic with its PR handed, and a CI run that holds
When the turn ends
Then the stop is held with the number of the run, not released by the end of the scenario

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1809 — a head moved by a push or an epic merge holds the stop after a branch switch

Given a session on another branch that pushed the branch of an open PR, and a task whose epic branch has an open PR into main
When the turn ends while the run of that PR goes with no watch
Then the stop is held by that run
And a PR of a branch the session neither works on nor pushed holds nothing
And a push with its output redirected, a push of `HEAD`, a push of two branches and `gh pr create -H` name their branches
And `git checkout -b` before a push of `HEAD` in one command names the new branch
And a quoted branch, a line continued by a backslash, an address built by a substitution with a pipe, a quoted credential helper before `push`, and `--head owner:branch` name their branches

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1810 — a head with no run holds the stop for two minutes, for a pipeline base only

Given a head pushed a minute ago with no run on it
When the turn ends
Then the stop is held as a fresh head
And the minutes count from the result of the push, not from its start
And for a push sent to the background they count from the notice of its end
And a base that matches a mask of the pipeline holds as a listed one
And three minutes after the push, or for a base the pipeline does not wake for, it holds nothing

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1811 — three stops on one red run give one refusal when a read follows it

Given a failed run, a first stop, then a call that reads it, then two more stops
When each stop is judged
Then only the first is held by the run

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.

### SC-AK-1812 — a second stop with no call names the run, not the menu

Given an unread red run and a stop that follows a refusal with no call
When the turn ends
Then the refusal names the run and offers no owner's menu

Covered: `projects/agent-kit/tests/turn-exit-guard.test.sh`.
