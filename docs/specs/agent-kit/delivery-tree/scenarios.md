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

Given the command moves into another working copy of the same repository and sends the branch
from there
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

### SC-AK-1173 — a sending call in another repository is not judged by the gate

Given the command moves into a tree of another repository and sends the branch from there
When the gate judges the call
Then it lets the call through without running the set of the session tree

Covered: `projects/agent-kit/tests/git-guard-push-tests.test.sh`.

### SC-AK-1174 — a branch in another repository asks the task of that repository

Given the command moves into a tree of another repository, and the task of the branch exists in
its work queue and not in the session's
When the guard judges the creation of the branch
Then it lets the call through: the task is asked of the queue of the repository the command runs in

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-1175 — a second copy of the same repository asks the session's queue

Given the command moves into a second copy of the same repository, and the task of the branch is
not in the session's work queue
When the guard judges the creation of the branch
Then it refuses as before: the shared `.git` directory is one, and so is the queue

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-1176 — a request from another repository is judged by its branch

Given the command moves into a tree of another repository and opens a request there
When the guard judges the opening
Then it reads the branch and the task of that repository, not of the session tree

Covered: `projects/agent-kit/tests/git-guards.test.sh`.
