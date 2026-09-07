# Scenarios — leading the work by commands

The identifier goes at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared across the domain,
and the numbers were not recounted at the move into the subdomain: the number ties the scenario to
the test title.

The scenarios of the check of the work queue live in the subdomain next to it: two dozen of them
gathered, and together with the rest the list went past the length limit.

### SC-AK-12 — the merge is refused while the branch carries the folder of its task

Given a branch under a task, and the folder of its task is committed into the branch
When the command of merging the PR goes
Then the guard refuses, names the lying folder and what the refusal is lifted by

### SC-AK-13 — a folder taken apart does not hinder the merge

Given a branch under a task, and the folder of its task is no longer in the branch, while a file
arrived in the directory of the archive
When the command of merging the PR goes
Then the guard lets it through

### SC-AK-14 — what is judged is the content of the branch, not the working tree

Given the task folder is removed in the working tree, but the removal is not committed
When the command of merging the PR goes
Then the guard refuses: the folder will go away into the main branch

### SC-AK-15 — a removal without a record in the archive does not pass

Given the task folder is removed in the branch whole, and the branch added nothing in the directory
of the archive
When the command of merging the PR goes
Then the guard refuses and names the absence of a record in the archive

### SC-AK-17 — the bypass from the text of the command works without a network

Given the task folder lies in the branch, and the line of the bypass with a reason stands in the
text of the command of the merge
When the command of merging the PR goes
Then the guard lets it through without asking the work queue

### SC-AK-18 — a bypass without a reason does not count as a bypass

Given the task folder lies in the branch, and the line of the bypass stands without a reason
When the command of merging the PR goes
Then the guard refuses

### SC-AK-19 — a folder of the old form of the name is found as a nested directory

Given a branch of the form with a slash, and the folder of its task lies as a nested directory
When the command of merging the PR goes
Then the guard refuses and names the nested path whole

### SC-AK-20 — the check of the queue finds the folder of a closed task in a nested directory

Given a nested folder of the old form lies in the directory of the tasks, and the task behind it is
closed
When the check of the work queue goes
Then the folder is named a divergence, and the sample and the drafts of the analysis are not

### SC-AK-21 — a tree without a directory of tasks gets no requirement

Given the profile of the tree names no directory of tasks
When the command of merging the PR goes
Then the guard lets it through silently

### SC-AK-59 — an uncommitted edit stops the closing of the session

Given there is an uncommitted edit in the working tree
When the executor calls the closing of the session
Then not a single branch is removed, the tree stays on the current branch, and the refusal names
the uncommitted files

Not covered: the command is carried out by an agent, and a run does not check it — the check goes
by a call in the tree.

### SC-AK-60 — work by the rule with a merged PR brings the tree back to the main branch

Given the work goes in a branch under the number of the task, its PR is merged, the working tree is
clean
When the executor calls the closing of the session
Then the tree moves to the main branch and pulls it from the remote

Not covered: the command is carried out by an agent, and a run does not check it — the check goes
by a call in the tree.

### SC-AK-61 — work outside the rule leaves the tree in its own branch

Given the work goes in a branch behind which there is no task, the working tree is clean
When the executor calls the closing of the session
Then the main branch is merged into the current one, and the tree stays on it

Not covered: the command is carried out by an agent, and a run does not check it — the check goes
by a call in the tree.

### SC-AK-62 — the merged branches are removed, the unmerged one stays named

Given among the local branches there is one merged into the main and one with commits the main does
not have
When the executor calls the closing of the session
Then the merged one is removed, the unmerged one stays, and its name together with the number of
the commits past the main one is named to the executor

Not covered: the command is carried out by an agent, and a run does not check it — the check goes
by a call in the tree.

### SC-AK-63 — the dead trackings are removed by the same call

Given there is a reference in the tree to a remote branch that is no longer in the remote
When the executor calls the closing of the session
Then the reference is removed together with the rest of the tidying

Not covered: the command is carried out by an agent, and a run does not check it — the check goes
by a call in the tree.

### SC-AK-64 — the handover is written last and lies outside the tree

Given the closing of the session has reached the writing of the handover
When the command writes it
Then the file lands in the directory of the handover from the profile of the tree, one file per
branch, does not go into the history, and the path to it is named to the executor by the last line

Not covered: the command is carried out by an agent, and a run does not check it — the check goes
by a call in the tree.

