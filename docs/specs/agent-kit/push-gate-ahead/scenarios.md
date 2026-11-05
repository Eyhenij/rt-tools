# Scenarios — the push set against its base, from its marks and ahead

The spec is `spec.md` next to it. The scenarios check what base the set is counted against, when a
check is not run again and how the heavy steps leave the guard.

### SC-AK-1240 — a stacked branch is counted against the branch it was created from

Given a branch created from another branch whose remote copy lies in the history of the head
When the push guard picks the base
Then the base is the remote copy of that branch

Given a branch created from the main branch
When the push guard picks the base
Then the base is the remote main branch

Given the parent branch was removed from the remote
When the push guard picks the base
Then the base is the remote main branch: the gate may be stricter, never weaker

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

### SC-AK-1166 — the push gate names every red light check by one refusal

Given the gate set holds two red light checks, a green one between them and a heavy one after them
When the guard judges the push
Then the refusal names both red lines and the tail of each output. The green one is not named. The
heavy one is not started and is named as held

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.
