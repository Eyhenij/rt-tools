# Scenarios — the identity of the call that opens a request

The prefix is `SC-AK`. The subdomain `delivery-identity` of the domain `agent-kit`.

### SC-AK-480 — a request whose author cannot be learned and whose command names no token is refused

Given the tree named the token variable and has no way to ask the hosting who will come
When a request is opened, and there is no substitution in the command
Then the opening is refused: who will open it stays unknown, and it may come out from the very
person named as its reviewer

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-481 — a request with the substitution of the token passes

Given the machine record token is substituted before the command
When a request is opened
Then the guard lets the call through

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-482 — a token set by a separate line counts

Given the token is set by a separate command of the same call
When a request is opened right after
Then the guard lets the call through: the text of the command is judged whole, not one prefix of it

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-483 — the refusal names the token variable

Given a request is opened without the substitution
When the guard refuses the call
Then the refusal holds the name of the variable and a ready substitution line

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-831 — a command named by a path is recognised on a par with a bare name

Given the hosting client is called with a directory before the name — by a full path or a relative
one
When the guard looks for its own name in the command
Then the call is recognised and judged as one named by a bare name: a path before the name of the
same command changes it in nothing, and a call the guard does not know leaves with zero and stays
silent — while silence is indistinguishable from permission

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-484 — a tree without a machine record judges no author

Given the tree named no token variable
When a request is opened
Then the guard lets the call through: for such a tree the identity of a call means nothing

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-485 — the draft of a request opened by a foreign record is lifted, and the record is named

Given the author of the request is not the record the tree named as the machine one, and the
request has a review
When the draft is lifted
Then the guard lets the call through and names the record aloud: the clash that breaks a review is
caught by the condition about the review, and a foreign record by itself breaks nothing

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-487 — a request of the machine record lifts its draft

Given the author of the request is the machine record of the tree
When the draft is lifted
Then the guard lets the call through

Covered: `projects/agent-kit/tests/git-guards.test.sh`.

### SC-AK-842 — the login the call will go under is checked against the reviewer

Given the tree can ask the hosting who will come by the token
When a request is opened with a reviewer named in the command
Then a login other than the reviewer lets the call through, a login equal to the reviewer forbids
it, and the refusal names the account and the reopening: the hosting silently drops a review
request pointing at the author

Covered: `projects/agent-kit/tests/git-guards-identity.test.sh`.

### SC-AK-843 — asking did not work: the demand falls back to the text of the command

Given the tree has no way to ask the hosting — or the answer is empty
When a request is opened
Then the author stays unknown, and the call is judged by the text alone: a command naming the token
passes, one without it is refused

Covered: `projects/agent-kit/tests/git-guards-identity.test.sh`.

### SC-AK-892 — the delivery rule says that the active record of the client is picked per machine

Given the edition of the delivery rule for a hosting with a client whose active record is one per
machine
When the article about the identity of a call is read
Then an article stands next to it: the active record is picked per machine, not per tree, and the
machine record is substituted onto a call and is not made active

Covered: `projects/agent-kit/tests/git-guards-identity.test.sh`.

### SC-AK-1064 — a request whose author is named as its own reviewer is refused

Given the hosting answers that the call will go under a certain account
When a request is opened, and that same account stands as `--reviewer`
Then the opening is refused: the hosting accepts such a review request and silently does not create
it, and the author of a request cannot be changed

Covered: `projects/agent-kit/tests/git-guards-identity.test.sh`.

### SC-AK-1065 — a request from a record other than the machine one passes, and the record is named

Given the hosting answers with an account other than the machine one, and the reviewer is a third
When a request is opened
Then the guard lets the call through and names the account aloud: the review will be created, and
silence about a foreign account is indistinguishable from a check that did not fire

Covered: `projects/agent-kit/tests/git-guards-identity.test.sh`.