### SC-AK-152 — the creating ends with an answer of the work queue

Given the task is created and stands in the work queue with a column and an executor
When the command of creating puts its output together
Then it names the column and the executor and ends with a zero code

Covered: `projects/agent-kit/tests/checks-config.test.sh`.

### SC-AK-153 — a task outside the work queue ends the command with a refusal

Given the task is created, and it is not in the work queue
When the command of creating puts its output together
Then it names the absence by a line of its own and ends with a non-zero code

Covered: `projects/agent-kit/tests/checks-config.test.sh`.

### SC-AK-154 — a task without an executor is named apart

Given the task stands in the work queue, but it has no executor
When the command of creating puts its output together
Then it names that by a line of its own and ends with a non-zero code

Covered: `projects/agent-kit/tests/checks-config.test.sh`.

### SC-AK-155 — a queue that was not asked does not count as a confirmation

Given the work queue could not be asked
When the command of creating puts its output together
Then it names that the state of the queue is unknown and ends with a non-zero code

Covered: `projects/agent-kit/tests/checks-config.test.sh`.

### SC-AK-194 — a mention of the bypass mid-line does not count as a bypass

Given the command of the merge carries words about a bypass, but it does not begin the line
When the call of the merge goes with the task folder lying there
Then the guard refuses: a text naming a bypass is not one

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-195 — a substitution instead of a reason does not count as a bypass

Given the line of the bypass stands right, and its reason is written as a substitution in angle
brackets
When the call of the merge goes with the task folder lying there
Then the guard refuses: a substitution is never a reason

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-367 — a task from the first column refuses the delivery

Given the tree named the first column of the work queue, and the task stands in it
When a PR is opened
Then the opening is refused, the column of the task and the command of the move are named

Covered: `projects/agent-kit/tests/git-guards-readiness.test.sh`.

### SC-AK-368 — a task taken into work is not refused by the column

Given the task stands not in the first column
When a PR is opened
Then the column gives no refusal

Covered: `projects/agent-kit/tests/git-guards-readiness.test.sh`.

### SC-AK-369 — a tree that named no first column gets no check

Given the name of the first column is not declared by the tree, and the task stands in the first
column
When a PR is opened
Then the column is not judged at all

Covered: `projects/agent-kit/tests/git-guards-readiness.test.sh`.

### SC-AK-374 — the draft of a PR without a review is not lifted

Given the PR has neither a requested reviewer nor a left opinion
When the draft is lifted — by any of the clients of the hosting
Then the lifting is refused, the number of the PR and the lack of a review are named; a reading of
the same PR does not count as a lifting

Covered: `projects/agent-kit/tests/git-guards-readiness.test.sh`.

### SC-AK-375 — a PR with a review lifts the draft

Given the PR has a requested reviewer or an opinion left not by the author
When the draft is lifted
Then the guard lets the call through silently

Covered: `projects/agent-kit/tests/git-guards-readiness.test.sh`.

### SC-AK-376 — without an answer about the PR the draft is lifted

Given the helper of the work queue stays silent, or a PR under such a number is unknown to it
When the draft is lifted
Then the guard lets the call through silently

Covered: `projects/agent-kit/tests/git-guards-readiness.test.sh`.

### SC-AK-380 — the state of a PR is taken from the helper of the work queue

Given the helper of the work queue is in place and answers
When the profile is asked about the state of a PR
Then it gives back the answer of the helper; without the helper it stays silent

Covered: `projects/agent-kit/tests/defaults.test.sh`.

### SC-AK-381 — an answer with the mark of the silence of the network does not come outward

Given the helper answered with the mark "there was no network"
When the profile is asked about the state of a PR
Then it stays silent, and the answer does not come outward

Covered: `projects/agent-kit/tests/defaults.test.sh`.

### SC-AK-382 — without a node the state of a PR is not asked

Given there is no node on the machine the helper is started by
When the profile is asked about the state of a PR
Then it stays silent, and the answer does not come outward

Covered: `projects/agent-kit/tests/defaults.test.sh`.

### SC-AK-383 — a draft without a reference to the PR is judged on a par with a named one

Given the PR of the current branch has no review
When the draft is lifted by a call without a reference to the PR — by any of the clients of the
hosting
Then the lifting is refused by the same refusal as at a call with a reference

