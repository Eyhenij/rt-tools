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
Then the hook lies in the hooks directory of the tree, executable and with the layout header

Covered: `projects/agent-kit/tests/pre-push.test.sh`.
