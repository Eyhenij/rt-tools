# Scenarios — the working order of the sorting out of the cargo

The identifier goes at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared across the domain: the
numbers continue its numbering and are not recounted after a merge of a subdomain.

The order of the sorting out of the cargo is carried out by an agent, not by a machine, and most of the
scenarios below are not checked by a run. The mark at them says that directly: it names what the
scenario is confirmed by instead — by a call of the command on live cargo and by reading the answer of
the intake.

### SC-MB-260 — the sorting out starts with the records nobody read

Given records of the cargo in different states lie in the intake
When the executor sits down to sort the cargo out
Then the list is narrowed by the filter of the state "new" and goes by the order of the arrival

Not covered: the order is carried out by an agent, and it is not checked by a run — it is confirmed by
a sorting out of live cargo, at which the filtered list shows only what is not sorted out.

### SC-MB-261 — the taking of a report into work creates a task and marks the record

Given a record of the cargo stands in the state "new", and the executor decided to work by it
When they take it into work
Then a task is created by the record, and by the same turn the record is moved into "in progress"

Covered: `projects/agent-kit/tests/cargo-mark-guard.test.sh` — the guard of the mark of the cargo does
not release a turn that took a record into work without a move of the state.

### SC-MB-262 — the records of one edit are marked by one bundle

Given several records of the cargo are fixed by one edit
When the executor takes them into work
Then all of them go away by one call of the command of the mark and by one task

Not covered: the order is carried out by an agent — it is confirmed by the answer of the command, in
which the number of the moved records equals the number of the records of the edit.

### SC-MB-263 — a record no work will be done by does not go into "in progress"

Given the executor read the record and decided there will be no edit by it
When they go on down the list
Then the state of the record stays the former one, and the decision stays the open question `Q-CT-1`

Not covered: a state of a refusal is not created by the set, and there is nothing to check while the
owner has not decided the question.

### SC-MB-264 — "ready" is put after the merge, not after the opening of the request

Given the edit by the record of the cargo lies in an open request and is not merged yet
When the executor marks the state
Then the record stays in "in progress"; into "ready" it goes after the merge of the edit into the main
branch

Not covered: the order is carried out by an agent — it is confirmed by two answers of the intake:
before the merge and after it.

### SC-MB-265 — the transition into "ready" arrives together with the way of the fix

Given the edit is merged, and the executor moves the record into "ready"
When the call of the command of the mark goes
Then the way of the fix goes together with the state, and the intake accepts the string

Not covered: the scenario has no test of its own. The refusal of a transition without a text is checked
by a spec of the intake under a number of its own, and that the text goes by the same call is confirmed
by the answer of the command on live cargo.

### SC-MB-266 — "released" is put by whoever publishes, and with the version of the release

Given the edition of the package is published, and the fix by the record of the cargo entered it
When whoever publishes marks the state
Then the record is moved into "released", and the version of that release stands at it

Not covered: the order is carried out by an agent — it is confirmed by the answer of the intake, in
which both the state and the version stand at the record.

### SC-MB-267 — a refused row of the mark is taken apart, it is not repeated

Given the call of the command of the mark gave back a refused row with a reason
When the executor reads the answer
Then they take the reason apart, they do not send the same call anew

Not covered: the order is carried out by an agent — it is confirmed by an edit of the call going after
a refusal, not a repeat of it.

### SC-MB-268 — the rule and the pattern are laid out into the tree

Given the resources of the rule and of the pattern lie in the set of the package
When the layout of the resources and its check go
Then both lie in the tree with the header of the layout, and the check finds no divergence

Not covered: the layout of a separate resource is not checked by a test — the mechanics of the layout
are covered by specs of their own, and this scenario is confirmed by a green check of the layout in the
gate of the push.

### SC-MB-281 — the work by a record of the cargo is handed in, and the state of the record is the former one

Given the turn opened a request or took apart the task folder whose analysis of the request names the
keys of the cargo
When the guard judges the end of the turn
Then the turn is refused, the refusal names the keys of the records and demands the state "ready"
together with the way of the fix; a mark made by the same turn releases the turn

Covered: `projects/agent-kit/tests/cargo-mark-guard.test.sh`.

### SC-MB-282 — the taking into work is not judged by the guard, and the closing by a publisher counts as a mark

Given the turn created a task folder with the keys of the cargo and put no mark
When the guard judges the end of the turn
Then the turn is released: "in progress" cannot be put at a foreign record — the closing by a publisher
accepts only "ready" and "released", and demanding the taking would mean demanding the impossible. At a
handing in of the work the closing by a publisher counts as a mark on a par with an ordinary one

Covered: `projects/agent-kit/tests/cargo-mark-guard.test.sh`.

### SC-MB-283 — an ordinary turn of the work demands no mark, and a dry run does not count as one

Given the turn edited code and committed, and handed no work in; or the turn handed the work in and
called the mark by a dry run
When the guard judges the end of the turn
Then the first is released — a guard asking for a mark at every turn would refuse the work itself — and
the second is refused: a dry run leaves no trace outward

Covered: `projects/agent-kit/tests/cargo-mark-guard.test.sh`.

### SC-MB-284 — a task not from the cargo gets no guard

Given the turn handed the work in, and the analysis of the request names no keys of the records of the
cargo or names a sign shorter than the full one
When the guard judges the end of the turn
Then the turn is released: a short sign does not count as a key — a mark with it is refused by the
intake, and demanding it would mean driving the executor after a refusal

Covered: `projects/agent-kit/tests/cargo-mark-guard.test.sh`.

### SC-MB-285 — the guard releases the work when there is nothing to judge by

Given the tree declared no command of the mark, there is no record of the turn or a repeated pass over
the same turn goes
When the guard judges the end of the turn
Then the turn is released: a broken guard has no right to jam the work

Covered: `projects/agent-kit/tests/cargo-mark-guard.test.sh`.
