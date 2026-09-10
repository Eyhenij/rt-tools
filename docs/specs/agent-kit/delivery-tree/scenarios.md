# Scenarios — the tree a command runs in

The spec is `spec.md` next to it. The scenarios check by whose profile the form of a branch name is
judged when the command moves into a neighbouring tree.

### SC-AK-1074 — the branch name form is judged by the tree the command runs in

Given the command moves into a neighbouring tree, and there the branch name is lawful by that
tree's own form
When the guard judges the creation of the branch
Then it lets the call through: the task key of a neighbouring tree is its own, and a refusal on a
lawful name has no bypass at all

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-1075 — a miss in the name of one's own tree is refused as before

Given the command carries no move into another tree
When the guard judges the creation of a branch whose name does not match the form
Then it refuses and names the form

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-1076 — a tree without a profile is not judged by the form at all

Given the command moves into a tree that declared no profile of its own
When the guard judges the creation of the branch
Then the form is not judged: a foreign tree is not accountable to this guard

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-1077 — a call from a second working copy is refused

Given the command moves into another working copy of a tree and sends the branch from there
When the gate judges the call
Then it refuses and names both copies: the set runs where the session was started, so someone
else's uncommitted work would refuse the call while the contribution actually leaving passes
unchecked

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-1078 — a move inside one's own root refuses nothing

Given the command moves into the root of the same working copy, or carries no move at all
When the gate judges the call
Then everything goes as before: the set runs and decides by its own outcome

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.
