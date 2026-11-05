# Scenarios — the git hook before a push

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain.

### SC-AK-1243 — a red set cancels a push the session guard does not see

Given the git hook is wired into the repository, and the set of the profile is red
When a push is sent by `git push` from a terminal
Then git does not send it, the remote has no branch, and the hook names the red check. On a green
set the same push leaves

Covered: `projects/agent-kit/tests/pre-push.test.sh`.

### SC-AK-1244 — a commit the session guard found green runs no second set

Given the session guard ran a green set and wrote the tip into the mark of green
When the same commit is pushed and the set is red now
Then the push leaves without the set; a next commit is not covered by the mark. On a red set the
guard writes no mark

Covered: `projects/agent-kit/tests/pre-push.test.sh`.

### SC-AK-1245 — a push of a commit other than the tip is refused

Given the working copy stands on a task branch
When `main` or a tag on another commit is pushed
Then the push is refused and the ref is named; a tag on the tip passes

Covered: `projects/agent-kit/tests/pre-push.test.sh`.

### SC-AK-1246 — the layout puts the hook into the tree

Given a tree that took the hook resource
When the package is laid out
Then the hook lies in the hooks directory of the tree, executable and with the layout header, and the
shared set code lies next to it. Without a built package the scenario is red, not skipped

Covered: `projects/agent-kit/tests/pre-push.test.sh`.

### SC-AK-1247 — a deletion runs no set

Given the set of the profile is red
When a remote branch is deleted by `git push --delete`
Then the push leaves: a deletion sends no tree

Covered: `projects/agent-kit/tests/pre-push.test.sh`.

### SC-AK-1248 — under the pipeline the hook passes

Given the set of the profile is red
When the push is sent with `CI` set
Then the push leaves without the set

Covered: `projects/agent-kit/tests/pre-push.test.sh`.

### SC-AK-1249 — several refs in one push are judged one by one

Given the working copy stands on a task branch
When the branch is pushed together with `main` and a tag on another commit
Then the whole push is refused, the branch does not reach the remote, and both foreign refs are named

Covered: `projects/agent-kit/tests/pre-push.test.sh`.

### SC-AK-1250 — the set is read from the package default and the tree override, by this repository's root

Given the package default and the tree override each name a red check
When the branch is pushed
Then both red checks are named. When the caller exported the root of another directory, the set is
still read by the root of the repository the push goes from

Covered: `projects/agent-kit/tests/pre-push.test.sh`.

### SC-AK-1251 — after a red check no heavy one starts

Given the set holds a red check and a heavy one after it
When the branch is pushed
Then the heavy check does not run, and the refusal names it among those not started

Covered: `projects/agent-kit/tests/pre-push.test.sh`.

### SC-AK-1252 — a skipped check is named and judges nothing

Given every check of the set exits with the skip code
When the branch is pushed
Then the push leaves, the skipped check is named, and no mark of green is written. A skip code of 1
does not turn a red check into a skipped one

Covered: `projects/agent-kit/tests/pre-push.test.sh`.

### SC-AK-1253 — a copy with uncommitted edits writes no mark

Given the set is green and a tracked file has an uncommitted edit
When the branch is pushed
Then the push leaves and no mark is written. A copy whose only extra file lies outside the history
writes the tip

Covered: `projects/agent-kit/tests/pre-push.test.sh`.

### SC-AK-1254 — the mark of one working copy covers a push from another

Given a second working copy of the same repository and a red set
When the mark of green holds its tip and the push goes from the second copy
Then the push leaves without the set; without the mark it is refused

Covered: `projects/agent-kit/tests/pre-push.test.sh`.

### SC-AK-1255 — a hooks manager calls the hook by a line, and a hook without the set code says so

Given the hook is wired by a line in the directory a hooks manager sets as the hooks path
When the set is red and the branch is pushed
Then the push is refused. A hook whose set code is missing next to it says that no check ran

Covered: `projects/agent-kit/tests/pre-push.test.sh`.
