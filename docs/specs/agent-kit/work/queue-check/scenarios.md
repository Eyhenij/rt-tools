# Scenarios: the check of the work queue

A subdomain of the domain "Leading the work by commands". Here are the scenarios of one check — the
one that checks the work queue against the repository: the columns, the runs at the tips of the
requests, the drafts, the conflicts and the task folders. The rest of the leading of the work is in
the list of the scenarios of the domain next to it.

The identifier goes at the start of the test title, followed by a dash. The prefix is shared across
the domain, and the numbers were not recounted at the move into the subdomain: the number ties the
scenario to the test title.

### SC-AK-277 — the tip of an open PR without a run is named a divergence

Given an open PR at whose tip not a single run started, and the tip has lain longer than allowed
When the check of the work queue goes
Then it names the tip, its age and what the event is brought back with, and ends with a non-zero
code

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-278 — a fresh tip without a run is not judged

Given an open PR whose tip was pushed a minute ago, and there is no run behind it yet
When the check of the work queue goes
Then it stays silent: between the push and the run some time passes

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-279 — a run at the tip lifts the question

Given an open PR at whose tip there is a run
When the check of the work queue goes
Then it stays silent about it, whatever its colour

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-280 — a tree without a file of the pipeline is not asked about runs

Given a tree that has no named file of the pipeline, and an open PR without a run at the tip
When the check of the work queue goes
Then it says that the runs were not asked about, and does not count that as a divergence

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-281 — ready work left as a draft is named a divergence

Given an open draft PR whose run at the tip ended in success
When the check of the work queue goes
Then it names the tip and what the draft is lifted by, and ends with a non-zero code

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-282 — a draft at a run that is not green is not judged

Given an open draft PR whose run at the tip is in progress or fell
When the check of the work queue goes
Then it stays silent about the draft: the work is not ready yet

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-377 — the state of a PR names its review

Given a reviewer is requested at the PR and an opinion is left
When the state of the PR is asked about
Then the PR is found, it has a review, and both stand in the list — the requested one and the one
who left the opinion

Covered: `projects/agent-kit/tests/checks-board-pull.test.sh`.

### SC-AK-378 — a review by the author does not count as a review

Given the only one named at the PR is its own author
When the state of the PR is asked about
Then the PR has no review, although the author does not disappear from the list of the named ones;
an unknown number answers with an absence

Covered: `projects/agent-kit/tests/checks-board-pull.test.sh`.

### SC-AK-379 — silence of the hosting does not count as a state of a PR

Given the hosting did not answer or refused the entry
When the state of the PR is asked about
Then the answer is named a silence of the network, and there is no verdict about a review in it

Covered: `projects/agent-kit/tests/checks-board-pull.test.sh`.

### SC-AK-391 — the number of the PR is taken from the answer of the hosting

Given the PR is named by an address
When the state of the PR is asked about
Then the PR is found, and its number comes from the answer of the hosting; a call without a
reference goes to the client with no argument at all

Covered: `projects/agent-kit/tests/checks-board-pull.test.sh`.

### SC-AK-392 — a PR is found by the name of a branch too

Given the PR is named by the name of a branch or by an address
When the state of the PR is asked about
Then what was named goes to the client of the hosting as an argument, and the PR is found by it

Covered: `projects/agent-kit/tests/checks-board-pull.test.sh`.

### SC-AK-425 — a conflicting open PR is named a divergence

Given an open PR conflicts with the main branch
When the check of the work queue goes
Then the check names it a divergence and says what the conflict is with: the guard judges one turn,
while a conflict arrives into a handed-in PR by someone else's merge, without an action of the
author

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-426 — an uncounted request and a mergeable one stay silent

Given the mergeability of the PR is not counted yet, or it is counted and there is no conflict
When the check of the work queue goes
Then there is no line about it: the hosting counts the mergeability anew after every edit of the
main branch, and a line about the uncounted would turn red at every fresh tip

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-531 — a production that lags is named a divergence

