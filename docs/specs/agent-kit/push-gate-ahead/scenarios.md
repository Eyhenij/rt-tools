# Scenarios — the push set against its base, from its marks and ahead

The spec is `spec.md` next to it. The scenarios check what base the set is counted against, when a
check is not run again and how the heavy steps leave the guard.

### SC-AK-1240 — a stacked branch is counted against the branch under it

Given a branch that stands on another branch whose remote copy lies in the history of the head
When the push guard picks the base
Then the base is the remote copy of that branch

Given a branch that stands on the main branch
When the push guard picks the base
Then the base is the remote main branch

Given the lower branch was removed from the remote, the working copy holds no ref of it, and no
other remote branch carries it
When the push guard picks the base
Then the base is the remote main branch

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-1340 — the base is the remote branch the head has the fewest commits over

Given two remote branches lie in the history of the head, one nearer to it than the other
When the push guard picks the base
Then the base is the nearer one

Given the branch has a remote copy of its own behind the head
When the push guard picks the base
Then that copy is not the base

Given the lower branch was removed from the remote, and the working copy still holds its ref
When the push guard picks the base
Then the base is that ref

Given the lower branch was merged into the branch of the epic by the host and removed from the
remote, and the working copy holds no ref of it
When the push guard picks the base
Then the base is the branch of the epic, whether or not the branch took it in

Given a branch made from the checked-out head, and the call comes from a subdirectory
When the push guard picks the base
Then the base is the same as from the root of the tree

Given the main branch moved ahead on the remote, and the ref of a branch merged into it earlier
lies in the history of the head
When the push guard picks the base
Then the base is the remote main branch

Given the host merged a task into the branch of an epic
When the push guard picks the base for the branch of the epic
Then the merged task is not the base, and neither is a task that stands on the branch of the epic

Given the host merged a neighbouring task into the branch of an epic after a task was taken from it
When the push guard picks the base for that task
Then the base is the branch of the epic

Given a remote branch that stands on this one
When the push guard picks the base
Then that branch is not the base

Given a head that is no branch
When the push guard picks the base
Then the base is the remote main branch

Given a neighbouring task taken from the new tip of the branch of the epic, as near as that branch
When the push guard picks the base
Then the base is the branch of the epic, not the neighbour

Given a branch taken straight from the remote branch of the epic, so that it tracks it
When the push guard picks the base
Then the base is the branch of the epic

Given a remote branch at the same commit as the main branch
When the push guard picks the base
Then the base is the remote main branch

Given a task that took the main branch in by itself
When the push guard picks the base
Then the base is the branch of the epic: what the main branch brought is not counted

Given a branch pushed before its first commit
When the push guard picks the base
Then the base is the branch it lies on, not the main one

Given a branch moved past the head by a plain push, not by a merge of the host
When the push guard picks the base
Then that branch is not the base

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-1241 — a check green on the same tree is not run again

Given a clean working copy and a check that passed on its tree against its base
When the same tree is pushed again
Then the check is not run, and the push passes

Given the working copy holds an edit outside the index
When the push call comes
Then the check runs again: a mark is not trusted on a dirty copy

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-1242 — the heavy steps run ahead, not inside the guard

Given a tree that declared running its heavy steps ahead, and a heavy step with no mark
When the push call comes
Then the guard refuses at once, does not run the step and names the command that runs it ahead

Given the run ahead passed on a clean copy
When the push call comes
Then the push passes from the marks, and the heavy step ran once

Given the working copy holds an edit outside the index
When the run ahead starts
Then it does not run anything and exits with 3

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-1345 — a head that adds nothing to its base is pushed with no check run

Given a branch whose every commit already lies in its base on the remote, and a set of one red check
When the push call comes
Then the guard lets it through and runs no check

Given the same branch
When the run ahead starts
Then it names that there is nothing to run and exits with 0

Covered: `projects/agent-kit/tests/git-guard-push-nothing-new.test.sh`.

### SC-AK-1346 — a head with a commit over its base is judged by the set

Given the same branch with one commit over its base
When the push call comes
Then the guard runs the set and refuses on the red check

Given a repository with no remote
When the push call comes
Then the guard runs the set: there is no base to compare the head with

Covered: `projects/agent-kit/tests/git-guard-push-nothing-new.test.sh`.

### SC-AK-1349 — the head tells nothing about a push of another branch

Given a head that adds nothing to its base, and a set of one red check
When the push names another branch, sends the head into a branch of another name or names no branch
Then the guard runs the set and refuses on the red check

Covered: `projects/agent-kit/tests/git-guard-push-nothing-new.test.sh`.

### SC-AK-1347 — a commit of unread paths keeps the mark of a check

Given a profile that names the paths a check does not read, and the key of that check
When a commit changes those paths alone — a file under the unread directory, a text at the root
Then the key of the check is the same, and the key of a check the profile does not name changes

Covered: `projects/agent-kit/tests/git-guard-push-marks-unread.test.sh`.

### SC-AK-1348 — a commit of what the check reads drops its mark

Given the same profile and the key of the check
When a commit changes a file of code, or a text that lies inside the code
Then the key of the check changes

Covered: `projects/agent-kit/tests/git-guard-push-marks-unread.test.sh`.

### SC-AK-1350 — a check that passed over its time limit is red

Given the profile gives a check a limit of 12 seconds and words for the refusal
When the check passes in 14 seconds
Then the set calls it red, and the refusal names 14, 12 and the words. At 12 and 13 seconds the
check is green, since one second over is the clock. A check the profile gives no limit is green
however long it took

Covered: `projects/agent-kit/tests/push-over-budget.test.sh`.

### SC-AK-1351 — a push whose whole set ran over its time limit is red

Given the profile gives a whole set a limit of 440 seconds and words for the refusal
When the set of one push runs for 442 seconds
Then the push is red, and the refusal names 442, 440 and the words and asks why before the next
push. At 441 seconds the set is green, the package default sets no limit, and both runners judge
the sum

Covered: `projects/agent-kit/tests/push-over-budget.test.sh`.

### SC-AK-1166 — the push gate names every red light check by one refusal

Given the gate set holds two red light checks, a green one between them and a heavy one after them
When the guard judges the push
Then the refusal names both red lines and the tail of each output. The green one is not named. The
heavy one is not started and is named as held

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.
