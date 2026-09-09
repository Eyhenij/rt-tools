# Scenarios — the reading of its own records by a tree

The identifier stands at the start of the test title, followed by a dash. While a scenario is not
covered, it carries the mark "Not covered" with a reason. The prefix is shared by the domain.

### SC-MB-318 — a tree reads its own records by its token

Given the intake holds records of two trees
When the reading is called with the token of the first
Then only its records come back, and every one of them carries a state

Не покрыто: пробы пишутся вторым этапом задачи.

### SC-MB-319 — the records of a neighbour do not leave by a name in the request

Given the request names the sign of a foreign tree
When the reading is called with the token of one's own tree
Then the answer holds only the records of the tree of the token

Не покрыто: пробы пишутся вторым этапом задачи.

### SC-MB-320 — the answer carries the fix and the version of the release

Given a record of the tree is released, and the fix and the version stand on it
When the reading is called
Then the record of the answer carries both values

Не покрыто: пробы пишутся вторым этапом задачи.

### SC-MB-321 — a call without a token is refused

Given the request carries no token of a tree
When the reading is called
Then the intake answers with a refusal and gives out no record

Не покрыто: пробы пишутся вторым этапом задачи.

### SC-MB-322 — a tree without records answers with an empty list

Given the tree has sent nothing yet
When the reading is called with its token
Then the answer is empty, and the code says the call went through

Не покрыто: пробы пишутся вторым этапом задачи.