Given the last successful rollout was made not from the tip of the main branch
When the check of the work queue goes
Then the check names the lag by the number of commits and the commit of the last rollout: a merge
does not move production, and a run of the main branch says nothing about it

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-532 — a tree without a named flow of the rollout gets no check of production

Given the working flow of the rollout is not named in the settings of the tree
When the check of the work queue goes
Then production is not checked, and the check says so aloud: silence would read as production being
in step

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-584 — a pushed-out run at the tip of a request is named by a line of the check

Given an open request at whose tip there is one run: cancelled and with zero jobs
When the check of the work queue goes
Then it names the request, the number of the run and that the branch was not checked

### SC-AK-585 — the line names the reading of the run before its restart

Given a pushed-out run at the tip of an open request
When the check of the work queue goes
Then in its line the command of reading the run stands before the command of the restart

### SC-AK-586 — a run cancelled mid-way gives no line

Given an open request at whose tip there is a cancelled run with jobs
When the check of the work queue goes
Then it says nothing about a pushing out: the run has a journal, and a person decides by it

### SC-AK-587 — the number of the jobs is asked only of the cancelled runs

Given an open request at whose tip a run ended in success
When the check of the work queue goes
Then there was no call about the number of the jobs of that run

### SC-AK-588 — a green run at the same tip removes the line

Given a tip that has both a pushed-out run and another one that ended in success
When the check of the work queue goes
Then it says nothing about a pushing out: the run is already restarted

### SC-AK-589 — the pushing out is judged before the absence of a run

Given a tip whose only run is pushed out, and the tip has lain longer than the allowed time
When the check of the work queue goes
Then there is one line — about the pushing out, not about there being no run

### SC-AK-590 — a tree without a file of the pipeline does not judge the pushing out

Given a tree that named no file of the pipeline, and an open request at it
When the check of the work queue goes
Then the runs are not asked about at all, and there is no line about a pushing out

### SC-AK-670 — at a conflicting request the reason named is the conflict, not the loss of the event

Given an open PR conflicts with the main branch, and there is no run at its tip
When the check of the work queue goes
Then the line names the conflict as the reason: the pipeline checks the merge of the branch with the
base, and at a conflict there is no merge

### SC-AK-671 — there is no advice to reclose the request at a conflict

Given the same conflicting PR without a run
When the check of the work queue goes
Then there is no command of reclosing in the line: it is carried out literally and brings no run
back

### SC-AK-672 — at a mergeable request the line about the event is the former one

Given an open PR without a conflict, and there is no run at its tip
When the check of the work queue goes
Then the line speaks of a lost event and calls to bring it back — there the reason really is in it

Covered: `projects/agent-kit/tests/checks-board.test.sh`.

### SC-AK-794 — a tree that named no mark of the cargo is judged as before

Given a record of the cargo stands in the work queue, and the tree named no mark of the cargo
When the check of the work queue goes
Then the record is judged as a task: a title without a number, no executor, not on the queue — an
invented default of the mark would coincide with nothing and would silently switch the sifting off
at every tree

Covered: `projects/agent-kit/tests/checks-board-cargo.test.sh`.

### SC-AK-795 — a marked record is not judged as a task at all

Given the tree named the mark of the cargo, and the record carries it
When the check of the work queue goes
Then not a single line is printed about the record, while the task next to it without the mark is
judged as before: a marked record is not a task whole, not by half

Covered: `projects/agent-kit/tests/checks-board-cargo.test.sh`.

### SC-AK-796 — what was sifted out is named by a number

Given the check sifted out records of the cargo
When it prints the total
Then the number of what was sifted out is named, and without cargo there is no line about it at
all: a silent sifting is indistinguishable from a check whose mark is named with a typo

Covered: `projects/agent-kit/tests/checks-board-cargo.test.sh`.