Covered: `projects/agent-kit/tests/git-guards-readiness.test.sh`.

### SC-AK-384 — a PR named by an address or by the name of a branch is judged on a par with a number

Given a PR without a review is named by an address or by the name of a branch
When the draft is lifted
Then the lifting is refused, and the number from the answer of the work queue stands in the
refusal; there is no number in the answer — into the refusal goes what the PR was named by in the
command

Covered: `projects/agent-kit/tests/git-guards-readiness.test.sh`.

### SC-AK-385 — returning a PR into a draft passes

Given the PR has no review
When the PR is returned into a draft — with a reference to it or without one
Then the guard lets the call through silently

Covered: `projects/agent-kit/tests/git-guards-readiness.test.sh`.

### SC-AK-390 — the column is asked at the opening of the PR, not at the creating of the branch

Given the task stands in the first column of the work queue
When a branch is created by it, and then a PR is opened
Then the creating of the branch passes, and the opening of the PR is refused — and refused exactly
by the column

Covered: `projects/agent-kit/tests/git-guards-readiness.test.sh`.

### SC-AK-423 — a conflicting PR does not lift the draft

A conflict arrives into a handed-in PR by someone else's merge: its merge button is locked by the
hosting, and a lifted draft calls to press it.

Given the PR is open as a draft, it has a review, and it conflicts with the main branch
When the draft is lifted
Then the lifting is refused, and the refusal names the number of the PR together with the conflict

Covered: `projects/agent-kit/tests/git-guards-readiness.test.sh`.

### SC-AK-424 — silence about mergeability does not hold up the lifting of the draft

Given the helper of the work queue says nothing about mergeability at all
When the draft is lifted at a PR with a review
Then the guard lets the call through silently: there is no field — there is no requirement,
otherwise an edit of the package would refuse the lifting at every tree whose helper is not fixed
yet

Covered: `projects/agent-kit/tests/git-guards-readiness.test.sh`.

### SC-AK-526 — the opening of the request is refused while the branch carries the folder of its task

Given a branch under a task, and the folder of its task is committed into the branch
When the command of opening the request goes
Then the guard refuses, names the lying folder and what the refusal is lifted by: the tidying
stands before the opening of the request, because the merge is pressed by a person on the hosting
and the guard does not reach there

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-527 — the bypass from the text of the command works at the opening of the request too

Given the task folder lies in the branch, and the line of the bypass with a reason stands in the
text of the command of the opening
When the command of opening the request goes
Then the guard does not name the folder

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-528 — a removal without a record in the archive does not pass at the opening of the request

Given the task folder is removed in the branch whole, and the branch added nothing in the directory
of the archive
When the command of opening the request goes
Then the guard refuses and names the absence of a record in the archive

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-711 — the lifting of the draft is refused while the branch carries the folder of its task

Given the folder of its task lies in the branch
When the executor lifts the draft from the request
Then the guard refuses the call and names the folder itself: the boundary stands here, not at the
merge, because the guard does not reach as far as the merge

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-712 — a bypass with a reason works at the lifting of the draft too

Given the folder of its task lies in the branch, and the command carries the line of the bypass
with a reason
When the executor lifts the draft from the request
Then the guard lets it through: work merged in parts does not take the folder apart to the end

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-823 — the mark of multi-session work against the line of the works

Given the card is marked with the mark of multi-session work, and there is no such row in the lines
of the works
When the check of the work queue is run
Then it names a divergence: the planning goes by the line, not by the card

Given a row of the line names the work as multi-session, and there is no mark on the card
When the same check is run
Then it names a divergence from the other side

Given a row of the line names the number of the task, but the word of the mark is not in it
When the same check is run
Then this row does not count as a record about the multi-session nature

Given the tree named no name of the mark
When the same check is run
Then the link is not judged at all: there is nothing to tell a multi-session card from an ordinary
one by

Covered: `projects/agent-kit/tests/checks-board-long-work.test.sh`.

### SC-AK-824 — a rollout that fell in the check of the work queue

Given the last rollout ended in failure
When the check of the work queue is run
Then it names it by a line of its own with a reference to the run: the main branch is ahead of
production

Given the rollout is still in progress
When the same check is run
Then it does not count as a divergence: the rollout may still end in success

Covered: `projects/agent-kit/tests/checks-board-long-work.test.sh`.
